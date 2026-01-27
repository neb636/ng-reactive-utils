import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { useRouteQueryParams } from './use-route-query-params.composable';

describe('useRouteQueryParams', () => {
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

  it('should return empty object when no query params are present', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.queryParams()).toEqual({});
  });

  it('should return initial query params from snapshot', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { category: 'electronics', sort: 'price' },
    } as any;
    routeQueryParamsSubject.next({ category: 'electronics', sort: 'price' });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ category: string; sort: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.queryParams().category).toBe('electronics');
    expect(component.queryParams().sort).toBe('price');
  });

  it('should update reactively when query params change', async () => {
    mockActivatedRoute.snapshot = {
      queryParams: { query: 'angular' },
    } as any;
    routeQueryParamsSubject.next({ query: 'angular' });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ query: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.queryParams().query).toBe('angular');

    // Update query params
    routeQueryParamsSubject.next({ query: 'react' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(component.queryParams().query).toBe('react');
  });

  it('should return readonly signal that cannot be directly modified', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const queryParams = fixture.componentInstance.queryParams;

    // Should not have .set() method (readonly signal)
    expect((queryParams as any).set).toBeUndefined();
  });

  it('should support type-safe access to query params', () => {
    mockActivatedRoute.snapshot = {
      queryParams: {
        category: 'books',
        sort: 'date',
        order: 'asc',
        page: '1',
      },
    } as any;
    routeQueryParamsSubject.next({
      category: 'books',
      sort: 'date',
      order: 'asc',
      page: '1',
    });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{
        category: string;
        sort: string;
        order: string;
        page: string;
      }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const params = component.queryParams();

    expect(params.category).toBe('books');
    expect(params.sort).toBe('date');
    expect(params.order).toBe('asc');
    expect(params.page).toBe('1');
  });

  it('should handle single query parameter', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { search: 'test query' },
    } as any;
    routeQueryParamsSubject.next({ search: 'test query' });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ search: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.queryParams().search).toBe('test query');
  });

  it('should handle optional query parameters', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { required: 'value' },
    } as any;
    routeQueryParamsSubject.next({ required: 'value' });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ required: string; optional?: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.queryParams().required).toBe('value');
    expect(component.queryParams().optional).toBeUndefined();
  });

  it('should work correctly in template bindings', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { category: 'electronics' },
    } as any;
    routeQueryParamsSubject.next({ category: 'electronics' });

    @Component({
      template: `<h1 data-testid="title">Category: {{ queryParams().category }}</h1>`,
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ category: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    const titleElement = element.querySelector('[data-testid="title"]');

    expect(titleElement.textContent.trim()).toBe('Category: electronics');
  });

  it('should maintain separate instances for different components', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { shared: 'value' },
    } as any;
    routeQueryParamsSubject.next({ shared: 'value' });

    @Component({
      selector: 'test-component-1',
      template: '',
    })
    class TestComponent1 {
      queryParams = useRouteQueryParams<{ shared: string }>();
    }

    @Component({
      selector: 'test-component-2',
      template: '',
    })
    class TestComponent2 {
      queryParams = useRouteQueryParams<{ shared: string }>();
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    const component1 = fixture1.componentInstance;
    const component2 = fixture2.componentInstance;

    // Both should have the same query params from the shared ActivatedRoute
    expect(component1.queryParams().shared).toBe('value');
    expect(component2.queryParams().shared).toBe('value');
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Destroy component (should clean up without errors)
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should handle multiple rapid query param changes', async () => {
    mockActivatedRoute.snapshot = {
      queryParams: { count: '0' },
    } as any;
    routeQueryParamsSubject.next({ count: '0' });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ count: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Rapidly update query params
    for (let i = 1; i <= 10; i++) {
      routeQueryParamsSubject.next({ count: i.toString() });
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    // Should have the last value
    expect(component.queryParams().count).toBe('10');
  });

  it('should handle query params changing from populated to empty', async () => {
    mockActivatedRoute.snapshot = {
      queryParams: { filter: 'active' },
    } as any;
    routeQueryParamsSubject.next({ filter: 'active' });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ filter?: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.queryParams().filter).toBe('active');

    // Clear query params
    routeQueryParamsSubject.next({});

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(component.queryParams()).toEqual({});
  });

  it('should handle query params with special characters', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { search: 'hello world', filter: 'tag:angular' },
    } as any;
    routeQueryParamsSubject.next({ search: 'hello world', filter: 'tag:angular' });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ search: string; filter: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.queryParams().search).toBe('hello world');
    expect(component.queryParams().filter).toBe('tag:angular');
  });

  it('should handle query params being added dynamically', async () => {
    mockActivatedRoute.snapshot = {
      queryParams: { existing: 'value' },
    } as any;
    routeQueryParamsSubject.next({ existing: 'value' });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ existing: string; new?: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.queryParams().existing).toBe('value');
    expect(component.queryParams().new).toBeUndefined();

    // Add new query param
    routeQueryParamsSubject.next({ existing: 'value', new: 'param' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(component.queryParams().existing).toBe('value');
    expect(component.queryParams().new).toBe('param');
  });

  it('should handle query params being removed dynamically', async () => {
    mockActivatedRoute.snapshot = {
      queryParams: { param1: 'value1', param2: 'value2' },
    } as any;
    routeQueryParamsSubject.next({ param1: 'value1', param2: 'value2' });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ param1?: string; param2?: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.queryParams().param1).toBe('value1');
    expect(component.queryParams().param2).toBe('value2');

    // Remove param2
    routeQueryParamsSubject.next({ param1: 'value1' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(component.queryParams().param1).toBe('value1');
    expect(component.queryParams().param2).toBeUndefined();
  });

  it('should demonstrate use case for product filtering', () => {
    mockActivatedRoute.snapshot = {
      queryParams: {
        category: 'electronics',
        sort: 'price',
        order: 'asc',
      },
    } as any;
    routeQueryParamsSubject.next({
      category: 'electronics',
      sort: 'price',
      order: 'asc',
    });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{
        category: string;
        sort: string;
        order: string;
      }>();

      // Simulate resource loading
      getFilterUrl() {
        const params = this.queryParams();
        return `/api/products?category=${params.category}&sort=${params.sort}&order=${params.order}`;
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.getFilterUrl()).toBe(
      '/api/products?category=electronics&sort=price&order=asc',
    );
  });

  it('should handle multiple query params update simultaneously', async () => {
    mockActivatedRoute.snapshot = {
      queryParams: { page: '1', limit: '10' },
    } as any;
    routeQueryParamsSubject.next({ page: '1', limit: '10' });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ page: string; limit: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.queryParams().page).toBe('1');
    expect(component.queryParams().limit).toBe('10');

    // Update both params
    routeQueryParamsSubject.next({ page: '5', limit: '25' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(component.queryParams().page).toBe('5');
    expect(component.queryParams().limit).toBe('25');
  });

  it('should handle query params with numeric string values', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { page: '1', limit: '20', offset: '100' },
    } as any;
    routeQueryParamsSubject.next({ page: '1', limit: '20', offset: '100' });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ page: string; limit: string; offset: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.queryParams().page).toBe('1');
    expect(component.queryParams().limit).toBe('20');
    expect(component.queryParams().offset).toBe('100');
  });

  it('should handle query params with boolean-like string values', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { active: 'true', archived: 'false' },
    } as any;
    routeQueryParamsSubject.next({ active: 'true', archived: 'false' });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ active: string; archived: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.queryParams().active).toBe('true');
    expect(component.queryParams().archived).toBe('false');
  });

  it('should handle empty string query param values', () => {
    mockActivatedRoute.snapshot = {
      queryParams: { search: '', filter: '' },
    } as any;
    routeQueryParamsSubject.next({ search: '', filter: '' });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ search: string; filter: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.queryParams().search).toBe('');
    expect(component.queryParams().filter).toBe('');
  });

  it('should handle query params with very long values', () => {
    const longValue = 'a'.repeat(1000);

    mockActivatedRoute.snapshot = {
      queryParams: { longParam: longValue },
    } as any;
    routeQueryParamsSubject.next({ longParam: longValue });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ longParam: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.queryParams().longParam).toBe(longValue);
    expect(component.queryParams().longParam.length).toBe(1000);
  });

  it('should handle query params with URL-encoded values', () => {
    mockActivatedRoute.snapshot = {
      queryParams: {
        search: 'hello%20world',
        tag: 'angular%2Freact',
      },
    } as any;
    routeQueryParamsSubject.next({
      search: 'hello%20world',
      tag: 'angular%2Freact',
    });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{ search: string; tag: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.queryParams().search).toBe('hello%20world');
    expect(component.queryParams().tag).toBe('angular%2Freact');
  });

  it('should demonstrate use case for search with filters', () => {
    mockActivatedRoute.snapshot = {
      queryParams: {
        query: 'angular',
        sort: 'date',
        tags: 'reactive,signals',
      },
    } as any;
    routeQueryParamsSubject.next({
      query: 'angular',
      sort: 'date',
      tags: 'reactive,signals',
    });

    @Component({
      template: '',
    })
    class TestComponent {
      queryParams = useRouteQueryParams<{
        query: string;
        sort: string;
        tags: string;
      }>();

      // Simulate parsing tags
      getTags() {
        const params = this.queryParams();
        return params.tags?.split(',') || [];
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.getTags()).toEqual(['reactive', 'signals']);
  });
});
