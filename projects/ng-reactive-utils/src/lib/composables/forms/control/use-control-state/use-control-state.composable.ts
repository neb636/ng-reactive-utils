import { computed, Signal } from '@angular/core';
import { AbstractControl, FormControlStatus, ValidationErrors } from '@angular/forms';
import { useControlValue } from '../use-control-value/use-control-value.composable';
import { useControlStatus } from '../use-control-status/use-control-status.composable';
import { useControlValid } from '../use-control-valid/use-control-valid.composable';
import { useControlPending } from '../use-control-pending/use-control-pending.composable';
import { useControlDisabled } from '../use-control-disabled/use-control-disabled.composable';
import { useControlDirty } from '../use-control-dirty/use-control-dirty.composable';
import { useControlPristine } from '../use-control-pristine/use-control-pristine.composable';
import { useControlTouched } from '../use-control-touched/use-control-touched.composable';
import { useControlUntouched } from '../use-control-untouched/use-control-untouched.composable';
import { useControlErrors } from '../use-control-errors/use-control-errors.composable';

/**
 * Represents the reactive state of an AbstractControl as signals.
 */
export interface ControlState<T> {
  /** The current value of the control */
  value: Signal<T>;
  /** The validation status of the control */
  status: Signal<FormControlStatus>;
  /** Whether the control is valid */
  valid: Signal<boolean>;
  /** Whether the control is invalid */
  invalid: Signal<boolean>;
  /** Whether the control has pending async validators */
  pending: Signal<boolean>;
  /** Whether the control is disabled */
  disabled: Signal<boolean>;
  /** Whether the control is enabled */
  enabled: Signal<boolean>;
  /** Whether the control value has been modified */
  dirty: Signal<boolean>;
  /** Whether the control value has not been modified */
  pristine: Signal<boolean>;
  /** Whether the control has been interacted with */
  touched: Signal<boolean>;
  /** Whether the control has not been interacted with */
  untouched: Signal<boolean>;
  /** The validation errors of the control */
  errors: Signal<ValidationErrors | null>;
}

/**
 * Converts an AbstractControl into a reactive state object with signals for all control properties.
 * This provides a comprehensive view of the control's state that updates reactively.
 * Works with FormControl, FormGroup, and FormArray.
 *
 * @param control - The AbstractControl to convert to signals
 * @returns An object containing signals for all control state properties
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <input [formControl]="emailControl" />
 *     @if (emailState.invalid() && emailState.touched()) {
 *       <span>Please enter a valid email</span>
 *     }
 *   `
 * })
 * class MyComponent {
 *   emailControl = new FormControl('', [Validators.required, Validators.email]);
 *   emailState = useControlState<string>(this.emailControl);
 * }
 * ```
 */
export const useControlState = <T>(control: AbstractControl): ControlState<T> => {
  const valid = useControlValid(control);
  const disabled = useControlDisabled(control);

  return {
    value: useControlValue(control),
    status: useControlStatus(control),
    valid,
    invalid: computed(() => !valid()),
    pending: useControlPending(control),
    disabled,
    enabled: computed(() => !disabled()),
    dirty: useControlDirty(control),
    pristine: useControlPristine(control),
    touched: useControlTouched(control),
    untouched: useControlUntouched(control),
    errors: useControlErrors(control),
  };
};
