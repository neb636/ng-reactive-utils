import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { useRouteParams } from './use-route-params.composable';

describe('useRouteParams', () => {
  let routeParamsSubject: BehaviorSubject<any>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(() => {
    routeParamsSubject = new BehaviorSubject({});
    
    mockActivatedRoute = {
      params: routeParamsSubject.asObservable(),
      snapshot: {
        params: {},
      } as any,
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });
  });

  it('should return empty object when no route params are present', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.params()).toEqual({});
  });

  it('should return initial route params from snapshot', () => {
    mockActivatedRoute.snapshot = {
      params: { userId: '123', postId: '456' },
    } as any;
    routeParamsSubject.next({ userId: '123', postId: '456' });

    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams<{ userId: string; postId: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.params().userId).toBe('123');
    expect(component.params().postId).toBe('456');
  });

  it('should update reactively when route params change', async () => {
    mockActivatedRoute.snapshot = {
      params: { id: '1' },
    } as any;
    routeParamsSubject.next({ id: '1' });

    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams<{ id: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.params().id).toBe('1');

    // Update route params
    routeParamsSubject.next({ id: '2' });

    await new Promise(resolve => setTimeout(resolve, 50));
      expect(component.params().id).toBe('2');
      
  });

  it('should return readonly signal that cannot be directly modified', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const params = fixture.componentInstance.params;

    // Should not have .set() method (readonly signal)
    expect((params as any).set).toBeUndefined();
  });

  it('should support type-safe access to route params', () => {
    mockActivatedRoute.snapshot = {
      params: { 
        userId: '100',
        postId: '200',
        commentId: '300'
      },
    } as any;
    routeParamsSubject.next({ 
      userId: '100',
      postId: '200',
      commentId: '300'
    });

    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams<{ 
        userId: string; 
        postId: string; 
        commentId: string;
      }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const params = component.params();
    
    expect(params.userId).toBe('100');
    expect(params.postId).toBe('200');
    expect(params.commentId).toBe('300');
  });

  it('should handle single route parameter', () => {
    mockActivatedRoute.snapshot = {
      params: { productId: 'abc123' },
    } as any;
    routeParamsSubject.next({ productId: 'abc123' });

    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams<{ productId: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.params().productId).toBe('abc123');
  });

  it('should handle params with numeric string values', () => {
    mockActivatedRoute.snapshot = {
      params: { page: '42', limit: '10' },
    } as any;
    routeParamsSubject.next({ page: '42', limit: '10' });

    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams<{ page: string; limit: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.params().page).toBe('42');
    expect(component.params().limit).toBe('10');
  });

  it('should handle params with special characters', () => {
    mockActivatedRoute.snapshot = {
      params: { slug: 'hello-world_test' },
    } as any;
    routeParamsSubject.next({ slug: 'hello-world_test' });

    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams<{ slug: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.params().slug).toBe('hello-world_test');
  });

  it('should work correctly in template bindings', () => {
    mockActivatedRoute.snapshot = {
      params: { userId: '999', postId: '777' },
    } as any;
    routeParamsSubject.next({ userId: '999', postId: '777' });

    @Component({
      template: `<h1 data-testid="title">User {{ params().userId }} - Post {{ params().postId }}</h1>`,
    })
    class TestComponent {
      params = useRouteParams<{ userId: string; postId: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    const titleElement = element.querySelector('[data-testid="title"]');

    expect(titleElement.textContent.trim()).toBe('User 999 - Post 777');
  });

  it('should maintain separate instances for different components', () => {
    mockActivatedRoute.snapshot = {
      params: { sharedParam: 'shared-value' },
    } as any;
    routeParamsSubject.next({ sharedParam: 'shared-value' });

    @Component({
      selector: 'test-component-1',
      template: '',
    })
    class TestComponent1 {
      params = useRouteParams<{ sharedParam: string }>();
    }

    @Component({
      selector: 'test-component-2',
      template: '',
    })
    class TestComponent2 {
      params = useRouteParams<{ sharedParam: string }>();
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    const component1 = fixture1.componentInstance;
    const component2 = fixture2.componentInstance;

    // Both should have the same params from the shared ActivatedRoute
    expect(component1.params().sharedParam).toBe('shared-value');
    expect(component2.params().sharedParam).toBe('shared-value');
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Destroy component (should clean up without errors)
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should handle multiple rapid param changes', async () => {
    mockActivatedRoute.snapshot = {
      params: { count: '0' },
    } as any;
    routeParamsSubject.next({ count: '0' });

    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams<{ count: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Rapidly update route params
    for (let i = 1; i <= 10; i++) {
      routeParamsSubject.next({ count: i.toString() });
    }

    await new Promise(resolve => setTimeout(resolve, 100));
      // Should have the last value
      expect(component.params().count).toBe('10');
      
  });

  it('should handle params changing from populated to empty', async () => {
    mockActivatedRoute.snapshot = {
      params: { id: '123' },
    } as any;
    routeParamsSubject.next({ id: '123' });

    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams<{ id?: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.params().id).toBe('123');

    // Clear params
    routeParamsSubject.next({});

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(component.params()).toEqual({});
  });

  it('should handle params with UUID format', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    
    mockActivatedRoute.snapshot = {
      params: { resourceId: uuid },
    } as any;
    routeParamsSubject.next({ resourceId: uuid });

    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams<{ resourceId: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.params().resourceId).toBe(uuid);
  });

  it('should handle params being added dynamically', async () => {
    mockActivatedRoute.snapshot = {
      params: { id: '1' },
    } as any;
    routeParamsSubject.next({ id: '1' });

    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams<{ id: string; extra?: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.params().id).toBe('1');
    expect(component.params().extra).toBeUndefined();

    // Add new param
    routeParamsSubject.next({ id: '1', extra: 'value' });

    await new Promise(resolve => setTimeout(resolve, 50));
      expect(component.params().id).toBe('1');
      expect(component.params().extra).toBe('value');
      
  });

  it('should handle null values in params', async () => {
    mockActivatedRoute.snapshot = {
      params: { optionalParam: null },
    } as any;
    routeParamsSubject.next({ optionalParam: null });

    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams<{ optionalParam: string | null }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 50));
      const component = fixture.componentInstance;
      expect(component.params().optionalParam).toBeNull();
      
  });

  it('should demonstrate use case for resource loading', () => {
    mockActivatedRoute.snapshot = {
      params: { productId: 'prod-123' },
    } as any;
    routeParamsSubject.next({ productId: 'prod-123' });

    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams<{ productId: string }>();
      
      // Simulate resource loading
      getProductUrl() {
        const productId = this.params().productId;
        return `/api/products/${productId}`;
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.getProductUrl()).toBe('/api/products/prod-123');
  });

  it('should handle multiple params update simultaneously', async () => {
    mockActivatedRoute.snapshot = {
      params: { userId: '1', postId: '1' },
    } as any;
    routeParamsSubject.next({ userId: '1', postId: '1' });

    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams<{ userId: string; postId: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.params().userId).toBe('1');
    expect(component.params().postId).toBe('1');

    // Update both params
    routeParamsSubject.next({ userId: '999', postId: '888' });

    await new Promise(resolve => setTimeout(resolve, 50));
      expect(component.params().userId).toBe('999');
      expect(component.params().postId).toBe('888');
      
  });

  it('should handle params with very long values', () => {
    const longValue = 'a'.repeat(1000);
    
    mockActivatedRoute.snapshot = {
      params: { longParam: longValue },
    } as any;
    routeParamsSubject.next({ longParam: longValue });

    @Component({
      template: '',
    })
    class TestComponent {
      params = useRouteParams<{ longParam: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.params().longParam).toBe(longValue);
    expect(component.params().longParam.length).toBe(1000);
  });
});

