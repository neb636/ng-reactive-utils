import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { useFormDisabled } from './use-form-disabled.composable';

describe('useFormDisabled', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return false when form is enabled', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isDisabled = useFormDisabled(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isDisabled()).toBe(false);
  });

  it('should return true when form is disabled', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl({ value: '', disabled: true }),
      });
      isDisabled = useFormDisabled(this.form);

      constructor() {
        this.form.disable();
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isDisabled()).toBe(true);
  });

  it('should update when form is disabled/enabled', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isDisabled = useFormDisabled(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isDisabled } = fixture.componentInstance;

    expect(isDisabled()).toBe(false);

    form.disable();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isDisabled()).toBe(true);

    form.enable();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isDisabled()).toBe(false);
  });

  it('should handle form with multiple controls', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        firstName: new FormControl(''),
        lastName: new FormControl(''),
      });
      isDisabled = useFormDisabled(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isDisabled } = fixture.componentInstance;

    form.disable();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isDisabled()).toBe(true);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isDisabled = useFormDisabled(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
