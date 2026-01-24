import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { useControlUntouched } from './use-control-untouched.composable';

describe('useControlUntouched', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return true when control is untouched', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isUntouched = useControlUntouched(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isUntouched()).toBe(true);
  });

  it('should return false when control is touched', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isUntouched = useControlUntouched(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isUntouched } = fixture.componentInstance;
    control.markAsTouched();
    control.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isUntouched()).toBe(false);
  });

  it('should update when control becomes touched', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isUntouched = useControlUntouched(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isUntouched } = fixture.componentInstance;

    expect(isUntouched()).toBe(true);

    control.markAsTouched();
    control.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isUntouched()).toBe(false);
  });

  it('should update when control is reset to untouched', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isUntouched = useControlUntouched(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isUntouched } = fixture.componentInstance;

    // First make it touched
    control.markAsTouched();
    control.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isUntouched()).toBe(false);

    // Then reset to untouched
    control.markAsUntouched();
    control.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isUntouched()).toBe(true);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isUntouched = useControlUntouched(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
