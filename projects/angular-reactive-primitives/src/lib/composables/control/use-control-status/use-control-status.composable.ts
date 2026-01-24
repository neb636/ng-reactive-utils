import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControlStatus } from '@angular/forms';
import { startWith } from 'rxjs';

/**
 * Returns the validation status of an AbstractControl as a signal.
 * The signal updates reactively whenever the control's status changes.
 * Works with FormControl, FormGroup, and FormArray.
 *
 * Status values:
 * - 'VALID': The control is valid
 * - 'INVALID': The control is invalid
 * - 'PENDING': The control has pending async validators
 * - 'DISABLED': The control is disabled
 *
 * @param control - The AbstractControl to get status from
 * @returns A signal containing the control status
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input [formControl]="emailControl" />
 *     <span [class]="'status-' + controlStatus().toLowerCase()">
 *       Status: {{ controlStatus() }}
 *     </span>
 *   `
 * })
 * class MyComponent {
 *   emailControl = new FormControl('', Validators.required);
 *   controlStatus = useControlStatus(this.emailControl);
 * }
 * ```
 */
export const useControlStatus = (
  control: AbstractControl,
): Signal<FormControlStatus> => {
  return toSignal(control.statusChanges.pipe(startWith(control.status)), {
    initialValue: control.status,
  }) as Signal<FormControlStatus>;
};
