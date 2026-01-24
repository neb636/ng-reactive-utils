# useFormPending

Returns whether a FormGroup has pending async validators as a signal. The signal updates reactively whenever the form's pending state changes.

## Usage

```typescript
import { useFormPending } from 'angular-reactive-primitives';

@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="username" placeholder="Username" />
      
      @if (isPending()) {
        <span class="loading">Checking availability...</span>
      }
      
      <button [disabled]="isPending()">
        @if (isPending()) {
          Validating...
        } @else {
          Submit
        }
      </button>
    </form>
  `
})
class RegistrationComponent {
  form = new FormGroup({
    username: new FormControl('', [], [this.usernameValidator()])
  });
  
  isPending = useFormPending(this.form);
  
  usernameValidator(): AsyncValidatorFn {
    return (control) => {
      return this.userService.checkUsername(control.value).pipe(
        map(exists => exists ? { usernameTaken: true } : null)
      );
    };
  }
}
```

## Parameters

| Parameter | Type        | Default    | Description                              |
| --------- | ----------- | ---------- | ---------------------------------------- |
| `form`    | `FormGroup` | _required_ | The FormGroup to check pending state for |

## Returns

`Signal<boolean>` - A readonly signal containing the pending state (true if async validators are running)

## Notes

- Uses `toSignal` with `form.statusChanges` observable
- Returns `true` when any control has running async validators
- Returns `false` when all async validators have completed
- Useful for showing loading indicators during async validation

## Source

<<< @/../projects/angular-reactive-primitives/src/lib/composables/form/use-form-pending/use-form-pending.composable.ts
