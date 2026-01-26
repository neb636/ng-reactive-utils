import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { map } from 'rxjs';

/**
 * Returns whether an AbstractControl has pending async validators as a signal.
 * The signal updates reactively whenever the control's pending state changes.
 * Works with FormControl, FormGroup, and FormArray.
 *
 * @param control - The AbstractControl to check pending state for
 * @returns A signal containing the pending state (true if async validators are running)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input [formControl]="usernameControl" />
 *     @if (isPending()) {
 *       <span>Checking availability...</span>
 *     }
 *   `
 * })
 * class MyComponent {
 *   usernameControl = new FormControl('', [], [asyncUsernameValidator]);
 *   isPending = useControlPending(this.usernameControl);
 * }
 * ```
 */
export const useControlPending = (control: AbstractControl): Signal<boolean> => {
  return toSignal(control.statusChanges.pipe(map(() => control.pending)), {
    initialValue: control.pending,
  }) as Signal<boolean>;
};
