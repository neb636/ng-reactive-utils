import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { useFormErrors } from './use-form-errors.composable';

describe('useFormErrors', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return null when form has no errors', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl('John'),
      });
      formErrors = useFormErrors(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.formErrors()).toBeNull();
  });

  it('should return errors when form has errors', () => {
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
          validators: () => ({ customError: true }),
        },
      );
      formErrors = useFormErrors(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.formErrors()).toEqual({ customError: true });
  });

  it('should update when errors change', async () => {
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
      formErrors = useFormErrors(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formErrors } = fixture.componentInstance;

    expect(formErrors()).toBeNull();

    form.patchValue({ password: 'abc', confirmPassword: 'xyz' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formErrors()).toEqual({ passwordMismatch: true });

    form.patchValue({ password: 'abc', confirmPassword: 'abc' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formErrors()).toBeNull();
  });

  it('should handle multiple form-level validators', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup(
        {
          min: new FormControl(0),
          max: new FormControl(0),
        },
        {
          validators: [
            (group) => {
              const min = group.get('min')?.value;
              const max = group.get('max')?.value;
              return min > max ? { minGreaterThanMax: true } : null;
            },
            (group) => {
              const min = group.get('min')?.value;
              return min < 0 ? { negativeMin: true } : null;
            },
          ],
        },
      );
      formErrors = useFormErrors(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formErrors } = fixture.componentInstance;

    form.patchValue({ min: 10, max: 5 });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formErrors()?.['minGreaterThanMax']).toBe(true);

    form.patchValue({ min: -1, max: 5 });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formErrors()?.['negativeMin']).toBe(true);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      formErrors = useFormErrors(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
