# useFormPristine

Returns whether a FormGroup is pristine (has not been modified) as a signal. The signal updates reactively whenever the form's pristine state changes.

## Usage

```typescript
import { useFormPristine } from 'angular-reactive-primitives';

@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="name" />
      
      @if (isPristine()) {
        <p class="hint">Start typing to make changes</p>
      } @else {
        <p class="info">Form has been modified</p>
      }
    </form>
  `
})
class SimpleFormComponent {
  form = new FormGroup({
    name: new FormControl('')
  });
  
  isPristine = useFormPristine(this.form);
}
```

## Parameters

| Parameter | Type        | Default    | Description                               |
| --------- | ----------- | ---------- | ----------------------------------------- |
| `form`    | `FormGroup` | _required_ | The FormGroup to check pristine state for |

## Returns

`Signal<boolean>` - A readonly signal containing the pristine state (true if not modified)

## Notes

- Uses `toSignal` with `form.valueChanges` observable
- Returns `true` when no control has been modified
- Returns `false` when any control value has been changed
- Opposite of `useFormDirty`

## Source

<<< @/../projects/angular-reactive-primitives/src/lib/composables/forms/form/use-form-pristine/use-form-pristine.composable.ts
