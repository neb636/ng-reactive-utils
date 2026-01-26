import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { useControlPristine } from './use-control-pristine.composable';

describe('useControlPristine', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return true when control is pristine', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isPristine = useControlPristine(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isPristine()).toBe(true);
  });

  it('should return false when control is dirty', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isPristine = useControlPristine(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isPristine } = fixture.componentInstance;
    control.markAsDirty();
    control.setValue('test');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isPristine()).toBe(false);
  });

  it('should update when control becomes dirty', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isPristine = useControlPristine(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isPristine } = fixture.componentInstance;

    expect(isPristine()).toBe(true);

    control.markAsDirty();
    control.setValue('test');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isPristine()).toBe(false);
  });

  it('should update when control is reset to pristine', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isPristine = useControlPristine(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isPristine } = fixture.componentInstance;

    // First make it dirty
    control.markAsDirty();
    control.setValue('test');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isPristine()).toBe(false);

    // Then reset to pristine
    control.markAsPristine();
    control.setValue('test2');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isPristine()).toBe(true);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isPristine = useControlPristine(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
