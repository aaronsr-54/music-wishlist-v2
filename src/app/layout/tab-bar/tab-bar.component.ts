import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  template: `
    <nav class="tab-bar">
      <button
        class="tab"
        [class.active]="activeTab === 'search'"
        (click)="tabChange.emit('search')"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="9.5" cy="9.5" r="6.25" stroke="currentColor" stroke-width="1.5"/>
          <path d="M14 14L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>Buscar</span>
      </button>
      <button
        class="tab"
        [class.active]="activeTab === 'wishlist'"
        (click)="tabChange.emit('wishlist')"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 19S3 13.5 3 8a5 5 0 018-4A5 5 0 0119 8c0 5.5-8 11-8 11z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        <span>Wishlist</span>
      </button>
    </nav>
  `,
  styles: [`
    .tab-bar {
      display: flex;
      height: 64px;
      background: var(--ink-200);
      border-top: 1px solid var(--ink-100);
      flex-shrink: 0;
      padding-bottom: env(safe-area-inset-bottom, 0);
    }

    .tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--bone-700);
      font-family: var(--font-body);
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.04em;
      transition: color var(--dur-fast) var(--ease);
    }

    .tab.active {
      color: var(--bone);
    }

    .tab.active svg {
      filter: drop-shadow(0 0 6px rgba(205,197,183,0.35));
    }
  `]
})
export class TabBarComponent {
  @Input({ required: true }) activeTab: 'search' | 'wishlist' = 'search';
  @Output() tabChange = new EventEmitter<'search' | 'wishlist'>();
}
