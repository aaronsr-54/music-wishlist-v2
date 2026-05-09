// firebase-admin NOT used here — avoids gRPC/OpenSSL issues on Vercel.
// User's own ID token authenticates directly against Firestore REST API.
// Security rules enforce userId isolation.

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
// Already public in the Angular bundle:
const FIREBASE_API_KEY = 'AIzaSyDIIW0YmNtS0WMcSyQa8l5ntv89C7SWlUo';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function getUidFromToken(idToken) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!res.ok) throw new Error('Token verification failed');
  const { users } = await res.json();
  if (!users?.[0]) throw new Error('User not found');
  return users[0].localId;
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(val).map(([k, v]) => [k, toFirestoreValue(v)])
        ),
      },
    };
  }
  return { stringValue: String(val) };
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

  const idToken = authHeader.slice(7);

  try {
    const uid = await getUidFromToken(idToken);
    const docUrl = `${FIRESTORE_BASE}/push-subscriptions/${uid}`;

    if (action === 'subscribe') {
      if (!subscription?.endpoint) {
        return res.status(400).json({ error: 'Missing subscription' });
      }
      const r = await fetch(docUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          fields: {
            subscription: toFirestoreValue(subscription),
            updatedAt: { integerValue: String(Date.now()) },
          },
        }),
      });
      if (!r.ok) throw new Error(`Firestore PATCH failed: ${await r.text()}`);
    } else {
      const r = await fetch(docUrl, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!r.ok && r.status !== 404) throw new Error(`Firestore DELETE failed: ${await r.text()}`);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    const msg = error.message ?? String(error);
    console.error('push error:', msg);
    return res.status(500).json({ error: msg });
  }
};
