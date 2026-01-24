# useControlPending

Returns whether an AbstractControl has pending async validators as a signal. The signal updates reactively whenever the control's pending state changes. Works with FormControl, FormGroup, and FormArray.

## Usage

```typescript
import { useControlPending } from 'angular-reactive-primitives';

@Component({
  template: `
    <input [formControl]="usernameControl" />
    
    @if (isPending()) {
      <span class="loading-spinner">Checking availability...</span>
    }
  `
})
class UsernameFieldComponent {
  usernameControl = new FormControl('', [], [asyncUsernameValidator]);
  isPending = useControlPending(this.usernameControl);
}
```

## Advanced Usage

```typescript
import { useControlPending } from 'angular-reactive-primitives';

@Component({
  template: `
    <input [formControl]="emailControl" />
    
    @if (isPending()) {
      <div class="validation-status">
        <span class="spinner"></span>
        Validating email...
      </div>
    } @else if (emailControl.valid) {
      <div class="validation-status success">Email is available</div>
    }
    
    <button [disabled]="isPending() || emailControl.invalid">
      Continue
    </button>
  `
})
class EmailVerificationComponent {
  emailControl = new FormControl('', [Validators.email], [asyncEmailValidator]);
  isPending = useControlPending(this.emailControl);
}
```

## Parameters

| Parameter | Type              | Default    | Description                              |
| --------- | ----------------- | ---------- | ---------------------------------------- |
| `control` | `AbstractControl` | _required_ | The control to check pending state for   |

## Returns

`Signal<boolean>` - A readonly signal containing the pending state (true if async validators are running)

## Notes

- Works with FormControl, FormGroup, and FormArray
- Uses `toSignal` with `control.statusChanges` observable
- Returns `true` when the control has pending async validators
- Returns `false` when all validators have completed
- Useful for showing loading indicators during async validation

## Source

<<< @/../projects/angular-reactive-primitives/src/lib/composables/forms/control/use-control-pending/use-control-pending.composable.ts
