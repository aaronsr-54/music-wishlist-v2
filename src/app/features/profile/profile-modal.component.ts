import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [AvatarComponent],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 bg-black/50 z-[999]"
        (click)="closeModal()"
      ></div>
      <div
        class="fixed bottom-0 left-0 right-0 bg-ink border-t border-ink-200 rounded-t-[20px] z-[1000] max-h-[90vh] overflow-y-auto md:bottom-auto md:top-1/2 md:left-1/2 md:right-auto md:max-w-[500px] md:w-full md:rounded-[16px] md:-translate-x-1/2 md:-translate-y-1/2"
        [style.animation]="modalAnimation"
      >
        <div class="flex items-center justify-between p-5 border-b border-ink-200">
          <h2 class="m-0 font-display text-base font-semibold text-bone">Mi Perfil</h2>
          <button
            class="bg-transparent border-none text-[20px] text-bone-600 cursor-pointer p-0 w-8 h-8 flex items-center justify-center transition-colors duration-fast ease-smooth hover:text-bone"
            (click)="closeModal()"
          >✕</button>
        </div>

        @if (auth.currentUser(); as user) {
          <div class="p-6 flex flex-col gap-6">
            <div class="flex gap-5 pb-6 border-b border-ink-200">
              <app-avatar
                [name]="user.displayName ?? user.email ?? 'Usuario'"
                [size]="80"
              />
              <div class="flex-1 flex flex-col justify-center gap-1">
                <h1 class="font-display text-[20px] font-bold text-bone m-0 leading-[1.2]">
                  {{ user.displayName ?? user.email }}
                </h1>
                <p class="text-[13px] text-bone-600 m-0">{{ user.email }}</p>
              </div>
            </div>

            <div class="grid gap-3 grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
              <div class="flex flex-col gap-[6px] p-4 bg-ink-200 rounded-card text-center">
                <span class="text-[11px] text-bone-600 tracking-[0.02em] uppercase">Wishlist Total</span>
                <span class="font-display text-[24px] font-bold text-bone">{{ wishlistSvc.total() }}</span>
              </div>
              <div class="flex flex-col gap-[6px] p-4 bg-ink-200 rounded-card text-center">
                <span class="text-[11px] text-bone-600 tracking-[0.02em] uppercase">Pendientes</span>
                <span class="font-display text-[24px] font-bold text-bone">{{ wishlistSvc.pending().length }}</span>
              </div>
              <div class="flex flex-col gap-[6px] p-4 bg-ink-200 rounded-card text-center">
                <span class="text-[11px] text-bone-600 tracking-[0.02em] uppercase">Listos</span>
                <span class="font-display text-[24px] font-bold text-bone">{{ wishlistSvc.downloaded().length }}</span>
              </div>
            </div>

            <button
              class="flex items-center justify-center text-[#e57373] font-display text-[15px] font-semibold cursor-pointer transition-[opacity,transform] duration-fast ease-smooth bg-transparent border-none hover:opacity-[0.88] hover:-translate-y-px active:translate-y-0"
              (click)="logout()"
            >Cerrar sesión</button>
          </div>
        }
      </div>
    }
  `,
})
export class ProfileModalComponent {
  auth = inject(AuthService);
  wishlistSvc = inject(WishlistService);

  @Input({ required: true }) isOpen = () => false;
  @Output() closed = new EventEmitter<void>();

  get modalAnimation() {
    if (window.innerWidth >= 768) return 'slideIn 240ms var(--ease)';
    return 'slideUp 240ms var(--ease)';
  }

  closeModal() {
    this.closed.emit();
  }

  async logout() {
    await this.auth.logout();
    this.closeModal();
  }
}
