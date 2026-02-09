import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { useSessionStorage } from './use-session-storage.composable';

describe('useSessionStorage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should use sessionStorage as storage type', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useSessionStorage('test-storage-type', 123);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Should be in sessionStorage
    expect(sessionStorage.getItem('test-storage-type')).toBe('123');
    // Should NOT be in localStorage
    expect(localStorage.getItem('test-storage-type')).toBeNull();
  });

  it('should create a writable signal', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useSessionStorage('test-writable', 0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const counter = fixture.componentInstance.counter;

    // Should have signal methods
    expect(typeof counter).toBe('function');
    expect(typeof counter.set).toBe('function');
    expect(typeof counter.update).toBe('function');
  });

  it('should persist and read values', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useSessionStorage('test-persist', 42);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Initial value
    expect(component.counter()).toBe(42);

    // Update value
    component.counter.set(100);
    expect(component.counter()).toBe(100);
    expect(sessionStorage.getItem('test-persist')).toBe('100');
  });

  it('should pass options to useStorage', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useSessionStorage('test-options', 42, { writeDefaults: false });
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Should respect writeDefaults option
    expect(sessionStorage.getItem('test-options')).toBeNull();
  });

  it('should support custom serializer', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      date = useSessionStorage('test-serializer', new Date('2024-01-01'), {
        serializer: {
          read: (value: string) => new Date(value),
          write: (value: Date) => value.toISOString(),
        },
      });
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const newDate = new Date('2024-12-25');
    component.date.set(newDate);

    expect(component.date().getTime()).toBe(newDate.getTime());
    expect(sessionStorage.getItem('test-serializer')).toBe(newDate.toISOString());
  });
});
