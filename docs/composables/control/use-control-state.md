# useControlState

Converts an AbstractControl into a reactive state object with signals for all control properties. This provides a comprehensive view of the control's state that updates reactively. Works with FormControl, FormGroup, and FormArray.

## Usage

```typescript
import { useControlState } from 'ng-reactive-utils';

@Component({
  template: `
    <input [formControl]="emailControl" />

    @if (emailState.invalid() && emailState.touched()) {
      <span class="error">Please enter a valid email</span>
    }

    @if (emailState.dirty()) {
      <span class="info">Email has been modified</span>
    }

    <pre>Value: {{ emailState.value() }}</pre>
    <pre>Status: {{ emailState.status() }}</pre>
  `,
})
class EmailInputComponent {
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  emailState = useControlState<string>(this.emailControl);
}
```

## Parameters

| Parameter | Type              | Default    | Description                       |
| --------- | ----------------- | ---------- | --------------------------------- |
| `control` | `AbstractControl` | _required_ | The control to convert to signals |

## Returns

`ControlState<T>` - An object containing signals for all control state properties:

| Property    | Type                        | Description                                                       |
| ----------- | --------------------------- | ----------------------------------------------------------------- | ------------------------------------ |
| `value`     | `Signal<T>`                 | The current value of the control                                  |
| `status`    | `Signal<FormControlStatus>` | The validation status ('VALID', 'INVALID', 'PENDING', 'DISABLED') |
| `valid`     | `Signal<boolean>`           | Whether the control is valid                                      |
| `invalid`   | `Signal<boolean>`           | Whether the control is invalid                                    |
| `pending`   | `Signal<boolean>`           | Whether async validators are running                              |
| `disabled`  | `Signal<boolean>`           | Whether the control is disabled                                   |
| `enabled`   | `Signal<boolean>`           | Whether the control is enabled                                    |
| `dirty`     | `Signal<boolean>`           | Whether the control has been modified                             |
| `pristine`  | `Signal<boolean>`           | Whether the control has not been modified                         |
| `touched`   | `Signal<boolean>`           | Whether the control has been interacted with                      |
| `untouched` | `Signal<boolean>`           | Whether the control has not been interacted with                  |
| `errors`    | `Signal<ValidationErrors    | null>`                                                            | The validation errors of the control |

## Notes

- Works with FormControl, FormGroup, and FormArray
- Uses `toSignal` to convert control observables to signals
- All signals update reactively when the control state changes
- For individual properties, consider using the specific composables like `useControlValue`, `useControlValid`, etc.

## Source

<<< @/../src/lib/composables/forms/control/use-control-state/use-control-state.composable.ts
