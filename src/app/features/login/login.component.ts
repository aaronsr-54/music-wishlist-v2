import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="screen">
      <header class="eyebrow">
        <span class="label">00/ Acceso</span>
        <span class="version">v0.1 beta</span>
      </header>

      <main class="hero">
        <h1 class="wordmark">Music Wishlist</h1>
        <p class="description">
          Lleva un registro de la música que quieres descubrir.
          Busca, añade y marca lo que ya tienes.
        </p>
      </main>

      <footer class="cta">
        <span class="cta-label">Inicia sesión con</span>

        <button class="google-btn" (click)="login()" [disabled]="loading()">
          @if (loading()) {
            <span class="dot-pulse">
              <span></span><span></span><span></span>
            </span>
          } @else {
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          }
        </button>

        @if (showDemo()) {
          <button class="demo-btn" (click)="loginDemo()" title="Demo login (solo desarrollo)">
            Demo: demo / 1234
          </button>
        }


        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <p class="legal">Al continuar aceptas los términos de uso.</p>
      </footer>
    </div>
  `,
  styles: [`
    .screen {
      min-height: 100dvh;
      background: var(--ink);
      display: flex;
      flex-direction: column;
      padding: 24px;
      max-width: 480px;
      margin: 0 auto;
      position: relative;
      overflow: hidden;
    }

    .screen::before {
      content: '';
      position: absolute;
      top: -120px;
      right: -80px;
      width: 320px;
      height: 320px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(200,149,107,0.07) 0%, transparent 70%);
      pointer-events: none;
    }

    .eyebrow {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--ink-200);
    }

    .label, .version {
      font-family: var(--font-display);
      font-size: 12px;
      color: var(--bone-600);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .hero {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 20px;
      padding: 48px 0;
    }

    .wordmark {
      font-family: var(--font-display);
      font-size: clamp(48px, 10vw, 88px);
      font-weight: 700;
      color: var(--bone);
      line-height: 1;
      margin: 0;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, var(--bone) 60%, var(--bone-600));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .description {
      font-family: var(--font-body);
      font-size: 16px;
      line-height: 1.6;
      color: var(--bone-600);
      margin: 0;
      max-width: 320px;
    }

    .cta {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 24px;
      border-top: 1px solid var(--ink-200);
    }

    .cta-label {
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--bone-600);
    }

    .google-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 24px;
      border-radius: var(--radius-pill);
      background: var(--bone);
      color: var(--ink);
      font-family: var(--font-body);
      font-size: 15px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: opacity var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
      align-self: flex-start;
      min-width: 220px;
      min-height: 48px;
    }

    .google-btn:hover:not(:disabled) {
      opacity: 0.88;
      transform: translateY(-1px);
    }

    .google-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .google-btn:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }

    .demo-btn {
      padding: 10px 16px;
      font-size: 12px;
      background: var(--ink-200);
      color: var(--bone-600);
      border: 1px solid var(--ink-100);
      border-radius: var(--radius-pill);
      cursor: pointer;
      transition: all var(--dur-fast) var(--ease);
      align-self: flex-start;
      font-family: var(--font-body);
    }

    .demo-btn:hover {
      background: var(--ink-100);
      color: var(--bone);
    }

    .dot-pulse {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .error {
      font-size: 13px;
      color: #e57373;
      margin: 0;
    }

    .legal {
      font-size: 12px;
      color: var(--bone-700);
      margin: 0;
    }

  `]
})
export class LoginComponent {
  private auth = inject(AuthService);

  loading = signal(false);
  error = signal('');
  showDemo = signal(false);

  constructor() {
    this.showDemo.set(this.auth.isDemoMode());
  }

  async login() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.loginWithGoogle();
    } catch (e: any) {
      this.error.set('Error al iniciar sesión. Inténtalo de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  loginDemo() {
    this.auth.loginMock('demo', '1234');
  }
}
