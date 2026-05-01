import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-section',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      @if (title()) {
        <h3
          class="font-display text-[clamp(0.6875rem,0.6093rem+0.3036vw,0.875rem)] font-bold text-bone-700 mt-0 mb-4 uppercase tracking-[0.06em]"
        >
          {{ title() }}
        </h3>
      }
      <ng-content />
    </section>
  `,
})
export class ProfileSectionComponent {
  title = input<string>();
  divider = input(false);
}
