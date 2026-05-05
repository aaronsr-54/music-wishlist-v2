import {
  Component,
  inject,
  computed,
  signal,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { CoverComponent } from '../cover/cover.component';
import { IconComponent } from '../../icons/icon.component';
import { PreviewService } from '../../../core/services/preview.service';

@Component({
  selector: 'app-floating-player',
  standalone: true,
  imports: [CoverComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'fixed bottom-[5.4rem] md:bottom-4 z-50 mx-[0.5rem] md:mx-auto animate-slide-up',
  },
  template: `
    <div
      class="flex items-center gap-3 p-3 rounded-xl bg-bone/95 backdrop-blur-sm shadow-lg overflow-hidden"
      [style.width]="isMobile() ? 'calc(100dvw - 1rem)' : '360px'"
    >
      <app-cover
        [name]="metadata()?.title ?? ''"
        [coverUrl]="metadata()?.cover ?? ''"
        [size]="36"
        rounded="rounded-md"
      />

      <div class="flex flex-col flex-1 min-w-0 pr-2 w-full">
        <span class="text-sm font-medium text-ink truncate w-full">
          {{ metadata()?.title }}
        </span>
        <span class="text-xs text-ink-600 truncate w-full">
          {{ metadata()?.artist }}
        </span>
      </div>

      <div class="flex items-center gap-1">
        @if (hasParent()) {
          <button
            (click)="prev()"
            [disabled]="!hasPrev()"
            class="w-8 h-8 flex items-center justify-center rounded-full text-ink/70 hover:text-ink hover:bg-ink-500/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            title="Previous"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6z" />
              <path d="M19 20V4l-11 8 11 8z" />
            </svg>
          </button>
        }

        <button
          (click)="togglePlay()"
          class="w-10 h-10 flex items-center justify-center rounded-full bg-ink text-bone hover:scale-105 active:scale-95 transition-transform"
          title="{{ isPlaying() ? 'Pause' : 'Play' }}"
        >
          <app-icon [name]="isPlaying() ? 'pause' : 'play'" class="w-5 h-5" />
        </button>

        @if (hasParent()) {
          <button
            (click)="next()"
            [disabled]="!hasNext()"
            class="w-8 h-8 flex items-center justify-center rounded-full text-ink/70 hover:text-ink hover:bg-ink-500/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            title="Next"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6h2v12h-2z" />
              <path d="M5 20V4l11 8-11 8z" />
            </svg>
          </button>
        }

        <div
          class="absolute bottom-[2px] left-0 right-0 flex justify-center px-6"
        >
          <div class="h-1 w-full rounded-full bg-bone-400/30 overflow-hidden">
            <div
              class="h-full rounded-full bg-ink-600 transition-all duration-100"
              [style.width.%]="progress()"
            ></div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FloatingPlayerComponent {
  private preview = inject(PreviewService);
  isMobile = signal(true);

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 768);
  }

  constructor() {
    this.isMobile.set(window.innerWidth < 768);
  }

  metadata = computed(() => this.preview.state().metadata);
  isPlaying = computed(() => this.preview.state().isPlaying);
  progress = computed(() => this.preview.state().progress);
  hasNext = computed(() => this.preview.hasNextTrack());
  hasPrev = computed(() => this.preview.hasPrevTrack());
  hasParent = computed(() => !!this.preview.state().parentId);

  togglePlay() {
    this.preview.toggle();
  }

  prev() {
    this.preview.prev();
  }

  next() {
    this.preview.next();
  }
}
