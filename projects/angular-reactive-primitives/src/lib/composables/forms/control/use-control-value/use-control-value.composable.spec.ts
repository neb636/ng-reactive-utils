import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { useControlValue } from './use-control-value.composable';

describe('useControlValue', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should return initial control value', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('John');
      value = useControlValue<string>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('John');
  });

  it('should update when control value changes', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      value = useControlValue<string>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, value } = fixture.componentInstance;

    expect(value()).toBe('');

    control.setValue('Jane');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(value()).toBe('Jane');
  });

  it('should handle number values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl(0);
      value = useControlValue<number>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, value } = fixture.componentInstance;

    control.setValue(42);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(value()).toBe(42);
  });

  it('should handle boolean values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl(false);
      value = useControlValue<boolean>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, value } = fixture.componentInstance;

    control.setValue(true);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(value()).toBe(true);
  });

  it('should handle object values', async () => {
    interface Person {
      name: string;
      age: number;
    }

    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl<Person>({ name: '', age: 0 });
      value = useControlValue<Person>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, value } = fixture.componentInstance;

    control.setValue({ name: 'John', age: 30 });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(value()).toEqual({ name: 'John', age: 30 });
  });

  it('should handle array values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl<string[]>([]);
      value = useControlValue<string[]>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, value } = fixture.componentInstance;

    control.setValue(['a', 'b', 'c']);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(value()).toEqual(['a', 'b', 'c']);
  });

  it('should handle null values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl<string | null>('initial');
      value = useControlValue<string | null>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, value } = fixture.componentInstance;

    control.setValue(null);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(value()).toBeNull();
  });

  it('should handle multiple rapid value changes', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl(0);
      value = useControlValue<number>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, value } = fixture.componentInstance;

    for (let i = 1; i <= 10; i++) {
      control.setValue(i);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(value()).toBe(10);
  });

  it('should handle reset', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('initial');
      value = useControlValue<string>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const { control, value } = fixture.componentInstance;

    control.setValue('changed');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(value()).toBe('changed');

    control.reset('reset');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(value()).toBe('reset');
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      control = new FormControl('');
      value = useControlValue<string>(this.control);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
