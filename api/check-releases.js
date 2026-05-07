// firebase-admin NOT used here — avoids gRPC/OpenSSL issues on Vercel.
// User's Firebase ID token used directly for Firestore REST API.
// Firestore security rule required:
//   match /artist-releases-cache/{document} { allow read, write: if request.auth != null; }

import webpush from 'web-push';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
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

// ── Auth ──────────────────────────────────────────────────────

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

// ── Firestore REST helpers ────────────────────────────────────

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

// ── Runner ────────────────────────────────────────────────────

async function run(uid, idToken) {
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
    const cacheDoc = await getDoc(cacheRef, idToken);
    const cachedIds = cacheDoc ? (cacheDoc.fields?.albumIds?.arrayValue?.values ?? []).map((v) => v.stringValue).filter(Boolean) : null;

    if (cachedIds === null) {
      await setDoc(cacheRef, { albumIds: latestIds, checkedAt: Date.now() }, idToken);
      continue;
    }

    const newAlbums = albums.filter((a) => !cachedIds.includes(String(a.id)));
    if (newAlbums.length > 0) {
      newReleasesByArtist[favorite.artistId] = newAlbums;
      await setDoc(cacheRef, { albumIds: latestIds, checkedAt: Date.now() }, idToken);
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
          await deleteDoc(`push-subscriptions/${uid}`, idToken);
        }
        artistResults.albums.push({ id: album.id, title: album.title, recordType: releaseType, sent: false, error: err.message });
      }
    }

    results.push(artistResults);
  }

  return { notified, results };
}

// ── Handler ───────────────────────────────────────────────────

export default async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = authHeader.slice(7);

    // CRON_SECRET path — requires Firestore security rules that allow
    // service-level access. Currently not supported — use the user token path.
    if (token === process.env.CRON_SECRET) {
      return res.status(501).json({ error: 'Cron path not yet available' });
    }

    const uid = await getUidFromToken(token);
    const result = await run(uid, token);
    return res.status(200).json(result);
  } catch (error) {
    console.error('check-releases error:', error);
    return res.status(500).json({ error: error.message ?? 'Internal server error' });
  }
};
