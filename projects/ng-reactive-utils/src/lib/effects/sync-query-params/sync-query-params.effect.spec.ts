import { TestBed } from '@angular/core/testing';
import {
  Component,
  provideZonelessChangeDetection,
  signal,
  computed,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { vi } from 'vitest';
import { syncQueryParamsEffect } from './sync-query-params.effect';

describe('syncQueryParamsEffect', () => {
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(() => {
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    mockActivatedRoute = {
      snapshot: {} as any,
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should immediately sync initial query params to URL', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ query: 'angular', category: 'all' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Documentation: "Effect runs automatically whenever the queryParams signal changes"
    // Should run immediately with initial value
    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { query: 'angular', category: 'all' },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should sync query param changes to URL (one-way: signal → URL)', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ query: '' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    // Clear initial call
    mockRouter.navigate.mockClear();

    // Documentation: "This is **one-way sync**: signal → URL"
    component.queryParams.set({ query: 'angular' });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { query: 'angular' },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should use default queryParamsHandling="merge"', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ query: 'test' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Documentation: queryParamsHandling defaults to 'merge'
    const call = mockRouter.navigate.mock.calls[0];
    expect(call[1].queryParamsHandling).toBe('merge');
  });

  it('should support queryParamsHandling="preserve"', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ query: 'test' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
          options: { queryParamsHandling: 'preserve' },
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Documentation example uses 'preserve'
    const call = mockRouter.navigate.mock.calls[0];
    expect(call[1].queryParamsHandling).toBe('preserve');
  });

  it('should use default replaceUrl=false', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ query: 'test' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Documentation: replaceUrl defaults to false
    const call = mockRouter.navigate.mock.calls[0];
    expect(call[1].replaceUrl).toBe(false);
  });

  it('should support replaceUrl=true to avoid polluting browser history', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ query: 'test' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
          options: { replaceUrl: true },
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Documentation: "Set `replaceUrl: true` to avoid polluting browser history with every state change"
    const call = mockRouter.navigate.mock.calls[0];
    expect(call[1].replaceUrl).toBe(true);
  });

  it('should use default skipLocationChange=false', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ query: 'test' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Documentation: skipLocationChange defaults to false
    const call = mockRouter.navigate.mock.calls[0];
    expect(call[1].skipLocationChange).toBe(false);
  });

  it('should support skipLocationChange=true to update router state without changing browser URL', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ query: 'test' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
          options: { skipLocationChange: true },
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Documentation: "Update router state without changing browser URL"
    const call = mockRouter.navigate.mock.calls[0];
    expect(call[1].skipLocationChange).toBe(true);
  });

  it('should navigate relative to current route', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ query: 'test' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Documentation: "for the current route" - uses relativeTo: activatedRoute
    const call = mockRouter.navigate.mock.calls[0];
    expect(call[1].relativeTo).toBe(mockActivatedRoute);
  });

  it('should handle empty query params', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({});

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: {},
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should handle multiple query params', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({
        query: 'angular',
        category: 'all',
        page: '1',
        sort: 'date',
      });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: {
        query: 'angular',
        category: 'all',
        page: '1',
        sort: 'date',
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should handle string values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ search: 'hello world' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    mockRouter.navigate.mockClear();

    component.queryParams.set({ search: 'goodbye world' });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { search: 'goodbye world' },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should handle number values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ page: 1, limit: 20 });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    mockRouter.navigate.mockClear();

    component.queryParams.set({ page: 2, limit: 50 });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { page: 2, limit: 50 },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should handle boolean values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ active: true, verified: false });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    mockRouter.navigate.mockClear();

    component.queryParams.set({ active: false, verified: true });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { active: false, verified: true },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should handle null and undefined values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal<Record<string, unknown>>({
        nullValue: null,
        undefinedValue: undefined,
      });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { nullValue: null, undefinedValue: undefined },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should handle array values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ tags: ['angular', 'react', 'vue'] });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    mockRouter.navigate.mockClear();

    component.queryParams.set({ tags: ['typescript', 'javascript'] });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { tags: ['typescript', 'javascript'] },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should work with computed() signals', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      query = signal('');
      category = signal('all');

      // Documentation example uses computed()
      queryParamsComputed = computed(() => ({
        query: this.query(),
        category: this.category(),
      }));

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParamsComputed,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { query: '', category: 'all' },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });

    mockRouter.navigate.mockClear();

    // Update one signal
    component.query.set('angular');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { query: 'angular', category: 'all' },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });

    mockRouter.navigate.mockClear();

    // Update both signals
    component.query.set('react');
    component.category.set('frameworks');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { query: 'react', category: 'frameworks' },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should clean up on component destroy without errors', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ query: 'test' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Destroy component - should clean up effect without errors
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should handle rapid signal updates efficiently', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ page: 0 });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    mockRouter.navigate.mockClear();

    // Rapid updates (simulating user typing or scrolling)
    for (let i = 1; i <= 10; i++) {
      component.queryParams.set({ page: i });
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should have called navigate (Angular effects may batch updates)
    expect(mockRouter.navigate).toHaveBeenCalled();

    // The last call should have the final value
    const lastCall =
      mockRouter.navigate.mock.calls[mockRouter.navigate.mock.calls.length - 1];
    expect(lastCall[1].queryParams).toEqual({ page: 10 });
  });

  it('should update on every signal change', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ count: 0 });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    // Initial call
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);

    mockRouter.navigate.mockClear();

    // First update
    component.queryParams.set({ count: 1 });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    const call1 = mockRouter.navigate.mock.calls[0];
    expect(call1[1].queryParams).toEqual({ count: 1 });

    // Second update
    component.queryParams.set({ count: 2 });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
    const call2 = mockRouter.navigate.mock.calls[1];
    expect(call2[1].queryParams).toEqual({ count: 2 });

    // Third update
    component.queryParams.set({ count: 3 });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockRouter.navigate).toHaveBeenCalledTimes(3);
    const call3 = mockRouter.navigate.mock.calls[2];
    expect(call3[1].queryParams).toEqual({ count: 3 });
  });

  it('should handle multiple effects syncing different query params', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      searchParams = signal({ query: 'angular' });
      filterParams = signal({ category: 'all' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.searchParams,
        });

        syncQueryParamsEffect({
          queryParams: this.filterParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    // Both should have called navigate with their initial values
    expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
    const call1 = mockRouter.navigate.mock.calls[0];
    expect(call1[1].queryParams).toEqual({ query: 'angular' });
    const call2 = mockRouter.navigate.mock.calls[1];
    expect(call2[1].queryParams).toEqual({ category: 'all' });

    mockRouter.navigate.mockClear();

    // Update only searchParams
    component.searchParams.set({ query: 'react' });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    const call3 = mockRouter.navigate.mock.calls[0];
    expect(call3[1].queryParams).toEqual({ query: 'react' });
  });

  it('should support all options combined', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ query: 'test' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
          options: {
            queryParamsHandling: 'preserve',
            replaceUrl: true,
            skipLocationChange: true,
          },
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { query: 'test' },
      queryParamsHandling: 'preserve',
      replaceUrl: true,
      skipLocationChange: true,
    });
  });

  it('should trigger effect with new object reference even with same content (Angular signals default behavior)', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ query: 'test' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    mockRouter.navigate.mockClear();

    // POTENTIAL BUG/DOCUMENTATION ISSUE: Setting signal to new object with same content
    // triggers the effect because Angular signals use reference equality by default
    component.queryParams.set({ query: 'test' });
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Effect is triggered because it's a new object reference
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { query: 'test' },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });

    mockRouter.navigate.mockClear();

    // Set to different value to confirm tracking still works
    component.queryParams.set({ query: 'different' });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { query: 'different' },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should work with signal.update() method', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ count: 0 });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }

      increment() {
        this.queryParams.update((params) => ({ count: params.count + 1 }));
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    mockRouter.navigate.mockClear();

    component.increment();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { count: 1 },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });

    component.increment();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { count: 2 },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should handle empty string values', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ query: '' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { query: '' },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should handle zero as a valid value', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ page: 0, offset: 0 });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { page: 0, offset: 0 },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should handle false as a valid value', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ enabled: false });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { enabled: false },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should maintain separate instances for different components', async () => {
    @Component({
      selector: 'test-component-1',
      template: '',
    })
    class TestComponent1 {
      queryParams = signal({ source: 'component1' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    @Component({
      selector: 'test-component-2',
      template: '',
    })
    class TestComponent2 {
      queryParams = signal({ source: 'component2' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    // Both should have called navigate with their respective values
    expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
    const call1 = mockRouter.navigate.mock.calls[0];
    expect(call1[1].queryParams).toEqual({ source: 'component1' });
    const call2 = mockRouter.navigate.mock.calls[1];
    expect(call2[1].queryParams).toEqual({ source: 'component2' });

    mockRouter.navigate.mockClear();

    // Update only component1
    fixture1.componentInstance.queryParams.set({ source: 'updated1' });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    const call3 = mockRouter.navigate.mock.calls[0];
    expect(call3[1].queryParams).toEqual({ source: 'updated1' });
  });

  it('should demonstrate use case from documentation (search component)', async () => {
    @Component({
      template: '',
    })
    class SearchComponent {
      query = signal('');
      category = signal('all');

      constructor() {
        // Documentation example
        syncQueryParamsEffect({
          queryParams: computed(() => ({
            query: this.query(),
            category: this.category(),
          })),
          options: {
            queryParamsHandling: 'merge',
            replaceUrl: true,
          },
        });
      }
    }

    const fixture = TestBed.createComponent(SearchComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { query: '', category: 'all' },
      queryParamsHandling: 'merge',
      replaceUrl: true,
      skipLocationChange: false,
    });

    mockRouter.navigate.mockClear();

    // User types in search
    component.query.set('angular signals');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { query: 'angular signals', category: 'all' },
      queryParamsHandling: 'merge',
      replaceUrl: true,
      skipLocationChange: false,
    });
  });

  it('should demonstrate use case from code comments (selected label and query)', async () => {
    @Component({
      template: '',
    })
    class MyComponent {
      selectedLabel = signal('');
      query = signal('');

      constructor() {
        // Code comment example
        syncQueryParamsEffect({
          queryParams: computed(() => ({
            selectedLabel: this.selectedLabel(),
            query: this.query(),
          })),
          options: { queryParamsHandling: 'preserve' },
        });
      }
    }

    const fixture = TestBed.createComponent(MyComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { selectedLabel: '', query: '' },
      queryParamsHandling: 'preserve',
      replaceUrl: false,
      skipLocationChange: false,
    });

    mockRouter.navigate.mockClear();

    // Update selectedLabel
    component.selectedLabel.set('important');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { selectedLabel: 'important', query: '' },
      queryParamsHandling: 'preserve',
      replaceUrl: false,
      skipLocationChange: false,
    });
  });

  it('should handle complex nested objects (though not recommended for URLs)', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({
        filters: {
          category: 'angular',
          tags: ['reactive', 'signals'],
        },
      });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Router should receive the object as-is
    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: {
        filters: {
          category: 'angular',
          tags: ['reactive', 'signals'],
        },
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should handle navigation failures gracefully', async () => {
    // Mock navigate to reject
    mockRouter.navigate.mockRejectedValue(new Error('Navigation failed'));

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ query: 'test' });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);

    // Should not throw during initialization
    expect(() => fixture.detectChanges()).not.toThrow();

    const component = fixture.componentInstance;

    // Update signal - should not throw even if navigation fails
    component.queryParams.set({ query: 'updated' });
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Navigate should have been called
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('should return the effect reference for manual cleanup if needed', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal({ query: 'test' });
      effectRef: any;

      constructor() {
        this.effectRef = syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Should return an effect reference
    expect(component.effectRef).toBeDefined();

    // Effect reference should have a destroy method
    expect(typeof component.effectRef.destroy).toBe('function');
  });

  it('should work with partial query params updates', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      page = signal(1);
      sort = signal<string | undefined>(undefined);

      queryParams = computed(() => {
        const params: Record<string, unknown> = { page: this.page() };
        if (this.sort()) {
          params['sort'] = this.sort();
        }
        return params;
      });

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
          options: { queryParamsHandling: 'merge' },
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { page: 1 },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });

    mockRouter.navigate.mockClear();

    // Add sort parameter
    component.sort.set('date');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { page: 1, sort: 'date' },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
      replaceUrl: false,
    });
  });

  it('should handle very large query param objects', () => {
    const largeParams: Record<string, unknown> = {};
    for (let i = 0; i < 50; i++) {
      largeParams[`param${i}`] = `value${i}`;
    }

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = signal(largeParams);

      constructor() {
        syncQueryParamsEffect({
          queryParams: this.queryParams,
        });
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const call = mockRouter.navigate.mock.calls[0];
    expect(call[1].queryParams).toEqual(largeParams);
  });
});
