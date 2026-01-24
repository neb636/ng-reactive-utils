# useControlDisabled

Returns whether an AbstractControl is disabled as a signal. The signal updates reactively whenever the control's disabled state changes. Works with FormControl, FormGroup, and FormArray.

## Usage

```typescript
import { useControlDisabled } from 'angular-reactive-primitives';

@Component({
  template: `
    <input [formControl]="emailControl" />
    
    @if (isDisabled()) {
      <span class="info">This field is currently disabled</span>
    }
    
    <button (click)="toggleDisabled()">
      {{ isDisabled() ? 'Enable' : 'Disable' }}
    </button>
  `
})
class ToggleableInputComponent {
  emailControl = new FormControl('');
  isDisabled = useControlDisabled(this.emailControl);
  
  toggleDisabled() {
    if (this.emailControl.disabled) {
      this.emailControl.enable();
    } else {
      this.emailControl.disable();
    }
  }
}
```

## Advanced Usage

```typescript
import { useControlDisabled } from 'angular-reactive-primitives';

@Component({
  template: `
    <input [formControl]="primaryEmail" placeholder="Primary Email" />
    <input [formControl]="backupEmail" placeholder="Backup Email" />
    
    @if (backupDisabled()) {
      <p class="hint">Enter primary email first</p>
    }
  `
})
class EmailFormComponent {
  primaryEmail = new FormControl('', Validators.required);
  backupEmail = new FormControl({ value: '', disabled: true });
  
  primaryValue = useControlValue<string>(this.primaryEmail);
  backupDisabled = useControlDisabled(this.backupEmail);
  
  constructor() {
    // Enable backup email when primary is filled
    effect(() => {
      if (this.primaryValue()) {
        this.backupEmail.enable();
      } else {
        this.backupEmail.disable();
      }
    });
  }
}
```

## Parameters

| Parameter | Type              | Default    | Description                                 |
| --------- | ----------------- | ---------- | ------------------------------------------- |
| `control` | `AbstractControl` | _required_ | The control to check disabled state for     |

## Returns

`Signal<boolean>` - A readonly signal containing the disabled state (true if disabled)

## Notes

- Works with FormControl, FormGroup, and FormArray
- Uses `toSignal` with `control.statusChanges` observable
- Returns `true` when the control is disabled
- Disabled controls are excluded from the form's value
- Disabled controls skip validation

## Source

<<< @/../projects/angular-reactive-primitives/src/lib/composables/forms/control/use-control-disabled/use-control-disabled.composable.ts
