import {
  Component,
  Input,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TrackType } from '../../models/track.model';
import { LanguageService } from '../../../core/i18n/language.service';
// @ts-ignore
import tailwindConfig from '../../../../../tailwind.config';

const createColorMap = (palette: Record<string, string>) => ({
  track: palette['track'],
  album: palette['album'],
  ep: palette['ep'],
  single: palette['track'],
  artist: palette['artist'],
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
      class="flex px-[6px] py-1 leading-none rounded-md text-ink border dark:text-bone font-display font-medium whitespace-nowrap text-xs"
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
      artist: translations.artist,
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
