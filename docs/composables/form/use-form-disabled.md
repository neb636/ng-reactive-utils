# useFormDisabled

Returns whether a FormGroup is disabled as a signal. The signal updates reactively whenever the form's disabled state changes.

## Usage

```typescript
import { useFormDisabled } from 'angular-reactive-primitives';

@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="email" />
      
      @if (isDisabled()) {
        <p class="info">Form is currently disabled</p>
      }
    </form>
    
    <button (click)="toggleForm()">
      {{ isDisabled() ? 'Enable' : 'Disable' }} Form
    </button>
  `
})
class EditableFormComponent {
  form = new FormGroup({
    email: new FormControl('')
  });
  
  isDisabled = useFormDisabled(this.form);
  
  toggleForm() {
    if (this.form.disabled) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }
}
```

## Parameters

| Parameter | Type        | Default    | Description                               |
| --------- | ----------- | ---------- | ----------------------------------------- |
| `form`    | `FormGroup` | _required_ | The FormGroup to check disabled state for |

## Returns

`Signal<boolean>` - A readonly signal containing the disabled state (true if disabled)

## Notes

- Uses `toSignal` with `form.statusChanges` observable
- Returns `true` when the form is disabled via `form.disable()`
- Returns `false` when the form is enabled
- A disabled form excludes its value from the parent form value

## Source

<<< @/../projects/angular-reactive-primitives/src/lib/composables/form/use-form-disabled/use-form-disabled.composable.ts
