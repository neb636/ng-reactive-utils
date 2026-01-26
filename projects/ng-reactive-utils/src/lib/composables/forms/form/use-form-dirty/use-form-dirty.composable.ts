import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { map } from 'rxjs';

/**
 * Returns whether a FormGroup is dirty (has been modified) as a signal.
 * The signal updates reactively whenever the form's dirty state changes.
 *
 * @param form - The FormGroup to check dirty state for
 * @returns A signal containing the dirty state (true if modified)
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <form [formGroup]="form">
 *       <input formControlName="name" />
 *       @if (isDirty()) {
 *         <span>You have unsaved changes</span>
 *       }
 *     </form>
 *   `
 * })
 * class MyComponent {
 *   form = new FormGroup({
 *     name: new FormControl('')
 *   });
 *   isDirty = useFormDirty(this.form);
 * }
 * ```
 */
export const useFormDirty = (form: FormGroup): Signal<boolean> => {
  return toSignal(form.valueChanges.pipe(map(() => form.dirty)), {
    initialValue: form.dirty,
  }) as Signal<boolean>;
};
