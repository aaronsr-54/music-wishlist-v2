import { Injectable, NgZone, computed, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  authState,
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { WishlistService } from '../firebase/wishlist.service';
import { FavoriteArtistsService } from '../firebase/favorite-artists.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private wishlistService = inject(WishlistService);
  private favoriteArtistsService = inject(FavoriteArtistsService);
  private ngZone = inject(NgZone);

  private firebaseUser = toSignal(authState(this.auth), { initialValue: null });
  demoMode = signal(false);

  readonly authState$ = authState(this.auth);

  constructor() {
    effect(() => {
      const firebaseUser = this.firebaseUser();
      if (firebaseUser) {
        this.wishlistService.initListener(firebaseUser.uid);
        this.favoriteArtistsService.initListener();
      } else if (!this.demoMode()) {
        this.wishlistService.stopListener();
        this.favoriteArtistsService.stopListener();
      }
    });
  }

  currentUser = computed(() => {
    const firebaseUser = this.firebaseUser();
    if (firebaseUser) return firebaseUser;
    if (this.demoMode()) {
      return {
        uid: 'demo-user',
        email: 'demo@example.com',
        displayName: 'Demo User',
        photoURL: null,
        emailVerified: false,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => '',
        getIdTokenResult: async () => ({
          token: '',
          expirationTime: '',
          authTime: '',
          issuedAtTime: '',
          signInProvider: null,
          signInSecondFactor: null,
          claims: {},
        }),
        reload: async () => {},
        toJSON: () => ({}),
      } as any;
    }
    return null;
  });

  isLoggedIn = computed(() => !!this.currentUser() || this.demoMode());

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
    this.router.navigate(['/']);
  }

  async logout(): Promise<void> {
    this.wishlistService.stopListener();
    await signOut(this.auth).catch(() => {});
    this.demoMode.set(false);
    this.router.navigate(['/login']);
  }

  setDemoMode(enabled: boolean): void {
    this.demoMode.set(enabled);
    if (enabled) {
      this.wishlistService.initListener('demo-user');
      this.favoriteArtistsService.initListener();
    }
  }
}
