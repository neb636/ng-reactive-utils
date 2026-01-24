import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of, delay } from 'rxjs';
import { useFormStatus } from './use-form-status.composable';

describe('useFormStatus', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return VALID when form is valid', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl('John'),
      });
      formStatus = useFormStatus(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.formStatus()).toBe('VALID');
  });

  it('should return INVALID when form is invalid', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl('', Validators.required),
      });
      formStatus = useFormStatus(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.formStatus()).toBe('INVALID');
  });

  it('should return DISABLED when form is disabled', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      formStatus = useFormStatus(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formStatus } = fixture.componentInstance;

    form.disable();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formStatus()).toBe('DISABLED');
  });

  it('should return PENDING when async validator is running', async () => {
    const asyncValidator: AsyncValidatorFn = (
      control: AbstractControl,
    ): Observable<ValidationErrors | null> => {
      return of(null).pipe(delay(100));
    };

    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        username: new FormControl('', [], [asyncValidator]),
      });
      formStatus = useFormStatus(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formStatus } = fixture.componentInstance;

    form.patchValue({ username: 'test' });

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(formStatus()).toBe('PENDING');

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(formStatus()).toBe('VALID');
  });

  it('should update when status changes', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        email: new FormControl('', Validators.required),
      });
      formStatus = useFormStatus(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formStatus } = fixture.componentInstance;

    expect(formStatus()).toBe('INVALID');

    form.patchValue({ email: 'test@example.com' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formStatus()).toBe('VALID');

    form.disable();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formStatus()).toBe('DISABLED');

    form.enable();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formStatus()).toBe('VALID');
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      formStatus = useFormStatus(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
