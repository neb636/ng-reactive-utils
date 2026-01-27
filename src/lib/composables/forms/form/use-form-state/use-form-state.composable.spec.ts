import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { useFormState } from './use-form-state.composable';

describe('useFormState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return all form state properties as signals', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      formState = useFormState<{ name: string }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { formState } = fixture.componentInstance;

    expect(formState.value()).toEqual({ name: '' });
    expect(formState.valid()).toBe(true);
    expect(formState.invalid()).toBe(false);
    expect(formState.pending()).toBe(false);
    expect(formState.disabled()).toBe(false);
    expect(formState.enabled()).toBe(true);
    expect(formState.dirty()).toBe(false);
    expect(formState.pristine()).toBe(true);
    expect(formState.touched()).toBe(false);
    expect(formState.untouched()).toBe(true);
    expect(formState.errors()).toBeNull();
    expect(formState.status()).toBe('VALID');
  });

  it('should update value signal when form value changes', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      formState = useFormState<{ name: string }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formState } = fixture.componentInstance;

    form.patchValue({ name: 'John' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formState.value()).toEqual({ name: 'John' });
  });

  it('should update valid/invalid signals when validation changes', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        email: new FormControl('', Validators.required),
      });
      formState = useFormState<{ email: string }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formState } = fixture.componentInstance;

    expect(formState.valid()).toBe(false);
    expect(formState.invalid()).toBe(true);

    form.patchValue({ email: 'test@example.com' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formState.valid()).toBe(true);
    expect(formState.invalid()).toBe(false);
  });

  it('should update disabled/enabled signals when form is disabled', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      formState = useFormState<{ name: string }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formState } = fixture.componentInstance;

    expect(formState.disabled()).toBe(false);
    expect(formState.enabled()).toBe(true);

    form.disable();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formState.disabled()).toBe(true);
    expect(formState.enabled()).toBe(false);
  });

  it('should update dirty/pristine signals when form is modified', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      formState = useFormState<{ name: string }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formState } = fixture.componentInstance;

    expect(formState.dirty()).toBe(false);
    expect(formState.pristine()).toBe(true);

    form.markAsDirty();
    form.patchValue({ name: 'test' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formState.dirty()).toBe(true);
    expect(formState.pristine()).toBe(false);
  });

  it('should update touched/untouched signals when form is touched', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      formState = useFormState<{ name: string }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formState } = fixture.componentInstance;

    expect(formState.touched()).toBe(false);
    expect(formState.untouched()).toBe(true);

    form.markAsTouched();
    form.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formState.touched()).toBe(true);
    expect(formState.untouched()).toBe(false);
  });

  it('should update errors signal when validation errors change', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup(
        {
          password: new FormControl(''),
          confirmPassword: new FormControl(''),
        },
        {
          validators: (group) => {
            const password = group.get('password')?.value;
            const confirmPassword = group.get('confirmPassword')?.value;
            return password === confirmPassword ? null : { passwordMismatch: true };
          },
        },
      );
      formState = useFormState<{
        password: string;
        confirmPassword: string;
      }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formState } = fixture.componentInstance;

    form.patchValue({ password: 'abc', confirmPassword: 'xyz' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formState.errors()).toEqual({ passwordMismatch: true });

    form.patchValue({ password: 'abc', confirmPassword: 'abc' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formState.errors()).toBeNull();
  });

  it('should update status signal correctly', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        email: new FormControl('', Validators.required),
      });
      formState = useFormState<{ email: string }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formState } = fixture.componentInstance;

    expect(formState.status()).toBe('INVALID');

    form.patchValue({ email: 'test@example.com' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formState.status()).toBe('VALID');

    form.disable();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formState.status()).toBe('DISABLED');
  });

  it('should handle complex form with multiple controls', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
      });
      formState = useFormState<{
        firstName: string;
        lastName: string;
        email: string;
      }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formState } = fixture.componentInstance;

    expect(formState.valid()).toBe(false);

    form.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formState.valid()).toBe(true);
    expect(formState.value()).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      formState = useFormState<{ name: string }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
