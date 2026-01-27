import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map } from 'rxjs';

/**
 * Returns whether a FormGroup has been touched (interacted with) as a signal.
 * The signal updates reactively whenever the form's touched state changes.
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
  return toSignal(form.statusChanges.pipe(map(() => form.touched)), {
    initialValue: form.touched,
  }) as Signal<boolean>;
};
