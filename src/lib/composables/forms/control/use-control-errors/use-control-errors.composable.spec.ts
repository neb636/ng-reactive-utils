import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { useControlErrors } from './use-control-errors.composable';

describe('useControlErrors', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return null when control has no errors', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('John');
      errors = useControlErrors(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.errors()).toBeNull();
  });

  it('should return required error when control is empty and required', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('', Validators.required);
      errors = useControlErrors(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.errors()).toEqual({ required: true });
  });

  it('should update when errors change', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('', [Validators.required, Validators.email]);
      errors = useControlErrors(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, errors } = fixture.componentInstance;

    expect(errors()?.['required']).toBe(true);

    control.setValue('invalid');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(errors()?.['email']).toBeTruthy();

    control.setValue('valid@example.com');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(errors()).toBeNull();
  });

  it('should handle minLength error', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('', Validators.minLength(5));
      errors = useControlErrors(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, errors } = fixture.componentInstance;

    control.setValue('abc');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(errors()?.['minlength']).toBeTruthy();
    expect(errors()?.['minlength'].requiredLength).toBe(5);
    expect(errors()?.['minlength'].actualLength).toBe(3);

    control.setValue('abcdef');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(errors()).toBeNull();
  });

  it('should handle maxLength error', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('', Validators.maxLength(5));
      errors = useControlErrors(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, errors } = fixture.componentInstance;

    control.setValue('abcdefgh');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(errors()?.['maxlength']).toBeTruthy();
    expect(errors()?.['maxlength'].requiredLength).toBe(5);
    expect(errors()?.['maxlength'].actualLength).toBe(8);
  });

  it('should handle pattern error', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('', Validators.pattern(/^[a-z]+$/));
      errors = useControlErrors(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, errors } = fixture.componentInstance;

    control.setValue('ABC123');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(errors()?.['pattern']).toBeTruthy();

    control.setValue('abc');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(errors()).toBeNull();
  });

  it('should handle multiple errors', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('', [Validators.required, Validators.minLength(3)]);
      errors = useControlErrors(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, errors } = fixture.componentInstance;

    expect(errors()?.['required']).toBe(true);

    control.setValue('ab');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(errors()?.['minlength']).toBeTruthy();
    expect(errors()?.['required']).toBeUndefined();
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      errors = useControlErrors(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
