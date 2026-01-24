import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControlStatus,
  ValidationErrors,
} from '@angular/forms';
import { map, startWith } from 'rxjs';

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
export const useControlState = <T>(
  control: AbstractControl,
): ControlState<T> => {
  const statusChanges$ = control.statusChanges.pipe(startWith(control.status));
  const valueChanges$ = control.valueChanges.pipe(startWith(control.value));

  return {
    value: toSignal(valueChanges$, { initialValue: control.value }) as Signal<T>,
    status: toSignal(statusChanges$, {
      initialValue: control.status,
    }) as Signal<FormControlStatus>,
    valid: toSignal(statusChanges$.pipe(map(() => control.valid)), {
      initialValue: control.valid,
    }) as Signal<boolean>,
    invalid: toSignal(statusChanges$.pipe(map(() => control.invalid)), {
      initialValue: control.invalid,
    }) as Signal<boolean>,
    pending: toSignal(statusChanges$.pipe(map(() => control.pending)), {
      initialValue: control.pending,
    }) as Signal<boolean>,
    disabled: toSignal(statusChanges$.pipe(map(() => control.disabled)), {
      initialValue: control.disabled,
    }) as Signal<boolean>,
    enabled: toSignal(statusChanges$.pipe(map(() => control.enabled)), {
      initialValue: control.enabled,
    }) as Signal<boolean>,
    dirty: toSignal(valueChanges$.pipe(map(() => control.dirty)), {
      initialValue: control.dirty,
    }) as Signal<boolean>,
    pristine: toSignal(valueChanges$.pipe(map(() => control.pristine)), {
      initialValue: control.pristine,
    }) as Signal<boolean>,
    touched: toSignal(statusChanges$.pipe(map(() => control.touched)), {
      initialValue: control.touched,
    }) as Signal<boolean>,
    untouched: toSignal(statusChanges$.pipe(map(() => control.untouched)), {
      initialValue: control.untouched,
    }) as Signal<boolean>,
    errors: toSignal(statusChanges$.pipe(map(() => control.errors)), {
      initialValue: control.errors,
    }) as Signal<ValidationErrors | null>,
  };
};
