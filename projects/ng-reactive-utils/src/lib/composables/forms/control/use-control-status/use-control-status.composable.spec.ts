import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import {
  FormControl,
  Validators,
  ReactiveFormsModule,
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of, delay } from 'rxjs';
import { useControlStatus } from './use-control-status.composable';

describe('useControlStatus', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return VALID when control is valid', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('John');
      status = useControlStatus(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.status()).toBe('VALID');
  });

  it('should return INVALID when control is invalid', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('', Validators.required);
      status = useControlStatus(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.status()).toBe('INVALID');
  });

  it('should return DISABLED when control is disabled', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      status = useControlStatus(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, status } = fixture.componentInstance;

    control.disable();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(status()).toBe('DISABLED');
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
      control = new FormControl('', [], [asyncValidator]);
      status = useControlStatus(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, status } = fixture.componentInstance;

    control.setValue('test');

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(status()).toBe('PENDING');

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(status()).toBe('VALID');
  });

  it('should update when status changes', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('', Validators.required);
      status = useControlStatus(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, status } = fixture.componentInstance;

    expect(status()).toBe('INVALID');

    control.setValue('test');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(status()).toBe('VALID');

    control.disable();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(status()).toBe('DISABLED');

    control.enable();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(status()).toBe('VALID');
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      status = useControlStatus(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
