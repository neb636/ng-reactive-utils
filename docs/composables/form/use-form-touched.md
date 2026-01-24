# useFormTouched

Returns whether a FormGroup has been touched (interacted with) as a signal. The signal updates reactively whenever the form's touched state changes.

## Usage

```typescript
import { useFormTouched } from 'angular-reactive-primitives';

@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="email" (blur)="onBlur()" />
      
      @if (isTouched() && form.get('email')?.invalid) {
        <span class="error">Please enter a valid email</span>
      }
    </form>
  `
})
class ContactFormComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
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

- Uses `toSignal` with `form.statusChanges` observable
- Returns `true` when any control has been blurred
- Useful for showing validation errors only after user interaction
- Form is touched when `markAsTouched()` is called or control loses focus

## Source

<<< @/../projects/angular-reactive-primitives/src/lib/composables/form/use-form-touched/use-form-touched.composable.ts
