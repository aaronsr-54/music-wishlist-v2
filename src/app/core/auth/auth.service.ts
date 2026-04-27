import { Injectable, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  authState,
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  private firebaseUser = toSignal(authState(this.auth), { initialValue: null });

  readonly authState$ = authState(this.auth);

  currentUser = this.firebaseUser;
  isLoggedIn = computed(() => !!this.currentUser());

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
    this.router.navigate(['/']);
  }

  async logout(): Promise<void> {
    await signOut(this.auth).catch(() => {});
    this.router.navigate(['/login']);
  }
}
