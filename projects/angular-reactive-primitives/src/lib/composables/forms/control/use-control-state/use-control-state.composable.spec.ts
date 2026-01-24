import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import {
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { useControlState } from './use-control-state.composable';

describe('useControlState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return all control state properties as signals', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      controlState = useControlState<string>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { controlState } = fixture.componentInstance;

    expect(controlState.value()).toBe('');
    expect(controlState.valid()).toBe(true);
    expect(controlState.invalid()).toBe(false);
    expect(controlState.pending()).toBe(false);
    expect(controlState.disabled()).toBe(false);
    expect(controlState.enabled()).toBe(true);
    expect(controlState.dirty()).toBe(false);
    expect(controlState.pristine()).toBe(true);
    expect(controlState.touched()).toBe(false);
    expect(controlState.untouched()).toBe(true);
    expect(controlState.errors()).toBeNull();
    expect(controlState.status()).toBe('VALID');
  });

  it('should update value signal when control value changes', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      controlState = useControlState<string>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, controlState } = fixture.componentInstance;

    control.setValue('John');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(controlState.value()).toBe('John');
  });

  it('should update valid/invalid signals when validation changes', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('', Validators.required);
      controlState = useControlState<string>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, controlState } = fixture.componentInstance;

    expect(controlState.valid()).toBe(false);
    expect(controlState.invalid()).toBe(true);

    control.setValue('test');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(controlState.valid()).toBe(true);
    expect(controlState.invalid()).toBe(false);
  });

  it('should update disabled/enabled signals when control is disabled', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      controlState = useControlState<string>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, controlState } = fixture.componentInstance;

    expect(controlState.disabled()).toBe(false);
    expect(controlState.enabled()).toBe(true);

    control.disable();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(controlState.disabled()).toBe(true);
    expect(controlState.enabled()).toBe(false);
  });

  it('should update dirty/pristine signals when control is modified', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      controlState = useControlState<string>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, controlState } = fixture.componentInstance;

    expect(controlState.dirty()).toBe(false);
    expect(controlState.pristine()).toBe(true);

    control.markAsDirty();
    control.setValue('test');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(controlState.dirty()).toBe(true);
    expect(controlState.pristine()).toBe(false);
  });

  it('should update touched/untouched signals when control is touched', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      controlState = useControlState<string>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, controlState } = fixture.componentInstance;

    expect(controlState.touched()).toBe(false);
    expect(controlState.untouched()).toBe(true);

    control.markAsTouched();
    control.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(controlState.touched()).toBe(true);
    expect(controlState.untouched()).toBe(false);
  });

  it('should update errors signal when validation errors change', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('', [Validators.required, Validators.email]);
      controlState = useControlState<string>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, controlState } = fixture.componentInstance;

    expect(controlState.errors()?.['required']).toBe(true);

    control.setValue('invalid');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(controlState.errors()?.['email']).toBeTruthy();

    control.setValue('valid@example.com');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(controlState.errors()).toBeNull();
  });

  it('should work with number type', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl(0);
      controlState = useControlState<number>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, controlState } = fixture.componentInstance;

    expect(controlState.value()).toBe(0);

    control.setValue(42);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(controlState.value()).toBe(42);
  });

  it('should work with boolean type', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl(false);
      controlState = useControlState<boolean>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, controlState } = fixture.componentInstance;

    expect(controlState.value()).toBe(false);

    control.setValue(true);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(controlState.value()).toBe(true);
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      controlState = useControlState<string>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
