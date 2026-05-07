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
        this.http.post(
          '/api/push',
          { action: 'subscribe', subscription: sub.toJSON() },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
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
          this.http.post(
            '/api/push',
            { action: 'unsubscribe' },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
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
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
