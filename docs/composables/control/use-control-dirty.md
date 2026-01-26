# useControlDirty

Returns whether an AbstractControl is dirty (has been modified) as a signal. The signal updates reactively whenever the control's dirty state changes. Works with FormControl, FormGroup, and FormArray.

## Usage

```typescript
import { useControlDirty } from 'ng-reactive-utils';

@Component({
  template: `
    <input [formControl]="nameControl" />
    
    @if (isDirty()) {
      <span class="modified-indicator">*</span>
    }
  `
})
class EditableFieldComponent {
  nameControl = new FormControl('');
  isDirty = useControlDirty(this.nameControl);
}
```

## Advanced Usage

```typescript
import { useControlDirty } from 'ng-reactive-utils';

@Component({
  template: `
    <input [formControl]="titleControl" />
    <textarea [formControl]="contentControl"></textarea>
    
    @if (hasChanges()) {
      <button (click)="save()">Save Changes</button>
      <button (click)="revert()">Discard</button>
    }
  `
})
class DocumentEditorComponent {
  titleControl = new FormControl('');
  contentControl = new FormControl('');
  
  titleDirty = useControlDirty(this.titleControl);
  contentDirty = useControlDirty(this.contentControl);
  
  hasChanges = computed(() => this.titleDirty() || this.contentDirty());
}
```

## Parameters

| Parameter | Type              | Default    | Description                              |
| --------- | ----------------- | ---------- | ---------------------------------------- |
| `control` | `AbstractControl` | _required_ | The control to check dirty state for     |

## Returns

`Signal<boolean>` - A readonly signal containing the dirty state (true if modified)

## Notes

- Works with FormControl, FormGroup, and FormArray
- Uses `toSignal` with `control.valueChanges` observable
- Returns `true` when the control value has been changed
- Returns `false` when the control is pristine (unchanged)
- Useful for tracking unsaved changes

## Source

<<< @/../projects/ng-reactive-utils/src/lib/composables/forms/control/use-control-dirty/use-control-dirty.composable.ts
