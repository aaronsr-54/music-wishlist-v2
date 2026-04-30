import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../../shared/icons/icon.component';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [IconComponent],
  template: `
    <nav class="tab-bar">
      <button
        class="tab"
        [class.active]="activeTab === 'releases'"
        (click)="tabChange.emit('releases')"
      >
        <app-icon name="music-note" class="tab-icon" />
        @if (activeTab === 'releases') {
          <span>LANZAMIENTOS</span>
        }
      </button>
      <button
        class="tab"
        [class.active]="activeTab === 'search'"
        (click)="tabChange.emit('search')"
      >
        <app-icon name="search" class="tab-icon" />
        @if (activeTab === 'search') {
          <span>BUSCADOR</span>
        }
      </button>
      <button
        class="tab"
        [class.active]="activeTab === 'wishlist'"
        (click)="tabChange.emit('wishlist')"
      >
        <app-icon name="heart" class="tab-icon" />
        @if (activeTab === 'wishlist') {
          <span>WHISLIST</span>
        }
      </button>
    </nav>
  `,
  styles: [
    `
      .tab-bar {
        display: flex;
        padding: 8px;
        padding-bottom: 24px;
        background: linear-gradient(
          0deg,
          var(--ink-200) 0%,
          var(--ink-100) 100%
        );
        border-top: 1px solid var(--ink-100);
        box-shadow: 0px -4px 10px 5px rgb(0 0 0 / 10%);
        flex-shrink: 0;
        border-top-left-radius: var(--radius-xl);
        border-top-right-radius: var(--radius-xl);
        width: 100%;
      }

      .tab {
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--bone-700);
        font-family: var(--font-body);
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.04em;
        transition: color var(--dur-fast) var(--ease);
        padding: 12px 0;
        border-radius: var(--radius-pill);
      }

      .tab span {
        font-family: var(--font-display);
        font-weight: 700;
      }

      .tab-icon {
        width: clamp(1.5rem, 3.5vw, 2rem);
        height: clamp(1.5rem, 3.5vw, 2rem);
      }

      .tab.active {
        color: var(--ink);
        background-color: var(--bone);
        flex-grow: 2;
      }
    `,
  ],
})
export class TabBarComponent {
  @Input({ required: true }) activeTab: 'search' | 'wishlist' | 'releases' =
    'search';
  @Output() tabChange = new EventEmitter<'search' | 'wishlist' | 'releases'>();
}
