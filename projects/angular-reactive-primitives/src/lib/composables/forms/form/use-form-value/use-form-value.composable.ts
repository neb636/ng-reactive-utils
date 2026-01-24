import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { startWith } from 'rxjs';

/**
 * Returns the current value of a FormGroup as a signal.
 * The signal updates reactively whenever the form value changes.
 *
 * @param form - The FormGroup to get the value from
 * @returns A signal containing the current form value
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <form [formGroup]="form">
 *       <input formControlName="email" />
 *     </form>
 *     <pre>{{ formValue() | json }}</pre>
 *   `
 * })
 * class MyComponent {
 *   form = new FormGroup({
 *     email: new FormControl('')
 *   });
 *   formValue = useFormValue<{ email: string }>(this.form);
 * }
 * ```
 */
export const useFormValue = <T extends object>(form: FormGroup): Signal<T> => {
  return toSignal(form.valueChanges.pipe(startWith(form.value)), {
    initialValue: form.value,
  }) as Signal<T>;
};
