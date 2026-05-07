// firebase-admin NOT used here — avoids gRPC/OpenSSL issues on Vercel.
// Cron uses a service-account JWT->OAuth token for Firestore REST API.
// Debug uses the user's own ID token (Firestore security rules enforce userId isolation).

import crypto from 'node:crypto';
import webpush from 'web-push';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const FIREBASE_API_KEY = 'AIzaSyDIIW0YmNtS0WMcSyQa8l5ntv89C7SWlUo';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

const RECORD_TYPE_MAP = {
  album: 'Album',
  ep: 'EP',
  single: 'Single',
};

// ── Auth helpers ──────────────────────────────────────────────

async function getUidFromToken(idToken) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    },
  );
  if (!res.ok) throw new Error('Token verification failed');
  const { users } = await res.json();
  if (!users?.[0]) throw new Error('User not found');
  return users[0].localId;
}

/** Get a short-lived OAuth2 access token for the Firebase service account. */
async function getFirebaseToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const encode = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');
  const message = `${encode(header)}.${encode(claimSet)}`;
  const sig = crypto.sign('RSA-SHA256', Buffer.from(message), PRIVATE_KEY);
  const assertion = `${message}.${sig.toString('base64url')}`;

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`OAuth2 token error ${r.status}: ${body}`);
  }
  const data = await r.json();
  return data.access_token;
}

// ── Firestore REST helpers ────────────────────────────────────

/** Build a Firestore Document proto from a plain JS object. */
function toDoc(value) {
  const fields = Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, toValue(v)]),
  );
  return { fields };
}

function toValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toValue) } };
  if (typeof val === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(val).map(([k, v]) => [k, toValue(v)]),
        ),
      },
    };
  }
  return { stringValue: String(val) };
}

/** Fetch all documents from a collection (max 300). */
async function listAll(collection, token) {
  const out = [];
  let pageToken = '';
  do {
    const params = new URLSearchParams({ pageSize: '300' });
    if (pageToken) params.set('pageToken', pageToken);
    const r = await fetch(
      `${FIRESTORE_BASE}/${collection}?${params}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!r.ok) {
      const body = await r.text();
      throw new Error(`Firestore list ${collection} error ${r.status}: ${body}`);
    }
    const data = await r.json();
    for (const doc of data.documents ?? []) {
      out.push({ id: doc.name.split('/').pop(), fields: doc.fields });
    }
    pageToken = data.nextPageToken ?? '';
  } while (pageToken);
  return out;
}

/** Fetch documents filtered by a field equality. Returns raw REST documents with parsed fields. */
async function listWhere(collection, fieldPath, op, value, token) {
  const structuredQuery = {
    from: [{ collectionId: collection }],
    where: {
      fieldFilter: {
        field: { fieldPath },
        op,
        value: toValue(value),
      },
    },
  };
  const r = await fetch(
    `${FIRESTORE_BASE}:runQuery`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ structuredQuery }),
    },
  );
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Firestore query ${collection} error ${r.status}: ${body}`);
  }
  const results = await r.json();
  const docs = [];
  for (const item of results) {
    if (item.document) {
      docs.push({
        id: item.document.name.split('/').pop(),
        fields: item.document.fields,
      });
    }
  }
  return docs;
}

/** Read a single document. Returns fields or null if not found. */
async function getDoc(path, token) {
  const r = await fetch(`${FIRESTORE_BASE}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (r.status === 404) return null;
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Firestore get ${path} error ${r.status}: ${body}`);
  }
  const data = await r.json();
  return { id: data.name.split('/').pop(), fields: data.fields };
}

/** Write (create or update) a document. */
async function setDoc(path, data, token) {
  const r = await fetch(`${FIRESTORE_BASE}/${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(toDoc(data)),
  });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Firestore set ${path} error ${r.status}: ${body}`);
  }
}

