import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of, delay } from 'rxjs';
import { useFormPending } from './use-form-pending.composable';

describe('useFormPending', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return false when no async validators', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isPending = useFormPending(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isPending()).toBe(false);
  });

  it('should return true when async validator is pending', async () => {
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
      isPending = useFormPending(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isPending } = fixture.componentInstance;

    form.patchValue({ username: 'test' });

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(isPending()).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(isPending()).toBe(false);
  });

  it('should update when pending state changes', async () => {
    const asyncValidator: AsyncValidatorFn = (
      control: AbstractControl,
    ): Observable<ValidationErrors | null> => {
      return of(null).pipe(delay(50));
    };

    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        email: new FormControl('', [], [asyncValidator]),
      });
      isPending = useFormPending(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isPending } = fixture.componentInstance;

    expect(isPending()).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(isPending()).toBe(false);

    form.patchValue({ email: 'new@example.com' });

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(isPending()).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(isPending()).toBe(false);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isPending = useFormPending(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
