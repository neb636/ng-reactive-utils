import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { useRouteParameter } from './use-route-param.composable';

describe('useRouteParameter', () => {
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

  it('should return undefined when parameter does not exist', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      productId = useRouteParameter('productId');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.productId()).toBeUndefined();
  });

  it('should return initial parameter value from snapshot', () => {
    mockActivatedRoute.snapshot = {
      params: { productId: 'abc123' },
    } as any;
    routeParamsSubject.next({ productId: 'abc123' });

    @Component({
      template: '',
    })
    class TestComponent {
      productId = useRouteParameter<string>('productId');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.productId()).toBe('abc123');
  });

  it('should update reactively when parameter changes', async () => {
    mockActivatedRoute.snapshot = {
      params: { userId: '1' },
    } as any;
    routeParamsSubject.next({ userId: '1' });

    @Component({
      template: '',
    })
    class TestComponent {
      userId = useRouteParameter<string>('userId');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.userId()).toBe('1');

    // Update parameter
    routeParamsSubject.next({ userId: '2' });

    await new Promise(resolve => setTimeout(resolve, 50));
      expect(component.userId()).toBe('2');
      
  });

  it('should return readonly signal that cannot be directly modified', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      id = useRouteParameter('id');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const id = fixture.componentInstance.id;

    // Should not have .set() method (readonly signal)
    expect((id as any).set).toBeUndefined();
  });

  it('should handle multiple different parameters in same component', () => {
    mockActivatedRoute.snapshot = {
      params: { userId: '100', postId: '200' },
    } as any;
    routeParamsSubject.next({ userId: '100', postId: '200' });

    @Component({
      template: '',
    })
    class TestComponent {
      userId = useRouteParameter<string>('userId');
      postId = useRouteParameter<string>('postId');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.userId()).toBe('100');
    expect(component.postId()).toBe('200');
  });

  it('should only return the requested parameter value', () => {
    mockActivatedRoute.snapshot = {
      params: { 
        userId: '123',
        postId: '456',
        commentId: '789'
      },
    } as any;
    routeParamsSubject.next({ 
      userId: '123',
      postId: '456',
      commentId: '789'
    });

    @Component({
      template: '',
    })
    class TestComponent {
      userId = useRouteParameter<string>('userId');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    // Should only return the userId, not the entire params object
    expect(component.userId()).toBe('123');
  });

  it('should handle parameter with numeric string value', () => {
    mockActivatedRoute.snapshot = {
      params: { page: '42' },
    } as any;
    routeParamsSubject.next({ page: '42' });

    @Component({
      template: '',
    })
    class TestComponent {
      page = useRouteParameter<string>('page');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.page()).toBe('42');
  });

  it('should work correctly in template bindings', () => {
    mockActivatedRoute.snapshot = {
      params: { productId: 'prod-999' },
    } as any;
    routeParamsSubject.next({ productId: 'prod-999' });

    @Component({
      template: `<h1 data-testid="title">Product ID: {{ productId() }}</h1>`,
    })
    class TestComponent {
      productId = useRouteParameter<string>('productId');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    const titleElement = element.querySelector('[data-testid="title"]');

    expect(titleElement.textContent.trim()).toBe('Product ID: prod-999');
  });

  it('should handle parameter changing from undefined to a value', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      id = useRouteParameter<string>('id');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.id()).toBeUndefined();

    // Add parameter
    routeParamsSubject.next({ id: 'new-id' });

    await new Promise(resolve => setTimeout(resolve, 50));
      expect(component.id()).toBe('new-id');
      
  });

  it('should handle parameter changing from a value to undefined', async () => {
    mockActivatedRoute.snapshot = {
      params: { id: 'existing-id' },
    } as any;
    routeParamsSubject.next({ id: 'existing-id' });

    @Component({
      template: '',
    })
    class TestComponent {
      id = useRouteParameter<string | undefined>('id');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.id()).toBe('existing-id');

    // Remove parameter
    routeParamsSubject.next({});

    await new Promise(resolve => setTimeout(resolve, 50));
      expect(component.id()).toBeUndefined();
      
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
      param = useRouteParameter<string>('sharedParam');
    }

    @Component({
      selector: 'test-component-2',
      template: '',
    })
    class TestComponent2 {
      param = useRouteParameter<string>('sharedParam');
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
      id = useRouteParameter('id');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Destroy component (should clean up without errors)
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should handle rapid parameter changes', async () => {
    mockActivatedRoute.snapshot = {
      params: { count: '0' },
    } as any;
    routeParamsSubject.next({ count: '0' });

    @Component({
      template: '',
    })
    class TestComponent {
      count = useRouteParameter<string>('count');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Rapidly update parameter
    for (let i = 1; i <= 10; i++) {
      routeParamsSubject.next({ count: i.toString() });
    }

    await new Promise(resolve => setTimeout(resolve, 100));
      // Should have the last value
      expect(component.count()).toBe('10');
      
  });

  it('should not be affected by changes to other parameters', async () => {
    mockActivatedRoute.snapshot = {
      params: { id: 'stable', other: 'initial' },
    } as any;
    routeParamsSubject.next({ id: 'stable', other: 'initial' });

    @Component({
      template: '',
    })
    class TestComponent {
      id = useRouteParameter<string>('id');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.id()).toBe('stable');

    // Update only the 'other' parameter
    routeParamsSubject.next({ id: 'stable', other: 'changed' });

    await new Promise(resolve => setTimeout(resolve, 50));
      // 'id' should remain the same
      expect(component.id()).toBe('stable');
      
  });

  it('should handle parameter with UUID format', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    
    mockActivatedRoute.snapshot = {
      params: { resourceId: uuid },
    } as any;
    routeParamsSubject.next({ resourceId: uuid });

    @Component({
      template: '',
    })
    class TestComponent {
      resourceId = useRouteParameter<string>('resourceId');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.resourceId()).toBe(uuid);
  });

  it('should handle parameter with special characters', () => {
    mockActivatedRoute.snapshot = {
      params: { slug: 'hello-world_test' },
    } as any;
    routeParamsSubject.next({ slug: 'hello-world_test' });

    @Component({
      template: '',
    })
    class TestComponent {
      slug = useRouteParameter<string>('slug');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.slug()).toBe('hello-world_test');
  });

  it('should handle null parameter value', async () => {
    mockActivatedRoute.snapshot = {
      params: { optionalParam: null },
    } as any;
    routeParamsSubject.next({ optionalParam: null });

    @Component({
      template: '',
    })
    class TestComponent {
      optionalParam = useRouteParameter<string | null>('optionalParam');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 50));
      const component = fixture.componentInstance;
      expect(component.optionalParam()).toBeNull();
      
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
      productId = useRouteParameter<string>('productId');
      
      // Simulate resource loading
      getProductUrl() {
        const id = this.productId();
        return `/api/products/${id}`;
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.getProductUrl()).toBe('/api/products/prod-123');
  });

  it('should handle parameter with very long value', () => {
    const longValue = 'a'.repeat(1000);
    
    mockActivatedRoute.snapshot = {
      params: { longParam: longValue },
    } as any;
    routeParamsSubject.next({ longParam: longValue });

    @Component({
      template: '',
    })
    class TestComponent {
      longParam = useRouteParameter<string>('longParam');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.longParam()).toBe(longValue);
    expect(component.longParam()?.length).toBe(1000);
  });

  it('should handle case-sensitive parameter names', () => {
    mockActivatedRoute.snapshot = {
      params: { 
        userId: 'lowercase',
        UserId: 'mixedcase',
        USERID: 'uppercase'
      },
    } as any;
    routeParamsSubject.next({ 
      userId: 'lowercase',
      UserId: 'mixedcase',
      USERID: 'uppercase'
    });

    @Component({
      template: '',
    })
    class TestComponent {
      lowerCaseParam = useRouteParameter<string>('userId');
      mixedCaseParam = useRouteParameter<string>('UserId');
      upperCaseParam = useRouteParameter<string>('USERID');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.lowerCaseParam()).toBe('lowercase');
    expect(component.mixedCaseParam()).toBe('mixedcase');
    expect(component.upperCaseParam()).toBe('uppercase');
  });

  it('should work with empty string parameter value', () => {
    mockActivatedRoute.snapshot = {
      params: { emptyParam: '' },
    } as any;
    routeParamsSubject.next({ emptyParam: '' });

    @Component({
      template: '',
    })
    class TestComponent {
      emptyParam = useRouteParameter<string>('emptyParam');
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.emptyParam()).toBe('');
  });
});








