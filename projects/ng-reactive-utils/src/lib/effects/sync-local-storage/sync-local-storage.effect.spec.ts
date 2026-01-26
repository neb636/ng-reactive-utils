import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { syncLocalStorageEffect } from './sync-local-storage.effect';
import { vi } from 'vitest';

describe('syncLocalStorageEffect', () => {
  let mockLocalStorage: Storage;
  let localStorageSetItemSpy: ReturnType<typeof vi.fn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // Store original localStorage
    originalLocalStorage = window.localStorage;

    // Create spy functions
    localStorageSetItemSpy = vi.fn();
    
    // Create a mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: localStorageSetItemSpy,
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    };

    // Replace window.localStorage with our mock
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      configurable: true,
      value: mockLocalStorage,
    });

    // Spy on console.warn
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      configurable: true,
      value: originalLocalStorage,
    });

    vi.restoreAllMocks();
  });

  it('should immediately save initial signal value to localStorage', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      formData = signal({ name: 'John', email: 'john@example.com' });

      constructor() {
        syncLocalStorageEffect({
          signal: this.formData,
          key: 'form-draft',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Effect should run immediately and save initial value
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'form-draft',
      JSON.stringify({ name: 'John', email: 'john@example.com' })
    );
  });

  it('should sync signal changes to localStorage (one-way: signal → storage)', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      formData = signal({ name: '', email: '' });

      constructor() {
        syncLocalStorageEffect({
          signal: this.formData,
          key: 'form-draft',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    // Clear initial call
    localStorageSetItemSpy.mockClear();

    // Update signal
    component.formData.set({ name: 'Jane', email: 'jane@example.com' });

    // Wait for effect to run
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'form-draft',
      JSON.stringify({ name: 'Jane', email: 'jane@example.com' })
    );
  });

  it('should use JSON.stringify by default for serialization', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      data = signal({ test: 'value', number: 42, nested: { deep: true } });

      constructor() {
        syncLocalStorageEffect({
          signal: this.data,
          key: 'test-key',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify({ test: 'value', number: 42, nested: { deep: true } })
    );
  });

  it('should support custom serialization function', async () => {
    const customSerialize = (value: any) => `custom:${JSON.stringify(value)}`;

    @Component({
      template: '',
    })
    class TestComponent {
      data = signal({ name: 'test' });

      constructor() {
        syncLocalStorageEffect({
          signal: this.data,
          key: 'custom-key',
          serialize: customSerialize,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'custom-key',
      'custom:{"name":"test"}'
    );
  });

  it('should handle string values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      text = signal('hello world');

      constructor() {
        syncLocalStorageEffect({
          signal: this.text,
          key: 'text-key',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'text-key',
      JSON.stringify('hello world')
    );
  });

  it('should handle number values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      count = signal(42);

      constructor() {
        syncLocalStorageEffect({
          signal: this.count,
          key: 'count-key',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'count-key',
      JSON.stringify(42)
    );
  });

  it('should handle boolean values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      isEnabled = signal(true);

      constructor() {
        syncLocalStorageEffect({
          signal: this.isEnabled,
          key: 'enabled-key',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'enabled-key',
      JSON.stringify(true)
    );
  });

  it('should handle array values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      items = signal([1, 2, 3, 4, 5]);

      constructor() {
        syncLocalStorageEffect({
          signal: this.items,
          key: 'items-key',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'items-key',
      JSON.stringify([1, 2, 3, 4, 5])
    );
  });

  it('should handle null values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      data = signal<string | null>(null);

      constructor() {
        syncLocalStorageEffect({
          signal: this.data,
          key: 'null-key',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'null-key',
      JSON.stringify(null)
    );
  });

  it('should handle undefined values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      data = signal<string | undefined>(undefined);

      constructor() {
        syncLocalStorageEffect({
          signal: this.data,
          key: 'undefined-key',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // JSON.stringify(undefined) returns undefined, which will be converted to string
    expect(localStorageSetItemSpy).toHaveBeenCalled();
  });

  it('should handle empty string values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      text = signal('');

      constructor() {
        syncLocalStorageEffect({
          signal: this.text,
          key: 'empty-key',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'empty-key',
      JSON.stringify('')
    );
  });

  it('should update localStorage on every signal change', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      count = signal(0);

      constructor() {
        syncLocalStorageEffect({
          signal: this.count,
          key: 'counter',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    // Initial value
    expect(localStorageSetItemSpy).toHaveBeenCalledTimes(1);
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('counter', JSON.stringify(0));

    localStorageSetItemSpy.mockClear();

    // First update
    component.count.set(1);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(localStorageSetItemSpy).toHaveBeenCalledTimes(1);
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('counter', JSON.stringify(1));

    // Second update
    component.count.set(2);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(localStorageSetItemSpy).toHaveBeenCalledTimes(2);
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('counter', JSON.stringify(2));

    // Third update
    component.count.set(3);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(localStorageSetItemSpy).toHaveBeenCalledTimes(3);
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('counter', JSON.stringify(3));
  });

  it('should handle multiple signals syncing to different keys', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      formData = signal({ name: '', email: '' });
      preferences = signal({ theme: 'dark', notifications: true });

      constructor() {
        syncLocalStorageEffect({
          signal: this.formData,
          key: 'form-data',
        });

        syncLocalStorageEffect({
          signal: this.preferences,
          key: 'user-preferences',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    // Both should have saved initial values
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'form-data',
      JSON.stringify({ name: '', email: '' })
    );
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'user-preferences',
      JSON.stringify({ theme: 'dark', notifications: true })
    );

    localStorageSetItemSpy.mockClear();

    // Update only formData
    component.formData.set({ name: 'John', email: 'john@example.com' });
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'form-data',
      JSON.stringify({ name: 'John', email: 'john@example.com' })
    );
    expect(localStorageSetItemSpy).toHaveBeenCalledTimes(1);

    // Update only preferences
    component.preferences.set({ theme: 'light', notifications: false });
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'user-preferences',
      JSON.stringify({ theme: 'light', notifications: false })
    );
    expect(localStorageSetItemSpy).toHaveBeenCalledTimes(2);
  });

  it('should warn and return early when localStorage is not available', () => {
    // Temporarily remove localStorage from window
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    
    // @ts-ignore - intentionally deleting for test
    delete window.localStorage;

    @Component({
      template: '',
    })
    class TestComponent {
      data = signal({ test: 'value' });

      constructor() {
        syncLocalStorageEffect({
          signal: this.data,
          key: 'test-key',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Documentation: "Automatically handles errors if localStorage is unavailable"
    expect(consoleWarnSpy).toHaveBeenCalledWith('localStorage is not available');

    // Restore localStorage
    if (originalDescriptor) {
      Object.defineProperty(window, 'localStorage', originalDescriptor);
    }
  });

  it('should warn and not throw when localStorage.setItem fails (quota exceeded)', async () => {
    // Mock setItem to throw an error
    localStorageSetItemSpy.mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    @Component({
      template: '',
    })
    class TestComponent {
      data = signal({ large: 'data' });

      constructor() {
        syncLocalStorageEffect({
          signal: this.data,
          key: 'test-key',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    
    // Should not throw during initialization
    expect(() => fixture.detectChanges()).not.toThrow();

    // Documentation: "Automatically handles errors if... quota exceeded"
    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(consoleWarnSpy.mock.calls[0][0]).toBe('Failed to save to localStorage for key "test-key":');
    expect(consoleWarnSpy.mock.calls[0][1]).toBeInstanceOf(Error);

    const component = fixture.componentInstance;

    // Update signal - should also not throw
    consoleWarnSpy.mockClear();
    component.data.set({ large: 'updated data' });
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(consoleWarnSpy.mock.calls[0][0]).toBe('Failed to save to localStorage for key "test-key":');
    expect(consoleWarnSpy.mock.calls[0][1]).toBeInstanceOf(Error);
  });

  it('should handle serialization errors gracefully', async () => {
    const badSerialize = () => {
      throw new Error('Serialization failed');
    };

    @Component({
      template: '',
    })
    class TestComponent {
      data = signal({ test: 'value' });

      constructor() {
        syncLocalStorageEffect({
          signal: this.data,
          key: 'test-key',
          serialize: badSerialize,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    
    // Should not throw during initialization
    expect(() => fixture.detectChanges()).not.toThrow();

    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(consoleWarnSpy.mock.calls[0][0]).toBe('Failed to save to localStorage for key "test-key":');
    expect(consoleWarnSpy.mock.calls[0][1]).toBeInstanceOf(Error);
  });

  it('should clean up on component destroy without errors', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      data = signal({ test: 'value' });

      constructor() {
        syncLocalStorageEffect({
          signal: this.data,
          key: 'test-key',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Destroy component - should clean up effect without errors
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should work with signal.update() method', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      count = signal(0);

      constructor() {
        syncLocalStorageEffect({
          signal: this.count,
          key: 'counter',
        });
      }

      increment() {
        this.count.update(v => v + 1);
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    localStorageSetItemSpy.mockClear();

    component.increment();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(localStorageSetItemSpy).toHaveBeenCalledWith('counter', JSON.stringify(1));

    component.increment();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(localStorageSetItemSpy).toHaveBeenCalledWith('counter', JSON.stringify(2));
  });

  it('should handle complex nested objects', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      complexData = signal({
        user: {
          profile: {
            name: 'John',
            age: 30,
            address: {
              street: '123 Main St',
              city: 'New York',
            },
          },
          preferences: {
            theme: 'dark',
            notifications: {
              email: true,
              push: false,
            },
          },
        },
        metadata: {
          lastUpdated: new Date('2024-01-01'),
          version: 1,
        },
      });

      constructor() {
        syncLocalStorageEffect({
          signal: this.complexData,
          key: 'complex-data',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'complex-data',
      JSON.stringify(fixture.componentInstance.complexData())
    );
  });

  it('should demonstrate use case from documentation (form draft)', async () => {
    @Component({
      template: '',
    })
    class FormComponent {
      formData = signal({ name: '', email: '' });

      constructor() {
        // Documentation example
        syncLocalStorageEffect({
          signal: this.formData,
          key: 'form-draft',
        });
      }
    }

    const fixture = TestBed.createComponent(FormComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    // Initial save
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'form-draft',
      JSON.stringify({ name: '', email: '' })
    );

    // User types in form
    component.formData.set({ name: 'John', email: '' });
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'form-draft',
      JSON.stringify({ name: 'John', email: '' })
    );

    // User continues typing
    component.formData.set({ name: 'John', email: 'john@example.com' });
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'form-draft',
      JSON.stringify({ name: 'John', email: 'john@example.com' })
    );
  });

  it('should demonstrate use case from code comments (form data)', async () => {
    @Component({
      template: '',
    })
    class MyComponent {
      formData = signal({ name: '', email: '' });

      constructor() {
        // Code comment example: Sync form data to localStorage whenever it changes
        syncLocalStorageEffect({
          signal: this.formData,
          key: 'form-data',
        });
      }
    }

    const fixture = TestBed.createComponent(MyComponent);
    fixture.detectChanges();

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'form-data',
      JSON.stringify({ name: '', email: '' })
    );
  });

  it('should only sync when signal value actually changes (Angular signal behavior)', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      count = signal(5);

      constructor() {
        syncLocalStorageEffect({
          signal: this.count,
          key: 'counter',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    // Initial save
    expect(localStorageSetItemSpy).toHaveBeenCalledTimes(1);

    localStorageSetItemSpy.mockClear();

    // Set to same value - Angular signals don't trigger effects when value is unchanged
    component.count.set(5);
    await new Promise(resolve => setTimeout(resolve, 50));

    // Should not have saved again
    expect(localStorageSetItemSpy).not.toHaveBeenCalled();

    // Set to different value
    component.count.set(6);
    await new Promise(resolve => setTimeout(resolve, 50));

    // Should save now
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('counter', JSON.stringify(6));
  });

  it('should maintain separate instances for different components', async () => {
    @Component({
      selector: 'test-component-1',
      template: '',
    })
    class TestComponent1 {
      data = signal('component1');

      constructor() {
        syncLocalStorageEffect({
          signal: this.data,
          key: 'component1-data',
        });
      }
    }

    @Component({
      selector: 'test-component-2',
      template: '',
    })
    class TestComponent2 {
      data = signal('component2');

      constructor() {
        syncLocalStorageEffect({
          signal: this.data,
          key: 'component2-data',
        });
      }
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    // Both should have saved their initial values
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'component1-data',
      JSON.stringify('component1')
    );
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'component2-data',
      JSON.stringify('component2')
    );

    localStorageSetItemSpy.mockClear();

    // Update only component1
    fixture1.componentInstance.data.set('updated1');
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'component1-data',
      JSON.stringify('updated1')
    );
    expect(localStorageSetItemSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle rapid signal updates efficiently', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      count = signal(0);

      constructor() {
        syncLocalStorageEffect({
          signal: this.count,
          key: 'counter',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    localStorageSetItemSpy.mockClear();

    // Rapid updates
    for (let i = 1; i <= 10; i++) {
      component.count.set(i);
    }

    // Wait for effects to run
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should have saved the final value
    // Note: Angular effects may batch updates, so we can't guarantee exactly 10 calls
    // but we should at least have the final value saved
    expect(localStorageSetItemSpy).toHaveBeenCalled();
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('counter', JSON.stringify(10));
  });

  it('should handle zero as a valid value', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      count = signal(0);

      constructor() {
        syncLocalStorageEffect({
          signal: this.count,
          key: 'counter',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(localStorageSetItemSpy).toHaveBeenCalledWith('counter', JSON.stringify(0));
  });

  it('should handle false as a valid value', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      flag = signal(false);

      constructor() {
        syncLocalStorageEffect({
          signal: this.flag,
          key: 'flag',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(localStorageSetItemSpy).toHaveBeenCalledWith('flag', JSON.stringify(false));
  });

  it('should use the exact key provided without modification', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      data = signal('test');

      constructor() {
        syncLocalStorageEffect({
          signal: this.data,
          key: 'my-app:user:settings',
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'my-app:user:settings',
      JSON.stringify('test')
    );
  });
});

