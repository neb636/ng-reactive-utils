import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { useControlTouched } from './use-control-touched.composable';

describe('useControlTouched', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return false when control is untouched', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isTouched = useControlTouched(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isTouched()).toBe(false);
  });

  it('should return true when control is touched', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isTouched = useControlTouched(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isTouched } = fixture.componentInstance;
    control.markAsTouched();
    control.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isTouched()).toBe(true);
  });

  it('should update when control is touched', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isTouched = useControlTouched(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isTouched } = fixture.componentInstance;

    expect(isTouched()).toBe(false);

    control.markAsTouched();
    control.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isTouched()).toBe(true);
  });

  it('should update when control is marked untouched', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isTouched = useControlTouched(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isTouched } = fixture.componentInstance;

    // First touch the control
    control.markAsTouched();
    control.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isTouched()).toBe(true);

    // Then mark untouched
    control.markAsUntouched();
    control.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isTouched()).toBe(false);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isTouched = useControlTouched(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
