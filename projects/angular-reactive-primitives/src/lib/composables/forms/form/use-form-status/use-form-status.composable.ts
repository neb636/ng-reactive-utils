import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormControlStatus } from '@angular/forms';

/**
 * Returns the validation status of a FormGroup as a signal.
 * The signal updates reactively whenever the form's status changes.
 *
 * Status values:
 * - 'VALID': All controls are valid
 * - 'INVALID': At least one control is invalid
 * - 'PENDING': At least one control has pending async validators
 * - 'DISABLED': The form is disabled
 *
 * @param form - The FormGroup to get status from
 * @returns A signal containing the form status
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <form [formGroup]="form">
 *       <input formControlName="email" />
 *       <span>Status: {{ formStatus() }}</span>
 *     </form>
 *   `
 * })
 * class MyComponent {
 *   form = new FormGroup({
 *     email: new FormControl('', Validators.required)
 *   });
 *   formStatus = useFormStatus(this.form);
 * }
 * ```
 */
export const useFormStatus = (form: FormGroup): Signal<FormControlStatus> => {
  return toSignal(form.statusChanges, {
    initialValue: form.status,
  }) as Signal<FormControlStatus>;
};
