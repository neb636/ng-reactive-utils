import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, ValidationErrors } from '@angular/forms';
import { map } from 'rxjs';

/**
 * Returns the validation errors of a FormGroup as a signal.
 * The signal updates reactively whenever the form's validation errors change.
 *
 * @param form - The FormGroup to get errors from
 * @returns A signal containing the validation errors or null if no errors
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <form [formGroup]="form">
 *       <input formControlName="password" />
 *       <input formControlName="confirmPassword" />
 *       @if (formErrors()?.['passwordMismatch']) {
 *         <span>Passwords do not match</span>
 *       }
 *     </form>
 *   `
 * })
 * class MyComponent {
 *   form = new FormGroup({
 *     password: new FormControl(''),
 *     confirmPassword: new FormControl('')
 *   }, { validators: passwordMatchValidator });
 *   formErrors = useFormErrors(this.form);
 * }
 * ```
 */
export const useFormErrors = (form: FormGroup): Signal<ValidationErrors | null> => {
  return toSignal(form.statusChanges.pipe(map(() => form.errors)), {
    initialValue: form.errors,
  }) as Signal<ValidationErrors | null>;
};
