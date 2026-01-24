import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { map, startWith } from 'rxjs';

/**
 * Returns the validation errors of an AbstractControl as a signal.
 * The signal updates reactively whenever the control's validation errors change.
 * Works with FormControl, FormGroup, and FormArray.
 *
 * @param control - The AbstractControl to get errors from
 * @returns A signal containing the validation errors or null if no errors
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input [formControl]="emailControl" />
 *     @if (errors()?.['required']) {
 *       <span>Email is required</span>
 *     }
 *     @if (errors()?.['email']) {
 *       <span>Please enter a valid email</span>
 *     }
 *   `
 * })
 * class MyComponent {
 *   emailControl = new FormControl('', [Validators.required, Validators.email]);
 *   errors = useControlErrors(this.emailControl);
 * }
 * ```
 */
export const useControlErrors = (
  control: AbstractControl,
): Signal<ValidationErrors | null> => {
  return toSignal(
    control.statusChanges.pipe(
      startWith(control.status),
      map(() => control.errors),
    ),
    { initialValue: control.errors },
  ) as Signal<ValidationErrors | null>;
};
