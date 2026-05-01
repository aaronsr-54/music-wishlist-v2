import { Component, Input } from '@angular/core';
import { TrackType } from '../../models/track.model';

const LABELS: Partial<Record<TrackType, string>> = {
  track: 'Canción',
  album: 'Álbum',
  ep: 'EP',
  single: 'Single',
};

const COLORS: Partial<Record<TrackType, string>> = {
  track: 'var(--accent-track)',
  album: 'var(--accent-album)',
  ep: 'var(--accent-ep)',
  single: 'var(--accent-track)',
};

@Component({
  selector: 'app-type-chip',
  standalone: true,
  template: `
    <span
      class="inline-block py-[2px] px-[4px] rounded-sm text-ink dark:text-bone border font-body text-[clamp(0.625rem,0.5207rem+0.4049vw,0.875rem)] font-medium tracking-[0.04em] uppercase whitespace-nowrap"
      [style.borderColor]="borderColor"
    >{{ label }}</span>
  `,
})
export class TypeChipComponent {
  @Input({ required: true }) type: TrackType = 'track';

  get label() {
    return LABELS[this.type];
  }

  get borderColor() {
    return COLORS[this.type];
  }
}
