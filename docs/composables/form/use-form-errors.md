# useFormErrors

Returns the validation errors of a FormGroup as a signal. The signal updates reactively whenever the form's validation errors change.

## Usage

```typescript
import { useFormErrors } from 'ng-reactive-utils';

@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="password" type="password" placeholder="Password" />
      <input formControlName="confirmPassword" type="password" placeholder="Confirm Password" />

      @if (formErrors()?.['passwordMismatch']) {
        <span class="error">Passwords do not match</span>
      }

      @if (formErrors()?.['weakPassword']) {
        <span class="error">Password is too weak</span>
      }
    </form>
  `,
})
class PasswordFormComponent {
  form = new FormGroup(
    {
      password: new FormControl(''),
      confirmPassword: new FormControl(''),
    },
    { validators: [this.passwordMatchValidator, this.passwordStrengthValidator] },
  );

  formErrors = useFormErrors(this.form);

  passwordMatchValidator(group: FormGroup): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  passwordStrengthValidator(group: FormGroup): ValidationErrors | null {
    const password = group.get('password')?.value;
    return password.length >= 8 ? null : { weakPassword: true };
  }
}
```

## Parameters

| Parameter | Type        | Default    | Description                      |
| --------- | ----------- | ---------- | -------------------------------- |
| `form`    | `FormGroup` | _required_ | The FormGroup to get errors from |

## Returns

`Signal<ValidationErrors | null>` - A readonly signal containing the validation errors or null if no errors

## Notes

- Uses `toSignal` with `form.statusChanges` observable
- Returns form-level validation errors only (not individual control errors)
- Returns `null` when the form has no validation errors
- Useful for cross-field validation like password confirmation

## Source

<<< @/../src/lib/composables/forms/form/use-form-errors/use-form-errors.composable.ts
