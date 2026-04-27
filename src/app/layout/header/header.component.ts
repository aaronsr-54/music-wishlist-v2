import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
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

      <nav class="nav-pills">
        <button
          class="nav-pill"
          [class.active]="activeTab === 'search'"
          (click)="tabChange.emit('search')"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle
              cx="6"
              cy="6"
              r="4.25"
              stroke="currentColor"
              stroke-width="1.25"
            />
            <path
              d="M9.5 9.5L12 12"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linecap="round"
            />
          </svg>
          Buscar
        </button>
        <button
          class="nav-pill"
          [class.active]="activeTab === 'wishlist'"
          (click)="tabChange.emit('wishlist')"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 12S2 8.5 2 5a3 3 0 015-2.24A3 3 0 0112 5c0 3.5-5 7-5 7z"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linejoin="round"
            />
          </svg>
          Wishlist
        </button>
      </nav>

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
        font-size: 24px;
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

      .nav-pills {
        display: flex;
        gap: 4px;
        padding: 4px;
        background: var(--ink-200);
        border-radius: var(--radius-pill);
      }

      @media (max-width: 767px) {
        .nav-pills {
          display: none;
        }
      }

      .nav-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: var(--radius-pill);
        border: none;
        background: none;
        color: var(--bone-600);
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--dur-fast) var(--ease);
        white-space: nowrap;
      }

      .nav-pill.active {
        background: var(--bone);
        color: var(--ink);
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
          font-size: 16px;
        }

        .user-area {
          min-width: auto;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  @Input({ required: true }) activeTab: 'search' | 'wishlist' = 'search';
  @Output() tabChange = new EventEmitter<'search' | 'wishlist'>();
  @Output() openProfile = new EventEmitter<void>();

  private auth = inject(AuthService);
  user = this.auth.currentUser;
}
