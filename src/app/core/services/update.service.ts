import { Injectable, inject, NgZone } from '@angular/core';
import { ToastService } from '../../shared/components/toast/toast.component';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  private toast = inject(ToastService);
  private zone = inject(NgZone);

  constructor() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'NEW_VERSION_AVAILABLE') {
        this.zone.run(() => {
          this.toast.showWithAction(
            'Nueva versión disponible',
            {
              label: 'Actualizar',
              fn: () => document.location.reload(),
            },
            'info'
          );
        });
      }
    });
  }
}
