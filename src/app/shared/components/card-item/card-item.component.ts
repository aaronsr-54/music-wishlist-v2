import { Component, computed, input, output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { fadeInOut } from '../../animations/animations';
import { ReleaseItem } from '../../models/release-item.model';
import { CoverComponent } from '../cover/cover.component';
import { TypeChipComponent } from '../type-chip/type-chip.component';
import { PreviewService } from '../../../core/services/preview.service';
import { IconComponent } from '../../icons/icon.component';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-card-item',
  standalone: true,
  imports: [
    DatePipe,
    CoverComponent,
    TypeChipComponent,
    IconComponent,
  ],
  animations: [fadeInOut()],
  styles: `
    @keyframes popIn {
      0% {
        opacity: 0;
        transform: scale(0.8);
      }
      50% {
        opacity: 1;
      }
      100% {
        transform: scale(1);
      }
    }
  `,
  template: `
    <div
      class="relative flex flex-col p-2 rounded-lg bg-bone-200 dark:bg-ink-200 gap-1 w-full"
    >
      <div class="relative">
        <div
          class="relative w-full shrink-0 rounded-md overflow-hidden transition-opacity duration-fast ease-smooth cursor-pointer"
          [title]="releaseItem().name"
          (click)="onCardClick()"
        >
          <app-cover
            class="!rounded-md overflow-hidden cursor-pointer"
            style="cursor: pointer !important"
            [coverUrl]="releaseItem().coverUrl"
            [name]="releaseItem().name"
            [rounded]="'rounded-md'"
          />
          @if (isPlayingCurrentItem()) {
            <div
              class="absolute inset-0 flex items-center justify-center bg-black/60 rounded-md backdrop-blur-[1.5px]"
              @fadeInOut
            >
              <app-icon
                [name]="previewState().isPlaying ? 'pause' : 'play'"
                class="w-12 h-12 text-bone-100"
              />
            </div>
          }
        </div>
      </div>

      <div class="flex flex-col gap-2 min-w-0">
        <div
          class="flex items-center justify-between text-ink-800 dark:text-bone-800"
        >
          <span
            class="font-display text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink-600 dark:text-bone-600 flex gap-0.5 items-center"
          >
            <b class="font-bold not-italic text-ink-700 dark:text-bone-700">{{
              releaseItem().releaseDate | date: 'dd'
            }}</b>
            <em
              class="italic font-normal text-ink-600 dark:text-bone-600 lowercase"
              >{{ releaseItem().releaseDate | date: 'LLL' }}</em
            >
          </span>
          <app-type-chip [type]="releaseItem().type" />
        </div>

        <div class="flex flex-col gap-1 cursor-pointer" (click)="onCardClick()">
          <span
            class="font-display text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] font-semibold text-ink-100 dark:text-bone-100 leading-none truncate max-w-full"
          >
            {{ releaseItem().name }}
          </span>
          <span
            class="text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink-600 dark:text-bone-600 truncate max-w-full"
          >
            {{ releaseItem().artist }}
          </span>
        </div>

        <button
          class="flex items-center text-ink font-display font-medium [&.added]:font-bold [&.added]:bg-ink italic [&.added]:not-italic [&.added]:text-bone [&.added]:dark:bg-bone  dark:text-bone [&.added]:dark:text-ink border border-ink dark:border-bone rounded-card uppercase px-4 py-1"
          [class.added]="isAdded()"
          (click)="onToggleWishlist()"
        >
          @if (isAdded()) {
            <app-icon
              name="check"
              class="w-[clamp(1.25rem,3vw,1.5rem)] h-[clamp(1.25rem,3vw,1.5rem)]"
            />
            <span class="flex-1">{{ t().added }}</span>
          } @else {
            <app-icon
              name="plus"
              class="w-[clamp(1.25rem,3vw,1.5rem)] h-[clamp(1.25rem,3vw,1.5rem)]"
            />
            <span class="flex-1">{{ t().save }}</span>
          }
        </button>
      </div>
    </div>
  `,
})
export class CardItemComponent {
  private preview = inject(PreviewService);
  private languageService = inject(LanguageService);

  item = input.required<ReleaseItem>();
  isAdded = input(false);
  showTypeChip = input(true);

  toggleWishlist = output<ReleaseItem>();
  onAlbumClick = output<string>();

  t = computed(() => this.languageService.t());
  releaseItem = computed(() => this.item() as ReleaseItem);
  previewState = computed(() => this.preview.state());

  isPlayingCurrentItem = computed(() => {
    const state = this.previewState();
    return state.trackId === this.releaseItem().id || state.parentId === this.releaseItem().id;
  });

  onToggleWishlist() {
    this.toggleWishlist.emit(this.item());
  }

  onCardClick() {
    this.onAlbumClick.emit(this.releaseItem().id);
  }

  async onPlayPreview(item: ReleaseItem) {
    if (item.previewUrl) {
      this.preview.play({
        id: item.id,
        title: item.name,
        artist: item.artist,
        cover: item.coverUrl,
        previewUrl: item.previewUrl,
        parentId: item.id,
      });
    } else {
      await this.preview.playAlbum({
        id: item.id,
        name: item.name,
        artist: item.artist,
        coverUrl: item.coverUrl,
        type: item.type,
        releaseDate: item.releaseDate,
      });
    }
  }
}