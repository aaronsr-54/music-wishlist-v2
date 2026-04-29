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
        <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
          <circle
            cx="9.5"
            cy="9.5"
            r="6.25"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path
            d="M14 14L18 18"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        <span>BUSCADOR</span>
      </button>
      <button
        class="tab"
        [class.active]="activeTab === 'wishlist'"
        (click)="tabChange.emit('wishlist')"
      >
        <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
          <path
            d="M11 19S3 13.5 3 8a5 5 0 018-4A5 5 0 0119 8c0 5.5-8 11-8 11z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
        <span>WHISLIST</span>
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
        border-top-left-radius: var(--radius-lg);
        border-top-right-radius: var(--radius-lg);
        width: 100%;
      }

      .tab {
        flex: 1;
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
        padding: 18px 0;
        border-radius: var(--radius-lg);
      }

      .tab.active {
        color: var(--ink);
        background-color: var(--bone);
      }

      .tab.active span {
        font-family: var(--font-display);
        font-weight: 700;
        border-bottom: 2px solid var(--ink);
      }
    `,
  ],
})
export class TabBarComponent {
  @Input({ required: true }) activeTab: 'search' | 'wishlist' = 'search';
  @Output() tabChange = new EventEmitter<'search' | 'wishlist'>();
}
