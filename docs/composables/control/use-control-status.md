# useControlStatus

Returns the validation status of an AbstractControl as a signal. The signal updates reactively whenever the control's status changes. Works with FormControl, FormGroup, and FormArray.

## Usage

```typescript
import { useControlStatus } from 'angular-reactive-primitives';

@Component({
  template: `
    <input [formControl]="usernameControl" placeholder="Username" />
    
    <span [class]="'status-' + controlStatus().toLowerCase()">
      {{ controlStatus() }}
    </span>
    
    @switch (controlStatus()) {
      @case ('VALID') {
        <span class="success">Username is available</span>
      }
      @case ('INVALID') {
        <span class="error">Username is invalid</span>
      }
      @case ('PENDING') {
        <span class="loading">Checking availability...</span>
      }
      @case ('DISABLED') {
        <span class="info">Username cannot be changed</span>
      }
    }
  `,
  styles: `
    .status-valid { color: green; }
    .status-invalid { color: red; }
    .status-pending { color: orange; }
    .status-disabled { color: gray; }
  `
})
class UsernameFieldComponent {
  usernameControl = new FormControl('', 
    [Validators.required, Validators.minLength(3)],
    [this.usernameAvailabilityValidator()]
  );
  
  controlStatus = useControlStatus(this.usernameControl);
}
```

## Parameters

| Parameter | Type              | Default    | Description                        |
| --------- | ----------------- | ---------- | ---------------------------------- |
| `control` | `AbstractControl` | _required_ | The control to get status from     |

## Returns

`Signal<FormControlStatus>` - A readonly signal containing the control status

## Status Values

| Status     | Description                              |
| ---------- | ---------------------------------------- |
| `VALID`    | Control passes all validation            |
| `INVALID`  | Control has validation errors            |
| `PENDING`  | Control has pending async validators     |
| `DISABLED` | Control is disabled                      |

## Notes

- Works with FormControl, FormGroup, and FormArray
- Uses `toSignal` with `control.statusChanges` observable
- Useful for conditional rendering based on control state
- Status changes trigger when value changes, validators run, or control is disabled/enabled

## Source

<<< @/../projects/angular-reactive-primitives/src/lib/composables/control/use-control-status/use-control-status.composable.ts
