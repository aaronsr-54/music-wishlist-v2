import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { ToastService } from '../../shared/components/toast/toast.component';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  private swUpdate = inject(SwUpdate);
  private toast = inject(ToastService);

  constructor() {
    if (!this.swUpdate.isEnabled) return;

    this.swUpdate.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => {
        this.toast.showWithAction(
          'Nueva versión disponible',
          {
            label: 'Actualizar',
            fn: () =>
              this.swUpdate
                .activateUpdate()
                .then(() => document.location.reload()),
          },
          'info'
        );
      });
  }
}
