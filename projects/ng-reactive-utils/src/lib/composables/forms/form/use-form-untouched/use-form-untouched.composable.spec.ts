import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { useFormUntouched } from './use-form-untouched.composable';

describe('useFormUntouched', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return true when form is untouched', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isUntouched = useFormUntouched(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isUntouched()).toBe(true);
  });

  it('should return false when form is touched', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isUntouched = useFormUntouched(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isUntouched } = fixture.componentInstance;
    form.markAsTouched();
    form.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isUntouched()).toBe(false);
  });

  it('should update when form is touched', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isUntouched = useFormUntouched(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isUntouched } = fixture.componentInstance;

    expect(isUntouched()).toBe(true);

    form.markAsTouched();
    form.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isUntouched()).toBe(false);
  });

  it('should update when form is marked untouched', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isUntouched = useFormUntouched(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isUntouched } = fixture.componentInstance;

    // First touch the form
    form.markAsTouched();
    form.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isUntouched()).toBe(false);

    // Then mark untouched
    form.markAsUntouched();
    form.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isUntouched()).toBe(true);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isUntouched = useFormUntouched(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
