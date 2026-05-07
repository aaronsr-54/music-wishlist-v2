import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import webpush from 'web-push';

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

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const RECORD_TYPE_MAP = {
  album: 'Album',
  ep: 'EP',
  single: 'Single',
};

async function fetchArtistAlbums(artistId) {
  const res = await fetch(
    `https://api.deezer.com/artist/${artistId}/albums?limit=50`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data ?? [];
}

export default async (req, res) => {
  // Vercel injects CRON_SECRET and sends it as Bearer token for cron jobs
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    initAdmin();
    const db = getFirestore();

    // Load all push subscriptions
    const subsSnapshot = await db.collection('push-subscriptions').get();
    if (subsSnapshot.empty) return res.status(200).json({ notified: 0 });

    // Load favorite artists grouped by userId
    const favoritesByUser = {};
    for (const subDoc of subsSnapshot.docs) {
      const uid = subDoc.id;
      const favSnapshot = await db
        .collection('favorite-artists')
        .where('addedByUid', '==', uid)
        .get();
      favoritesByUser[uid] = favSnapshot.docs.map((d) => d.data());
    }

    // Collect unique artist IDs across all users
    const allArtistIds = new Set();
    for (const favorites of Object.values(favoritesByUser)) {
      favorites.forEach((a) => allArtistIds.add(a.artistId));
    }

    // Fetch latest albums and diff against cache
    const newReleasesByArtist = {};
    for (const artistId of allArtistIds) {
      const albums = await fetchArtistAlbums(artistId);
      if (!albums.length) continue;

      const latestIds = albums.map((a) => String(a.id));
      const cacheRef = db.collection('artist-releases-cache').doc(artistId);
      const cacheDoc = await cacheRef.get();
      const cachedIds = cacheDoc.exists ? (cacheDoc.data().albumIds ?? []) : null;

      if (cachedIds === null) {
        // First run — seed cache, no notifications
        await cacheRef.set({ albumIds: latestIds, checkedAt: Date.now() });
        continue;
      }

      const newAlbums = albums.filter((a) => !cachedIds.includes(String(a.id)));
      if (newAlbums.length > 0) {
        newReleasesByArtist[artistId] = newAlbums;
        await cacheRef.set({ albumIds: latestIds, checkedAt: Date.now() });
      }
    }

    // Send notifications
    let notified = 0;
    for (const subDoc of subsSnapshot.docs) {
      const uid = subDoc.id;
      const { subscription } = subDoc.data();
      const userFavorites = favoritesByUser[uid] ?? [];

      for (const favorite of userFavorites) {
        const newAlbums = newReleasesByArtist[favorite.artistId];
        if (!newAlbums?.length) continue;

        for (const album of newAlbums) {
          const releaseType =
            RECORD_TYPE_MAP[album.record_type?.toLowerCase()] ?? 'Album';
          const coverUrl =
            album.cover_xl ?? album.cover_big ?? album.cover_medium ?? '';
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
            // Subscription expired or invalid — clean up
            if (err.statusCode === 404 || err.statusCode === 410) {
              await db.collection('push-subscriptions').doc(uid).delete();
            }
          }
        }
      }
    }

    return res.status(200).json({ notified });
  } catch (error) {
    console.error('check-releases error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
