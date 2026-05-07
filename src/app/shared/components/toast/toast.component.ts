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
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  private appRef = inject(ApplicationRef);

  toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info'): void {
    const id = Date.now();
    const toast: Toast = { id, message, type };
    this._toasts.update((t) => [...t, toast]);
    this.appRef.tick();

    setTimeout(() => {
      this._toasts.update((t) => t.filter((x) => x.id !== id));
      this.appRef.tick();
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
  template: `
    <div class="toast-stack bg-light dark:bg-dark" aria-live="polite" aria-atomic="true">
      @for (toast of toasts(); track toast.id) {
        <div
          class="toast-item"
          [class.toast-success]="toast.type === 'success'"
          [class.toast-error]="toast.type === 'error'"
          [class.toast-info]="toast.type === 'info'"
          role="alert"
        >
          <span class="toast-icon">
            @if (toast.type === 'success') {
              <app-icon name="check" class="text-current" />
            } @else if (toast.type === 'error') {
              <app-icon name="close" class="text-current" />
            } @else {
              <app-icon name="info" class="text-current" />
            }
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-stack {
      position: fixed;
      z-index: 999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
      bottom: 1.5rem;
      right: 1.5rem;
    }

    @media (max-width: 767px) {
      .toast-stack {
        bottom: 5.5rem;
        left: 0.5rem;
        right: 0.5rem;
        padding: 0.5rem;
        box-shadow: 0px -4px 10px 5px rgb(0 0 0 / 10%);
        border-radius: 0.75rem 0.75rem 0 0;
        gap: 0.25rem;
      }
    }

    .toast-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md, 0.5rem);
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: toastIn 300ms cubic-bezier(0.4, 0, 0.2, 1) both;
      pointer-events: auto;
    }

    @media (max-width: 767px) {
      .toast-item {
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius-sm, 0.375rem);
        font-size: 0.8125rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        animation: toastInMobile 250ms cubic-bezier(0.4, 0, 0.2, 1) both;
      }
    }

    .toast-success {
      background: #065f46;
      color: #d1fae5;
      border: 1px solid #34d399;
    }
    .toast-error {
      background: #7f1d1d;
      color: #fecaca;
      border: 1px solid #f87171;
    }
    .toast-info {
      background: #1e3a5f;
      color: #bfdbfe;
      border: 1px solid #60a5fa;
    }

    .toast-icon {
      width: 1.125rem;
      height: 1.125rem;
      flex-shrink: 0;
    }

    @media (max-width: 767px) {
      .toast-icon {
        width: 1rem;
        height: 1rem;
      }
    }

    .toast-message {
      line-height: 1.4;
    }

    @media (max-width: 767px) {
      .toast-message {
        line-height: 1.2;
        flex: 1;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes toastInMobile {
      from {
        opacity: 0;
        transform: translateY(100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);
  toasts = this.toastService.toasts;
}