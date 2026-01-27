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

- Uses `toSignal` with `form.statusChanges` observable
- Returns `true` when no control has been blurred
- Returns `false` when any control has been interacted with
- Opposite of `useFormTouched`

## Source

<<< @/../src/lib/composables/forms/form/use-form-untouched/use-form-untouched.composable.ts
