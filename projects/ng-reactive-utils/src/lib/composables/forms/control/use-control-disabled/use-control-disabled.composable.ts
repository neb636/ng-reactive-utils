import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { map } from 'rxjs';

/**
 * Returns whether an AbstractControl is disabled as a signal.
 * The signal updates reactively whenever the control's disabled state changes.
 * Works with FormControl, FormGroup, and FormArray.
 *
 * @param control - The AbstractControl to check disabled state for
 * @returns A signal containing the disabled state (true if disabled)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input [formControl]="emailControl" />
 *     @if (isDisabled()) {
 *       <span>This field is currently disabled</span>
 *     }
 *   `
 * })
 * class MyComponent {
 *   emailControl = new FormControl('');
 *   isDisabled = useControlDisabled(this.emailControl);
 *
 *   disableField() {
 *     this.emailControl.disable();
 *   }
 * }
 * ```
 */
export const useControlDisabled = (control: AbstractControl): Signal<boolean> => {
  return toSignal(control.statusChanges.pipe(map(() => control.disabled)), {
    initialValue: control.disabled,
  }) as Signal<boolean>;
};
