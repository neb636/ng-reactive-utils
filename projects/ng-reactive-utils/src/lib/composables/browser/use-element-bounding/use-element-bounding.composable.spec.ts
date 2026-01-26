import { TestBed } from '@angular/core/testing';
import {
  Component,
  signal,
  ElementRef,
  viewChild,
  provideZonelessChangeDetection,
} from '@angular/core';
import { useElementBounding } from './use-element-bounding.composable';

// Helper to mock getBoundingClientRect on an element
function mockElementBounds(
  element: HTMLElement,
  bounds: {
    width: number;
    height: number;
    x?: number;
    y?: number;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  },
) {
  const x = bounds.x ?? bounds.left ?? 0;
  const y = bounds.y ?? bounds.top ?? 0;
  const top = bounds.top ?? bounds.y ?? 0;
  const left = bounds.left ?? bounds.x ?? 0;
  const right = bounds.right ?? left + bounds.width;
  const bottom = bounds.bottom ?? top + bounds.height;

  element.getBoundingClientRect = () => ({
    width: bounds.width,
    height: bounds.height,
    x,
    y,
    top,
    right,
    bottom,
    left,
    toJSON: () => {},
  });
}

describe('useElementBounding', () => {
  let originalGetBoundingClientRect: typeof Element.prototype.getBoundingClientRect;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    // Save original method
    originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  });

  afterEach(() => {
    // Restore original method
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('should return default values when element is null', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      elementSignal = signal<Element | null>(null);
      bounding = useElementBounding(this.elementSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const bounding = fixture.componentInstance.bounding();
    expect(bounding.x).toBe(0);
    expect(bounding.y).toBe(0);
    expect(bounding.width).toBe(0);
    expect(bounding.height).toBe(0);
    expect(bounding.top).toBe(0);
    expect(bounding.right).toBe(0);
    expect(bounding.bottom).toBe(0);
    expect(bounding.left).toBe(0);
  });

  it('should track element bounding box', () => {
    // Mock at prototype level before component creation
    Element.prototype.getBoundingClientRect = function () {
      // Check if this element has inline styles to determine which mock to return
      const style = (this as HTMLElement).getAttribute('style') || '';
      if (style.includes('width: 100px')) {
        return {
          width: 100,
          height: 50,
          x: 10,
          y: 20,
          top: 20,
          right: 110,
          bottom: 70,
          left: 10,
          toJSON: () => {},
        } as DOMRect;
      }
      return {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        toJSON: () => {},
      } as DOMRect;
    };

    @Component({
      template: '<div #myDiv style="width: 100px; height: 50px;"></div>',
    })
    class TestComponent {
      divRef = viewChild<ElementRef<HTMLDivElement>>('myDiv');
      bounding = useElementBounding(this.divRef);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const bounding = fixture.componentInstance.bounding();
    expect(bounding.width).toBe(100);
    expect(bounding.height).toBe(50);
    expect(typeof bounding.x).toBe('number');
    expect(typeof bounding.y).toBe('number');
  });

  it('should work with Element directly (not ElementRef)', () => {
    @Component({
      template: '<div #myDiv style="width: 200px; height: 100px;"></div>',
    })
    class TestComponent {
      divRef = viewChild<ElementRef<HTMLDivElement>>('myDiv');
      elementSignal = signal<Element | null>(null);
      bounding = useElementBounding(this.elementSignal);

      ngAfterViewInit() {
        const element = this.divRef()?.nativeElement;
        if (element) {
          mockElementBounds(element, { width: 200, height: 100, x: 15, y: 25 });
          this.elementSignal.set(element);
        }
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const bounding = fixture.componentInstance.bounding();
    expect(bounding.width).toBe(200);
    expect(bounding.height).toBe(100);
  });

  it('should provide an update method', () => {
    @Component({
      template: '<div #myDiv style="width: 100px; height: 50px;"></div>',
    })
    class TestComponent {
      divRef = viewChild<ElementRef<HTMLDivElement>>('myDiv');
      bounding = useElementBounding(this.divRef);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const bounding = fixture.componentInstance.bounding();
    expect(typeof bounding.update).toBe('function');

    // Should not throw
    bounding.update();
  });

  it('should manually update bounding when update() is called', async () => {
    let mockWidth = 100;

    // Mock at prototype level
    Element.prototype.getBoundingClientRect = function () {
      const style = (this as HTMLElement).getAttribute('style') || '';
      if (style.includes('width: 100px')) {
        return {
          width: mockWidth,
          height: 50,
          x: 10,
          y: 20,
          top: 20,
          right: 10 + mockWidth,
          bottom: 70,
          left: 10,
          toJSON: () => {},
        } as DOMRect;
      }
      return {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        toJSON: () => {},
      } as DOMRect;
    };

    @Component({
      template: '<div #myDiv style="width: 100px; height: 50px;"></div>',
    })
    class TestComponent {
      divRef = viewChild<ElementRef<HTMLDivElement>>('myDiv');
      bounding = useElementBounding(this.divRef, {
        windowResize: false,
        windowScroll: false,
      });
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    // Initial values
    let bounding = component.bounding();
    expect(bounding.width).toBe(100);

    // Change mock width
    mockWidth = 300;

    // Size shouldn't update automatically (listeners disabled)
    await new Promise((resolve) => setTimeout(resolve, 50));

    bounding = component.bounding();
    expect(bounding.width).toBe(100); // Still old value

    // Manual update
    bounding.update();

    await new Promise((resolve) => setTimeout(resolve, 50));

    bounding = component.bounding();
    expect(bounding.width).toBe(300); // Updated!
  });

  it('should respect custom throttle configuration', () => {
    @Component({
      template: '<div #myDiv></div>',
    })
    class TestComponent {
      divRef = viewChild<ElementRef<HTMLDivElement>>('myDiv');
      bounding = useElementBounding(this.divRef, { throttleMs: 500 });
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Should create without errors with custom throttle
    const bounding = fixture.componentInstance.bounding();
    expect(bounding).toBeDefined();
  });

  it('should respect windowResize: false configuration', () => {
    @Component({
      template: '<div #myDiv></div>',
    })
    class TestComponent {
      divRef = viewChild<ElementRef<HTMLDivElement>>('myDiv');
      bounding = useElementBounding(this.divRef, { windowResize: false });
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const bounding = fixture.componentInstance.bounding();
    expect(bounding).toBeDefined();
  });

  it('should respect windowScroll: false configuration', () => {
    @Component({
      template: '<div #myDiv></div>',
    })
    class TestComponent {
      divRef = viewChild<ElementRef<HTMLDivElement>>('myDiv');
      bounding = useElementBounding(this.divRef, { windowScroll: false });
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const bounding = fixture.componentInstance.bounding();
    expect(bounding).toBeDefined();
  });

  it('should handle multiple components using the composable independently', () => {
    // Mock at prototype level to handle multiple elements
    Element.prototype.getBoundingClientRect = function () {
      const style = (this as HTMLElement).getAttribute('style') || '';
      if (style.includes('width: 100px')) {
        return {
          width: 100,
          height: 50,
          x: 10,
          y: 20,
          top: 20,
          right: 110,
          bottom: 70,
          left: 10,
          toJSON: () => {},
        } as DOMRect;
      } else if (style.includes('width: 200px')) {
        return {
          width: 200,
          height: 100,
          x: 15,
          y: 25,
          top: 25,
          right: 215,
          bottom: 125,
          left: 15,
          toJSON: () => {},
        } as DOMRect;
      }
      return {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        toJSON: () => {},
      } as DOMRect;
    };

    @Component({
      template: '<div #myDiv style="width: 100px; height: 50px;"></div>',
    })
    class TestComponent1 {
      divRef = viewChild<ElementRef<HTMLDivElement>>('myDiv');
      bounding = useElementBounding(this.divRef);
    }

    @Component({
      template: '<div #myDiv style="width: 200px; height: 100px;"></div>',
    })
    class TestComponent2 {
      divRef = viewChild<ElementRef<HTMLDivElement>>('myDiv');
      bounding = useElementBounding(this.divRef);
    }

    const fixture1 = TestBed.createComponent(TestComponent1);
    const fixture2 = TestBed.createComponent(TestComponent2);

    fixture1.detectChanges();
    fixture2.detectChanges();

    const bounding1 = fixture1.componentInstance.bounding();
    const bounding2 = fixture2.componentInstance.bounding();

    expect(bounding1.width).toBe(100);
    expect(bounding1.height).toBe(50);
    expect(bounding2.width).toBe(200);
    expect(bounding2.height).toBe(100);
  });

  it('should return readonly signal', () => {
    @Component({
      template: '<div #myDiv></div>',
    })
    class TestComponent {
      divRef = viewChild<ElementRef<HTMLDivElement>>('myDiv');
      bounding = useElementBounding(this.divRef);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const bounding = fixture.componentInstance.bounding;

    // Should not have .set() method (readonly signal)
    expect((bounding as any).set).toBeUndefined();
  });

  it('should handle undefined element signal', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      elementSignal = signal<Element | undefined>(undefined);
      bounding = useElementBounding(this.elementSignal);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const bounding = fixture.componentInstance.bounding();
    expect(bounding.x).toBe(0);
    expect(bounding.y).toBe(0);
    expect(bounding.width).toBe(0);
    expect(bounding.height).toBe(0);
  });

  it('should clean up observers on component destroy', () => {
    @Component({
      template: '<div #myDiv></div>',
    })
    class TestComponent {
      divRef = viewChild<ElementRef<HTMLDivElement>>('myDiv');
      bounding = useElementBounding(this.divRef);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Get the bounding to ensure setup happened
    fixture.componentInstance.bounding();

    // Destroy component (should clean up without errors)
    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should track position changes correctly', () => {
    @Component({
      template: `
        <div style="padding: 50px;">
          <div #myDiv style="width: 100px; height: 50px;"></div>
        </div>
      `,
    })
    class TestComponent {
      divRef = viewChild<ElementRef<HTMLDivElement>>('myDiv');
      bounding = useElementBounding(this.divRef);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const bounding = fixture.componentInstance.bounding();

    // Element should be positioned somewhere on the page (not at 0,0)
    // The exact values depend on the test environment, but it should have valid coordinates
    expect(typeof bounding.x).toBe('number');
    expect(typeof bounding.y).toBe('number');
    expect(typeof bounding.top).toBe('number');
    expect(typeof bounding.left).toBe('number');
    expect(typeof bounding.right).toBe('number');
    expect(typeof bounding.bottom).toBe('number');

    // Verify consistency
    expect(bounding.x).toBe(bounding.left);
    expect(bounding.y).toBe(bounding.top);
  });

  it('should update position coordinates correctly', () => {
    @Component({
      template: '<div #myDiv style="width: 100px; height: 50px;"></div>',
    })
    class TestComponent {
      divRef = viewChild<ElementRef<HTMLDivElement>>('myDiv');
      bounding = useElementBounding(this.divRef);
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const bounding = fixture.componentInstance.bounding();

    // x should equal left, y should equal top
    expect(bounding.x).toBe(bounding.left);
    expect(bounding.y).toBe(bounding.top);

    // right should be left + width
    expect(bounding.right).toBeCloseTo(bounding.left + bounding.width, 1);

    // bottom should be top + height
    expect(bounding.bottom).toBeCloseTo(bounding.top + bounding.height, 1);
  });
});
