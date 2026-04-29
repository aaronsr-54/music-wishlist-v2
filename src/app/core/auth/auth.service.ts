import { Injectable, computed, inject, signal } from '@angular/core';
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private wishlistService = inject(WishlistService);

  private firebaseUser = toSignal(authState(this.auth), { initialValue: null });
  demoMode = signal(false);

  readonly authState$ = authState(this.auth);

  currentUser = this.firebaseUser;
  isLoggedIn = computed(() => !!this.currentUser() || this.demoMode());

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
    this.wishlistService.initListener();
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
      this.wishlistService.initListener();
    }
  }
}
