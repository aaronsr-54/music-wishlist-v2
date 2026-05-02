import { Component, ChangeDetectionStrategy, input, inject, computed } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICON_REGISTRY, IconName } from './icon-registry';

@Component({
  selector: 'app-icon',
  standalone: true,
  host: { 'aria-hidden': 'true' },
  template: `<span [innerHTML]="svgContent()"></span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  private sanitizer = inject(DomSanitizer);

  name = input.required<IconName>();

  svgContent = computed((): SafeHtml =>
    this.sanitizer.bypassSecurityTrustHtml(ICON_REGISTRY[this.name()])
  );
}
