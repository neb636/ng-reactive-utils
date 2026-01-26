import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { map } from 'rxjs';

/**
 * Returns whether an AbstractControl is pristine (has not been modified) as a signal.
 * The signal updates reactively whenever the control's pristine state changes.
 * Works with FormControl, FormGroup, and FormArray.
 *
 * @param control - The AbstractControl to check pristine state for
 * @returns A signal containing the pristine state (true if not modified)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input [formControl]="nameControl" />
 *     @if (isPristine()) {
 *       <span>Field has not been modified</span>
 *     }
 *   `
 * })
 * class MyComponent {
 *   nameControl = new FormControl('');
 *   isPristine = useControlPristine(this.nameControl);
 * }
 * ```
 */
export const useControlPristine = (
  control: AbstractControl,
): Signal<boolean> => {
  return toSignal(control.valueChanges.pipe(map(() => control.pristine)), {
    initialValue: control.pristine,
  }) as Signal<boolean>;
};
