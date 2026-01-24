import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { useFormDirty } from './use-form-dirty.composable';

describe('useFormDirty', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return false when form is pristine', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isDirty = useFormDirty(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isDirty()).toBe(false);
  });

  it('should return true when form is dirty', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isDirty = useFormDirty(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isDirty } = fixture.componentInstance;
    form.markAsDirty();
    form.patchValue({ name: 'test' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isDirty()).toBe(true);
  });

  it('should update when form becomes dirty', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isDirty = useFormDirty(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isDirty } = fixture.componentInstance;

    expect(isDirty()).toBe(false);

    form.markAsDirty();
    form.patchValue({ name: 'test' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isDirty()).toBe(true);
  });

  it('should update when form is reset to pristine', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isDirty = useFormDirty(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { form, isDirty } = fixture.componentInstance;

    // First make it dirty
    form.markAsDirty();
    form.patchValue({ name: 'test' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isDirty()).toBe(true);

    // Then reset to pristine
    form.markAsPristine();
    form.patchValue({ name: 'test2' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isDirty()).toBe(false);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      form = new FormGroup({
        name: new FormControl(''),
      });
      isDirty = useFormDirty(this.form);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
