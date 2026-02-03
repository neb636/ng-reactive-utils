import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  useStorage,
  StorageSerializers,
  STORAGE_CUSTOM_EVENT_NAME,
} from './use-storage.composable';

describe('useStorage', () => {
  let mockStorage: Storage;

  beforeEach(() => {
    // Create a mock storage
    let store: Record<string, string> = {};
    mockStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
    };

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    mockStorage.clear();
  });

  describe('basic functionality', () => {
    it('should return default value when storage is empty', () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', 'default-value', mockStorage);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe('default-value');
    });

    it('should return stored value when present in storage', () => {
      mockStorage.setItem('test-key', '"stored-value"');

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', 'default-value', mockStorage);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe('stored-value');
    });

    it('should write default value to storage when writeDefaults is true', () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', 'default-value', mockStorage, {
          writeDefaults: true,
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(mockStorage.getItem('test-key')).toBe('default-value');
    });

    it('should not write default value when writeDefaults is false', () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', 'default-value', mockStorage, {
          writeDefaults: false,
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(mockStorage.getItem('test-key')).toBeNull();
    });

    it('should update storage when signal value changes', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', 'initial', mockStorage);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.storage.value.set('updated');

      // Wait for effect to run
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockStorage.getItem('test-key')).toBe('updated');
    });

    it('should remove item from storage when value is set to null', async () => {
      mockStorage.setItem('test-key', '"initial"');

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage<string | null>('test-key', 'initial', mockStorage);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.storage.value.set(null);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockStorage.getItem('test-key')).toBeNull();
    });
  });

  describe('type serialization', () => {
    it('should serialize and deserialize strings', () => {
      mockStorage.setItem('test-key', 'hello world');

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', '', mockStorage);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe('hello world');
    });

    it('should serialize and deserialize numbers', () => {
      mockStorage.setItem('test-key', '42.5');

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', 0, mockStorage);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe(42.5);
    });

    it('should serialize and deserialize booleans', () => {
      mockStorage.setItem('test-key', 'true');

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', false, mockStorage);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe(true);
    });

    it('should serialize and deserialize objects', () => {
      mockStorage.setItem('test-key', JSON.stringify({ name: 'John', age: 30 }));

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', { name: '', age: 0 }, mockStorage);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toEqual({ name: 'John', age: 30 });
    });

    it('should serialize and deserialize arrays', () => {
      mockStorage.setItem('test-key', JSON.stringify([1, 2, 3]));

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', [] as number[], mockStorage);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toEqual([1, 2, 3]);
    });

    it('should serialize and deserialize Map with custom serializer', () => {
      const testMap = new Map([
        ['a', 1],
        ['b', 2],
      ]);
      mockStorage.setItem('test-key', JSON.stringify(Array.from(testMap.entries())));

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', new Map<string, number>(), mockStorage, {
          serializer: StorageSerializers.map,
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toEqual(testMap);
    });

    it('should serialize and deserialize Set with custom serializer', () => {
      const testSet = new Set([1, 2, 3]);
      mockStorage.setItem('test-key', JSON.stringify(Array.from(testSet)));

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', new Set<number>(), mockStorage, {
          serializer: StorageSerializers.set,
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toEqual(testSet);
    });

    it('should serialize and deserialize Date with custom serializer', () => {
      const testDate = new Date('2024-01-15T10:30:00.000Z');
      mockStorage.setItem('test-key', testDate.toISOString());

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', new Date(), mockStorage, {
          serializer: StorageSerializers.date,
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value().toISOString()).toBe(
        testDate.toISOString()
      );
    });
  });

  describe('mergeDefaults', () => {
    it('should shallow merge objects when mergeDefaults is true', () => {
      mockStorage.setItem('test-key', JSON.stringify({ name: 'John' }));

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage(
          'test-key',
          { name: '', age: 25, email: 'default@example.com' },
          mockStorage,
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

    it('should not merge arrays when mergeDefaults is true', () => {
      mockStorage.setItem('test-key', JSON.stringify([1, 2]));

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', [3, 4, 5], mockStorage, {
          mergeDefaults: true,
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      // Arrays should not be merged, storage value should win
      expect(fixture.componentInstance.storage.value()).toEqual([1, 2]);
    });

    it('should use custom merge function when provided', () => {
      mockStorage.setItem('test-key', JSON.stringify({ a: 1, b: 2 }));

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage(
          'test-key',
          { a: 0, c: 3 },
          mockStorage,
          {
            mergeDefaults: (stored, defaults) => ({
              ...defaults,
              ...stored,
              merged: true,
            }),
          }
        );
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toEqual({
        a: 1,
        b: 2,
        c: 3,
        merged: true,
      });
    });
  });

  describe('remove function', () => {
    it('should remove item from storage and reset to default', async () => {
      mockStorage.setItem('test-key', '"stored"');

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', 'default', mockStorage);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe('stored');

      fixture.componentInstance.storage.remove();

      expect(mockStorage.getItem('test-key')).toBeNull();
      expect(fixture.componentInstance.storage.value()).toBe('default');
    });
  });

  describe('error handling', () => {
    it('should call onError when storage read fails', () => {
      const errorHandler = jasmine.createSpy('errorHandler');
      const badStorage = {
        ...mockStorage,
        getItem: () => {
          throw new Error('Read error');
        },
      } as Storage;

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', 'default', badStorage, {
          onError: errorHandler,
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(errorHandler).toHaveBeenCalled();
      expect(fixture.componentInstance.storage.value()).toBe('default');
    });

    it('should call onError when storage write fails', async () => {
      const errorHandler = jasmine.createSpy('errorHandler');
      const badStorage = {
        ...mockStorage,
        setItem: () => {
          throw new Error('Write error');
        },
      } as Storage;

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', 'default', badStorage, {
          onError: errorHandler,
          writeDefaults: false,
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.storage.value.set('new-value');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('cross-tab sync', () => {
    it('should update signal when storage event is dispatched', () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', 'initial', mockStorage);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      // Simulate storage event from another tab
      const event = new StorageEvent('storage', {
        key: 'test-key',
        newValue: 'from-other-tab',
        storageArea: mockStorage,
      });
      window.dispatchEvent(event);

      expect(fixture.componentInstance.storage.value()).toBe('from-other-tab');
    });

    it('should reset to default when storage event has null value', () => {
      mockStorage.setItem('test-key', '"stored"');

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', 'default', mockStorage);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe('stored');

      // Simulate storage clear from another tab
      const event = new StorageEvent('storage', {
        key: 'test-key',
        newValue: null,
        storageArea: mockStorage,
      });
      window.dispatchEvent(event);

      expect(fixture.componentInstance.storage.value()).toBe('default');
    });

    it('should ignore storage events for different keys', () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', 'initial', mockStorage);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const event = new StorageEvent('storage', {
        key: 'other-key',
        newValue: 'other-value',
        storageArea: mockStorage,
      });
      window.dispatchEvent(event);

      expect(fixture.componentInstance.storage.value()).toBe('initial');
    });

    it('should not listen to storage changes when listenToStorageChanges is false', () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', 'initial', mockStorage, {
          listenToStorageChanges: false,
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const event = new StorageEvent('storage', {
        key: 'test-key',
        newValue: 'from-other-tab',
        storageArea: mockStorage,
      });
      window.dispatchEvent(event);

      expect(fixture.componentInstance.storage.value()).toBe('initial');
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
        storage = useStorage('test-key', 'default', undefined);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe('default');
    });
  });

  describe('custom serializer', () => {
    it('should use custom serializer for read and write', async () => {
      const customSerializer = {
        read: (raw: string) => raw.toUpperCase(),
        write: (value: string) => value.toLowerCase(),
      };

      mockStorage.setItem('test-key', 'hello');

      @Component({ template: '' })
      class TestComponent {
        storage = useStorage('test-key', '', mockStorage, {
          serializer: customSerializer,
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      // Read should uppercase
      expect(fixture.componentInstance.storage.value()).toBe('HELLO');

      // Write should lowercase
      fixture.componentInstance.storage.value.set('WORLD');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockStorage.getItem('test-key')).toBe('world');
    });
  });

  describe('template bindings', () => {
    it('should work correctly in templates', async () => {
      @Component({
        template: `
          <div data-testid="value">{{ storage.value() }}</div>
          <button data-testid="update" (click)="update()">Update</button>
        `,
      })
      class TestComponent {
        storage = useStorage('test-key', 'initial', mockStorage);

        update() {
          this.storage.value.set('updated');
        }
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const element = fixture.nativeElement;
      const valueDiv = element.querySelector('[data-testid="value"]');
      const button = element.querySelector('[data-testid="update"]');

      expect(valueDiv.textContent.trim()).toBe('initial');

      button.click();
      fixture.detectChanges();

      expect(valueDiv.textContent.trim()).toBe('updated');
    });
  });
});
