# useFormValue

Returns the current value of a FormGroup as a signal. The signal updates reactively whenever the form value changes.

## Usage

```typescript
import { useFormValue } from 'ng-reactive-utils';

@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="firstName" />
      <input formControlName="lastName" />
    </form>

    <p>Hello, {{ formValue().firstName }} {{ formValue().lastName }}!</p>
    <pre>{{ formValue() | json }}</pre>
  `,
})
class GreetingComponent {
  form = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
  });

  formValue = useFormValue<{ firstName: string; lastName: string }>(this.form);

  // Use in computed signals
  fullName = computed(() => `${this.formValue().firstName} ${this.formValue().lastName}`.trim());
}
```

## Parameters

| Parameter | Type        | Default    | Description                         |
| --------- | ----------- | ---------- | ----------------------------------- |
| `form`    | `FormGroup` | _required_ | The FormGroup to get the value from |

## Returns

`Signal<T>` - A readonly signal containing the current form value

## Notes

- Uses `toSignal` with `form.valueChanges` observable
- Type parameter `T` should match your form's value structure
- Updates reactively on every value change (patchValue, setValue, reset)
- Can be used in computed signals for derived state

## Source

<<< @/../src/lib/composables/forms/form/use-form-value/use-form-value.composable.ts
