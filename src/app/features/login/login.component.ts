import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="screen">
      <header class="eyebrow">
        <span class="label"><span class="label--number">00/</span> ACCESO</span>
        <span class="version">v0.1 - beta</span>
      </header>

      <main class="hero">
        <h1 class="wordmark">
          Music <span class="wordmark--accent">Wishlist</span>.
        </h1>
        <p class="description">
          Lleva un registro de la música que quieres descubrir. Busca, añade y
          marca lo que ya tienes.
        </p>
      </main>

      <footer class="cta">
        <span class="cta-label">INICIA SESIÓN CON</span>

        <div class="cta-buttons">
          <button class="google-btn" (click)="login()" [disabled]="loading()">
            @if (loading()) {
              <span class="dot-pulse">
                <span></span><span></span><span></span>
              </span>
            } @else {
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="var(--ink-100)"
              >
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
                />
                <path
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"
                />
              </svg>
              Continuar con Google
            }
          </button>

        </div>
        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
      </footer>
    </div>
  `,
  styles: [
    `
      .screen {
        min-height: 100dvh;
        background: var(--ink);
        display: flex;
        flex-direction: column;
        padding: 2rem;
        margin: 0 auto;
        position: relative;
        overflow: hidden;

        @media (min-width: 600px) {
          padding: 2rem 6rem;
        }
      }

      .screen::before {
        content: '';
        position: absolute;
        top: -120px;
        right: -80px;
        width: 320px;
        height: 320px;
        border-radius: 50%;
        background: radial-gradient(
          circle,
          rgba(200, 149, 107, 0.07) 0%,
          transparent 70%
        );
        pointer-events: none;
      }

      .eyebrow {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 24px;
        animation: rowEnter var(--dur-slow) var(--ease) both;
        animation-delay: 0ms;
      }

      .label {
        font-family: var(--font-display);
        font-size: 12px;
        color: var(--bone);
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .label--number {
        color: var(--bone-700);
        font-weight: 400;
        font-style: italic;
      }

      .version {
        color: var(--bone-700);
        font-size: 11px;
        font-style: italic;
        font-weight: 500;
      }

      .hero {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 20px;
        padding: 48px 0;
        animation: rowEnter var(--dur-slow) var(--ease) both;
        animation-delay: 80ms;
      }

      .wordmark {
        font-family: var(--font-display);
        font-size: clamp(68px, 10vw, 88px);
        font-weight: 700;
        color: var(--bone);
        line-height: 0.8;
        margin: 0;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, var(--bone) 60%, var(--bone-600));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .wordmark--accent {
        font-weight: 200;
        font-style: italic;
        margin-left: -7px;
      }

      .description {
        font-family: var(--font-body);
        font-size: 14px;
        line-height: 1.2;
        color: var(--bone-600);
        margin: 0;
      }

      .cta {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-top: 24px;
        animation: rowEnter var(--dur-slow) var(--ease) both;
        animation-delay: 200ms;
      }

      .cta-buttons {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        align-items: flex-end;
      }

      .cta-label {
        font-family: var(--font-body);
        font-size: 12px;
        font-weight: 500;
        color: var(--bone-700);
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
        transition:
          opacity var(--dur-fast) var(--ease),
          transform var(--dur-fast) var(--ease);
        align-self: flex-start;
        min-width: 220px;
        min-height: 48px;

        @media (max-width: 480px) {
          width: 100%;
          justify-content: center;
        }
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
    `,
  ],
})
export class LoginComponent {
  private auth = inject(AuthService);

  loading = signal(false);
  error = signal('');

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

}
