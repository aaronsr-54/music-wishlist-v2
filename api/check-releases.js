import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import webpush from 'web-push';

const FIREBASE_API_KEY = 'AIzaSyDIIW0YmNtS0WMcSyQa8l5ntv89C7SWlUo';

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

let _db = null;

function initAdmin() {
  if (getApps().length > 0) return;
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

function getDb() {
  if (!_db) {
    _db = getFirestore();
    _db.settings({ preferRest: true });
  }
  return _db;
}

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

async function fetchArtistAlbums(artistId) {
  const res = await fetch(`https://api.deezer.com/artist/${artistId}/albums?limit=50`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.data ?? [];
}

async function sendNotification(subscription, payload) {
  await webpush.sendNotification(subscription, payload);
}

async function runForSingleUser(uid, db) {
  const subDoc = await db.collection('push-subscriptions').doc(uid).get();
  if (!subDoc.exists) {
    return { notified: 0, results: [], error: 'No push subscription found.' };
  }
  const { subscription } = subDoc.data();

  const favSnapshot = await db
    .collection('favorite-artists')
    .where('addedByUid', '==', uid)
    .get();

  if (favSnapshot.empty) {
    return { notified: 0, results: [], error: 'No favorite artists found.' };
  }

  const favorites = favSnapshot.docs.map((d) => d.data());

  const newReleasesByArtist = {};
  for (const favorite of favorites) {
    const albums = await fetchArtistAlbums(favorite.artistId);
    if (!albums.length) continue;

    const latestIds = albums.map((a) => String(a.id));
    const cacheRef = db.collection('artist-releases-cache').doc(favorite.artistId);
    const cacheDoc = await cacheRef.get();
    const cachedIds = cacheDoc.exists ? (cacheDoc.data().albumIds ?? []) : null;

    if (cachedIds === null) {
      await cacheRef.set({ albumIds: latestIds, checkedAt: Date.now() });
      continue;
    }

    const newAlbums = albums.filter((a) => !cachedIds.includes(String(a.id)));
    if (newAlbums.length > 0) {
      newReleasesByArtist[favorite.artistId] = newAlbums;
      await cacheRef.set({ albumIds: latestIds, checkedAt: Date.now() });
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
        await sendNotification(subscription, payload);
        notified++;
        artistResults.albums.push({ id: album.id, title: album.title, recordType: releaseType, sent: true });
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await db.collection('push-subscriptions').doc(uid).delete();
        }
        artistResults.albums.push({ id: album.id, title: album.title, recordType: releaseType, sent: false, error: err.message });
      }
    }

    results.push(artistResults);
  }

  return { notified, results };
}

async function runForAllUsers(db) {
  const subsSnapshot = await db.collection('push-subscriptions').get();
  if (subsSnapshot.empty) return { notified: 0 };

  const favoritesByUser = {};
  for (const subDoc of subsSnapshot.docs) {
    const uid = subDoc.id;
    const favSnapshot = await db
      .collection('favorite-artists')
      .where('addedByUid', '==', uid)
      .get();
    favoritesByUser[uid] = favSnapshot.docs.map((d) => d.data());
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
    const cacheRef = db.collection('artist-releases-cache').doc(artistId);
    const cacheDoc = await cacheRef.get();
    const cachedIds = cacheDoc.exists ? (cacheDoc.data().albumIds ?? []) : null;

    if (cachedIds === null) {
      await cacheRef.set({ albumIds: latestIds, checkedAt: Date.now() });
      continue;
    }

    const newAlbums = albums.filter((a) => !cachedIds.includes(String(a.id)));
    if (newAlbums.length > 0) {
      newReleasesByArtist[artistId] = newAlbums;
      await cacheRef.set({ albumIds: latestIds, checkedAt: Date.now() });
    }
  }

  let notified = 0;
  for (const subDoc of subsSnapshot.docs) {
    const uid = subDoc.id;
    const { subscription } = subDoc.data();
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
          await sendNotification(subscription, payload);
          notified++;
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await db.collection('push-subscriptions').doc(uid).delete();
          }
        }
      }
    }
  }

  return { notified };
}

export default async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    initAdmin();
    const db = getDb();

    const token = authHeader.slice(7);

    if (token === process.env.CRON_SECRET) {
      const result = await runForAllUsers(db);
      return res.status(200).json(result);
    }

    const uid = await getUidFromToken(token);
    const result = await runForSingleUser(uid, db);
    return res.status(200).json(result);
  } catch (error) {
    console.error('check-releases error:', error);
    return res.status(500).json({ error: error.message ?? 'Internal server error' });
  }
};
