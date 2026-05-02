import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 })),
      ]),
    ]),
  ],
  template: `
    <div class="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300" (click)="closeModal()"></div>
    <div class="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-bone dark:bg-ink shadow-[0_-2px_12px_4px_rgba(0,0,0,0.15)]" @slideIn>
      <div class="flex flex-col gap-6 p-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-ink dark:text-bone">{{ title() }}</h2>
          <button
            class="text-ink/60 dark:text-bone/60 hover:text-ink dark:hover:text-bone transition-colors"
            (click)="closeModal()"
            aria-label="Cerrar"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="flex flex-col gap-3">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent {
  title = input<string>('');
  onClose = output<void>();

  closeModal() {
    this.onClose.emit();
  }
}
