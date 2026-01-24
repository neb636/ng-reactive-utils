import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map } from 'rxjs';

/**
 * Returns whether a FormGroup has pending async validators as a signal.
 * The signal updates reactively whenever the form's pending state changes.
 *
 * @param form - The FormGroup to check pending state for
 * @returns A signal containing the pending state (true if async validators are running)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <form [formGroup]="form">
 *       <input formControlName="username" />
 *       @if (isPending()) {
 *         <span>Checking availability...</span>
 *       }
 *     </form>
 *   `
 * })
 * class MyComponent {
 *   form = new FormGroup({
 *     username: new FormControl('', [], [asyncUsernameValidator])
 *   });
 *   isPending = useFormPending(this.form);
 * }
 * ```
 */
export const useFormPending = (form: FormGroup): Signal<boolean> => {
  return toSignal(form.statusChanges.pipe(map(() => form.pending)), {
    initialValue: form.pending,
  }) as Signal<boolean>;
};
