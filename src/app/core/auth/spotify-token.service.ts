import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

const CACHE_KEY = 'spotify_token';
const CACHE_EXP = 'spotify_token_exp';
const BUFFER_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class SpotifyTokenService {
  async getToken(): Promise<string> {
    const cached = localStorage.getItem(CACHE_KEY);
    const exp = Number(localStorage.getItem(CACHE_EXP) ?? 0);

    if (cached && Date.now() < exp - BUFFER_MS) {
      return cached;
    }

    const auth = btoa(`${environment.spotify.clientId}:${environment.spotify.clientSecret}`);
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const data = await res.json() as { access_token: string; expires_in: number };
    localStorage.setItem(CACHE_KEY, data.access_token);
    localStorage.setItem(CACHE_EXP, String(Date.now() + data.expires_in * 1000));

    return data.access_token;
  }
}
