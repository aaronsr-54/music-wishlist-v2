import {
  Injectable,
  inject,
  signal,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationRef } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  isRemoving?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  private appRef = inject(ApplicationRef);

  toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info'): void {
    const id = Date.now();
    const toast: Toast = { id, message, type, isRemoving: false };
    this._toasts.update((t) => [...t, toast]);
    this.appRef.tick();

    setTimeout(() => {
      this._toasts.update((t) =>
        t.map((x) => (x.id === id ? { ...x, isRemoving: true } : x)),
      );
      this.appRef.tick();

      setTimeout(() => {
        this._toasts.update((t) => t.filter((x) => x.id !== id));
        this.appRef.tick();
      }, 300);
    }, 3000);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }
}

@Component({
  selector: 'app-toast-container',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, IconComponent],
  host: {
    class: 'block',
  },
  styles: `
    .toast-item.toast-entering {
      animation: slideInDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .toast-item.toast-exiting {
      animation: slideOutUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @media (min-width: 768px) {
      .toast-item.toast-entering {
        animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .toast-item.toast-exiting {
        animation: slideOutLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }
    @keyframes slideInDown {
      from { opacity: 0; transform: translateY(-100%); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideOutUp {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-100%); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutLeft {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(-100%); }
    }
  `,
  template: `
    <div
      class="z-50 absolute w-full px-2 top-2 mx-auto md:w-72 md:left-4 md:top-auto md:bottom-4 md:px-0 flex flex-col items-center gap-[2px] pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      @for (toast of toasts(); track toast.id) {
        <div
          class="p-3 w-full bg-light dark:bg-dark text-ink dark:text-bone [&.error]:text-red-600 [&.error]:dark:text-red-400 font-display italic shadow-lg rounded-card flex gap-2 border border-solid border-ink-200 pointer-events-auto transition-all duration-300 toast-item"
          [class.toast-entering]="!toast.isRemoving"
          [class.toast-exiting]="toast.isRemoving"
          [class.error]="toast.type === 'error'"
          role="alert"
        >
          <span class="w-5 h-5">
            @if (toast.type === 'success') {
              <app-icon name="check" />
            } @else if (toast.type === 'error') {
              <app-icon name="close" />
            } @else {
              <app-icon name="info" />
            }
          </span>
          <span>{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);
  toasts = this.toastService.toasts;
}
