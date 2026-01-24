import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { useControlValid } from './use-control-valid.composable';

describe('useControlValid', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return true when control is valid', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('John');
      isValid = useControlValid(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isValid()).toBe(true);
  });

  it('should return false when control is invalid', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('', Validators.required);
      isValid = useControlValid(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.isValid()).toBe(false);
  });

  it('should update when validity changes', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('', Validators.required);
      isValid = useControlValid(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isValid } = fixture.componentInstance;

    expect(isValid()).toBe(false);

    control.setValue('test');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isValid()).toBe(true);
  });

  it('should handle multiple validators', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]);
      isValid = useControlValid(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isValid } = fixture.componentInstance;

    expect(isValid()).toBe(false);

    control.setValue('ab');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isValid()).toBe(false);

    control.setValue('abc');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isValid()).toBe(true);
  });

  it('should handle email validator', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('', Validators.email);
      isValid = useControlValid(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, isValid } = fixture.componentInstance;

    control.setValue('invalid');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isValid()).toBe(false);

    control.setValue('valid@example.com');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(isValid()).toBe(true);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      isValid = useControlValid(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
