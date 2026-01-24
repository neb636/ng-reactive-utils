import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map } from 'rxjs';

/**
 * Returns whether a FormGroup is disabled as a signal.
 * The signal updates reactively whenever the form's disabled state changes.
 *
 * @param form - The FormGroup to check disabled state for
 * @returns A signal containing the disabled state (true if disabled)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <form [formGroup]="form">
 *       <input formControlName="email" />
 *       @if (isDisabled()) {
 *         <span>Form is currently disabled</span>
 *       }
 *     </form>
 *   `
 * })
 * class MyComponent {
 *   form = new FormGroup({
 *     email: new FormControl('')
 *   });
 *   isDisabled = useFormDisabled(this.form);
 *
 *   disableForm() {
 *     this.form.disable();
 *   }
 * }
 * ```
 */
export const useFormDisabled = (form: FormGroup): Signal<boolean> => {
  return toSignal(form.statusChanges.pipe(map(() => form.disabled)), {
    initialValue: form.disabled,
  }) as Signal<boolean>;
};
