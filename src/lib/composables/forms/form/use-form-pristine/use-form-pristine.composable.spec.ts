import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { useFormPristine } from './use-form-pristine.composable';

describe('useFormPristine', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return true when form is pristine', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isPristine = useFormPristine(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isPristine()).toBe(true);
  });

  it('should return false when form is dirty', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isPristine = useFormPristine(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isPristine } = fixture.componentInstance;
    form.markAsDirty();
    form.patchValue({ name: 'test' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isPristine()).toBe(false);
  });

  it('should update when form becomes dirty', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isPristine = useFormPristine(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isPristine } = fixture.componentInstance;

    expect(isPristine()).toBe(true);

    form.markAsDirty();
    form.patchValue({ name: 'test' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isPristine()).toBe(false);
  });

  it('should update when form is reset to pristine', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isPristine = useFormPristine(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isPristine } = fixture.componentInstance;

    // First make it dirty
    form.markAsDirty();
    form.patchValue({ name: 'test' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isPristine()).toBe(false);

    // Then reset to pristine
    form.markAsPristine();
    form.patchValue({ name: 'test2' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isPristine()).toBe(true);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isPristine = useFormPristine(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
