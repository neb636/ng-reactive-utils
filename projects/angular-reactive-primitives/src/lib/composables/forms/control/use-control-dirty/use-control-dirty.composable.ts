import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { map, startWith } from 'rxjs';

/**
 * Returns whether an AbstractControl is dirty (has been modified) as a signal.
 * The signal updates reactively whenever the control's dirty state changes.
 * Works with FormControl, FormGroup, and FormArray.
 *
 * @param control - The AbstractControl to check dirty state for
 * @returns A signal containing the dirty state (true if modified)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input [formControl]="nameControl" />
 *     @if (isDirty()) {
 *       <span>Field has been modified</span>
 *     }
 *   `
 * })
 * class MyComponent {
 *   nameControl = new FormControl('');
 *   isDirty = useControlDirty(this.nameControl);
 * }
 * ```
 */
export const useControlDirty = (control: AbstractControl): Signal<boolean> => {
  return toSignal(
    control.valueChanges.pipe(
      startWith(control.value),
      map(() => control.dirty),
    ),
    { initialValue: control.dirty },
  ) as Signal<boolean>;
};
