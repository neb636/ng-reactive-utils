# useControlValue

Returns the current value of an AbstractControl as a signal. The signal updates reactively whenever the control value changes. Works with FormControl, FormGroup, and FormArray.

## Usage

```typescript
import { useControlValue } from 'angular-reactive-primitives';

@Component({
  template: `
    <input [formControl]="nameControl" placeholder="Enter your name" />
    <p>Hello, {{ name() }}!</p>
  `
})
class GreetingComponent {
  nameControl = new FormControl('');
  name = useControlValue<string>(this.nameControl);
  
  // Use in computed signals
  greeting = computed(() => 
    this.name() ? `Welcome, ${this.name()}!` : 'Please enter your name'
  );
}
```

## Advanced Usage

```typescript
import { useControlValue } from 'angular-reactive-primitives';

@Component({
  template: `
    <select [formControl]="categoryControl">
      <option value="">Select category</option>
      <option value="electronics">Electronics</option>
      <option value="clothing">Clothing</option>
    </select>
  `
})
class ProductFilterComponent {
  categoryControl = new FormControl<string | null>(null);
  category = useControlValue<string | null>(this.categoryControl);
  
  // Use with resource for reactive data fetching
  products = resource({
    params: () => ({ category: this.category() }),
    loader: ({ params }) => this.productService.getByCategory(params.category)
  });
}
```

## Parameters

| Parameter | Type              | Default    | Description                            |
| --------- | ----------------- | ---------- | -------------------------------------- |
| `control` | `AbstractControl` | _required_ | The control to get the value from      |

## Returns

`Signal<T>` - A readonly signal containing the current control value

## Notes

- Works with FormControl, FormGroup, and FormArray
- Uses `toSignal` with `control.valueChanges` observable
- Type parameter `T` should match your control's value type
- Updates reactively on every value change (setValue, patchValue, reset)

## Source

<<< @/../projects/angular-reactive-primitives/src/lib/composables/control/use-control-value/use-control-value.composable.ts
