import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { useStorage } from './use-storage-base.composable';

describe('useStorage', () => {
  describe('with localStorage', () => {
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
        counter = useStorage('localStorage', 'test-counter', 42);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.counter()).toBe(42);
    });

    it('should write default value to storage on initialization', () => {
      @Component({
        template: '',
      })
      class TestComponent {
        counter = useStorage('localStorage', 'test-init', 100);
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
        counter = useStorage('localStorage', 'test-no-write', 100, { writeDefaults: false });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(localStorage.getItem('test-no-write')).toBeNull();
    });

    it('should read existing value from storage', () => {
      localStorage.setItem('test-existing', '999');

      @Component({
        template: '',
      })
      class TestComponent {
        counter = useStorage('localStorage', 'test-existing', 0);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.counter()).toBe(999);
    });

    it('should persist value changes to storage', () => {
      @Component({
        template: '',
      })
      class TestComponent {
        counter = useStorage('localStorage', 'test-persist', 0);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      component.counter.set(123);

      expect(localStorage.getItem('test-persist')).toBe('123');
      expect(component.counter()).toBe(123);
    });

    it('should persist value updates to storage', () => {
      @Component({
        template: '',
      })
      class TestComponent {
        counter = useStorage('localStorage', 'test-update', 10);
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
        prefs = useStorage<UserPrefs>('localStorage', 'test-prefs', {
          theme: 'light',
          fontSize: 16,
        });
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
        items = useStorage<string[]>('localStorage', 'test-array', []);
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
        token = useStorage<string | null>('localStorage', 'test-token', 'initial');
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
        lastVisit = useStorage('localStorage', 'test-date', new Date('2024-01-01'), {
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
        counter = useStorage('localStorage', 'test-sync', 0);
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
        counter = useStorage('localStorage', 'test-key-match', 0);
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

    it('should only sync events for matching storage area', () => {
      @Component({
        template: '',
      })
      class TestComponent {
        counter = useStorage('localStorage', 'test-storage-area', 0);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const component = fixture.componentInstance;

      // Simulate storage event from sessionStorage
      const storageEvent = new StorageEvent('storage', {
        key: 'test-storage-area',
        newValue: '999',
        oldValue: '0',
        storageArea: sessionStorage,
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
        data = useStorage('localStorage', 'test-invalid', { default: 'value' });
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
        counter = useStorage('localStorage', 'test-cleanup', 0);
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
        counter = useStorage('localStorage', 'test-ssr', 42);
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
        counter = useStorage('localStorage', 'test-writable', 0);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const counter = fixture.componentInstance.counter;

      // Should have .set() and .update() methods
      expect(typeof counter.set).toBe('function');
      expect(typeof counter.update).toBe('function');
    });

    it('should handle storage event with null newValue (item removed)', () => {
      @Component({
        template: '',
      })
      class TestComponent {
        counter = useStorage('localStorage', 'test-null-event', 42);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      component.counter.set(100);

      // Simulate storage event where item was removed
      const storageEvent = new StorageEvent('storage', {
        key: 'test-null-event',
        newValue: null,
        oldValue: '100',
        storageArea: localStorage,
      });

      window.dispatchEvent(storageEvent);

      // Should revert to default value
      expect(component.counter()).toBe(42);
    });
  });

  describe('with sessionStorage', () => {
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
        counter = useStorage('sessionStorage', 'test-counter', 42);
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
        counter = useStorage('sessionStorage', 'test-init', 100);
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
        counter = useStorage('sessionStorage', 'test-existing', 0);
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
        counter = useStorage('sessionStorage', 'test-persist', 0);
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
        wizard = useStorage<WizardState>('sessionStorage', 'test-wizard', {
          step: 1,
          completed: false,
        });
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
        token = useStorage<string | null>('sessionStorage', 'test-token', 'initial');
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
        counter = useStorage('sessionStorage', 'test-ssr', 42);
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
        counter = useStorage('sessionStorage', 'test-writable', 0);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const counter = fixture.componentInstance.counter;

      // Should have .set() and .update() methods
      expect(typeof counter.set).toBe('function');
      expect(typeof counter.update).toBe('function');
    });
  });
});
