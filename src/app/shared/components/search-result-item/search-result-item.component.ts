import { Component, input, output } from '@angular/core';
import { Track } from '../../models/track.model';
import { CoverComponent } from '../cover/cover.component';
import { TypeChipComponent } from '../type-chip/type-chip.component';

@Component({
  selector: 'app-search-result-item',
  standalone: true,
  imports: [CoverComponent, TypeChipComponent],
  template: `
    @switch (type()) {
      @case ('artist') {
        <button
          class="item-row artist-row"
          (click)="onArtistClick.emit(item())"
        >
          <app-cover
            [coverUrl]="item().coverUrl"
            [name]="item().name"
            [size]="56"
          />
          <div class="item-meta">
            <span class="item-title">{{ item().name }}</span>
            <div class="item-subtitle">
              @if (item().fanCount) {
                <span class="item-stat item-stat--fans"
                  ><b> {{ formatFans(item().fanCount) }} </b> fan{{
                    item().fanCount !== 1 ? 's' : ''
                  }}</span
                >
                <span class="item-sep">·</span>
              }
              @if (item().albumCount) {
                <span class="item-stat item-stat--albums">
                  {{ item().albumCount }}
                  álbum{{ item().albumCount !== 1 ? 's' : '' }}</span
                >
              }
            </div>
          </div>
        </button>
      }
      @case ('track') {
        <div class="item-row">
          <app-cover
            [coverUrl]="item().coverUrl"
            [name]="item().name"
            [size]="56"
          />
          <div class="item-meta">
            <span class="item-title">{{ item().name }}</span>
            <div class="item-subtitle">
              <span class="item-artist">{{ item().artists[0] }}</span>
              ·
              <app-type-chip [type]="item().type" />
            </div>
          </div>
          @if (showAddButton()) {
            <button
              class="add-btn"
              [class.added]="isAdded()"
              (click)="onAddClick.emit(item())"
              [title]="
                isAdded() ? 'Quitar de wishlist' : 'Añadir a wishlist'
              "
            >
              @if (isAdded()) {
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3 8.5L6.5 12L13 5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              } @else {
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M8 3V13M3 8H13"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              }
            </button>
          }
        </div>
      }
    }
  `,
  styles: [
    `
      .artist-row {
        background: none;
        border: none;
        cursor: pointer;
        padding: 10px 8px;
        text-align: left;
        width: 100%;
      }

      .artist-row:hover {
        background: var(--ink-100);
        border-radius: var(--radius-md);
        transition: border-radius var(--dur-fast) var(--ease);
      }

      .item-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 8px;
        border-bottom: 1px solid var(--ink-200);
        margin: 0 -8px;
        transition: background var(--dur-fast) var(--ease);
      }

      .item-row:last-child {
        border-bottom: none;
      }

      .item-meta {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }

      .item-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--bone-100);
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        height: 18px;
        text-overflow: ellipsis;
        font-family: var(--font-display);
      }

      .item-subtitle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--bone-800);
      }

      .item-artist {
        font-size: 13px;
        color: var(--bone-600);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        height: 15px;
      }

      .item-stat {
        font-size: 12px;
        color: var(--bone-700);
      }

      .item-stat--albums {
        font-family: var(--font-display);
        font-style: italic;
      }

      .item-sep {
        color: var(--bone-800);
      }

      .add-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--bone-600);
        flex-shrink: 0;
        transition:
          background var(--dur-fast) var(--ease),
          color var(--dur-fast) var(--ease),
          transform var(--dur-fast) var(--ease);
        border: none;
        background: none;
        padding: 0;
      }

      .add-btn:hover {
        background: var(--ink-200);
        color: var(--bone-100);
      }

      .add-btn:active {
        transform: scale(0.82);
      }

      .add-btn.added {
        background: var(--bone);
        color: var(--ink);
        animation: popIn 220ms var(--ease) both;
      }
    `,
  ],
})
export class SearchResultItemComponent {
  item = input.required<Track>();
  type = input.required<'artist' | 'track'>();
  isAdded = input(false);
  showAddButton = input(true);

  onArtistClick = output<Track>();
  onAddClick = output<Track>();

  formatFans(count: number): string {
    if (count >= 1000000)
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000)
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return count.toString();
  }
}
