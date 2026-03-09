import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  useControlDirty,
  useControlErrors,
  useControlPristine,
  useControlState,
  useControlStatus,
  useControlTouched,
  useControlUntouched,
  useControlValid,
  useControlValue,
  useFormDirty,
  useFormDisabled,
  useFormErrors,
  useFormPending,
  useFormPristine,
  useFormState,
  useFormStatus,
  useFormTouched,
  useFormUntouched,
  useFormValid,
  useFormValue,
} from 'ng-reactive-utils';

@Component({
  selector: 'app-forms-page',
  imports: [ReactiveFormsModule, JsonPipe],
  template: `
    <div class="page">
      <h1 class="page-title">Form & Control Composables</h1>

      <!-- The form itself -->
      <div class="card" style="margin-bottom: 16px" [formGroup]="form">
        <div class="card-title">Test Form</div>
        <div style="display: grid; gap: 10px">
          <div>
            <label style="font-size: 12px; color: #666; display: block; margin-bottom: 3px">
              Username (required, min 3 chars)
            </label>
            <input
              formControlName="username"
              placeholder="Enter username"
              style="width: 100%; padding: 6px 10px; border: 1px solid #d4d4d4; border-radius: 5px; font-size: 13px"
            />
          </div>
          <div>
            <label style="font-size: 12px; color: #666; display: block; margin-bottom: 3px">
              Email (required, valid email)
            </label>
            <input
              formControlName="email"
              placeholder="Enter email"
              style="width: 100%; padding: 6px 10px; border: 1px solid #d4d4d4; border-radius: 5px; font-size: 13px"
            />
          </div>
          <div>
            <label style="font-size: 12px; color: #666; display: block; margin-bottom: 3px">
              Age (required, min 18)
            </label>
            <input
              formControlName="age"
              type="number"
              placeholder="Enter age"
              style="width: 100%; padding: 6px 10px; border: 1px solid #d4d4d4; border-radius: 5px; font-size: 13px"
            />
          </div>
          <div class="btn-row">
            <button class="primary" (click)="form.markAllAsTouched()">Mark All Touched</button>
            <button (click)="form.reset()">Reset</button>
            <button (click)="toggleDisabled()">
              {{ formState.disabled() ? 'Enable' : 'Disable' }} Form
            </button>
          </div>
        </div>
      </div>

      <div class="demo-grid">

        <!-- useFormState (composite) -->
        <div class="card">
          <div class="card-title">useFormState(form)</div>
          <div class="card-desc">All form state signals bundled in one object.</div>
          <div class="value-row">
            <span class="value-label">value</span>
            <span class="value" style="font-size: 11px">{{ formState.value() | json }}</span>
          </div>
          <div class="value-row">
            <span class="value-label">status</span>
            <span class="value">{{ formState.status() }}</span>
          </div>
          <div class="value-row">
            <span class="value-label">valid</span>
            <span class="value" [class.truthy]="formState.valid()" [class.falsy]="!formState.valid()">
              {{ formState.valid() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">dirty</span>
            <span class="value" [class.truthy]="formState.dirty()" [class.falsy]="!formState.dirty()">
              {{ formState.dirty() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">touched</span>
            <span
              class="value"
              [class.truthy]="formState.touched()"
              [class.falsy]="!formState.touched()"
            >
              {{ formState.touched() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">disabled</span>
            <span
              class="value"
              [class.truthy]="formState.disabled()"
              [class.falsy]="!formState.disabled()"
            >
              {{ formState.disabled() }}
            </span>
          </div>
        </div>

        <!-- Individual form composables -->
        <div class="card">
          <div class="card-title">useForm*() — individual</div>
          <div class="card-desc">
            Each form state property available as its own composable.
          </div>
          <div class="value-row">
            <span class="value-label">useFormValue</span>
            <span class="value" style="font-size: 11px">{{ formValue() | json }}</span>
          </div>
          <div class="value-row">
            <span class="value-label">useFormStatus</span>
            <span class="value">{{ formStatus() }}</span>
          </div>
          <div class="value-row">
            <span class="value-label">useFormValid</span>
            <span class="value" [class.truthy]="formValid()" [class.falsy]="!formValid()">
              {{ formValid() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">useFormPending</span>
            <span class="value">{{ formPending() }}</span>
          </div>
          <div class="value-row">
            <span class="value-label">useFormDirty</span>
            <span class="value" [class.truthy]="formDirty()" [class.falsy]="!formDirty()">
              {{ formDirty() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">useFormPristine</span>
            <span class="value" [class.truthy]="formPristine()" [class.falsy]="!formPristine()">
              {{ formPristine() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">useFormTouched</span>
            <span class="value" [class.truthy]="formTouched()" [class.falsy]="!formTouched()">
              {{ formTouched() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">useFormUntouched</span>
            <span class="value" [class.truthy]="formUntouched()" [class.falsy]="!formUntouched()">
              {{ formUntouched() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">useFormDisabled</span>
            <span class="value" [class.truthy]="formDisabled()" [class.falsy]="!formDisabled()">
              {{ formDisabled() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">useFormErrors</span>
            <span class="value" style="font-size: 11px">{{ formErrors() | json }}</span>
          </div>
        </div>

        <!-- useControlState (composite) -->
        <div class="card">
          <div class="card-title">useControlState(control) — username</div>
          <div class="card-desc">All control state signals for the username FormControl.</div>
          <div class="value-row">
            <span class="value-label">value</span>
            <span class="value">{{ usernameState.value() || '—' }}</span>
          </div>
          <div class="value-row">
            <span class="value-label">status</span>
            <span class="value">{{ usernameState.status() }}</span>
          </div>
          <div class="value-row">
            <span class="value-label">valid</span>
            <span
              class="value"
              [class.truthy]="usernameState.valid()"
              [class.falsy]="!usernameState.valid()"
            >
              {{ usernameState.valid() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">dirty</span>
            <span
              class="value"
              [class.truthy]="usernameState.dirty()"
              [class.falsy]="!usernameState.dirty()"
            >
              {{ usernameState.dirty() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">touched</span>
            <span
              class="value"
              [class.truthy]="usernameState.touched()"
              [class.falsy]="!usernameState.touched()"
            >
              {{ usernameState.touched() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">errors</span>
            <span class="value" style="font-size: 11px">{{ usernameState.errors() | json }}</span>
          </div>
        </div>

        <!-- Individual control composables -->
        <div class="card">
          <div class="card-title">useControl*() — email control</div>
          <div class="card-desc">Each control state property as its own composable.</div>
          <div class="value-row">
            <span class="value-label">useControlValue</span>
            <span class="value">{{ emailValue() || '—' }}</span>
          </div>
          <div class="value-row">
            <span class="value-label">useControlStatus</span>
            <span class="value">{{ emailStatus() }}</span>
          </div>
          <div class="value-row">
            <span class="value-label">useControlValid</span>
            <span class="value" [class.truthy]="emailValid()" [class.falsy]="!emailValid()">
              {{ emailValid() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">useControlPristine</span>
            <span
              class="value"
              [class.truthy]="emailPristine()"
              [class.falsy]="!emailPristine()"
            >
              {{ emailPristine() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">useControlDirty</span>
            <span class="value" [class.truthy]="emailDirty()" [class.falsy]="!emailDirty()">
              {{ emailDirty() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">useControlTouched</span>
            <span
              class="value"
              [class.truthy]="emailTouched()"
              [class.falsy]="!emailTouched()"
            >
              {{ emailTouched() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">useControlUntouched</span>
            <span
              class="value"
              [class.truthy]="emailUntouched()"
              [class.falsy]="!emailUntouched()"
            >
              {{ emailUntouched() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">useControlErrors</span>
            <span class="value" style="font-size: 11px">{{ emailErrors() | json }}</span>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class FormsPage {
  form = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    age: new FormControl<number | null>(null, [Validators.required, Validators.min(18)]),
  });

  usernameControl = this.form.controls.username;
  emailControl = this.form.controls.email;

  // ── useFormState (composite) ─────────────────────────────────────────────
  formState = useFormState(this.form);

  // ── Individual form composables ──────────────────────────────────────────
  formValue = useFormValue(this.form);
  formStatus = useFormStatus(this.form);
  formValid = useFormValid(this.form);
  formPending = useFormPending(this.form);
  formDirty = useFormDirty(this.form);
  formPristine = useFormPristine(this.form);
  formTouched = useFormTouched(this.form);
  formUntouched = useFormUntouched(this.form);
  formDisabled = useFormDisabled(this.form);
  formErrors = useFormErrors(this.form);

  // ── useControlState (composite) for username ─────────────────────────────
  usernameState = useControlState(this.usernameControl);

  // ── Individual control composables for email ─────────────────────────────
  emailValue = useControlValue(this.emailControl);
  emailStatus = useControlStatus(this.emailControl);
  emailValid = useControlValid(this.emailControl);
  emailPristine = useControlPristine(this.emailControl);
  emailDirty = useControlDirty(this.emailControl);
  emailTouched = useControlTouched(this.emailControl);
  emailUntouched = useControlUntouched(this.emailControl);
  emailErrors = useControlErrors(this.emailControl);

  toggleDisabled() {
    if (this.form.disabled) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }
}
