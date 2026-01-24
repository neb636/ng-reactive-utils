import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs';

/**
 * Returns whether a FormGroup is valid as a signal.
 * The signal updates reactively whenever the form's validity changes.
 *
 * @param form - The FormGroup to check validity for
 * @returns A signal containing the validity state (true if valid)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <form [formGroup]="form">
 *       <input formControlName="email" />
 *       <button [disabled]="!isValid()">Submit</button>
 *     </form>
 *   `
 * })
 * class MyComponent {
 *   form = new FormGroup({
 *     email: new FormControl('', Validators.required)
 *   });
 *   isValid = useFormValid(this.form);
 * }
 * ```
 */
export const useFormValid = (form: FormGroup): Signal<boolean> => {
  return toSignal(
    form.statusChanges.pipe(
      startWith(form.status),
      map(() => form.valid),
    ),
    { initialValue: form.valid },
  ) as Signal<boolean>;
};
