import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, TouchedChangeEvent } from '@angular/forms';
import { filter, map } from 'rxjs';

/**
 * Returns whether a FormGroup is untouched (has not been interacted with) as a signal.
 * The signal updates reactively whenever the form's untouched state changes,
 * including when markAsTouched() or markAsUntouched() are called directly.
 *
 * @param form - The FormGroup to check untouched state for
 * @returns A signal containing the untouched state (true if not interacted with)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <form [formGroup]="form">
 *       <input formControlName="email" />
 *       @if (isUntouched()) {
 *         <span>Please fill out the form</span>
 *       }
 *     </form>
 *   `
 * })
 * class MyComponent {
 *   form = new FormGroup({
 *     email: new FormControl('')
 *   });
 *   isUntouched = useFormUntouched(this.form);
 * }
 * ```
 */
export const useFormUntouched = (form: FormGroup): Signal<boolean> => {
  return toSignal(
    form.events.pipe(
      filter((event): event is TouchedChangeEvent => event instanceof TouchedChangeEvent),
      map((event) => !event.touched),
    ),
    { initialValue: form.untouched },
  ) as Signal<boolean>;
};
