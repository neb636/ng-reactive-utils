import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { useControlDisabled } from './use-control-disabled.composable';

describe('useControlDisabled', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return false when control is enabled', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isDisabled = useControlDisabled(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isDisabled()).toBe(false);
  });

  it('should return true when control is disabled', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl({ value: '', disabled: true });
      isDisabled = useControlDisabled(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isDisabled()).toBe(true);
  });

  it('should update when control is disabled/enabled', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isDisabled = useControlDisabled(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isDisabled } = fixture.componentInstance;

    expect(isDisabled()).toBe(false);

    control.disable();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isDisabled()).toBe(true);

    control.enable();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isDisabled()).toBe(false);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isDisabled = useControlDisabled(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
