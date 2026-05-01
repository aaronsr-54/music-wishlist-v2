import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { WishlistShareService } from '../../../core/firebase/wishlist-share.service';
import { WishlistShare } from '../../../shared/models/wishlist-share.model';
import { IconComponent } from '../../../shared/icons/icon.component';
import { ProfileSectionComponent } from '../../../shared/components/profile-section/profile-section.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { EmailAutocompleteComponent } from '../../../shared/components/email-autocomplete/email-autocomplete.component';

@Component({
  selector: 'app-profile-shared',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    ProfileSectionComponent,
    EmptyStateComponent,
    EmailAutocompleteComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-profile-section title="Social">
      <section
        class="flex flex-col gap-8 border border-solid border-ink-200 rounded-lg p-4 shadow-[0_2px_12px_4px_rgba(0,0,0,0.15)]"
      >
        <!-- SECCIÓN: Compartida con -->
        <div class="flex flex-col gap-4">
          <h3
            class="text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] text-bone-700 italic"
          >
            Compartir wishlist con
          </h3>

          <!-- Input de email autocomplete -->
          <app-email-autocomplete
            (emailSelected)="shareWith($event)"
            [disabled]="loading()"
            [suggestedEmails]="shareService.suggestedEmails()"
          />

          <!-- Listado de shares enviados -->
          <div class="p-4 flex flex-col gap-3">
            @for (share of shareService.sharesGiven(); track share.id) {
              <div
                class="flex items-center justify-between py-3 px-2 group hover:bg-ink-100/20 rounded transition-colors duration-base"
              >
                <span class="text-bone text-sm font-medium">
                  {{ share.recipientEmail }}
                </span>
                <button
                  (click)="unshare(share)"
                  [disabled]="loading()"
                  class="text-bone-600 hover:text-bone transition-colors duration-base cursor-pointer opacity-0 group-hover:opacity-100"
                  title="Quitar"
                >
                  <app-icon name="close" class="w-5 h-5" />
                </button>
              </div>
            } @empty {
              <app-empty-state
                icon="heart"
                title="Aún no has compartido"
                subtitle="Comparte tu wishlist con alguien para que pueda verla"
              />
            }
          </div>
        </div>

        <!-- SECCIÓN: De otros usuarios -->
        @if (shareService.sharesReceived().length > 0) {
          <div class="flex flex-col gap-4">
            <h3
              class="text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] text-bone-700 italic "
            >
              Wishlists de otros usuarios
            </h3>

            <div class="flex flex-col gap-3">
              @for (share of shareService.sharesReceived(); track share.id) {
                <div
                  class="flex items-center justify-between py-3 px-2 group transition-all duration-base"
                  [class.opacity-50]="share.hidden"
                >
                  <div class="flex flex-col gap-1 min-w-0">
                    <span class="text-bone text-sm font-semibold truncate">
                      {{ share.ownerName }}
                    </span>
                    <span class="text-bone-600 text-xs">
                      {{ share.ownerUid }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <button
                      (click)="toggleHidden(share)"
                      [disabled]="loading()"
                      class="text-xs text-bone-600 hover:text-bone transition-colors duration-base cursor-pointer"
                      [title]="share.hidden ? 'Mostrar' : 'Ocultar'"
                    >
                      <app-icon
                        [name]="share.hidden ? 'eye-off' : 'eye'"
                        class="w-6 h-6 fill-bone"
                      />
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </section>
    </app-profile-section>
  `,
})
export class ProfileSharedComponent {
  private auth = inject(AuthService);
  shareService = inject(WishlistShareService);

  loading = signal(false);

  async shareWith(email: string): Promise<void> {
    if (this.loading()) return;

    this.loading.set(true);
    try {
      const user = this.auth.currentUser();
      if (!user) return;

      await this.shareService.share(
        email,
        user.uid,
        user.displayName || user.email || 'Usuario',
        user.photoURL || null,
      );
    } finally {
      this.loading.set(false);
    }
  }

  async unshare(share: WishlistShare): Promise<void> {
    if (this.loading()) return;

    this.loading.set(true);
    try {
      const user = this.auth.currentUser();
      if (!user) return;

      await this.shareService.unshare(share.id!, user.uid);
    } finally {
      this.loading.set(false);
    }
  }

  async toggleHidden(share: WishlistShare): Promise<void> {
    if (this.loading()) return;

    this.loading.set(true);
    try {
      await this.shareService.toggleHidden(share);
    } finally {
      this.loading.set(false);
    }
  }
}
