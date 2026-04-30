import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AvatarComponent],
  template: `
    <header class="header">
      <h1 class="wordmark">
        Music <span class="wordmark--accent">Wishlist</span>.
      </h1>

      <div class="user-area">
        @if (user(); as u) {
          <button
            class="user-btn"
            (click)="openProfile.emit()"
            title="Abrir perfil"
          >
            <app-avatar [name]="u.displayName ?? u.email ?? 'U'" [size]="32" />
          </button>
        }
      </div>
    </header>
  `,
  styles: [
    `
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 64px;
        padding: 0 24px;
        flex-shrink: 0;
        gap: 16px;
      }

      .wordmark {
        font-family: var(--font-display);
        font-size: clamp(1.5rem, 1.3957rem + 0.4049vw, 1.75rem);
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
      }

      .user-area {
        min-width: 160px;
        display: flex;
        justify-content: flex-end;
      }

      .user-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        border-radius: 50%;
        transition: opacity var(--dur-fast) var(--ease);
      }

      .user-btn:hover {
        opacity: 0.8;
      }

      @media (max-width: 767px) {
        .header {
          padding: 0 16px;
          height: 56px;
        }

        .logo {
          min-width: auto;
          flex: 1;
        }

        .logo-text {
          font-size: clamp(1rem, 0.8957rem + 0.4049vw, 1.25rem);
        }

        .user-area {
          min-width: auto;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  @Output() openProfile = new EventEmitter<void>();

  private auth = inject(AuthService);
  user = this.auth.currentUser;
}
