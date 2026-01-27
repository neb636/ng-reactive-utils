# useFormStatus

Returns the validation status of a FormGroup as a signal. The signal updates reactively whenever the form's status changes.

## Usage

```typescript
import { useFormStatus } from 'ng-reactive-utils';

@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="email" />

      <div [class]="'status-' + formStatus().toLowerCase()">Status: {{ formStatus() }}</div>

      @switch (formStatus()) {
        @case ('VALID') {
          <button type="submit">Submit</button>
        }
        @case ('INVALID') {
          <p class="error">Please fix the errors above</p>
        }
        @case ('PENDING') {
          <p class="loading">Validating...</p>
        }
        @case ('DISABLED') {
          <p class="info">Form is disabled</p>
        }
      }
    </form>
  `,
  styles: `
    .status-valid {
      color: green;
    }
    .status-invalid {
      color: red;
    }
    .status-pending {
      color: orange;
    }
    .status-disabled {
      color: gray;
    }
  `,
})
class StatusFormComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  formStatus = useFormStatus(this.form);
}
```

## Parameters

| Parameter | Type        | Default    | Description                      |
| --------- | ----------- | ---------- | -------------------------------- |
| `form`    | `FormGroup` | _required_ | The FormGroup to get status from |

## Returns

`Signal<FormControlStatus>` - A readonly signal containing the form status

## Status Values

| Status     | Description                                       |
| ---------- | ------------------------------------------------- |
| `VALID`    | All controls pass validation                      |
| `INVALID`  | At least one control has validation errors        |
| `PENDING`  | At least one control has pending async validators |
| `DISABLED` | The form is disabled                              |

## Notes

- Uses `toSignal` with `form.statusChanges` observable
- Status is determined by the combined status of all controls
- Useful for conditional rendering based on form state

## Source

<<< @/../projects/ng-reactive-utils/src/lib/composables/forms/form/use-form-status/use-form-status.composable.ts
