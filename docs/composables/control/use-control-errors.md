# useControlErrors

Returns the validation errors of an AbstractControl as a signal. The signal updates reactively whenever the control's validation errors change. Works with FormControl, FormGroup, and FormArray.

## Usage

```typescript
import { useControlErrors } from 'angular-reactive-primitives';

@Component({
  template: `
    <input [formControl]="emailControl" placeholder="Email" />
    
    @if (errors()?.['required']) {
      <span class="error">Email is required</span>
    }
    
    @if (errors()?.['email']) {
      <span class="error">Please enter a valid email address</span>
    }
    
    @if (errors()?.['minlength']) {
      <span class="error">
        Email must be at least {{ errors()?.['minlength'].requiredLength }} characters
      </span>
    }
  `
})
class EmailFieldComponent {
  emailControl = new FormControl('', [
    Validators.required, 
    Validators.email,
    Validators.minLength(5)
  ]);
  
  errors = useControlErrors(this.emailControl);
}
```

## Advanced Usage

```typescript
import { useControlErrors } from 'angular-reactive-primitives';

@Component({
  template: `
    <input [formControl]="passwordControl" type="password" />
    
    <ul class="validation-list">
      @for (error of errorMessages(); track error) {
        <li class="error">{{ error }}</li>
      }
    </ul>
  `
})
class PasswordFieldComponent {
  passwordControl = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(/[A-Z]/),
    Validators.pattern(/[0-9]/)
  ]);
  
  errors = useControlErrors(this.passwordControl);
  
  errorMessages = computed(() => {
    const errors = this.errors();
    if (!errors) return [];
    
    const messages: string[] = [];
    if (errors['required']) messages.push('Password is required');
    if (errors['minlength']) messages.push('Must be at least 8 characters');
    if (errors['pattern']) messages.push('Must contain uppercase and numbers');
    return messages;
  });
}
```

## Parameters

| Parameter | Type              | Default    | Description                         |
| --------- | ----------------- | ---------- | ----------------------------------- |
| `control` | `AbstractControl` | _required_ | The control to get errors from      |

## Returns

`Signal<ValidationErrors | null>` - A readonly signal containing the validation errors or null if no errors

## Common Error Types

| Error       | Description                          |
| ----------- | ------------------------------------ |
| `required`  | Value is empty                       |
| `email`     | Value is not a valid email           |
| `minlength` | Value is shorter than required       |
| `maxlength` | Value is longer than allowed         |
| `pattern`   | Value doesn't match the pattern      |
| `min`       | Numeric value is below minimum       |
| `max`       | Numeric value is above maximum       |

## Notes

- Works with FormControl, FormGroup, and FormArray
- Uses `toSignal` with `control.statusChanges` observable
- Returns `null` when the control has no validation errors
- Error object keys correspond to validator names

## Source

<<< @/../projects/angular-reactive-primitives/src/lib/composables/forms/control/use-control-errors/use-control-errors.composable.ts
