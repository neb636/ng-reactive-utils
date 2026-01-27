# useFormValid

Returns whether a FormGroup is valid as a signal. The signal updates reactively whenever the form's validity changes.

## Usage

```typescript
import { useFormValid } from 'ng-reactive-utils';

@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="email" placeholder="Email" />
      <input formControlName="password" type="password" placeholder="Password" />

      <button [disabled]="!isValid()">Submit</button>

      @if (!isValid()) {
        <p class="error">Please fill in all required fields correctly.</p>
      }
    </form>
  `,
})
class LoginFormComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  isValid = useFormValid(this.form);
}
```

## Parameters

| Parameter | Type        | Default    | Description                         |
| --------- | ----------- | ---------- | ----------------------------------- |
| `form`    | `FormGroup` | _required_ | The FormGroup to check validity for |

## Returns

`Signal<boolean>` - A readonly signal containing the validity state (true if valid)

## Notes

- Uses `toSignal` with `form.statusChanges` observable
- Returns `true` when all controls pass validation
- Returns `false` when any control has validation errors
- Updates reactively when any control's validity changes

## Source

<<< @/../projects/ng-reactive-utils/src/lib/composables/forms/form/use-form-valid/use-form-valid.composable.ts
