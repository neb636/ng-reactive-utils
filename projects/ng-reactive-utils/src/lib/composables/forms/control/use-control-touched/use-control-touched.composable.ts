import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { map } from 'rxjs';

/**
 * Returns whether an AbstractControl has been touched (interacted with) as a signal.
 * The signal updates reactively whenever the control's touched state changes.
 * Works with FormControl, FormGroup, and FormArray.
 *
 * @param control - The AbstractControl to check touched state for
 * @returns A signal containing the touched state (true if interacted with)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input [formControl]="emailControl" />
 *     @if (isTouched() && emailControl.invalid) {
 *       <span>Please enter a valid email</span>
 *     }
 *   `
 * })
 * class MyComponent {
 *   emailControl = new FormControl('', Validators.email);
 *   isTouched = useControlTouched(this.emailControl);
 * }
 * ```
 */
export const useControlTouched = (control: AbstractControl): Signal<boolean> => {
  return toSignal(control.statusChanges.pipe(map(() => control.touched)), {
    initialValue: control.touched,
  }) as Signal<boolean>;
};
