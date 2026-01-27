import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { useRouteFragment } from './use-route-fragment.composable';

describe('useRouteFragment', () => {
  let routeFragmentSubject: BehaviorSubject<string | null>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(() => {
    routeFragmentSubject = new BehaviorSubject<string | null>(null);

    mockActivatedRoute = {
      fragment: routeFragmentSubject.asObservable(),
      snapshot: {
        fragment: null,
      } as any,
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });
  });

  it('should return null when no fragment is present', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      fragment = useRouteFragment();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.fragment()).toBeNull();
  });

  it('should return initial fragment from snapshot', () => {
    mockActivatedRoute.snapshot = {
      fragment: 'installation',
    } as any;
    routeFragmentSubject.next('installation');

    @Component({
      template: '',
    })
    class TestComponent {
      fragment = useRouteFragment();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.fragment()).toBe('installation');
  });

  it('should update reactively when fragment changes', async () => {
    mockActivatedRoute.snapshot = {
      fragment: 'section1',
    } as any;
    routeFragmentSubject.next('section1');

    @Component({
      template: '',
    })
    class TestComponent {
      fragment = useRouteFragment();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.fragment()).toBe('section1');

    // Update fragment
    routeFragmentSubject.next('section2');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(component.fragment()).toBe('section2');
  });

  it('should return readonly signal that cannot be directly modified', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      fragment = useRouteFragment();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const fragment = fixture.componentInstance.fragment;

    // Should not have .set() method (readonly signal)
    expect((fragment as any).set).toBeUndefined();
  });

  it('should handle fragment changing from null to a value', async () => {
    @Component({
      template: '',
    })
    class TestComponent {
      fragment = useRouteFragment();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.fragment()).toBeNull();

    // Update fragment to a value
    routeFragmentSubject.next('introduction');

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(component.fragment()).toBe('introduction');
  });

  it('should handle fragment changing from a value to null', async () => {
    mockActivatedRoute.snapshot = {
      fragment: 'overview',
    } as any;
    routeFragmentSubject.next('overview');

    @Component({
      template: '',
    })
    class TestComponent {
      fragment = useRouteFragment();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.fragment()).toBe('overview');

    // Clear fragment
    routeFragmentSubject.next(null);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(component.fragment()).toBeNull();
  });

  it('should work correctly in template bindings', () => {
    mockActivatedRoute.snapshot = {
      fragment: 'features',
    } as any;
    routeFragmentSubject.next('features');

    @Component({
      template: `<p data-testid="fragment">Current section: {{ fragment() }}</p>`,
    })
    class TestComponent {
      fragment = useRouteFragment();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    const fragmentElement = element.querySelector('[data-testid="fragment"]');

    expect(fragmentElement.textContent.trim()).toBe('Current section: features');
  });

  it('should handle fragments with special characters', () => {
    const specialFragment = 'section-1_part-a';

    mockActivatedRoute.snapshot = {
      fragment: specialFragment,
    } as any;
    routeFragmentSubject.next(specialFragment);

    @Component({
      template: '',
    })
    class TestComponent {
      fragment = useRouteFragment();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.fragment()).toBe(specialFragment);
  });

  it('should handle fragments with numbers', () => {
    mockActivatedRoute.snapshot = {
      fragment: '123',
    } as any;
    routeFragmentSubject.next('123');

    @Component({
      template: '',
    })
    class TestComponent {
      fragment = useRouteFragment();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.fragment()).toBe('123');
  });

  it('should maintain separate instances for different components', () => {
    mockActivatedRoute.snapshot = {
      fragment: 'shared',
    } as any;
    routeFragmentSubject.next('shared');

    @Component({
      selector: 'test-component-1',
      template: '',
    })
    class TestComponent1 {
      fragment = useRouteFragment();
    }

    @Component({
      selector: 'test-component-2',
      template: '',
    })
    class TestComponent2 {
      fragment = useRouteFragment();
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    const component1 = fixture1.componentInstance;
    const component2 = fixture2.componentInstance;

    // Both should have the same fragment from the shared ActivatedRoute
    expect(component1.fragment()).toBe('shared');
    expect(component2.fragment()).toBe('shared');
  });

  it('should clean up on component destroy', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      fragment = useRouteFragment();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Destroy component (should clean up without errors)
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should handle multiple rapid fragment changes', async () => {
    mockActivatedRoute.snapshot = {
      fragment: 'section1',
    } as any;
    routeFragmentSubject.next('section1');

    @Component({
      template: '',
    })
    class TestComponent {
      fragment = useRouteFragment();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Rapidly update fragment
    const fragments = ['section2', 'section3', 'section4', 'section5'];
    fragments.forEach((frag) => routeFragmentSubject.next(frag));

    await new Promise((resolve) => setTimeout(resolve, 100));
    // Should have the last value
    expect(component.fragment()).toBe('section5');
  });

  it('should handle empty string fragment', () => {
    mockActivatedRoute.snapshot = {
      fragment: '',
    } as any;
    routeFragmentSubject.next('');

    @Component({
      template: '',
    })
    class TestComponent {
      fragment = useRouteFragment();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.fragment()).toBe('');
  });

  it('should demonstrate use case for smooth scrolling', () => {
    mockActivatedRoute.snapshot = {
      fragment: 'pricing',
    } as any;
    routeFragmentSubject.next('pricing');

    @Component({
      template: '',
    })
    class TestComponent {
      fragment = useRouteFragment();

      // Simulate what would happen in a real component with effect
      scrollToSection() {
        const section = this.fragment();
        if (section) {
          return `Scrolling to: ${section}`;
        }
        return 'No section to scroll to';
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.scrollToSection()).toBe('Scrolling to: pricing');
  });

  it('should handle fragments with URL-encoded characters', () => {
    const encodedFragment = 'section%20with%20spaces';

    mockActivatedRoute.snapshot = {
      fragment: encodedFragment,
    } as any;
    routeFragmentSubject.next(encodedFragment);

    @Component({
      template: '',
    })
    class TestComponent {
      fragment = useRouteFragment();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.fragment()).toBe(encodedFragment);
  });

  it('should handle very long fragment values', () => {
    const longFragment =
      'this-is-a-very-long-fragment-identifier-that-might-be-used-for-deep-linking-in-some-applications';

    mockActivatedRoute.snapshot = {
      fragment: longFragment,
    } as any;
    routeFragmentSubject.next(longFragment);

    @Component({
      template: '',
    })
    class TestComponent {
      fragment = useRouteFragment();
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.fragment()).toBe(longFragment);
  });
});
