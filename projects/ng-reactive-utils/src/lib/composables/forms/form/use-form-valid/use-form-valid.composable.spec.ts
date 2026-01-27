import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { useFormValid } from './use-form-valid.composable';

describe('useFormValid', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return true when form is valid', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl('John'),
      });
      isValid = useFormValid(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isValid()).toBe(true);
  });

  it('should return false when form is invalid', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl('', Validators.required),
      });
      isValid = useFormValid(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isValid()).toBe(false);
  });

  it('should update when validity changes', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        email: new FormControl('', Validators.required),
      });
      isValid = useFormValid(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isValid } = fixture.componentInstance;

    expect(isValid()).toBe(false);

    form.patchValue({ email: 'test@example.com' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isValid()).toBe(true);
  });

  it('should handle multiple validators', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
      });
      isValid = useFormValid(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isValid } = fixture.componentInstance;

    expect(isValid()).toBe(false);

    form.patchValue({ email: 'invalid' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isValid()).toBe(false);

    form.patchValue({ email: 'valid@example.com' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isValid()).toBe(true);
  });

  it('should handle form-level validators', async () => {
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
      isValid = useFormValid(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isValid } = fixture.componentInstance;

    form.patchValue({ password: 'abc', confirmPassword: 'xyz' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isValid()).toBe(false);

    form.patchValue({ password: 'abc', confirmPassword: 'abc' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isValid()).toBe(true);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isValid = useFormValid(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
