import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { useLocalStorage } from './use-local-storage.composable';
import { useSessionStorage } from '../use-session-storage/use-session-storage.composable';

describe('useLocalStorage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return default value when no stored value exists', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useLocalStorage('test-counter', 42);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.counter()).toBe(42);
  });

  it('should write default value to localStorage on initialization', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useLocalStorage('test-init', 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(localStorage.getItem('test-init')).toBe('100');
  });

  it('should not write default value when writeDefaults is false', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useLocalStorage('test-no-write', 100, { writeDefaults: false });
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(localStorage.getItem('test-no-write')).toBeNull();
  });

  it('should read existing value from localStorage', () => {
    localStorage.setItem('test-existing', '999');

    @Component({
      template: '',
    })
    class TestComponent {
      counter = useLocalStorage('test-existing', 0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.counter()).toBe(999);
  });

  it('should persist value changes to localStorage', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useLocalStorage('test-persist', 0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.counter.set(123);

    expect(localStorage.getItem('test-persist')).toBe('123');
    expect(component.counter()).toBe(123);
  });

  it('should persist value updates to localStorage', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useLocalStorage('test-update', 10);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.counter.update((v) => v + 5);

    expect(localStorage.getItem('test-update')).toBe('15');
    expect(component.counter()).toBe(15);
  });

  it('should handle object values', () => {
    interface UserPrefs {
      theme: string;
      fontSize: number;
    }

    @Component({
      template: '',
    })
    class TestComponent {
      prefs = useLocalStorage<UserPrefs>('test-prefs', { theme: 'light', fontSize: 16 });
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.prefs.update((p) => ({ ...p, theme: 'dark' }));

    expect(component.prefs()).toEqual({ theme: 'dark', fontSize: 16 });
    expect(JSON.parse(localStorage.getItem('test-prefs')!)).toEqual({
      theme: 'dark',
      fontSize: 16,
    });
  });

  it('should handle array values', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      items = useLocalStorage<string[]>('test-array', []);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.items.update((arr) => [...arr, 'item1', 'item2']);

    expect(component.items()).toEqual(['item1', 'item2']);
    expect(JSON.parse(localStorage.getItem('test-array')!)).toEqual(['item1', 'item2']);
  });

  it('should remove from storage when value is null', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      token = useLocalStorage<string | null>('test-token', 'initial');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(localStorage.getItem('test-token')).toBe('"initial"');

    component.token.set(null);

    expect(localStorage.getItem('test-token')).toBeNull();
  });

  it('should handle custom serializer', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      lastVisit = useLocalStorage('test-date', new Date('2024-01-01'), {
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
    component.lastVisit.set(newDate);

    expect(component.lastVisit().getTime()).toBe(newDate.getTime());
    expect(localStorage.getItem('test-date')).toBe(newDate.toISOString());
  });

  it('should sync across tabs via storage events', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useLocalStorage('test-sync', 0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Simulate storage event from another tab
    const storageEvent = new StorageEvent('storage', {
      key: 'test-sync',
      newValue: '999',
      oldValue: '0',
      storageArea: localStorage,
    });

    window.dispatchEvent(storageEvent);

    expect(component.counter()).toBe(999);
  });

  it('should only sync events for matching key', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useLocalStorage('test-key-match', 0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Simulate storage event for different key
    const storageEvent = new StorageEvent('storage', {
      key: 'different-key',
      newValue: '999',
      oldValue: '0',
      storageArea: localStorage,
    });

    window.dispatchEvent(storageEvent);

    // Should not update
    expect(component.counter()).toBe(0);
  });

  it('should handle parse errors gracefully', () => {
    localStorage.setItem('test-invalid', 'not valid json');

    @Component({
      template: '',
    })
    class TestComponent {
      data = useLocalStorage('test-invalid', { default: 'value' });
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Should return default value on parse error
    expect(fixture.componentInstance.data()).toEqual({ default: 'value' });
  });

  it('should clean up storage event listeners on destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useLocalStorage('test-cleanup', 0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.counter.set(42);

    // Destroy component
    fixture.destroy();

    // Simulate storage event after destroy
    const storageEvent = new StorageEvent('storage', {
      key: 'test-cleanup',
      newValue: '999',
      oldValue: '42',
      storageArea: localStorage,
    });

    // Should not throw or update
    expect(() => window.dispatchEvent(storageEvent)).not.toThrow();
  });

  it('should handle server-side rendering (returns default value)', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'server' }],
    });

    @Component({
      template: '',
    })
    class TestComponent {
      counter = useLocalStorage('test-ssr', 42);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Should return default value on server
    expect(fixture.componentInstance.counter()).toBe(42);
  });

  it('should return writable signal', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useLocalStorage('test-writable', 0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const counter = fixture.componentInstance.counter;

    // Should have .set() and .update() methods
    expect(typeof counter.set).toBe('function');
    expect(typeof counter.update).toBe('function');
  });
});

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

  it('should return default value when no stored value exists', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useSessionStorage('test-counter', 42);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.counter()).toBe(42);
  });

  it('should write default value to sessionStorage on initialization', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useSessionStorage('test-init', 100);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(sessionStorage.getItem('test-init')).toBe('100');
  });

  it('should read existing value from sessionStorage', () => {
    sessionStorage.setItem('test-existing', '999');

    @Component({
      template: '',
    })
    class TestComponent {
      counter = useSessionStorage('test-existing', 0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.counter()).toBe(999);
  });

  it('should persist value changes to sessionStorage', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useSessionStorage('test-persist', 0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.counter.set(123);

    expect(sessionStorage.getItem('test-persist')).toBe('123');
    expect(component.counter()).toBe(123);
  });

  it('should handle object values', () => {
    interface WizardState {
      step: number;
      completed: boolean;
    }

    @Component({
      template: '',
    })
    class TestComponent {
      wizard = useSessionStorage<WizardState>('test-wizard', { step: 1, completed: false });
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.wizard.update((w) => ({ ...w, step: 2 }));

    expect(component.wizard()).toEqual({ step: 2, completed: false });
    expect(JSON.parse(sessionStorage.getItem('test-wizard')!)).toEqual({
      step: 2,
      completed: false,
    });
  });

  it('should remove from storage when value is null', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      token = useSessionStorage<string | null>('test-token', 'initial');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(sessionStorage.getItem('test-token')).toBe('"initial"');

    component.token.set(null);

    expect(sessionStorage.getItem('test-token')).toBeNull();
  });

  it('should handle server-side rendering (returns default value)', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'server' }],
    });

    @Component({
      template: '',
    })
    class TestComponent {
      counter = useSessionStorage('test-ssr', 42);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Should return default value on server
    expect(fixture.componentInstance.counter()).toBe(42);
  });

  it('should return writable signal', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      counter = useSessionStorage('test-writable', 0);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const counter = fixture.componentInstance.counter;

    // Should have .set() and .update() methods
    expect(typeof counter.set).toBe('function');
    expect(typeof counter.update).toBe('function');
  });

  it('should use sessionStorage instead of localStorage', () => {
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
});
