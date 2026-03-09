# useFormUntouched

Returns whether a FormGroup is untouched (has not been interacted with) as a signal. The signal updates reactively whenever the form's untouched state changes.

## Usage

```typescript
import { useFormUntouched } from 'ng-reactive-utils';

@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="email" />

      @if (isUntouched()) {
        <p class="hint">Click on the field to start</p>
      }
    </form>
  `,
})
class GuidedFormComponent {
  form = new FormGroup({
    email: new FormControl(''),
  });

  isUntouched = useFormUntouched(this.form);
}
```

## Parameters

| Parameter | Type        | Default    | Description                                |
| --------- | ----------- | ---------- | ------------------------------------------ |
| `form`    | `FormGroup` | _required_ | The FormGroup to check untouched state for |

## Returns

`Signal<boolean>` - A readonly signal containing the untouched state (true if not interacted with)

## Notes

- Merges `TouchedChangeEvent` events from the `FormGroup` **and all direct child controls** — this is necessary because Angular does not propagate `TouchedChangeEvent` from child controls up to the parent group
- Uses `control.events` (not `statusChanges`) to listen for touched-state changes; `statusChanges` does not emit on touch changes
- Returns the group-level `form.untouched` value on each event, so the signal reflects the overall untouched state of the form
- Only tracks **direct** child controls — grandchild controls inside nested `FormGroup` or `FormArray` children are not observed; use `useControlUntouched` on the nested group directly if needed
- Returns `false` once any direct child control loses focus or `markAsTouched()` is called
- Opposite of `useFormTouched`

## Source

<<< @/../src/lib/composables/forms/form/use-form-untouched/use-form-untouched.composable.ts
