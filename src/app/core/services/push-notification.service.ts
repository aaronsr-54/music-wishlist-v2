import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly isSupported =
    typeof window !== 'undefined' &&
    'PushManager' in window &&
    'serviceWorker' in navigator;

  permissionState = signal<NotificationPermission>('default');
  isSubscribed = signal(false);
  loading = signal(false);

  constructor() {
    if (!this.isSupported) return;
    this.permissionState.set(Notification.permission);
    this.syncSubscriptionState();
  }

  private async syncSubscriptionState(): Promise<void> {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      this.isSubscribed.set(!!sub);
    } catch {
      this.isSubscribed.set(false);
    }
  }

  async subscribe(): Promise<'granted' | 'denied' | 'error'> {
    if (!this.isSupported || this.auth.demoMode()) return 'error';
    this.loading.set(true);
    let sub: PushSubscription | null = null;
    try {
      const permission = await Notification.requestPermission();
      this.permissionState.set(permission);
      if (permission !== 'granted') return 'denied';

      const reg = await navigator.serviceWorker.ready;
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(environment.vapidPublicKey),
      });

      const user = this.auth.currentUser();
      if (!user) throw new Error('No user');
      const token = await user.getIdToken();

      await firstValueFrom(
        this.http.post('/api/push', { action: 'subscribe', subscription: sub.toJSON() }, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      this.isSubscribed.set(true);
      return 'granted';
    } catch (err) {
      console.error('[PushNotification] subscribe error:', err);
      if (sub) await sub.unsubscribe().catch(() => {});
      return 'error';
    } finally {
      this.loading.set(false);
    }
  }

  async sendTestNotification(): Promise<void> {
    if (!this.isSupported) return;
    const reg = await navigator.serviceWorker.ready;

    const samples = [
      {
        releaseType: 'Album',
        emoji: '💿',
        artist: 'The Weeknd',
        title: 'Hurry Up Tomorrow',
        albumId: '302127',
        cover: 'https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/1000x1000-000000-80-0-0.jpg',
      },
      {
        releaseType: 'EP',
        emoji: '🎧',
        artist: 'Billie Eilish',
        title: 'Guitar Songs',
        albumId: '123456',
        cover: 'https://e-cdns-images.dzcdn.net/images/cover/c2b03f0a7b2af3f89c99cdf02e7a1d48/1000x1000-000000-80-0-0.jpg',
      },
      {
        releaseType: 'Single',
        emoji: '🎵',
        artist: 'Kendrick Lamar',
        title: 'luther',
        albumId: '789012',
        cover: 'https://e-cdns-images.dzcdn.net/images/cover/2a5b47ab5ae5f3413ec3eaada94ca700/1000x1000-000000-80-0-0.jpg',
      },
    ];

    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      await new Promise<void>((resolve) => setTimeout(resolve, i * 1200));
      reg.showNotification(`${s.emoji} Nuevo ${s.releaseType} de ${s.artist}`, {
        body: s.title,
        icon: s.cover,
        image: s.cover,
        badge: '/favicon.png',
        data: { albumId: s.albumId },
        actions: [
          { action: 'add', title: '+ Wishlist' },
          { action: 'view', title: 'Ver release' },
        ],
      } as NotificationOptions);
    }
  }

  async unsubscribe(): Promise<void> {
    if (!this.isSupported) return;
    this.loading.set(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      const user = this.auth.currentUser();
      if (user && !this.auth.demoMode()) {
        const token = await user.getIdToken();
        await firstValueFrom(
          this.http.post('/api/push', { action: 'unsubscribe' }, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );
      }
      this.isSubscribed.set(false);
    } catch {
      // ignore
    } finally {
      this.loading.set(false);
    }
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
