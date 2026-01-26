import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { createSharedComposable } from './create-shared-composable';

describe('createSharedComposable', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  describe('Basic usage without parameters', () => {
    it('should create a shared instance that returns the value', () => {
      const useCounter = createSharedComposable(() => {
        const count = signal(0);
        return {
          value: count,
        };
      });

      @Component({
        template: '',
      })
      class TestComponent {
        counter = useCounter();
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const counter = fixture.componentInstance.counter;
      expect(counter()).toBe(0);
    });

    it('should share a single instance between multiple components', () => {
      const useSharedState = createSharedComposable(() => {
        const state = signal({ count: 0 });
        return {
          value: state,
        };
      });

      @Component({
        template: '',
        selector: 'test-component-shared-1',
      })
      class TestComponent1 {
        state = useSharedState();
      }

      @Component({
        template: '',
        selector: 'test-component-shared-2',
      })
      class TestComponent2 {
        state = useSharedState();
      }

      const fixture1 = TestBed.createComponent(TestComponent1);
      const fixture2 = TestBed.createComponent(TestComponent2);

      fixture1.detectChanges();
      fixture2.detectChanges();

      // Both components should get the same signal instance
      const state1 = fixture1.componentInstance.state;
      const state2 = fixture2.componentInstance.state;

      // Modify through one component
      state1.set({ count: 5 });

      // Both should reflect the change (same instance)
      expect(state1().count).toBe(5);
      expect(state2().count).toBe(5);
      expect(state1).toBe(state2); // Same reference
    });

    it('should track factory invocations - factory should only be called once for multiple components', () => {
      let factoryCallCount = 0;

      const useSharedResource = createSharedComposable(() => {
        factoryCallCount++;
        const data = signal('shared');
        return {
          value: data,
        };
      });

      @Component({
        template: '',
        selector: 'test-component-resource-1',
      })
      class TestComponent1 {
        resource = useSharedResource();
      }

      @Component({
        template: '',
        selector: 'test-component-resource-2',
      })
      class TestComponent2 {
        resource = useSharedResource();
      }

      @Component({
        template: '',
        selector: 'test-component-resource-3',
      })
      class TestComponent3 {
        resource = useSharedResource();
      }

      TestBed.createComponent(TestComponent1).detectChanges();
      TestBed.createComponent(TestComponent2).detectChanges();
      TestBed.createComponent(TestComponent3).detectChanges();

      // Factory should only be called once for all three components
      expect(factoryCallCount).toBe(1);
    });
  });

  describe('Reference counting', () => {
    it('should increment reference count for each consumer', () => {
      let cleanupCallCount = 0;

      const useResource = createSharedComposable(() => {
        const data = signal('test');
        return {
          value: data,
          cleanup: () => {
            cleanupCallCount++;
          },
        };
      });

      @Component({
        template: '',
      })
      class TestComponent {
        resource = useResource();
      }

      const fixture1 = TestBed.createComponent(TestComponent);
      const fixture2 = TestBed.createComponent(TestComponent);
      const fixture3 = TestBed.createComponent(TestComponent);

      fixture1.detectChanges();
      fixture2.detectChanges();
      fixture3.detectChanges();

      // Destroy first component
      fixture1.destroy();
      expect(cleanupCallCount).toBe(0); // Still 2 references

      // Destroy second component
      fixture2.destroy();
      expect(cleanupCallCount).toBe(0); // Still 1 reference

      // Destroy third component
      fixture3.destroy();
      expect(cleanupCallCount).toBe(1); // Last reference, cleanup called
    });

    it('should call cleanup only when the last consumer is destroyed', () => {
      let isCleanedUp = false;

      const useWebSocket = createSharedComposable(() => {
        const messages = signal<string[]>([]);
        return {
          value: messages,
          cleanup: () => {
            isCleanedUp = true;
          },
        };
      });

      @Component({
        template: '',
        selector: 'websocket-component-1',
      })
      class Component1 {
        ws = useWebSocket();
      }

      @Component({
        template: '',
        selector: 'websocket-component-2',
      })
      class Component2 {
        ws = useWebSocket();
      }

      const fixture1 = TestBed.createComponent(Component1);
      const fixture2 = TestBed.createComponent(Component2);

      fixture1.detectChanges();
      fixture2.detectChanges();

      expect(isCleanedUp).toBe(false);

      fixture1.destroy();
      expect(isCleanedUp).toBe(false); // Still one consumer

      fixture2.destroy();
      expect(isCleanedUp).toBe(true); // Last consumer destroyed
    });

    it('should allow recreation after all consumers are destroyed', () => {
      let factoryCallCount = 0;
      let cleanupCallCount = 0;

      const useResource = createSharedComposable(() => {
        factoryCallCount++;
        const data = signal(`instance-${factoryCallCount}`);
        return {
          value: data,
          cleanup: () => {
            cleanupCallCount++;
          },
        };
      });

      @Component({
        template: '',
      })
      class TestComponent {
        resource = useResource();
      }

      // First lifecycle
      const fixture1 = TestBed.createComponent(TestComponent);
      fixture1.detectChanges();
      const resource1 = fixture1.componentInstance.resource;
      expect(resource1()).toBe('instance-1');
      expect(factoryCallCount).toBe(1);

      fixture1.destroy();
      expect(cleanupCallCount).toBe(1);

      // Second lifecycle - should create new instance
      const fixture2 = TestBed.createComponent(TestComponent);
      fixture2.detectChanges();
      const resource2 = fixture2.componentInstance.resource;
      expect(resource2()).toBe('instance-2');
      expect(factoryCallCount).toBe(2);

      fixture2.destroy();
      expect(cleanupCallCount).toBe(2);
    });
  });

  describe('Argument-based caching', () => {
    it('should create separate instances for different argument values', () => {
      const useTimedResource = createSharedComposable((timeout: number) => {
        const data = signal(`timeout-${timeout}`);
        return {
          value: data,
        };
      });

      @Component({
        template: '',
        selector: 'timed-resource-component-1',
      })
      class Component1 {
        resource = useTimedResource(100);
      }

      @Component({
        template: '',
        selector: 'timed-resource-component-2',
      })
      class Component2 {
        resource = useTimedResource(200);
      }

      const fixture1 = TestBed.createComponent(Component1);
      const fixture2 = TestBed.createComponent(Component2);

      fixture1.detectChanges();
      fixture2.detectChanges();

      const resource1 = fixture1.componentInstance.resource;
      const resource2 = fixture2.componentInstance.resource;

      expect(resource1()).toBe('timeout-100');
      expect(resource2()).toBe('timeout-200');
      expect(resource1).not.toBe(resource2); // Different instances
    });

    it('should share instances when same arguments are provided', () => {
      let factoryCallCounts: Record<number, number> = {};

      const useConfiguredResource = createSharedComposable((delay: number) => {
        factoryCallCounts[delay] = (factoryCallCounts[delay] || 0) + 1;
        const data = signal(delay);
        return {
          value: data,
        };
      });

      @Component({
        template: '',
        selector: 'configured-resource-component-1',
      })
      class Component1 {
        resource = useConfiguredResource(100);
      }

      @Component({
        template: '',
        selector: 'configured-resource-component-2',
      })
      class Component2 {
        resource = useConfiguredResource(100);
      }

      @Component({
        template: '',
        selector: 'configured-resource-component-3',
      })
      class Component3 {
        resource = useConfiguredResource(200);
      }

      TestBed.createComponent(Component1).detectChanges();
      TestBed.createComponent(Component2).detectChanges();
      TestBed.createComponent(Component3).detectChanges();

      // Same arguments = same instance = factory called once
      expect(factoryCallCounts[100]).toBe(1);
      // Different argument = different instance
      expect(factoryCallCounts[200]).toBe(1);
    });

    it('should handle multiple parameters correctly', () => {
      const useMultiParam = createSharedComposable(
        (param1: string, param2: number, param3: boolean) => {
          const data = signal(`${param1}-${param2}-${param3}`);
          return {
            value: data,
          };
        }
      );

      @Component({
        template: '',
        selector: 'multi-param-component-1',
      })
      class Component1 {
        resource = useMultiParam('test', 42, true);
      }

      @Component({
        template: '',
        selector: 'multi-param-component-2',
      })
      class Component2 {
        resource = useMultiParam('test', 42, true);
      }

      @Component({
        template: '',
        selector: 'multi-param-component-3',
      })
      class Component3 {
        resource = useMultiParam('test', 42, false);
      }

      const fixture1 = TestBed.createComponent(Component1);
      const fixture2 = TestBed.createComponent(Component2);
      const fixture3 = TestBed.createComponent(Component3);

      fixture1.detectChanges();
      fixture2.detectChanges();
      fixture3.detectChanges();

      const resource1 = fixture1.componentInstance.resource;
      const resource2 = fixture2.componentInstance.resource;
      const resource3 = fixture3.componentInstance.resource;

      // Same params = same instance
      expect(resource1).toBe(resource2);
      expect(resource1()).toBe('test-42-true');

      // Different params = different instance
      expect(resource1).not.toBe(resource3);
      expect(resource3()).toBe('test-42-false');
    });

    it('should cleanup each cached instance independently', () => {
      const cleanupTracker: Record<number, number> = {};

      const useInstanceWithCleanup = createSharedComposable((id: number) => {
        const data = signal(id);
        return {
          value: data,
          cleanup: () => {
            cleanupTracker[id] = (cleanupTracker[id] || 0) + 1;
          },
        };
      });

      @Component({
        template: '',
        selector: 'cleanup-component-for-id1',
      })
      class ComponentForId1 {
        resource = useInstanceWithCleanup(1);
      }

      @Component({
        template: '',
        selector: 'cleanup-component-for-id2',
      })
      class ComponentForId2 {
        resource = useInstanceWithCleanup(2);
      }

      const fixture1a = TestBed.createComponent(ComponentForId1);
      const fixture1b = TestBed.createComponent(ComponentForId1);
      const fixture2 = TestBed.createComponent(ComponentForId2);

      fixture1a.detectChanges();
      fixture1b.detectChanges();
      fixture2.detectChanges();

      // Destroy one consumer of id:1
      fixture1a.destroy();
      expect(cleanupTracker[1]).toBeUndefined(); // Still has one reference

      // Destroy consumer of id:2
      fixture2.destroy();
      expect(cleanupTracker[2]).toBe(1); // Last reference to id:2

      // Destroy last consumer of id:1
      fixture1b.destroy();
      expect(cleanupTracker[1]).toBe(1); // Last reference to id:1
    });
  });

  describe('Optional cleanup function', () => {
    it('should work without cleanup function', () => {
      const useSimple = createSharedComposable(() => {
        const data = signal('no cleanup');
        return {
          value: data,
        };
      });

      @Component({
        template: '',
      })
      class TestComponent {
        simple = useSimple();
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.simple()).toBe('no cleanup');
      
      // Should destroy without errors
      expect(() => fixture.destroy()).not.toThrow();
    });

    it('should not throw when cleanup is undefined', () => {
      const useResourceWithoutCleanup = createSharedComposable(() => {
        return {
          value: signal(42),
          cleanup: undefined,
        };
      });

      @Component({
        template: '',
      })
      class TestComponent {
        resource = useResourceWithoutCleanup();
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(() => fixture.destroy()).not.toThrow();
    });
  });

  describe('DestroyRef integration', () => {
    it('should automatically register cleanup with DestroyRef', () => {
      let cleanupCalled = false;

      const useAutoCleanup = createSharedComposable(() => {
        const data = signal('test');
        return {
          value: data,
          cleanup: () => {
            cleanupCalled = true;
          },
        };
      });

      @Component({
        template: '',
      })
      class TestComponent {
        autoCleanup = useAutoCleanup();
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(cleanupCalled).toBe(false);

      // Destroy triggers DestroyRef callbacks
      fixture.destroy();
      expect(cleanupCalled).toBe(true);
    });

    it('should handle multiple components destroyed in different order', () => {
      const destructionOrder: string[] = [];

      const useTrackedResource = createSharedComposable((id: string) => {
        const data = signal(id);
        return {
          value: data,
          cleanup: () => {
            destructionOrder.push(`cleanup-${id}`);
          },
        };
      });

      @Component({
        template: '',
        selector: 'tracked-resource-component-1',
      })
      class Component1 {
        resource = useTrackedResource('A');
      }

      @Component({
        template: '',
        selector: 'tracked-resource-component-2',
      })
      class Component2 {
        resource = useTrackedResource('A');
      }

      @Component({
        template: '',
        selector: 'tracked-resource-component-3',
      })
      class Component3 {
        resource = useTrackedResource('B');
      }

      const fixture1 = TestBed.createComponent(Component1);
      const fixture2 = TestBed.createComponent(Component2);
      const fixture3 = TestBed.createComponent(Component3);

      fixture1.detectChanges();
      fixture2.detectChanges();
      fixture3.detectChanges();

      // Destroy in specific order
      fixture3.destroy(); // B's last consumer
      expect(destructionOrder).toEqual(['cleanup-B']);

      fixture1.destroy(); // A still has fixture2
      expect(destructionOrder).toEqual(['cleanup-B']);

      fixture2.destroy(); // A's last consumer
      expect(destructionOrder).toEqual(['cleanup-B', 'cleanup-A']);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle rapid creation and destruction of consumers', () => {
      let activeInstances = 0;

      const useTrackedInstance = createSharedComposable(() => {
        activeInstances++;
        const data = signal('tracked');
        return {
          value: data,
          cleanup: () => {
            activeInstances--;
          },
        };
      });

      @Component({
        template: '',
      })
      class TestComponent {
        instance = useTrackedInstance();
      }

      // Create and destroy multiple times
      for (let i = 0; i < 5; i++) {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        expect(activeInstances).toBe(1);
        fixture.destroy();
        expect(activeInstances).toBe(0);
      }
    });

    it('should maintain separate cache entries with default parameter values', () => {
      let factoryCalls: Array<number | undefined> = [];

      const useWithDefault = createSharedComposable((value = 100) => {
        factoryCalls.push(value);
        const data = signal(value);
        return {
          value: data,
        };
      });

      @Component({
        template: '',
        selector: 'with-default-component-1',
      })
      class Component1 {
        resource = useWithDefault();
      }

      @Component({
        template: '',
        selector: 'with-default-component-2',
      })
      class Component2 {
        resource = useWithDefault(100);
      }

      const fixture1 = TestBed.createComponent(Component1);
      const fixture2 = TestBed.createComponent(Component2);

      fixture1.detectChanges();
      fixture2.detectChanges();

      // Both use value 100, but different cache keys (no args vs [100])
      // This tests whether JSON.stringify creates different keys for these cases
      expect(factoryCalls).toEqual([100, 100]); // Called twice
      
      const resource1 = fixture1.componentInstance.resource;
      const resource2 = fixture2.componentInstance.resource;
      
      // They might be different instances due to different cache keys
      // (empty array vs [100])
      expect(resource1()).toBe(100);
      expect(resource2()).toBe(100);
    });

    it('should handle object and array parameters', () => {
      const useWithComplexParams = createSharedComposable(
        (config: { timeout: number; retries: number }) => {
          const data = signal(config);
          return {
            value: data,
          };
        }
      );

      @Component({
        template: '',
        selector: 'complex-params-component-1',
      })
      class Component1 {
        resource = useWithComplexParams({ timeout: 100, retries: 3 });
      }

      @Component({
        template: '',
        selector: 'complex-params-component-2',
      })
      class Component2 {
        resource = useWithComplexParams({ timeout: 100, retries: 3 });
      }

      const fixture1 = TestBed.createComponent(Component1);
      const fixture2 = TestBed.createComponent(Component2);

      fixture1.detectChanges();
      fixture2.detectChanges();

      const resource1 = fixture1.componentInstance.resource;
      const resource2 = fixture2.componentInstance.resource;

      // Same object values should create same cache key
      expect(resource1).toBe(resource2);
      expect(resource1().timeout).toBe(100);
      expect(resource1().retries).toBe(3);
    });
  });

  describe('Memory leak prevention', () => {
    it('should remove cache entry after cleanup', () => {
      // This test verifies that the cache is cleaned up properly
      // We'll use multiple create/destroy cycles to ensure no memory leaks
      let factoryCallCount = 0;

      const useResource = createSharedComposable(() => {
        factoryCallCount++;
        return {
          value: signal(`instance-${factoryCallCount}`),
        };
      });

      @Component({
        template: '',
      })
      class TestComponent {
        resource = useResource();
      }

      // First cycle
      const fixture1 = TestBed.createComponent(TestComponent);
      fixture1.detectChanges();
      expect(fixture1.componentInstance.resource()).toBe('instance-1');
      fixture1.destroy();

      // Second cycle - if cache was properly cleared, factory should be called again
      const fixture2 = TestBed.createComponent(TestComponent);
      fixture2.detectChanges();
      expect(fixture2.componentInstance.resource()).toBe('instance-2');
      expect(factoryCallCount).toBe(2);
    });
  });

  describe('Edge cases', () => {
    it('should handle when factory returns readonly signal', () => {
      const useReadonly = createSharedComposable(() => {
        const count = signal(0);
        return {
          value: count.asReadonly(),
        };
      });

      @Component({
        template: '',
      })
      class TestComponent {
        readonly = useReadonly();
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const readonlySignal = fixture.componentInstance.readonly;
      
      // Should not have .set() method
      expect((readonlySignal as any).set).toBeUndefined();
      expect(readonlySignal()).toBe(0);
    });

    it('should handle null and undefined as parameter values', () => {
      const useNullable = createSharedComposable((value: string | null | undefined) => {
        const data = signal(value);
        return {
          value: data,
        };
      });

      @Component({
        template: '',
        selector: 'test-null-component-1',
      })
      class Component1 {
        resource = useNullable(null);
      }

      @Component({
        template: '',
        selector: 'test-undefined-component-2',
      })
      class Component2 {
        resource = useNullable(undefined);
      }

      @Component({
        template: '',
        selector: 'test-null-component-3',
      })
      class Component3 {
        resource = useNullable(null);
      }

      const fixture1 = TestBed.createComponent(Component1);
      const fixture2 = TestBed.createComponent(Component2);
      const fixture3 = TestBed.createComponent(Component3);

      fixture1.detectChanges();
      fixture2.detectChanges();
      fixture3.detectChanges();

      const resource1 = fixture1.componentInstance.resource;
      const resource2 = fixture2.componentInstance.resource;
      const resource3 = fixture3.componentInstance.resource;

      // NOTE: Due to JSON.stringify limitation, null and undefined create the same cache key
      // JSON.stringify([null]) === JSON.stringify([undefined]) === "[null]"
      // So they will share the same instance
      expect(resource1).toBe(resource2);
      // Same null values should share instance
      expect(resource1).toBe(resource3);
      
      // The value will be null because that's what was created first
      expect(resource1()).toBeNull();
    });

    it('should handle zero as a parameter value', () => {
      const useWithZero = createSharedComposable((value: number) => {
        const data = signal(value * 2);
        return {
          value: data,
        };
      });

      @Component({
        template: '',
      })
      class TestComponent {
        resource = useWithZero(0);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.resource()).toBe(0);
    });

    it('should handle empty string as parameter value', () => {
      const useWithString = createSharedComposable((str: string) => {
        const data = signal(str);
        return {
          value: data,
        };
      });

      @Component({
        template: '',
      })
      class TestComponent {
        resource = useWithString('');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.resource()).toBe('');
    });
  });
});

