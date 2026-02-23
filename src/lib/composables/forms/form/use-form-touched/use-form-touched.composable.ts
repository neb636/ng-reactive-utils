import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, TouchedChangeEvent } from '@angular/forms';
import { filter, map } from 'rxjs';

/**
 * Returns whether a FormGroup has been touched (interacted with) as a signal.
 * The signal updates reactively whenever the form's touched state changes,
 * including when markAsTouched() or markAsUntouched() are called directly.
 *
 * @param form - The FormGroup to check touched state for
 * @returns A signal containing the touched state (true if interacted with)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <form [formGroup]="form">
 *       <input formControlName="email" />
 *       @if (isTouched() && form.get('email')?.invalid) {
 *         <span>Please enter a valid email</span>
 *       }
 *     </form>
 *   `
 * })
 * class MyComponent {
 *   form = new FormGroup({
 *     email: new FormControl('', Validators.email)
 *   });
 *   isTouched = useFormTouched(this.form);
 * }
 * ```
 */
export const useFormTouched = (form: FormGroup): Signal<boolean> => {
  return toSignal(
    form.events.pipe(
      filter((event): event is TouchedChangeEvent => event instanceof TouchedChangeEvent),
      map((event) => event.touched),
    ),
    { initialValue: form.touched },
  ) as Signal<boolean>;
};
