# useControlPristine

Returns whether an AbstractControl is pristine (has not been modified) as a signal. The signal updates reactively whenever the control's pristine state changes. Works with FormControl, FormGroup, and FormArray.

## Usage

```typescript
import { useControlPristine } from 'ng-reactive-utils';

@Component({
  template: `
    <input [formControl]="nameControl" />
    
    @if (isPristine()) {
      <span class="hint">Start typing to edit</span>
    }
  `
})
class EditableFieldComponent {
  nameControl = new FormControl('');
  isPristine = useControlPristine(this.nameControl);
}
```

## Advanced Usage

```typescript
import { useControlPristine } from 'ng-reactive-utils';

@Component({
  template: `
    <input [formControl]="searchControl" placeholder="Search..." />
    
    @if (isPristine()) {
      <div class="suggestions">
        <h4>Popular searches</h4>
        <ul>
          <li>Angular signals</li>
          <li>Reactive forms</li>
        </ul>
      </div>
    } @else {
      <div class="results">
        <!-- Show search results -->
      </div>
    }
  `
})
class SearchComponent {
  searchControl = new FormControl('');
  isPristine = useControlPristine(this.searchControl);
}
```

## Parameters

| Parameter | Type              | Default    | Description                               |
| --------- | ----------------- | ---------- | ----------------------------------------- |
| `control` | `AbstractControl` | _required_ | The control to check pristine state for   |

## Returns

`Signal<boolean>` - A readonly signal containing the pristine state (true if not modified)

## Notes

- Works with FormControl, FormGroup, and FormArray
- Uses `toSignal` with `control.valueChanges` observable
- Returns `true` when the control value has not been changed
- Returns `false` when the control is dirty (has been modified)
- Opposite of `useControlDirty`

## Source

<<< @/../projects/ng-reactive-utils/src/lib/composables/forms/control/use-control-pristine/use-control-pristine.composable.ts
