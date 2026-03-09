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
- Uses `control.events` (Angular's unified event stream) filtered to `TouchedChangeEvent` — not `statusChanges`, which does not emit on touched-state changes
- Returns `true` when `markAsTouched()` is called or the control loses focus (blur)
- Useful for showing validation errors only after user interaction

## Source

<<< @/../src/lib/composables/forms/control/use-control-touched/use-control-touched.composable.ts
