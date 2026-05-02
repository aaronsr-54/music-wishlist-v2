import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';

export type ButtonVariant = 'action' | 'add' | 'cover';

const BASE =
  'flex items-center justify-center cursor-pointer p-0 transition-[background,color,transform,opacity] duration-[160ms]';

const VARIANTS: Record<ButtonVariant, string> = {
  add: `${BASE} border-none bg-transparent rounded-full shrink-0 text-ink-600 dark:text-bone-600 w-[clamp(2.25rem,5vw,2.75rem)] h-[clamp(2.25rem,5vw,2.75rem)] hover:bg-bone-200 dark:hover:bg-ink-200 hover:text-bone-100 active:scale-[0.82]`,
  action: `${BASE} bg-transparent rounded-full border-[1.5px] border-ink-100 text-bone-600 w-[clamp(2rem,4.5vw,2.5rem)] h-[clamp(2rem,4.5vw,2.5rem)] hover:border-ink-400 dark:hover:border-bone-400 hover:text-bone hover:scale-110 active:scale-[0.88]`,
  cover: `${BASE} border-none bg-transparent relative shrink-0 rounded-sm disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:opacity-80`,
};

@Component({
  selector: 'button[appBtn]',
  standalone: true,
  host: {
    '[class]': 'hostClass()',
  },
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input.required<ButtonVariant>();
  added = input(false);
  danger = input(false);

  hostClass = computed(() => {
    const v = this.variant();
    let cls = VARIANTS[v];
    if (v === 'add' && this.added()) {
      cls +=
        ' !bg-ink dark:bg-bone !text-bone dark:text-ink [animation:popIn_220ms_var(--ease-smooth)_both]';
    }
    if (v === 'action' && this.danger()) {
      cls = cls.replace(
        'hover:border-ink-400 dark:hover:border-bone-400 hover:text-bone',
        'hover:border-red-400 hover:text-red-400',
      );
    }
    return cls;
  });
}
