# useFormDirty

Returns whether a FormGroup is dirty (has been modified) as a signal. The signal updates reactively whenever the form's dirty state changes.

## Usage

```typescript
import { useFormDirty } from 'ng-reactive-utils';

@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="title" />
      <textarea formControlName="content"></textarea>
      
      @if (isDirty()) {
        <div class="unsaved-warning">
          You have unsaved changes
          <button (click)="resetForm()">Discard</button>
        </div>
      }
      
      <button [disabled]="!isDirty()">Save Changes</button>
    </form>
  `
})
class EditorComponent {
  form = new FormGroup({
    title: new FormControl(''),
    content: new FormControl('')
  });
  
  isDirty = useFormDirty(this.form);
  
  resetForm() {
    this.form.reset();
  }
  
  // Use with canDeactivate guard
  canDeactivate(): boolean {
    return !this.isDirty() || confirm('Discard unsaved changes?');
  }
}
```

## Parameters

| Parameter | Type        | Default    | Description                            |
| --------- | ----------- | ---------- | -------------------------------------- |
| `form`    | `FormGroup` | _required_ | The FormGroup to check dirty state for |

## Returns

`Signal<boolean>` - A readonly signal containing the dirty state (true if modified)

## Notes

- Uses `toSignal` with `form.valueChanges` observable
- Returns `true` when any control value has been changed by the user
- Returns `false` when form is pristine (unchanged)
- Useful for "unsaved changes" warnings and save button states

## Source

<<< @/../projects/ng-reactive-utils/src/lib/composables/forms/form/use-form-dirty/use-form-dirty.composable.ts
