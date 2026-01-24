import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { useFormValue } from './use-form-value.composable';

describe('useFormValue', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return initial form value', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl('John'),
      });
      formValue = useFormValue<{ name: string }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.formValue()).toEqual({ name: 'John' });
  });

  it('should update when form value changes', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      formValue = useFormValue<{ name: string }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formValue } = fixture.componentInstance;

    expect(formValue()).toEqual({ name: '' });

    form.patchValue({ name: 'Jane' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formValue()).toEqual({ name: 'Jane' });
  });

  it('should handle complex form values', async () => {
    interface UserForm {
      personal: {
        firstName: string;
        lastName: string;
      };
      contact: {
        email: string;
        phone: string;
      };
    }

    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        personal: new FormGroup({
          firstName: new FormControl(''),
          lastName: new FormControl(''),
        }),
        contact: new FormGroup({
          email: new FormControl(''),
          phone: new FormControl(''),
        }),
      });
      formValue = useFormValue<UserForm>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formValue } = fixture.componentInstance;

    form.patchValue({
      personal: { firstName: 'John', lastName: 'Doe' },
      contact: { email: 'john@example.com', phone: '555-0123' },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formValue()).toEqual({
      personal: { firstName: 'John', lastName: 'Doe' },
      contact: { email: 'john@example.com', phone: '555-0123' },
    });
  });

  it('should handle multiple rapid value changes', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        count: new FormControl(0),
      });
      formValue = useFormValue<{ count: number }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formValue } = fixture.componentInstance;

    for (let i = 1; i <= 10; i++) {
      form.patchValue({ count: i });
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(formValue()).toEqual({ count: 10 });
  });

  it('should work with setValue', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
        age: new FormControl(0),
      });
      formValue = useFormValue<{ name: string; age: number }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formValue } = fixture.componentInstance;

    form.setValue({ name: 'Bob', age: 25 });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formValue()).toEqual({ name: 'Bob', age: 25 });
  });

  it('should handle reset', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl('initial'),
      });
      formValue = useFormValue<{ name: string }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, formValue } = fixture.componentInstance;

    form.patchValue({ name: 'changed' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formValue()).toEqual({ name: 'changed' });

    form.reset({ name: 'reset' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(formValue()).toEqual({ name: 'reset' });
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      formValue = useFormValue<{ name: string }>(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
