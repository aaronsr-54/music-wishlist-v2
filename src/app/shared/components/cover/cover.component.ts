import { Component, Input, computed, signal } from '@angular/core';
import { NgStyle } from '@angular/common';

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
  imports: [NgStyle],
  template: `
    @if (coverUrl && !imgError()) {
      <img
        [src]="coverUrl"
        [alt]="name"
        [ngStyle]="imgStyle()"
        (error)="imgError.set(true)"
      />
    } @else {
      <div [ngStyle]="placeholderStyle()">
        {{ initials() }}
      </div>
    }
  `,
})
export class CoverComponent {
  @Input({ required: true }) name = '';
  @Input() coverUrl = '';
  @Input() size = 56;

  imgError = signal(false);

  initials = computed(() =>
    this.name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join(''),
  );

  private variant = computed(() => VARIANTS[hashVariant(this.name)]);

  imgStyle = computed(() => ({
    width: `${this.size}px`,
    height: `${this.size}px`,
    borderRadius: 'var(--radius-sm)',
    objectFit: 'cover',
    display: 'block',
    flexShrink: '0',
  }));

  placeholderStyle = computed(() => {
    const v = this.variant();
    return {
      width: `${this.size}px`,
      height: `${this.size}px`,
      borderRadius: 'var(--radius-sm)',
      background: v.bg,
      color: v.color,
      border: v.border,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: '700',
      fontSize: `${Math.round(this.size * 0.28)}px`,
      flexShrink: '0',
      letterSpacing: '0.02em',
    };
  });
}
