import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { useRouteQueryParam } from './use-route-query-param.composable';

describe('useRouteQueryParam', () => {
  let routeQueryParamsSubject: BehaviorSubject<any>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(() => {
    routeQueryParamsSubject = new BehaviorSubject({});
    
    mockActivatedRoute = {
      queryParams: routeQueryParamsSubject.asObservable(),
      snapshot: {
        queryParams: {},
      } as any,
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });
  });

  it('should return undefined when query param does not exist', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      searchQuery = useRouteQueryParam('query');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.searchQuery()).toBeUndefined();
  });

  it('should return initial query param value from snapshot', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { query: 'angular' },
    } as any;
    routeQueryParamsSubject.next({ query: 'angular' });

    @Component({
      template: '',
    })
    class TestComponent {
      searchQuery = useRouteQueryParam<string>('query');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.searchQuery()).toBe('angular');
  });

  it('should update reactively when query param changes', async () => {
    mockActivatedRoute.snapshot = {
      queryParams: { filter: 'active' },
    } as any;
    routeQueryParamsSubject.next({ filter: 'active' });

    @Component({
      template: '',
    })
    class TestComponent {
      filter = useRouteQueryParam<string>('filter');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.filter()).toBe('active');

    // Update query param
    routeQueryParamsSubject.next({ filter: 'completed' });

    await new Promise(resolve => setTimeout(resolve, 50));
      expect(component.filter()).toBe('completed');
      
  });

  it('should return readonly signal that cannot be directly modified', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      param = useRouteQueryParam('param');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const param = fixture.componentInstance.param;

    // Should not have .set() method (readonly signal)
    expect((param as any).set).toBeUndefined();
  });

  it('should handle multiple different query params in same component', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { query: 'angular', sort: 'date' },
    } as any;
    routeQueryParamsSubject.next({ query: 'angular', sort: 'date' });

    @Component({
      template: '',
    })
    class TestComponent {
      searchQuery = useRouteQueryParam<string>('query');
      sortBy = useRouteQueryParam<string>('sort');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.searchQuery()).toBe('angular');
    expect(component.sortBy()).toBe('date');
  });

  it('should only return the requested query param value', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { 
        query: 'test',
        sort: 'date',
        order: 'asc',
        page: '1'
      },
    } as any;
    routeQueryParamsSubject.next({ 
      query: 'test',
      sort: 'date',
      order: 'asc',
      page: '1'
    });

    @Component({
      template: '',
    })
    class TestComponent {
      query = useRouteQueryParam<string>('query');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    // Should only return the query param, not the entire params object
    expect(component.query()).toBe('test');
  });

  it('should handle query param with numeric string value', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { page: '42' },
    } as any;
    routeQueryParamsSubject.next({ page: '42' });

    @Component({
      template: '',
    })
    class TestComponent {
      page = useRouteQueryParam<string>('page');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.page()).toBe('42');
  });

  it('should work correctly in template bindings', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { query: 'angular signals' },
    } as any;
    routeQueryParamsSubject.next({ query: 'angular signals' });

    @Component({
      template: `<h1 data-testid="title">Searching for: {{ searchQuery() }}</h1>`,
    })
    class TestComponent {
      searchQuery = useRouteQueryParam<string>('query');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    const titleElement = element.querySelector('[data-testid="title"]');

    expect(titleElement.textContent.trim()).toBe('Searching for: angular signals');
  });

  it('should handle query param changing from undefined to a value', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      filter = useRouteQueryParam<string>('filter');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.filter()).toBeUndefined();

    // Add query param
    routeQueryParamsSubject.next({ filter: 'new-filter' });

    await new Promise(resolve => setTimeout(resolve, 50));
      expect(component.filter()).toBe('new-filter');
      
  });

  it('should handle query param changing from a value to undefined', async () => {
    mockActivatedRoute.snapshot = {
      queryParams: { filter: 'existing-filter' },
    } as any;
    routeQueryParamsSubject.next({ filter: 'existing-filter' });

    @Component({
      template: '',
    })
    class TestComponent {
      filter = useRouteQueryParam<string | undefined>('filter');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.filter()).toBe('existing-filter');

    // Remove query param
    routeQueryParamsSubject.next({});

    await new Promise(resolve => setTimeout(resolve, 50));
      expect(component.filter()).toBeUndefined();
      
  });

  it('should maintain separate instances for different components', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { shared: 'shared-value' },
    } as any;
    routeQueryParamsSubject.next({ shared: 'shared-value' });

    @Component({
      selector: 'test-component-1',
      template: '',
    })
    class TestComponent1 {
      param = useRouteQueryParam<string>('shared');
    }

    @Component({
      selector: 'test-component-2',
      template: '',
    })
    class TestComponent2 {
      param = useRouteQueryParam<string>('shared');
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    const component1 = fixture1.componentInstance;
    const component2 = fixture2.componentInstance;

    // Both should have the same param value from the shared ActivatedRoute
    expect(component1.param()).toBe('shared-value');
    expect(component2.param()).toBe('shared-value');
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      param = useRouteQueryParam('param');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Destroy component (should clean up without errors)
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should handle rapid query param changes', async () => {
    mockActivatedRoute.snapshot = {
      queryParams: { count: '0' },
    } as any;
    routeQueryParamsSubject.next({ count: '0' });

    @Component({
      template: '',
    })
    class TestComponent {
      count = useRouteQueryParam<string>('count');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Rapidly update query param
    for (let i = 1; i <= 10; i++) {
      routeQueryParamsSubject.next({ count: i.toString(), other: 'stable' });
    }

    await new Promise(resolve => setTimeout(resolve, 100));
      // Should have the last value
      expect(component.count()).toBe('10');
      
  });

  it('should not be affected by changes to other query params', async () => {
    mockActivatedRoute.snapshot = {
      queryParams: { stable: 'value', other: 'initial' },
    } as any;
    routeQueryParamsSubject.next({ stable: 'value', other: 'initial' });

    @Component({
      template: '',
    })
    class TestComponent {
      stableParam = useRouteQueryParam<string>('stable');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.stableParam()).toBe('value');

    // Update only the 'other' query param
    routeQueryParamsSubject.next({ stable: 'value', other: 'changed' });

    await new Promise(resolve => setTimeout(resolve, 50));
      // 'stable' should remain the same
      expect(component.stableParam()).toBe('value');
      
  });

  it('should handle query param with special characters', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { search: 'hello world', tag: 'angular:reactive' },
    } as any;
    routeQueryParamsSubject.next({ search: 'hello world', tag: 'angular:reactive' });

    @Component({
      template: '',
    })
    class TestComponent {
      searchQuery = useRouteQueryParam<string>('search');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.searchQuery()).toBe('hello world');
  });

  it('should handle query param with boolean-like string value', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { active: 'true' },
    } as any;
    routeQueryParamsSubject.next({ active: 'true' });

    @Component({
      template: '',
    })
    class TestComponent {
      active = useRouteQueryParam<string>('active');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.active()).toBe('true');
  });

  it('should demonstrate use case for search results', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { query: 'angular' },
    } as any;
    routeQueryParamsSubject.next({ query: 'angular' });

    @Component({
      template: '',
    })
    class TestComponent {
      searchQuery = useRouteQueryParam<string>('query');
      
      // Simulate resource loading
      getSearchUrl() {
        const query = this.searchQuery();
        return `/api/search?q=${query}`;
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.getSearchUrl()).toBe('/api/search?q=angular');
  });

  it('should handle query param with very long value', () => {
    const longValue = 'a'.repeat(1000);
    
    mockActivatedRoute.snapshot = {
      queryParams: { longParam: longValue },
    } as any;
    routeQueryParamsSubject.next({ longParam: longValue });

    @Component({
      template: '',
    })
    class TestComponent {
      longParam = useRouteQueryParam<string>('longParam');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.longParam()).toBe(longValue);
    expect(component.longParam()?.length).toBe(1000);
  });

  it('should handle case-sensitive query param names', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { 
        param: 'lowercase',
        Param: 'mixedcase',
        PARAM: 'uppercase'
      },
    } as any;
    routeQueryParamsSubject.next({ 
      param: 'lowercase',
      Param: 'mixedcase',
      PARAM: 'uppercase'
    });

    @Component({
      template: '',
    })
    class TestComponent {
      lowerCaseParam = useRouteQueryParam<string>('param');
      mixedCaseParam = useRouteQueryParam<string>('Param');
      upperCaseParam = useRouteQueryParam<string>('PARAM');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.lowerCaseParam()).toBe('lowercase');
    expect(component.mixedCaseParam()).toBe('mixedcase');
    expect(component.upperCaseParam()).toBe('uppercase');
  });

  it('should work with empty string query param value', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { emptyParam: '' },
    } as any;
    routeQueryParamsSubject.next({ emptyParam: '' });

    @Component({
      template: '',
    })
    class TestComponent {
      emptyParam = useRouteQueryParam<string>('emptyParam');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.emptyParam()).toBe('');
  });

  it('should handle URL-encoded query param values', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { search: 'hello%20world' },
    } as any;
    routeQueryParamsSubject.next({ search: 'hello%20world' });

    @Component({
      template: '',
    })
    class TestComponent {
      search = useRouteQueryParam<string>('search');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.search()).toBe('hello%20world');
  });

  it('should handle query param with comma-separated values', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { tags: 'angular,react,vue' },
    } as any;
    routeQueryParamsSubject.next({ tags: 'angular,react,vue' });

    @Component({
      template: '',
    })
    class TestComponent {
      tags = useRouteQueryParam<string>('tags');
      
      // Simulate parsing tags
      getTagsArray() {
        const tags = this.tags();
        return tags ? tags.split(',') : [];
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.tags()).toBe('angular,react,vue');
    expect(component.getTagsArray()).toEqual(['angular', 'react', 'vue']);
  });

  it('should handle simultaneous updates to multiple query params but only track the specific one', async () => {
    mockActivatedRoute.snapshot = {
      queryParams: { param1: 'value1', param2: 'value2' },
    } as any;
    routeQueryParamsSubject.next({ param1: 'value1', param2: 'value2' });

    @Component({
      template: '',
    })
    class TestComponent {
      param1 = useRouteQueryParam<string>('param1');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.param1()).toBe('value1');

    // Update both params
    routeQueryParamsSubject.next({ param1: 'updated1', param2: 'updated2' });

    await new Promise(resolve => setTimeout(resolve, 50));
      // Should have the updated value for param1
      expect(component.param1()).toBe('updated1');
      
  });

  it('should demonstrate use case for pagination', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { page: '3', limit: '20' },
    } as any;
    routeQueryParamsSubject.next({ page: '3', limit: '20' });

    @Component({
      template: '',
    })
    class TestComponent {
      page = useRouteQueryParam<string>('page');
      limit = useRouteQueryParam<string>('limit');
      
      // Simulate pagination calculation
      getOffset() {
        const page = parseInt(this.page() || '1', 10);
        const limit = parseInt(this.limit() || '10', 10);
        return (page - 1) * limit;
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.getOffset()).toBe(40); // (3 - 1) * 20
  });

  it('should handle query param with numeric zero value', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { offset: '0' },
    } as any;
    routeQueryParamsSubject.next({ offset: '0' });

    @Component({
      template: '',
    })
    class TestComponent {
      offset = useRouteQueryParam<string>('offset');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.offset()).toBe('0');
  });
});








