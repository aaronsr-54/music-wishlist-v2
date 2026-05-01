import {
  Component,
  output,
  input,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-email-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full">
      <div
        class="w-100 flex items-center gap-2.5 py-4 border-b border-solid border-bone-100 dark:border-ink-100 group hover:border-ink-600 dark:hover:border-bone-600 transition-colors duration-base"
      >
        <app-icon
          name="mail"
          class="text-ink-800 dark:text-bone-800 w-8 h-8 group-hover:text-ink-700 dark:hover:text-bone-700 transition-colors duration-base"
        />
        <input
          type="email"
          placeholder="Email de la persona"
          [(ngModel)]="emailInput"
          (keyup.enter)="selectEmail(emailInput())"
          [disabled]="disabled()"
          class="flex-1 bg-transparent text-ink dark:text-bone font-body text-lg placeholder:text-bone-800 placeholder:italic transition-colors duration-base border-none outline-none"
        />
        <button
          (click)="selectEmail(emailInput())"
          [disabled]="!emailValid()"
          class="text-ink-600 dark:text-bone-600 hover:text-bone transition-colors duration-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Compartir"
        >
          <app-icon name="send" class="w-6 h-6 fill-bone" />
        </button>
      </div>

      <!-- Dropdown de sugerencias -->
      @if (showSuggestions() && filteredSuggestions().length > 0) {
        <div
          class="absolute top-full left-0 right-0 mt-1 bg-bone-100 dark:bg-ink-100 rounded-lg shadow-lg z-10 border border-solid border-bone-200 dark:border-ink-200"
        >
          @for (email of filteredSuggestions(); track email) {
            <button
              (click)="selectEmail(email)"
              class="w-full text-left px-4 py-2 text-sm text-ink dark:text-bone hover:bg-ink-200 transition-colors duration-base first:rounded-t-lg last:rounded-b-lg"
            >
              {{ email }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class EmailAutocompleteComponent {
  disabled = input<boolean>(false);
  suggestedEmails = input<string[]>([]);
  emailSelected = output<string>();

  emailInput = signal('');

  showSuggestions = computed(() => this.emailInput().length > 0);

  filteredSuggestions = computed(() => {
    const input = this.emailInput().toLowerCase();
    return this.suggestedEmails()
      .filter((email) => email.toLowerCase().startsWith(input))
      .slice(0, 5);
  });

  emailValid = computed(() => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(this.emailInput().trim());
  });

  selectEmail(email: string): void {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email.trim())) return;
    this.emailSelected.emit(email.trim());
    this.emailInput.set('');
  }
}
