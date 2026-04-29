import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  template: `
    <nav class="tab-bar">
      <button
        class="tab"
        [class.active]="activeTab === 'releases'"
        (click)="tabChange.emit('releases')"
      >
        <svg
          fill="currentColor"
          height="18"
          width="18"
          viewBox="0 0 24 24"
          xml:space="preserve"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <g id="new">
              <g>
                <polygon
                  points="13,23 11,23 11,13.7 3,18.4 2,16.6 10,12 2,7.4 3,5.6 11,10.3 11,1 13,1 13,10.3 21,5.6 22,7.4 14,12 22,16.6 21,18.4 13,13.7 "
                ></polygon>
              </g>
            </g>
          </g>
        </svg>
        @if (activeTab === 'releases') {
          <span>LANZAMIENTOS</span>
        }
      </button>
      <button
        class="tab"
        [class.active]="activeTab === 'search'"
        (click)="tabChange.emit('search')"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
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
        @if (activeTab === 'search') {
          <span>BUSCADOR</span>
        }
      </button>
      <button
        class="tab"
        [class.active]="activeTab === 'wishlist'"
        (click)="tabChange.emit('wishlist')"
      >
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
          <path
            d="M11 19S3 13.5 3 8a5 5 0 018-4A5 5 0 0119 8c0 5.5-8 11-8 11z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
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
    'releases';
  @Output() tabChange = new EventEmitter<'search' | 'wishlist' | 'releases'>();
}
