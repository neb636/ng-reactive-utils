import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, TouchedChangeEvent } from '@angular/forms';
import { filter, map } from 'rxjs';

/**
 * Returns whether an AbstractControl is untouched (has not been interacted with) as a signal.
 * The signal updates reactively whenever the control's untouched state changes,
 * including when markAsTouched() or markAsUntouched() are called directly.
 * Works with FormControl, FormGroup, and FormArray.
 *
 * @param control - The AbstractControl to check untouched state for
 * @returns A signal containing the untouched state (true if not interacted with)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input [formControl]="emailControl" />
 *     @if (isUntouched()) {
 *       <span>Please fill out this field</span>
 *     }
 *   `
 * })
 * class MyComponent {
 *   emailControl = new FormControl('');
 *   isUntouched = useControlUntouched(this.emailControl);
 * }
 * ```
 */
export const useControlUntouched = (control: AbstractControl): Signal<boolean> => {
  return toSignal(
    control.events.pipe(
      filter((event): event is TouchedChangeEvent => event instanceof TouchedChangeEvent),
      map((event) => !event.touched),
    ),
    { initialValue: control.untouched },
  ) as Signal<boolean>;
};
