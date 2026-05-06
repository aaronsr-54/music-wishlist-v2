import { Component, ChangeDetectionStrategy, Input, computed } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgStyle],
  template: `
    <div
      [ngStyle]="style()"
      class="bg-ink-400 text-bone dark:bg-bone-600 dark:text-ink"
    >
      {{ initial() }}
    </div>
  `,
})
export class AvatarComponent {
  @Input() name = '';
  @Input() size = 24;

  initial = computed(() => (this.name || '?')[0]?.toUpperCase() ?? '?');

  style = computed(() => {
    const s = this.size;

    return {
      width: `${s}px`,
      height: `${s}px`,
      fontSize: `${s * 0.5}px`,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-body)',
      fontWeight: '600',
      flexShrink: '0',
      verticalAlign: 'middle',
    };
  });
}
