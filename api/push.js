import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

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

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { action, subscription } = req.body ?? {};
  if (action !== 'subscribe' && action !== 'unsubscribe') {
    return res.status(400).json({ error: 'Missing action' });
  }

  try {
    initAdmin();
    const uid = (await getAuth().verifyIdToken(authHeader.slice(7))).uid;
    const db = getFirestore();
    const docRef = db.collection('push-subscriptions').doc(uid);

    if (action === 'subscribe') {
      if (!subscription?.endpoint) {
        return res.status(400).json({ error: 'Missing subscription' });
      }
      await docRef.set({ subscription, updatedAt: Date.now() });
    } else {
      await docRef.delete();
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('push error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
