# useFormTouched

Returns whether a FormGroup has been touched (interacted with) as a signal. The signal updates reactively whenever the form's touched state changes.

## Usage

```typescript
import { useFormTouched } from 'ng-reactive-utils';

@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="email" (blur)="onBlur()" />

      @if (isTouched() && form.get('email')?.invalid) {
        <span class="error">Please enter a valid email</span>
      }
    </form>
  `,
})
class ContactFormComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  isTouched = useFormTouched(this.form);

  onBlur() {
    // Form will be marked as touched automatically on blur
  }
}
```

## Parameters

| Parameter | Type        | Default    | Description                              |
| --------- | ----------- | ---------- | ---------------------------------------- |
| `form`    | `FormGroup` | _required_ | The FormGroup to check touched state for |

## Returns

`Signal<boolean>` - A readonly signal containing the touched state (true if interacted with)

## Notes

- Merges `TouchedChangeEvent` events from the `FormGroup` **and all direct child controls** — this is necessary because Angular does not propagate `TouchedChangeEvent` from child controls up to the parent group
- Uses `control.events` (not `statusChanges`) to listen for touched-state changes; `statusChanges` does not emit on touch changes
- Returns the group-level `form.touched` value on each event, so the signal reflects the overall touched state of the form
- Only tracks **direct** child controls — grandchild controls inside nested `FormGroup` or `FormArray` children are not observed; use `useControlTouched` on the nested group directly if needed
- Returns `true` when `markAsTouched()` is called on the form or any direct child loses focus

## Source

<<< @/../src/lib/composables/forms/form/use-form-touched/use-form-touched.composable.ts
