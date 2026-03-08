import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, TouchedChangeEvent } from '@angular/forms';
import { filter, map, merge } from 'rxjs';

/**
 * Returns whether a FormGroup is untouched (has not been interacted with) as a signal.
 * The signal updates reactively whenever any control in the form is touched or
 * untouched, including programmatic calls to markAsTouched() / markAsUntouched().
 *
 * @param form - The FormGroup to check untouched state for
 * @returns A signal containing the untouched state (true if not interacted with)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <form [formGroup]="form">
 *       <input formControlName="email" />
 *       @if (isUntouched()) {
 *         <span>Please fill out the form</span>
 *       }
 *     </form>
 *   `
 * })
 * class MyComponent {
 *   form = new FormGroup({
 *     email: new FormControl('')
 *   });
 *   isUntouched = useFormUntouched(this.form);
 * }
 * ```
 */
export const useFormUntouched = (form: FormGroup): Signal<boolean> => {
  // TouchedChangeEvent on a FormGroup only fires when markAsTouched() / markAsUntouched()
  // is called on the form itself — it does not propagate from child control blur events.
  // Merging events from all child controls ensures the signal stays accurate when a user
  // interacts with any field in the form.
  const allControls = [form, ...Object.values(form.controls)];
  const anyTouchedChange$ = merge(...allControls.map((control) => control.events)).pipe(
    filter((event): event is TouchedChangeEvent => event instanceof TouchedChangeEvent),
    map(() => form.untouched),
  );

  return toSignal(anyTouchedChange$, { initialValue: form.untouched }) as Signal<boolean>;
};
