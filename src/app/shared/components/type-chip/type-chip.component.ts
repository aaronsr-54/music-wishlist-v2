import { Component, Input, computed } from '@angular/core';
import { NgStyle } from '@angular/common';
import { TrackType } from '../../models/track.model';

const LABELS: Record<TrackType, string> = {
  track: 'Canción',
  album: 'Álbum',
  ep: 'EP'
};

const COLORS: Record<TrackType, { bg: string; color: string }> = {
  track: { bg: 'rgba(200,149,107,0.15)', color: 'var(--accent-track)' },
  album: { bg: 'rgba(123,167,188,0.15)', color: 'var(--accent-album)' },
  ep:    { bg: 'rgba(155,141,196,0.15)', color: 'var(--accent-ep)'    },
};

@Component({
  selector: 'app-type-chip',
  standalone: true,
  imports: [NgStyle],
  template: `<span class="chip" [ngStyle]="style">{{ label }}</span>`,
  styles: [`
    .chip {
      display: inline-block;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
    }
  `]
})
export class TypeChipComponent {
  @Input({ required: true }) type: TrackType = 'track';
  get label() { return LABELS[this.type]; }
  get style() { return COLORS[this.type]; }
}
