import { Component, Input, computed } from '@angular/core';
import { NgStyle } from '@angular/common';

const COLORS = [
  { bg: 'var(--bone-400)', color: 'var(--ink)' },
  { bg: 'var(--ink-100)', color: 'var(--bone)' },
  { bg: 'var(--bone-300)', color: 'var(--ink-200)' },
  { bg: 'var(--ink-200)', color: 'var(--bone-300)' },
];

function hashColor(name: string): number {
  return name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 4;
}

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [NgStyle],
  styles: [
    `
      .avatar {
        width: calc(var(--size) * 1px);
        height: calc(var(--size) * 1px);
        font-size: calc(var(--size) * 0.5px);
      }

      @media (min-width: 1024px) {
        .avatar {
          width: calc(var(--size) * 1.2px);
          height: calc(var(--size) * 1.2px);
          font-size: calc(var(--size) * 0.6px);
        }
      }
    `,
  ],
  template: `
    <div class="avatar" [ngStyle]="style()">
      {{ initial() }}
    </div>
  `,
})
export class AvatarComponent {
  @Input() name = '';
  @Input() size = 24;

  initial = computed(() => (this.name || '?')[0]?.toUpperCase() ?? '?');

  style = computed(() => {
    const c = COLORS[hashColor(this.name || 'A')];

    return {
      '--size': this.size,
      borderRadius: '50%',
      background: c.bg,
      color: c.color,
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
