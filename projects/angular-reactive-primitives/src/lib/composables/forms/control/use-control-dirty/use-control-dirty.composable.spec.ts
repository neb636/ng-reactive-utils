import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { useControlDirty } from './use-control-dirty.composable';

describe('useControlDirty', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return false when control is pristine', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isDirty = useControlDirty(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isDirty()).toBe(false);
  });

  it('should return true when control is dirty', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isDirty = useControlDirty(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isDirty } = fixture.componentInstance;
    control.markAsDirty();
    control.setValue('test');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isDirty()).toBe(true);
  });

  it('should update when control becomes dirty', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isDirty = useControlDirty(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isDirty } = fixture.componentInstance;

    expect(isDirty()).toBe(false);

    control.markAsDirty();
    control.setValue('test');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isDirty()).toBe(true);
  });

  it('should update when control is reset to pristine', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isDirty = useControlDirty(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isDirty } = fixture.componentInstance;

    // First make it dirty
    control.markAsDirty();
    control.setValue('test');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isDirty()).toBe(true);

    // Then reset to pristine
    control.markAsPristine();
    control.setValue('test2');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isDirty()).toBe(false);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isDirty = useControlDirty(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
