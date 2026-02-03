import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { useLocalStorage, StorageSerializers } from './use-local-storage.composable';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('basic functionality', () => {
    it('should return default value when localStorage is empty', () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', 'default-value');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe('default-value');
    });

    it('should return stored value when present in localStorage', () => {
      localStorage.setItem('test-key', '"stored-value"');

      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', 'default-value');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe('stored-value');
    });

    it('should write default value to localStorage', () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', 'default-value');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(localStorage.getItem('test-key')).toBe('default-value');
    });

    it('should update localStorage when signal value changes', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', 'initial');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.storage.value.set('updated');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(localStorage.getItem('test-key')).toBe('updated');
    });

    it('should provide a writable signal', () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', 'initial');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const { value } = fixture.componentInstance.storage;

      // Should have set and update methods (writable signal)
      expect(typeof value.set).toBe('function');
      expect(typeof value.update).toBe('function');
    });
  });

  describe('type serialization', () => {
    it('should handle string values', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', '');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.storage.value.set('hello world');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(localStorage.getItem('test-key')).toBe('hello world');
    });

    it('should handle number values', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', 0);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.storage.value.set(42.5);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(localStorage.getItem('test-key')).toBe('42.5');
    });

    it('should handle boolean values', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', false);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.storage.value.set(true);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(localStorage.getItem('test-key')).toBe('true');
    });

    it('should handle object values', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', { name: '', age: 0 });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.storage.value.set({ name: 'John', age: 30 });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(localStorage.getItem('test-key')).toBe('{"name":"John","age":30}');
    });

    it('should handle array values', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage<number[]>('test-key', []);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.storage.value.set([1, 2, 3]);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(localStorage.getItem('test-key')).toBe('[1,2,3]');
    });

    it('should handle Date values with custom serializer', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', new Date(), {
          serializer: StorageSerializers.date,
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const testDate = new Date('2024-01-15T10:30:00.000Z');
      fixture.componentInstance.storage.value.set(testDate);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(localStorage.getItem('test-key')).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should handle Map values with custom serializer', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', new Map<string, number>(), {
          serializer: StorageSerializers.map,
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const testMap = new Map([
        ['a', 1],
        ['b', 2],
      ]);
      fixture.componentInstance.storage.value.set(testMap);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(localStorage.getItem('test-key')).toBe('[["a",1],["b",2]]');
    });

    it('should handle Set values with custom serializer', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', new Set<number>(), {
          serializer: StorageSerializers.set,
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const testSet = new Set([1, 2, 3]);
      fixture.componentInstance.storage.value.set(testSet);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(localStorage.getItem('test-key')).toBe('[1,2,3]');
    });
  });

  describe('remove function', () => {
    it('should remove item from localStorage and reset to default', () => {
      localStorage.setItem('test-key', '"stored"');

      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', 'default');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe('stored');

      fixture.componentInstance.storage.remove();

      expect(localStorage.getItem('test-key')).toBeNull();
      expect(fixture.componentInstance.storage.value()).toBe('default');
    });
  });

  describe('mergeDefaults', () => {
    it('should merge defaults with stored value', () => {
      localStorage.setItem('test-key', '{"name":"John"}');

      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage(
          'test-key',
          { name: '', age: 25, email: 'default@example.com' },
          { mergeDefaults: true }
        );
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toEqual({
        name: 'John',
        age: 25,
        email: 'default@example.com',
      });
    });
  });

  describe('cross-tab sync', () => {
    it('should update signal when storage event is dispatched', () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', 'initial');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      // Simulate storage event from another tab
      const event = new StorageEvent('storage', {
        key: 'test-key',
        newValue: 'from-other-tab',
        storageArea: localStorage,
      });
      window.dispatchEvent(event);

      expect(fixture.componentInstance.storage.value()).toBe('from-other-tab');
    });
  });

  describe('SSR compatibility', () => {
    it('should return default value on server', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });

      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', 'default');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe('default');
    });
  });

  describe('real-world use cases', () => {
    it('should persist user preferences', async () => {
      @Component({ template: '' })
      class TestComponent {
        preferences = useLocalStorage('user-preferences', {
          theme: 'light',
          fontSize: 14,
          notifications: true,
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      // Update preferences
      fixture.componentInstance.preferences.value.update((prefs) => ({
        ...prefs,
        theme: 'dark',
        fontSize: 16,
      }));

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify stored
      const stored = JSON.parse(localStorage.getItem('user-preferences')!);
      expect(stored).toEqual({
        theme: 'dark',
        fontSize: 16,
        notifications: true,
      });
    });

    it('should persist shopping cart', async () => {
      interface CartItem {
        id: string;
        name: string;
        quantity: number;
      }

      @Component({ template: '' })
      class TestComponent {
        cart = useLocalStorage<CartItem[]>('shopping-cart', []);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      // Add items to cart
      fixture.componentInstance.cart.value.update((items) => [
        ...items,
        { id: '1', name: 'Product A', quantity: 2 },
        { id: '2', name: 'Product B', quantity: 1 },
      ]);

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify stored
      const stored = JSON.parse(localStorage.getItem('shopping-cart')!);
      expect(stored).toEqual([
        { id: '1', name: 'Product A', quantity: 2 },
        { id: '2', name: 'Product B', quantity: 1 },
      ]);
    });
  });

  describe('template bindings', () => {
    it('should work correctly in templates', async () => {
      @Component({
        template: `
          <div data-testid="theme">Theme: {{ theme.value() }}</div>
          <button data-testid="toggle" (click)="toggleTheme()">Toggle</button>
        `,
      })
      class TestComponent {
        theme = useLocalStorage('theme', 'light');

        toggleTheme() {
          this.theme.value.update((t) => (t === 'light' ? 'dark' : 'light'));
        }
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const element = fixture.nativeElement;
      const themeDiv = element.querySelector('[data-testid="theme"]');
      const toggleBtn = element.querySelector('[data-testid="toggle"]');

      expect(themeDiv.textContent.trim()).toBe('Theme: light');

      toggleBtn.click();
      fixture.detectChanges();

      expect(themeDiv.textContent.trim()).toBe('Theme: dark');
    });
  });

  describe('component lifecycle', () => {
    it('should clean up event listeners on component destroy', () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useLocalStorage('test-key', 'initial');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(() => fixture.destroy()).not.toThrow();
    });

    it('should maintain separate instances for different components', async () => {
      @Component({ selector: 'test-component-1', template: '' })
      class TestComponent1 {
        storage = useLocalStorage('key-1', 'default-1');
      }

      @Component({ selector: 'test-component-2', template: '' })
      class TestComponent2 {
        storage = useLocalStorage('key-2', 'default-2');
      }

      const fixture1 = TestBed.createComponent(TestComponent1);
      const fixture2 = TestBed.createComponent(TestComponent2);

      fixture1.detectChanges();
      fixture2.detectChanges();

      fixture1.componentInstance.storage.value.set('updated-1');
      fixture2.componentInstance.storage.value.set('updated-2');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(localStorage.getItem('key-1')).toBe('updated-1');
      expect(localStorage.getItem('key-2')).toBe('updated-2');
    });
  });
});