/** Delete a document (ignore 404). */
async function deleteDoc(path, token) {
  const r = await fetch(`${FIRESTORE_BASE}/${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (r.status !== 404 && !r.ok) {
    const body = await r.text();
    throw new Error(`Firestore delete ${path} error ${r.status}: ${body}`);
  }
}

/** Convert Firestore fields back to a plain object (shallow). */
function fromFields(fields) {
  const obj = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v.stringValue !== undefined) obj[k] = v.stringValue;
    else if (v.integerValue !== undefined) obj[k] = Number(v.integerValue);
    else if (v.doubleValue !== undefined) obj[k] = v.doubleValue;
    else if (v.booleanValue !== undefined) obj[k] = v.booleanValue;
    else if (v.arrayValue !== undefined) {
      obj[k] = (v.arrayValue.values ?? []).map(fromValue);
    } else if (v.mapValue !== undefined) {
      obj[k] = fromFields(v.mapValue.fields ?? {});
    } else if (v.nullValue !== null && v.nullValue !== undefined) obj[k] = null;
  }
  return obj;
}

function fromValue(v) {
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.arrayValue !== undefined) return (v.arrayValue.values ?? []).map(fromValue);
  if (v.mapValue !== undefined) return fromFields(v.mapValue.fields ?? {});
  return null;
}

// ── Deezer ────────────────────────────────────────────────────

async function fetchArtistAlbums(artistId) {
  const res = await fetch(`https://api.deezer.com/artist/${artistId}/albums?limit=50`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.data ?? [];
}

// ── Runner for a single user (called from UI with ID token) ────

async function runForSingleUser(uid, idToken, fbToken) {
  const subDoc = await getDoc(`push-subscriptions/${uid}`, idToken);
  if (!subDoc) {
    return { notified: 0, results: [], error: 'No push subscription found.' };
  }
  const subscription = fromFields(subDoc.fields).subscription;

  const favDocs = await listWhere('favorite-artists', 'addedByUid', 'EQUAL', uid, idToken);
  if (!favDocs.length) {
    return { notified: 0, results: [], error: 'No favorite artists found.' };
  }

  const favorites = favDocs.map((d) => fromFields(d.fields));

  const newReleasesByArtist = {};
  for (const favorite of favorites) {
    const albums = await fetchArtistAlbums(favorite.artistId);
    if (!albums.length) continue;

    const latestIds = albums.map((a) => String(a.id));
    const cacheRef = `artist-releases-cache/${favorite.artistId}`;
    const cacheDoc = await getDoc(cacheRef, fbToken);
    const cachedIds = cacheDoc ? (cacheDoc.fields?.albumIds?.arrayValue?.values ?? []).map((v) => v.stringValue).filter(Boolean) : null;

    if (cachedIds === null) {
      await setDoc(cacheRef, { albumIds: latestIds, checkedAt: Date.now() }, fbToken);
      continue;
    }

    const newAlbums = albums.filter((a) => !cachedIds.includes(String(a.id)));
    if (newAlbums.length > 0) {
      newReleasesByArtist[favorite.artistId] = newAlbums;
      await setDoc(cacheRef, { albumIds: latestIds, checkedAt: Date.now() }, fbToken);
    }
  }

  const results = [];
  let notified = 0;

  for (const favorite of favorites) {
    const newAlbums = newReleasesByArtist[favorite.artistId];
    if (!newAlbums?.length) continue;

    const artistResults = { artist: favorite.name, artistId: favorite.artistId, albums: [] };

    for (const album of newAlbums) {
      const releaseType = RECORD_TYPE_MAP[album.record_type?.toLowerCase()] ?? 'Album';
      const coverUrl = album.cover_xl ?? album.cover_big ?? album.cover_medium ?? '';

      const payload = JSON.stringify({
        title: album.title,
        artist: favorite.name,
        releaseType,
        coverUrl,
        albumId: String(album.id),
      });

      try {
        await webpush.sendNotification(subscription, payload);
        notified++;
        artistResults.albums.push({ id: album.id, title: album.title, recordType: releaseType, sent: true });
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await deleteDoc(`push-subscriptions/${uid}`, fbToken);
        }
        artistResults.albums.push({ id: album.id, title: album.title, recordType: releaseType, sent: false, error: err.message });
      }
    }

    results.push(artistResults);
  }

  return { notified, results };
}

// ── Runner for all users (called from cron with service account) ──

async function runForAllUsers(token) {
  const subsDocs = await listAll('push-subscriptions', token);
  if (!subsDocs.length) return { notified: 0 };

  const favoritesByUser = {};
  for (const subDoc of subsDocs) {
    const uid = subDoc.id;
    const favDocs = await listWhere('favorite-artists', 'addedByUid', 'EQUAL', uid, token);
    favoritesByUser[uid] = favDocs.map((d) => fromFields(d.fields));
  }

  const allArtistIds = new Set();
  for (const favorites of Object.values(favoritesByUser)) {
    favorites.forEach((a) => allArtistIds.add(a.artistId));
  }

  const newReleasesByArtist = {};
  for (const artistId of allArtistIds) {
    const albums = await fetchArtistAlbums(artistId);
    if (!albums.length) continue;

    const latestIds = albums.map((a) => String(a.id));
    const cacheRef = `artist-releases-cache/${artistId}`;
    const cacheDoc = await getDoc(cacheRef, token);
    const cachedIds = cacheDoc ? (cacheDoc.fields?.albumIds?.arrayValue?.values ?? []).map((v) => v.stringValue).filter(Boolean) : null;

    if (cachedIds === null) {
      await setDoc(cacheRef, { albumIds: latestIds, checkedAt: Date.now() }, token);
      continue;
    }

    const newAlbums = albums.filter((a) => !cachedIds.includes(String(a.id)));
    if (newAlbums.length > 0) {
      newReleasesByArtist[artistId] = newAlbums;
      await setDoc(cacheRef, { albumIds: latestIds, checkedAt: Date.now() }, token);
    }
  }

  let notified = 0;
  for (const subDoc of subsDocs) {
    const uid = subDoc.id;
    const { subscription } = fromFields(subDoc.fields);
    const userFavorites = favoritesByUser[uid] ?? [];

    for (const favorite of userFavorites) {
      const newAlbums = newReleasesByArtist[favorite.artistId];
      if (!newAlbums?.length) continue;

      for (const album of newAlbums) {
        const releaseType = RECORD_TYPE_MAP[album.record_type?.toLowerCase()] ?? 'Album';
        const coverUrl = album.cover_xl ?? album.cover_big ?? album.cover_medium ?? '';
        const payload = JSON.stringify({
          title: album.title,
          artist: favorite.name,
          releaseType,
          coverUrl,
          albumId: String(album.id),
        });

        try {
          await webpush.sendNotification(subscription, payload);
          notified++;
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await deleteDoc(`push-subscriptions/${uid}`, token);
          }
        }
      }
    }
  }

  return { notified };
}

// ── Handler ───────────────────────────────────────────────────

export default async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = authHeader.slice(7);

    if (token === process.env.CRON_SECRET) {
      const fbToken = await getFirebaseToken();
      const result = await runForAllUsers(fbToken);
      return res.status(200).json(result);
    }

    const uid = await getUidFromToken(token);
    const fbToken = await getFirebaseToken();
    const result = await runForSingleUser(uid, token, fbToken);
    return res.status(200).json(result);
  } catch (error) {
    console.error('check-releases error:', error);
    return res.status(500).json({ error: error.message ?? 'Internal server error' });
  }
};
