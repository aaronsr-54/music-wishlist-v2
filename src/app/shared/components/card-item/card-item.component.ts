import { Component, computed, input, output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { fadeInOut } from '../../animations/animations';
import { ReleaseItem } from '../../models/release-item.model';
import { CoverComponent } from '../cover/cover.component';
import { TypeChipComponent } from '../type-chip/type-chip.component';
import { PreviewService } from '../../../core/services/preview.service';
import { PreviewSpinnerComponent } from '../preview-spinner/preview-spinner.component';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-card-item',
  standalone: true,
  animations: [fadeInOut()],
  imports: [
    DatePipe,
    CoverComponent,
    TypeChipComponent,
    PreviewSpinnerComponent,
    IconComponent,
  ],
  template: `
    <div
      class="flex flex-col p-2 rounded-lg bg-ink-200 gap-1 w-full overflow-hidden"
    >
      <button
        class="relative w-full border-none bg-transparent p-0 cursor-pointer shrink-0 rounded-md transition-opacity duration-fast ease-smooth disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:opacity-80"
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
          class="!rounded-md overflow-hidden"
          [coverUrl]="releaseItem().coverUrl"
          [name]="releaseItem().name"
          [rounded]="'rounded-md'"
        />
        @if (previewState().trackId === releaseItem().id) {
          <div
            class="absolute inset-0 flex items-center justify-center bg-black/60 rounded-md backdrop-blur-[1.5px]"
            @fadeInOut
          >
            <app-preview-spinner
              [progress]="previewState().progress"
              [isPlaying]="previewState().isPlaying"
              [isLoading]="previewState().isLoading"
              source="card"
            />
          </div>
        }
      </button>

      <div class="flex flex-col gap-2 min-w-0">
        <div class="flex items-center justify-between text-bone-800">
          <span
            class="font-display text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-bone-600 flex gap-0.5 items-center"
          >
            <b class="font-bold not-italic text-bone-700">{{
              releaseItem().releaseDate | date: 'dd'
            }}</b>
            <em class="italic font-normal text-bone-600 lowercase">{{
              releaseItem().releaseDate | date: 'LLL'
            }}</em>
          </span>
          <app-type-chip [type]="releaseItem().type" />
        </div>

        <div class="flex flex-col gap-1">
          <span
            class="font-display text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] font-semibold text-bone-100 leading-none truncate max-w-full"
          >
            {{ releaseItem().name }}
          </span>
          <span
            class="text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-bone-600 truncate max-w-full"
          >
            {{ releaseItem().artist }}
          </span>
        </div>

        <button
          class="card-save-btn"
          [class.added]="isAdded()"
          (click)="onToggleWishlist()"
        >
          @if (isAdded()) {
            <app-icon
              name="check"
              class="w-[clamp(1.25rem,3vw,1.5rem)] h-[clamp(1.25rem,3vw,1.5rem)]"
            />
            <span>Añadido</span>
          } @else {
            <app-icon
              name="plus"
              class="w-[clamp(1.25rem,3vw,1.5rem)] h-[clamp(1.25rem,3vw,1.5rem)]"
            />
            <span>Guardar</span>
          }
        </button>
      </div>
    </div>
  `,
})
export class CardItemComponent {
  private preview = inject(PreviewService);

  item = input.required<ReleaseItem>();
  isAdded = input(false);
  showTypeChip = input(true);

  toggleWishlist = output<ReleaseItem>();

  releaseItem = computed(() => this.item() as ReleaseItem);
  previewState = computed(() => this.preview.state());

  onToggleWishlist() {
    this.toggleWishlist.emit(this.item());
  }

  onPlayPreview(item: ReleaseItem): void {
    if (!item.previewUrl) return;
    this.preview.play(item.id, item.previewUrl);
  }
}
