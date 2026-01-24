import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs';

/**
 * Returns whether a FormGroup is pristine (has not been modified) as a signal.
 * The signal updates reactively whenever the form's pristine state changes.
 *
 * @param form - The FormGroup to check pristine state for
 * @returns A signal containing the pristine state (true if not modified)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <form [formGroup]="form">
 *       <input formControlName="name" />
 *       @if (isPristine()) {
 *         <span>Form has not been modified</span>
 *       }
 *     </form>
 *   `
 * })
 * class MyComponent {
 *   form = new FormGroup({
 *     name: new FormControl('')
 *   });
 *   isPristine = useFormPristine(this.form);
 * }
 * ```
 */
export const useFormPristine = (form: FormGroup): Signal<boolean> => {
  return toSignal(
    form.valueChanges.pipe(
      startWith(form.value),
      map(() => form.pristine),
    ),
    { initialValue: form.pristine },
  ) as Signal<boolean>;
};
