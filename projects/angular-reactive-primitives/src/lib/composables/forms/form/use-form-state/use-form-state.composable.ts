import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormControlStatus, ValidationErrors } from '@angular/forms';
import { map, startWith } from 'rxjs';

/**
 * Represents the reactive state of a FormGroup as signals.
 */
export interface FormState<T> {
  /** The current value of the form */
  value: Signal<T>;
  /** The validation status of the form */
  status: Signal<FormControlStatus>;
  /** Whether the form is valid */
  valid: Signal<boolean>;
  /** Whether the form is invalid */
  invalid: Signal<boolean>;
  /** Whether the form has pending async validators */
  pending: Signal<boolean>;
  /** Whether the form is disabled */
  disabled: Signal<boolean>;
  /** Whether the form is enabled */
  enabled: Signal<boolean>;
  /** Whether the form value has been modified */
  dirty: Signal<boolean>;
  /** Whether the form value has not been modified */
  pristine: Signal<boolean>;
  /** Whether the form has been interacted with */
  touched: Signal<boolean>;
  /** Whether the form has not been interacted with */
  untouched: Signal<boolean>;
  /** The validation errors of the form */
  errors: Signal<ValidationErrors | null>;
}

/**
 * Converts a FormGroup into a reactive state object with signals for all form properties.
 * This provides a comprehensive view of the form's state that updates reactively.
 *
 * @param form - The FormGroup to convert to signals
 * @returns An object containing signals for all form state properties
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <form [formGroup]="form">
 *       <input formControlName="name" />
 *       @if (formState.invalid()) {
 *         <span>Form has errors</span>
 *       }
 *     </form>
 *   `
 * })
 * class MyComponent {
 *   form = new FormGroup({
 *     name: new FormControl('')
 *   });
 *   formState = useFormState(this.form);
 * }
 * ```
 */
export const useFormState = <T extends object>(
  form: FormGroup,
): FormState<T> => {
  const statusChanges$ = form.statusChanges.pipe(startWith(form.status));
  const valueChanges$ = form.valueChanges.pipe(startWith(form.value));

  return {
    value: toSignal(valueChanges$, { initialValue: form.value }) as Signal<T>,
    status: toSignal(statusChanges$, {
      initialValue: form.status,
    }) as Signal<FormControlStatus>,
    valid: toSignal(statusChanges$.pipe(map(() => form.valid)), {
      initialValue: form.valid,
    }) as Signal<boolean>,
    invalid: toSignal(statusChanges$.pipe(map(() => form.invalid)), {
      initialValue: form.invalid,
    }) as Signal<boolean>,
    pending: toSignal(statusChanges$.pipe(map(() => form.pending)), {
      initialValue: form.pending,
    }) as Signal<boolean>,
    disabled: toSignal(statusChanges$.pipe(map(() => form.disabled)), {
      initialValue: form.disabled,
    }) as Signal<boolean>,
    enabled: toSignal(statusChanges$.pipe(map(() => form.enabled)), {
      initialValue: form.enabled,
    }) as Signal<boolean>,
    dirty: toSignal(valueChanges$.pipe(map(() => form.dirty)), {
      initialValue: form.dirty,
    }) as Signal<boolean>,
    pristine: toSignal(valueChanges$.pipe(map(() => form.pristine)), {
      initialValue: form.pristine,
    }) as Signal<boolean>,
    touched: toSignal(statusChanges$.pipe(map(() => form.touched)), {
      initialValue: form.touched,
    }) as Signal<boolean>,
    untouched: toSignal(statusChanges$.pipe(map(() => form.untouched)), {
      initialValue: form.untouched,
    }) as Signal<boolean>,
    errors: toSignal(statusChanges$.pipe(map(() => form.errors)), {
      initialValue: form.errors,
    }) as Signal<ValidationErrors | null>,
  };
};
