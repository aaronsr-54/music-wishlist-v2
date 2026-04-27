import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  authState
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { ConfigService } from '../config/config.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private config = inject(ConfigService);

  private useMockAuth = signal(false);
  private mockUser = signal<any>(null);
  private firebaseUser = toSignal(authState(this.auth), { initialValue: null });

  readonly authReady$ = authState(this.auth).pipe(take(1));

  currentUser = computed(() =>
    this.useMockAuth() ? this.mockUser() : this.firebaseUser()
  );
  isLoggedIn = computed(() => !!this.currentUser());

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
    this.router.navigate(['/']);
  }

  loginMock(username: string, password: string): void {
    if (!this.config.isDemoMode()) {
      console.warn('Demo mode not enabled');
      return;
    }
    if (username === 'demo' && password === '1234') {
      this.useMockAuth.set(true);
      this.mockUser.set({
        uid: 'mock-user-123',
        email: 'demo@example.com',
        displayName: 'demo'
      });
      this.router.navigate(['/']);
    }
  }

  isDemoMode(): boolean {
    return this.config.isDemoMode();
  }

  async logout(): Promise<void> {
    this.useMockAuth.set(false);
    this.mockUser.set(null);
    await signOut(this.auth).catch(() => {});
    this.router.navigate(['/login']);
  }
}
