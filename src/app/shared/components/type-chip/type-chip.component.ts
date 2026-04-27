import { Component, Input } from '@angular/core';
import { NgStyle } from '@angular/common';
import { TrackType } from '../../models/track.model';

const LABELS: Record<TrackType, string> = {
  track: 'Canción',
  album: 'Álbum',
  ep: 'EP',
};

const COLORS: Record<TrackType, string> = {
  track: 'var(--accent-track)',
  album: 'var(--accent-album)',
  ep: 'var(--accent-ep)',
};

@Component({
  selector: 'app-type-chip',
  standalone: true,
  imports: [NgStyle],
  template: `<span class="chip" [ngStyle]="style">{{ label }}</span>`,
  styles: [
    `
      .chip {
        display: inline-block;
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        color: var(--bone);
        border: 1px solid;
        font-family: var(--font-body);
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        white-space: nowrap;
      }
    `,
  ],
})
export class TypeChipComponent {
  @Input({ required: true }) type: TrackType = 'track';
  get label() {
    return LABELS[this.type];
  }
  get style() {
    return {
      borderColor: COLORS[this.type],
    };
  }
}
