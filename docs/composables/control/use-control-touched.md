# useControlTouched

Returns whether an AbstractControl has been touched (interacted with) as a signal. The signal updates reactively whenever the control's touched state changes. Works with FormControl, FormGroup, and FormArray.

## Usage

```typescript
import { useControlTouched } from 'ng-reactive-utils';

@Component({
  template: `
    <input [formControl]="emailControl" placeholder="Email" />

    @if (isTouched() && emailControl.invalid) {
      <span class="error">Please enter a valid email</span>
    }
  `,
})
class EmailInputComponent {
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  isTouched = useControlTouched(this.emailControl);
}
```

## Parameters

| Parameter | Type              | Default    | Description                            |
| --------- | ----------------- | ---------- | -------------------------------------- |
| `control` | `AbstractControl` | _required_ | The control to check touched state for |

## Returns

`Signal<boolean>` - A readonly signal containing the touched state (true if interacted with)

## Notes

- Works with FormControl, FormGroup, and FormArray
- Uses `toSignal` with `control.statusChanges` observable
- Returns `true` when the control has been blurred (lost focus)
- Useful for showing validation errors only after user interaction
- Control is touched when `markAsTouched()` is called or control loses focus

## Source

<<< @/../projects/ng-reactive-utils/src/lib/composables/forms/control/use-control-touched/use-control-touched.composable.ts
