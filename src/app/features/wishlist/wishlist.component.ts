import { Component, computed, inject, signal } from '@angular/core';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { WishlistEntry } from '../../shared/models/wishlist-entry.model';
import { SearchResultItemComponent } from '../../shared/components/search-result-item/search-result-item.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import {
  SegmentedTabsComponent,
  SegmentedTabOption,
} from '../../shared/components/segmented-tabs/segmented-tabs.component';
import { LanguageService } from '../../core/i18n/language.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

type WishlistTab = 'pending' | 'downloaded';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    SearchResultItemComponent,
    EmptyStateComponent,
    SegmentedTabsComponent,
    PageHeaderComponent,
  ],
  styles: `
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .scroll-fade {
      overflow-y: auto;
      scrollbar-width: none;
      padding-bottom: 2rem;
      padding-top: 4px;
      -webkit-mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        black 16px,
        black 95%,
        transparent 100%
      );
      mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        black 16px,
        black 95%,
        transparent 100%
      );
    }

    .scroll-fade::-webkit-scrollbar {
      display: none;
    }
  `,
  template: `
    <div
      class="flex flex-col h-full overflow-hidden p-0.5 pt-2 gap-4 [animation:fadeIn_300ms_ease_both]"
      (touchstart)="onTouchStart($event)"
      (touchend)="onTouchEnd($event)"
    >
      <app-page-header prefix="03/" title="WISHLIST" [showBack]="false" />

      <div class="flex items-center justify-between gap-2 md:justify-end">

        <span
          class="font-display text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink-700 dark:text-bone-700 tracking-[0.06em] italic"
        >
          {{ wishlistSvc.total() }} {{ t().elements }}
        </span>
      </div>

      <div class="[animation:slideDown_300ms_ease_both]">
        <app-segmented-tabs
          variant="toggle"
          [options]="tabs()"
          [value]="activeTab()"
          (valueChange)="activeTab.set($event)"
        />
      </div>

      <div
        class="scroll-fade transition-opacity duration-300"
        [class.opacity-0]="animatingTab()"
      >
        @for (entry of activeEntries(); track entry.id; let i = $index) {
          <div
            class="[animation:scaleIn_300ms_ease_both]"
            [style.animation-delay]="i * 30 + 'ms'"
          >
            <app-search-result-item
              [item]="entry"
              source="wishlist"
              [wishlistStatus]="
                activeTab() === 'pending' ? 'pending' : 'downloaded'
              "
              (onMarkDownloaded)="markDownloaded($event)"
              (onUnmarkDownloaded)="unmarkDownloaded($event)"
              (onRemove)="remove($event)"
            />
          </div>
        } @empty {
          <app-empty-state
            [icon]="activeTab() === 'pending' ? 'plus' : 'check'"
            [title]="
              activeTab() === 'pending' ? t().wishlistTitle : t().emptyReady
            "
            [subtitle]="
              activeTab() === 'pending'
                ? t().searchToAdd
                : t().markToSee
            "
          />
        }
      </div>
    </div>
  `,
})
export class WishlistComponent {
  wishlistSvc = inject(WishlistService);
  private languageService = inject(LanguageService);

  activeTab = signal<WishlistTab>('pending');
  animatingTab = signal(false);

  t = computed(() => this.languageService.t());

  tabs = computed<SegmentedTabOption<WishlistTab>[]>(() => [
    {
      value: 'pending' as const,
      label: this.t().pending,
    },
    {
      value: 'downloaded' as const,
      label: this.t().ready,
    },
  ]);

  private touchStartX = 0;
  private touchStartY = 0;

  private readonly SWIPE_THRESHOLD = 50;

  activeEntries = computed(() =>
    this.activeTab() === 'pending'
      ? this.wishlistSvc.pending()
      : this.wishlistSvc.downloaded(),
  );

  onTouchStart(event: TouchEvent) {
    const touch = event.changedTouches[0];

    this.touchStartX = touch.screenX;
    this.touchStartY = touch.screenY;
  }

  onTouchEnd(event: TouchEvent) {
    const touch = event.changedTouches[0];

    const deltaX = touch.screenX - this.touchStartX;
    const deltaY = touch.screenY - this.touchStartY;

    // Ignorar scroll vertical
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    if (Math.abs(deltaX) < this.SWIPE_THRESHOLD) {
      return;
    }

    this.animatingTab.set(true);

    setTimeout(() => {
      if (deltaX < 0) {
        this.goToNextTab();
      } else {
        this.goToPreviousTab();
      }

      this.animatingTab.set(false);
    }, 150);
  }

  private goToNextTab() {
    if (this.activeTab() === 'pending') {
      this.activeTab.set('downloaded');
    }
  }

  private goToPreviousTab() {
    if (this.activeTab() === 'downloaded') {
      this.activeTab.set('pending');
    }
  }

  async markDownloaded(entry: WishlistEntry) {
    if (entry.id) {
      await this.wishlistSvc.markDownloaded(entry.id);
    }
  }

  async unmarkDownloaded(entry: WishlistEntry) {
    if (entry.id) {
      await this.wishlistSvc.unmarkDownloaded(entry.id);
    }
  }

  async remove(entry: WishlistEntry) {
    if (entry.id) {
      await this.wishlistSvc.remove(entry.id);
    }
  }
}
