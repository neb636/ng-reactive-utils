import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of, delay } from 'rxjs';
import { useControlPending } from './use-control-pending.composable';

function asyncValidator(
  control: AbstractControl,
): Observable<ValidationErrors | null> {
  return of(null).pipe(delay(100));
}

describe('useControlPending', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return false when control has no async validators', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isPending = useControlPending(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isPending()).toBe(false);
  });

  it('should return true when async validator is running', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('', [], [asyncValidator]);
      isPending = useControlPending(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isPending } = fixture.componentInstance;

    // Trigger async validation
    control.setValue('test');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isPending()).toBe(true);

    // Wait for async validator to complete
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(isPending()).toBe(false);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isPending = useControlPending(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
