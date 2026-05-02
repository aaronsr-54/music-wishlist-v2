import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-invite-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-block text-[11px] uppercase tracking-wider font-semibold w-fit px-2.5 py-1 rounded-full transition-colors duration-base"
      [class]="badgeClass()"
    >
      {{ getLabel() }}
    </span>
  `,
})
export class InviteStatusBadgeComponent {
  status = input.required<string>();

  badgeClass = computed(() => {
    const s = this.status();
    switch (s) {
      case 'pending':
        return 'bg-ink-200/60 text-bone-600';
      case 'accepted':
        return 'bg-green-900/30 text-green-400';
      case 'declined':
        return 'bg-red-900/30 text-red-400';
      default:
        return '';
    }
  });

  getLabel(): string {
    const s = this.status();
    return {
      pending: 'Pendiente',
      accepted: 'Aceptada',
      declined: 'Rechazada',
    }[s as string] || s;
  }
}
