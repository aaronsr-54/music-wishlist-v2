import {
  Component,
  inject,
  input,
  output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-template #modalTemplate>
      <div class="fixed inset-0 z-[9999] flex items-end justify-center">
        <!-- BACKDROP -->
        <div class="absolute inset-0 bg-black/40" (click)="close()"></div>

        <!-- CONTENT -->
        <div
          class="relative w-full max-w-md rounded-t-3xl bg-light dark:bg-dark p-6 animate-[slideUp_250ms_ease-out] pb-12 shadow-[0px_-4px_10px_5px_rgb(0_0_0/10%)] dark:shadow-[0px_-4px_10px_5px_rgb(0_0_0/25%)]"
        >
          <div class="flex items-center justify-between mb-4">
            <h2
              class="text-xl font-bold font-display italic text-ink-700 dark:text-bone-700"
            >
              {{ title() }}
            </h2>
          </div>

          <ng-content></ng-content>
        </div>
      </div>
    </ng-template>
  `,
})
export class ModalComponent {
  private overlay = inject(Overlay);
  private vcr = inject(ViewContainerRef);

  @ViewChild('modalTemplate') template!: TemplateRef<any>;

  title = input<string>('');
  onClose = output<void>();

  private overlayRef?: OverlayRef;
  private isOpen = false;

  // -----------------------
  // OPEN (NUEVO)
  // -----------------------
  open() {
    if (this.isOpen) return;

    const portal = new TemplatePortal(this.template, this.vcr);

    this.overlayRef = this.overlay.create({
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    this.overlayRef.attach(portal);
    this.isOpen = true;
  }

  // -----------------------
  // CLOSE
  // -----------------------
  close() {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.isOpen = false;
  }
}
