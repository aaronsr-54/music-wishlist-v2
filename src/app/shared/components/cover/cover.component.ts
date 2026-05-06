import { Component, Input, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';

const VARIANTS = [
  { bg: 'var(--bone-300)', color: 'var(--ink)', border: 'none' },
  { bg: 'var(--ink-200)', color: 'var(--bone)', border: 'none' },
  {
    bg: 'transparent',
    color: 'var(--ink)',
    border: '1.5px solid var(--ink-100)',
  },
  {
    bg: 'transparent',
    color: 'var(--bone-400)',
    border: '1.5px solid var(--ink-200)',
  },
];

function hashVariant(name: string): number {
  if (!name) return 0;
  return name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 4;
}

@Component({
  selector: 'app-cover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    @if (coverUrl && !imgError()) {
      <img
        [src]="coverUrl"
        [alt]="name"
        loading="lazy"
        class="max-w-full aspect-square object-cover block"
        [ngClass]="rounded"
        [style.width]="imgWidth()"
        (error)="imgError.set(true)"
      />
    } @else {
      <div
        class="max-w-full aspect-square flex items-center justify-center font-display font-bold tracking-[0.02em]"
        [ngClass]="rounded"
        [style.width]="imgWidth()"
        [style.background]="variant().bg"
        [style.color]="variant().color"
        [style.border]="variant().border"
        [style.fontSize]="placeholderFontSize()"
      >
        {{ initials() }}
      </div>
    }
  `,
})
export class CoverComponent {
  @Input({ required: true }) name = '';
  @Input() coverUrl = '';
  @Input() size?: number;
  @Input() rounded: string = 'rounded-sm';

  imgError = signal(false);

  initials = computed(() =>
    (this.name || '')
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join(''),
  );

  variant = computed(() => VARIANTS[hashVariant(this.name)]);

  imgWidth = computed(() =>
    this.size
      ? `clamp(${this.size}px, ${this.size * 1.125}px, ${this.size * 1.25}px)`
      : '100%',
  );

  placeholderFontSize = computed(() =>
    this.size ? `${Math.round(this.size * 0.28)}px` : 'clamp(12px, 3vw, 18px)',
  );
}
