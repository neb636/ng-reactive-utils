import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { map } from 'rxjs';

/**
 * Returns whether an AbstractControl is valid as a signal.
 * The signal updates reactively whenever the control's validity changes.
 * Works with FormControl, FormGroup, and FormArray.
 *
 * @param control - The AbstractControl to check validity for
 * @returns A signal containing the validity state (true if valid)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input [formControl]="emailControl" />
 *     @if (!isValid()) {
 *       <span>Email is invalid</span>
 *     }
 *   `
 * })
 * class MyComponent {
 *   emailControl = new FormControl('', Validators.email);
 *   isValid = useControlValid(this.emailControl);
 * }
 * ```
 */
export const useControlValid = (control: AbstractControl): Signal<boolean> => {
  return toSignal(control.statusChanges.pipe(map(() => control.valid)), {
    initialValue: control.valid,
  }) as Signal<boolean>;
};
