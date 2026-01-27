import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { useRouteData } from './use-route-data.composable';

describe('useRouteData', () => {
  let routeDataSubject: BehaviorSubject<any>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(() => {
    routeDataSubject = new BehaviorSubject({});

    mockActivatedRoute = {
      data: routeDataSubject.asObservable(),
      snapshot: {
        data: {},
      } as any,
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });
  });

  it('should return empty object when no route data is present', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      routeData = useRouteData();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.routeData()).toEqual({});
  });

  it('should return initial route data from snapshot', () => {
    mockActivatedRoute.snapshot = {
      data: { role: 'admin', title: 'Admin Panel' },
    } as any;
    routeDataSubject.next({ role: 'admin', title: 'Admin Panel' });

    @Component({
      template: '',
    })
    class TestComponent {
      routeData = useRouteData<{ role: string; title: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.routeData().role).toBe('admin');
    expect(component.routeData().title).toBe('Admin Panel');
  });

  it('should update reactively when route data changes', async () => {
    mockActivatedRoute.snapshot = {
      data: { role: 'user' },
    } as any;
    routeDataSubject.next({ role: 'user' });

    @Component({
      template: '',
    })
    class TestComponent {
      routeData = useRouteData<{ role: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.routeData().role).toBe('user');

    // Update route data
    routeDataSubject.next({ role: 'admin' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(component.routeData().role).toBe('admin');
  });

  it('should return readonly signal that cannot be directly modified', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      routeData = useRouteData();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const routeData = fixture.componentInstance.routeData;

    // Should not have .set() method (readonly signal)
    expect((routeData as any).set).toBeUndefined();
  });

  it('should support type-safe access to route data properties', () => {
    mockActivatedRoute.snapshot = {
      data: {
        role: 'admin',
        title: 'Admin Panel',
        permissions: ['read', 'write', 'delete'],
      },
    } as any;
    routeDataSubject.next({
      role: 'admin',
      title: 'Admin Panel',
      permissions: ['read', 'write', 'delete'],
    });

    @Component({
      template: '',
    })
    class TestComponent {
      routeData = useRouteData<{
        role: string;
        title: string;
        permissions: string[];
      }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const data = component.routeData();

    expect(data.role).toBe('admin');
    expect(data.title).toBe('Admin Panel');
    expect(data.permissions).toEqual(['read', 'write', 'delete']);
  });

  it('should handle null route data by returning empty object', async () => {
    mockActivatedRoute.snapshot = {
      data: null,
    } as any;
    routeDataSubject.next(null);

    @Component({
      template: '',
    })
    class TestComponent {
      routeData = useRouteData();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    await new Promise((resolve) => setTimeout(resolve, 50));
    const component = fixture.componentInstance;
    expect(component.routeData()).toEqual({});
  });

  it('should handle undefined route data by returning empty object', async () => {
    mockActivatedRoute.snapshot = {
      data: undefined,
    } as any;
    routeDataSubject.next(undefined);

    @Component({
      template: '',
    })
    class TestComponent {
      routeData = useRouteData();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    await new Promise((resolve) => setTimeout(resolve, 50));
    const component = fixture.componentInstance;
    expect(component.routeData()).toEqual({});
  });

  it('should work correctly in template bindings', () => {
    mockActivatedRoute.snapshot = {
      data: { title: 'Dashboard' },
    } as any;
    routeDataSubject.next({ title: 'Dashboard' });

    @Component({
      template: `<h1 data-testid="title">{{ routeData().title }}</h1>`,
    })
    class TestComponent {
      routeData = useRouteData<{ title: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    const titleElement = element.querySelector('[data-testid="title"]');

    expect(titleElement.textContent.trim()).toBe('Dashboard');
  });

  it('should handle complex nested object data', () => {
    const complexData = {
      user: {
        id: 1,
        name: 'John Doe',
        preferences: {
          theme: 'dark',
          language: 'en',
        },
      },
      metadata: {
        timestamp: '2025-01-01',
        version: '1.0.0',
      },
    };

    mockActivatedRoute.snapshot = {
      data: complexData,
    } as any;
    routeDataSubject.next(complexData);

    @Component({
      template: '',
    })
    class TestComponent {
      routeData = useRouteData<typeof complexData>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const data = component.routeData();

    expect(data.user.name).toBe('John Doe');
    expect(data.user.preferences.theme).toBe('dark');
    expect(data.metadata.version).toBe('1.0.0');
  });

  it('should maintain separate instances for different components', () => {
    mockActivatedRoute.snapshot = {
      data: { value: 'shared' },
    } as any;
    routeDataSubject.next({ value: 'shared' });

    @Component({
      selector: 'test-component-1',
      template: '',
    })
    class TestComponent1 {
      routeData = useRouteData<{ value: string }>();
    }

    @Component({
      selector: 'test-component-2',
      template: '',
    })
    class TestComponent2 {
      routeData = useRouteData<{ value: string }>();
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    const component1 = fixture1.componentInstance;
    const component2 = fixture2.componentInstance;

    // Both should have the same data from the shared ActivatedRoute
    expect(component1.routeData().value).toBe('shared');
    expect(component2.routeData().value).toBe('shared');
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      routeData = useRouteData();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Destroy component (should clean up without errors)
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should handle route data with boolean values', () => {
    mockActivatedRoute.snapshot = {
      data: { isPublic: true, requiresAuth: false },
    } as any;
    routeDataSubject.next({ isPublic: true, requiresAuth: false });

    @Component({
      template: '',
    })
    class TestComponent {
      routeData = useRouteData<{ isPublic: boolean; requiresAuth: boolean }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.routeData().isPublic).toBe(true);
    expect(component.routeData().requiresAuth).toBe(false);
  });

  it('should handle route data with number values', () => {
    mockActivatedRoute.snapshot = {
      data: { maxUsers: 100, timeout: 5000 },
    } as any;
    routeDataSubject.next({ maxUsers: 100, timeout: 5000 });

    @Component({
      template: '',
    })
    class TestComponent {
      routeData = useRouteData<{ maxUsers: number; timeout: number }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.routeData().maxUsers).toBe(100);
    expect(component.routeData().timeout).toBe(5000);
  });

  it('should handle route data with array values', () => {
    mockActivatedRoute.snapshot = {
      data: { tags: ['angular', 'reactive', 'signals'], ids: [1, 2, 3] },
    } as any;
    routeDataSubject.next({ tags: ['angular', 'reactive', 'signals'], ids: [1, 2, 3] });

    @Component({
      template: '',
    })
    class TestComponent {
      routeData = useRouteData<{ tags: string[]; ids: number[] }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.routeData().tags).toEqual(['angular', 'reactive', 'signals']);
    expect(component.routeData().ids).toEqual([1, 2, 3]);
  });

  it('should handle multiple rapid route data changes', async () => {
    mockActivatedRoute.snapshot = {
      data: { count: 0 },
    } as any;
    routeDataSubject.next({ count: 0 });

    @Component({
      template: '',
    })
    class TestComponent {
      routeData = useRouteData<{ count: number }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Rapidly update route data
    for (let i = 1; i <= 10; i++) {
      routeDataSubject.next({ count: i });
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    // Should have the last value
    expect(component.routeData().count).toBe(10);
  });

  it('should demonstrate use case for permissions checking', () => {
    mockActivatedRoute.snapshot = {
      data: { role: 'admin' },
    } as any;
    routeDataSubject.next({ role: 'admin' });

    @Component({
      template: '',
    })
    class TestComponent {
      routeData = useRouteData<{ role: string }>();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const hasAdminAccess = component.routeData().role === 'admin';

    expect(hasAdminAccess).toBe(true);
  });
});
