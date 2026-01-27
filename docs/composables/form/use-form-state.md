# useFormState

Converts a FormGroup into a reactive state object with signals for all form properties. This provides a comprehensive view of the form's state that updates reactively.

## Usage

```typescript
import { useFormState } from 'ng-reactive-utils';

@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="name" />
      <input formControlName="email" />

      @if (formState.invalid()) {
        <span class="error">Form has errors</span>
      }

      @if (formState.dirty()) {
        <span class="warning">You have unsaved changes</span>
      }

      <button [disabled]="formState.invalid() || formState.pending()">Submit</button>
    </form>

    <pre>{{ formState.value() | json }}</pre>
  `,
})
class UserFormComponent {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  formState = useFormState<{ name: string; email: string }>(this.form);
}
```

## Parameters

| Parameter | Type        | Default    | Description                         |
| --------- | ----------- | ---------- | ----------------------------------- |
| `form`    | `FormGroup` | _required_ | The FormGroup to convert to signals |

## Returns

`FormState<T>` - An object containing signals for all form state properties:

| Property    | Type                        | Description                                                       |
| ----------- | --------------------------- | ----------------------------------------------------------------- | --------------------------------- |
| `value`     | `Signal<T>`                 | The current value of the form                                     |
| `status`    | `Signal<FormControlStatus>` | The validation status ('VALID', 'INVALID', 'PENDING', 'DISABLED') |
| `valid`     | `Signal<boolean>`           | Whether the form is valid                                         |
| `invalid`   | `Signal<boolean>`           | Whether the form is invalid                                       |
| `pending`   | `Signal<boolean>`           | Whether async validators are running                              |
| `disabled`  | `Signal<boolean>`           | Whether the form is disabled                                      |
| `enabled`   | `Signal<boolean>`           | Whether the form is enabled                                       |
| `dirty`     | `Signal<boolean>`           | Whether the form has been modified                                |
| `pristine`  | `Signal<boolean>`           | Whether the form has not been modified                            |
| `touched`   | `Signal<boolean>`           | Whether the form has been interacted with                         |
| `untouched` | `Signal<boolean>`           | Whether the form has not been interacted with                     |
| `errors`    | `Signal<ValidationErrors    | null>`                                                            | The validation errors of the form |

## Notes

- Uses `toSignal` to convert form observables to signals
- All signals update reactively when the form state changes
- Type parameter `T` should match your form's value structure
- For individual properties, consider using the specific composables like `useFormValue`, `useFormValid`, etc.

## Source

<<< @/../projects/ng-reactive-utils/src/lib/composables/forms/form/use-form-state/use-form-state.composable.ts
