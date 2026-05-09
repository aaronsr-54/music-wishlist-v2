import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  output,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-context-menu-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div
      class="fixed bg-bone-100 dark:bg-ink-100 rounded-lg shadow-lg border border-bone-200 dark:border-ink-200 p-1 min-w-[140px] cursor-pointer z-50 group  overflow-hidden"
    >
      <button
        class="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-display text-ink dark:text-bone group-hover:font-semibold group-hover:italic text-left w-full group-hover:bg-bone-200 dark:group-hover:bg-ink-200 transition-all"
        (click)="handleCopyLink()"
      >
        <app-icon name="link" class="w-4 h-4" />
        <span>{{ label }}</span>
      </button>
    </div>
  `,
})
export class ContextMenuPanelComponent {
  label = 'Copiar enlace';

  onSelect = output<void>();
  onCopyLink = output<void>();

  @HostListener('document:click')
  onDocumentClick() {
    this.onSelect.emit();
  }

  handleCopyLink() {
    this.onCopyLink.emit();
  }
}
