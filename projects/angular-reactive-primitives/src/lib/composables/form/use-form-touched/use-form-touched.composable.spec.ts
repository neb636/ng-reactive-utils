import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { useFormTouched } from './use-form-touched.composable';

describe('useFormTouched', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return false when form is untouched', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isTouched = useFormTouched(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isTouched()).toBe(false);
  });

  it('should return true when form is touched', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isTouched = useFormTouched(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isTouched } = fixture.componentInstance;
    form.markAsTouched();
    form.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isTouched()).toBe(true);
  });

  it('should update when form is touched', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isTouched = useFormTouched(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isTouched } = fixture.componentInstance;

    expect(isTouched()).toBe(false);

    form.markAsTouched();
    form.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isTouched()).toBe(true);
  });

  it('should update when form is marked untouched', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isTouched = useFormTouched(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isTouched } = fixture.componentInstance;

    // First touch the form
    form.markAsTouched();
    form.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isTouched()).toBe(true);

    // Then mark untouched
    form.markAsUntouched();
    form.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isTouched()).toBe(false);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isTouched = useFormTouched(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
