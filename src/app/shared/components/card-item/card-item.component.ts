import { Component, computed, input, output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ReleaseItem } from '../../models/release-item.model';
import { CoverComponent } from '../cover/cover.component';
import { TypeChipComponent } from '../type-chip/type-chip.component';
import { PreviewService } from '../../../core/services/preview.service';
import { PreviewSpinnerComponent } from '../preview-spinner/preview-spinner.component';

@Component({
  selector: 'app-card-item',
  standalone: true,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
  imports: [DatePipe, CoverComponent, TypeChipComponent, PreviewSpinnerComponent],
  template: `
    <div class="card">
      <button
        class="cover-btn"
        (click)="onPlayPreview(releaseItem())"
        [title]="
          previewState().trackId === releaseItem().id &&
          previewState().isPlaying
            ? 'Pausar'
            : 'Reproducir preview'
        "
        [disabled]="!releaseItem().previewUrl"
      >
        <app-cover
          [coverUrl]="releaseItem().coverUrl"
          [name]="releaseItem().name"
        />
        @if (previewState().trackId === releaseItem().id) {
          <div class="preview-overlay" @fadeInOut>
            <app-preview-spinner
              [progress]="previewState().progress"
              [isPlaying]="previewState().isPlaying"
              source="card"
            />
          </div>
        }
      </button>
      <div class="item-meta">
        <div class="item-stats">
          <span class="release-date">
            <b>{{ releaseItem().releaseDate | date: 'dd' }}</b>
            <em>{{ releaseItem().releaseDate | date: 'LLL' }}</em>
          </span>
          <app-type-chip [type]="releaseItem().type" />
        </div>
        <div class="item-content">
          <span class="item-title">{{ releaseItem().name }}</span>
          <span class="item-artist">{{ releaseItem().artist }}</span>
        </div>
        <button
          class="action-btn add-to-wishlist"
          [class.added]="isAdded()"
          (click)="onToggleWishlist()"
        >
          @if (isAdded()) {
            <svg viewBox="0 0 16 16" fill="none" class="card-icon">
              <path
                d="M3 8.5L6.5 12L13 5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>Añadido</span>
          } @else {
            <svg viewBox="0 0 16 16" fill="none" class="card-icon">
              <path
                d="M8 3V13M3 8H13"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            <span>Guardar</span>
          }
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        display: flex;
        flex-direction: column;
        padding: 8px;
        border-radius: var(--radius-md);
        background: var(--ink-200);
        gap: 4px;
        width: 100%;
        overflow: hidden;
      }

      .item-meta {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }

      .item-stats {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--bone-800);
      }

      .item-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .item-title {
        max-width: 100%;
        font-size: clamp(0.875rem, 0.7707rem + 0.4049vw, 1.125rem);
        font-weight: 600;
        color: var(--bone-100);
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: var(--font-display);
      }

      .item-artist {
        max-width: 100%;
        font-size: clamp(0.75rem, 0.6457rem + 0.4049vw, 1rem);
        color: var(--bone-600);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .release-date {
        font-size: clamp(0.75rem, 0.6457rem + 0.4049vw, 1rem);
        color: var(--bone-600);
        font-family: var(--font-display);
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .release-date b {
        font-weight: 700;
        font-style: normal;
        color: var(--bone-700);
      }

      .release-date em {
        font-style: italic;
        font-weight: 400;
        color: var(--bone-600);
      }

      .action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        border: 1px solid var(--bone-600);
        border-radius: 4px;
        background: none;
        cursor: pointer;
        color: var(--bone-600);
        padding: 6px 12px;
        text-transform: uppercase;
        transition:
          background var(--dur-fast) var(--ease),
          color var(--dur-fast) var(--ease),
          border-color var(--dur-fast) var(--ease);
      }

      .action-btn:hover {
        background: var(--ink-200);
        color: var(--bone-100);
        border-color: var(--bone-100);
      }

      .action-btn:active {
        opacity: 0.8;
      }

      .action-btn.added {
        background: var(--bone);
        color: var(--ink);
        border-color: var(--bone);
        animation: popIn 220ms var(--ease) both;
      }

      .action-btn.added span {
        font-family: var(--font-display);
        font-weight: 800;
      }

      .action-btn span {
        font-size: clamp(0.75rem, 0.6979rem + 0.2024vw, 0.875rem);
        font-weight: 500;
        flex-grow: 1;
        height: 12px;
      }

      .card-icon {
        width: clamp(1.25rem, 3vw, 1.5rem);
        height: clamp(1.25rem, 3vw, 1.5rem);
      }

      .cover-btn {
        position: relative;
        border: none;
        background: none;
        padding: 0;
        cursor: pointer;
        flex-shrink: 0;
        border-radius: var(--radius-sm);
        transition: opacity var(--dur-fast) var(--ease);
        width: 100%;
      }

      .cover-btn:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .cover-btn:hover:not(:disabled) {
        opacity: 0.8;
      }

      .preview-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.6);
        border-radius: var(--radius-sm);
        backdrop-filter: blur(1.5px);
      }
    `,
  ],
})
export class CardItemComponent {
  private preview = inject(PreviewService);

  item = input.required<ReleaseItem>();
  isAdded = input(false);
  showTypeChip = input(true);

  toggleWishlist = output<ReleaseItem>();

  releaseItem = computed(() => {
    return this.item() as ReleaseItem;
  });
  previewState = computed(() => this.preview.state());

  onToggleWishlist() {
    this.toggleWishlist.emit(this.item());
  }

  onPlayPreview(item: ReleaseItem): void {
    if (!item.previewUrl) return;
    this.preview.play(item.id, item.previewUrl);
  }
}
