# useControlUntouched

Returns whether an AbstractControl is untouched (has not been interacted with) as a signal. The signal updates reactively whenever the control's untouched state changes. Works with FormControl, FormGroup, and FormArray.

## Usage

```typescript
import { useControlUntouched } from 'ng-reactive-utils';

@Component({
  template: `
    <input [formControl]="emailControl" />

    @if (isUntouched()) {
      <span class="hint">Click to enter your email</span>
    }
  `,
})
class EmailFieldComponent {
  emailControl = new FormControl('');
  isUntouched = useControlUntouched(this.emailControl);
}
```

## Advanced Usage

```typescript
import { useControlUntouched } from 'ng-reactive-utils';

@Component({
  template: `
    <div class="form-field" [class.pristine]="isUntouched()">
      <label>Password</label>
      <input type="password" [formControl]="passwordControl" />

      @if (isUntouched()) {
        <div class="requirements">Password must be at least 8 characters</div>
      } @else if (passwordControl.invalid) {
        <div class="error">Please enter a valid password</div>
      }
    </div>
  `,
})
class PasswordFieldComponent {
  passwordControl = new FormControl('', [Validators.minLength(8)]);
  isUntouched = useControlUntouched(this.passwordControl);
}
```

## Parameters

| Parameter | Type              | Default    | Description                              |
| --------- | ----------------- | ---------- | ---------------------------------------- |
| `control` | `AbstractControl` | _required_ | The control to check untouched state for |

## Returns

`Signal<boolean>` - A readonly signal containing the untouched state (true if not interacted with)

## Notes

- Works with FormControl, FormGroup, and FormArray
- Uses `toSignal` with `control.statusChanges` observable
- Returns `true` when the control has not been blurred (interacted with)
- Returns `false` when the control has been touched
- Opposite of `useControlTouched`
- Useful for showing hints before user interaction

## Source

<<< @/../src/lib/composables/forms/control/use-control-untouched/use-control-untouched.composable.ts
