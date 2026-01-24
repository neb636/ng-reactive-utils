import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { startWith } from 'rxjs';

/**
 * Returns the current value of an AbstractControl as a signal.
 * The signal updates reactively whenever the control value changes.
 * Works with FormControl, FormGroup, and FormArray.
 *
 * @param control - The AbstractControl to get the value from
 * @returns A signal containing the current control value
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input [formControl]="nameControl" />
 *     <p>Hello, {{ name() }}!</p>
 *   `
 * })
 * class MyComponent {
 *   nameControl = new FormControl('');
 *   name = useControlValue<string>(this.nameControl);
 * }
 * ```
 */
export const useControlValue = <T>(control: AbstractControl): Signal<T> => {
  return toSignal(control.valueChanges.pipe(startWith(control.value)), {
    initialValue: control.value,
  }) as Signal<T>;
};
