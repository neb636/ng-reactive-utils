import { computed, Signal } from '@angular/core';
import { FormGroup, FormControlStatus, ValidationErrors } from '@angular/forms';
import { useFormValue } from '../use-form-value/use-form-value.composable';
import { useFormStatus } from '../use-form-status/use-form-status.composable';
import { useFormValid } from '../use-form-valid/use-form-valid.composable';
import { useFormPending } from '../use-form-pending/use-form-pending.composable';
import { useFormDisabled } from '../use-form-disabled/use-form-disabled.composable';
import { useFormDirty } from '../use-form-dirty/use-form-dirty.composable';
import { useFormPristine } from '../use-form-pristine/use-form-pristine.composable';
import { useFormTouched } from '../use-form-touched/use-form-touched.composable';
import { useFormUntouched } from '../use-form-untouched/use-form-untouched.composable';
import { useFormErrors } from '../use-form-errors/use-form-errors.composable';

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
  const valid = useFormValid(form);
  const disabled = useFormDisabled(form);

  return {
    value: useFormValue(form),
    status: useFormStatus(form),
    valid,
    invalid: computed(() => !valid()),
    pending: useFormPending(form),
    disabled,
    enabled: computed(() => !disabled()),
    dirty: useFormDirty(form),
    pristine: useFormPristine(form),
    touched: useFormTouched(form),
    untouched: useFormUntouched(form),
    errors: useFormErrors(form),
  };
};
