import {
  Component,
  inject,
  computed,
  ChangeDetectionStrategy,
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
      'fixed bottom-[5.4rem] md:top-2 md:bottom-auto z-50 left-2 right-2 md:left-1/2 md:right-auto md:w-[30rem] md:-translate-x-1/2 animate-slide-up',
  },
  template: `
    <div
      class="flex items-center gap-3 p-2.5 rounded-xl bg-light/95 dark:bg-dark/95 backdrop-blur-sm shadow-lg overflow-hidden w-full"
    >
      <app-cover
        [name]="metadata()?.title ?? ''"
        [coverUrl]="metadata()?.cover ?? ''"
        [size]="36"
        rounded="rounded-full"
      />

      <div class="flex flex-col flex-1 min-w-0 pr-2 w-full">
        <span
          class="text-md font-medium text-ink dark:text-bone truncate w-full"
        >
          {{ metadata()?.title }}
        </span>
        <span class="text-xs text-ink-600 dark:text-bone-800 truncate w-full">
          {{ metadata()?.artist }}
        </span>
      </div>

      <div class="flex items-center gap-1">
        <button
          (click)="stop()"
          class="w-8 h-8 flex items-center justify-center"
          title="Stop"
        >
          <app-icon
            name="stop"
            class="w-8 h-8 fill-ink-200 dark:fill-bone-600 hover:fill-ink hover:dark:fill-bone"
          />
        </button>

        <button
          (click)="togglePlay()"
          class="w-10 h-10 flex items-center justify-center rounded-full bg-ink dark:bg-bone text-bone dark:text-ink hover:scale-105 active:scale-95 transition-transform"
          title="{{ isPlaying() ? 'Pause' : 'Play' }}"
        >
          <app-icon [name]="isPlaying() ? 'pause' : 'play'" class="w-5 h-5" />
        </button>

        <div
          class="absolute bottom-[2px] left-0 right-0 flex justify-center px-6"
        >
          <div
            class="h-1 w-full rounded-full bg-bone-400/30 dark:bg-ink-200/30 overflow-hidden"
          >
            <div
              class="h-full rounded-full bg-ink dark:bg-bone transition-all duration-100"
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

  metadata = computed(() => this.preview.state().metadata);
  isPlaying = computed(() => this.preview.state().isPlaying);
  progress = computed(() => this.preview.state().progress);

  togglePlay() {
    this.preview.toggle();
  }

  stop() {
    this.preview.stop();
  }
}
