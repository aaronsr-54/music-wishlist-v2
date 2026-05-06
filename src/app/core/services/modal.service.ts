import { Injectable, inject, Type } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private overlay = inject(Overlay);

  open<T>(component: Type<T>) {
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'bg-black/40',
      panelClass: [
        'fixed',
        'inset-0',
        'flex',
        'items-end',
        'justify-center',
        'z-[9999]',
      ],
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    const portal = new ComponentPortal(component);
    const componentRef = overlayRef.attach(portal);

    overlayRef.backdropClick().subscribe(() => overlayRef.dispose());

    return {
      close: () => overlayRef.dispose(),
    };
  }
}
