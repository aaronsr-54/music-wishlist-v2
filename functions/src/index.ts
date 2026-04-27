import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const SPOTIFY_CLIENT_ID = defineSecret('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = defineSecret('SPOTIFY_CLIENT_SECRET');

let cachedToken: string | null = null;
let tokenExpiry = 0;
const BUFFER_MS = 60_000;

export const spotifyToken = onRequest(
  {
    region: 'europe-west1',
    secrets: [SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET],
    cors: true
  },
  async (_req, res) => {
    if (cachedToken && Date.now() < tokenExpiry - BUFFER_MS) {
      res.json({ access_token: cachedToken, expires_in: Math.floor((tokenExpiry - Date.now()) / 1000) });
      return;
    }

    const credentials = Buffer.from(
      `${SPOTIFY_CLIENT_ID.value()}:${SPOTIFY_CLIENT_SECRET.value()}`
    ).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      res.status(500).json({ error: 'Failed to fetch Spotify token' });
      return;
    }

    const data = await response.json() as { access_token: string; expires_in: number };
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000;

    res.json(data);
  }
);
