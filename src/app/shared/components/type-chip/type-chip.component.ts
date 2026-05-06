import { Component, Input, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { TrackType } from '../../models/track.model';
import { LanguageService } from '../../../core/i18n/language.service';
// @ts-ignore
import tailwindConfig from '../../../../../tailwind.config';

const createColorMap = (palette: Record<string, string>) => ({
  track: palette['track'],
  album: palette['album'],
  ep: palette['ep'],
  single: palette['track'],
  artist: palette['track'],
});

const COLORS_LIGHT = createColorMap(tailwindConfig.accentLight);
const COLORS_DARK = createColorMap(tailwindConfig.accentDark);

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

@Component({
  selector: 'app-type-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-block py-[2px] px-[4px] rounded-sm text-ink border dark:text-bone-100 font-body text-[clamp(0.625rem,0.5207rem+0.4049vw,0.875rem)] font-medium tracking-[0.04em] uppercase whitespace-nowrap"
      [style.borderColor]="color"
      [style.backgroundColor]="bgColorWithOpacity"
      >{{ label }}</span
    >
  `,
})
export class TypeChipComponent {
  @Input({ required: true }) type: TrackType = 'track';

  private languageService = inject(LanguageService);

  get t() {
    return this.languageService.t();
  }

  get label() {
    const translations = this.t;
    const labels: Partial<Record<TrackType, string>> = {
      track: translations.track,
      album: translations.album,
      ep: 'EP',
      single: 'Single',
    };
    return labels[this.type];
  }

  get color() {
    const isDark = document.documentElement.classList.contains('dark');
    const colors = isDark ? COLORS_DARK : COLORS_LIGHT;
    return colors[this.type];
  }

  get bgColorWithOpacity() {
    return hexToRgba(this.color, 0.1);
  }
}
