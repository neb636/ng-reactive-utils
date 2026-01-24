# useControlValid

Returns whether an AbstractControl is valid as a signal. The signal updates reactively whenever the control's validity changes. Works with FormControl, FormGroup, and FormArray.

## Usage

```typescript
import { useControlValid } from 'angular-reactive-primitives';

@Component({
  template: `
    <input [formControl]="emailControl" placeholder="Email" />
    
    @if (!isValid()) {
      <span class="error">Email is invalid</span>
    }
    
    <button [disabled]="!isValid()">Continue</button>
  `
})
class EmailStepComponent {
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  isValid = useControlValid(this.emailControl);
}
```

## Parameters

| Parameter | Type              | Default    | Description                             |
| --------- | ----------------- | ---------- | --------------------------------------- |
| `control` | `AbstractControl` | _required_ | The control to check validity for       |

## Returns

`Signal<boolean>` - A readonly signal containing the validity state (true if valid)

## Notes

- Works with FormControl, FormGroup, and FormArray
- Uses `toSignal` with `control.statusChanges` observable
- Returns `true` when the control passes all validation
- Returns `false` when the control has validation errors

## Source

<<< @/../projects/angular-reactive-primitives/src/lib/composables/control/use-control-valid/use-control-valid.composable.ts
