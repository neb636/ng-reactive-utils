# useElementBounding

Creates a signal that tracks an element's bounding box (position and dimensions). The signal automatically updates when the element is resized or when the page is scrolled/resized.

## Usage

### Basic Usage

```typescript
import { useElementBounding } from 'ng-reactive-utils';
import { Component, viewChild, ElementRef } from '@angular/core';

@Component({
  template: `
    <div #box class="box">Drag me around</div>
    <div class="info">
      <p>Position: {{ bounding().x }}, {{ bounding().y }}</p>
      <p>Size: {{ bounding().width }} × {{ bounding().height }}</p>
      <p>Top: {{ bounding().top }}, Left: {{ bounding().left }}</p>
    </div>
  `,
})
class BoxTrackerComponent {
  boxRef = viewChild<ElementRef>('box');
  bounding = useElementBounding(this.boxRef);
}
```

### With Custom Configuration

```typescript
@Component({
  template: `<div #element>Content</div>`,
})
class CustomConfigComponent {
  elementRef = viewChild<ElementRef>('element');

  // Custom throttle for less frequent updates
  bounding = useElementBounding(this.elementRef, {
    throttleMs: 200,
    windowResize: true,
    windowScroll: true,
  });
}
```

### Manual Updates Only

```typescript
@Component({
  template: `
    <div #element>Content</div>
    <button (click)="bounding().update()">Update Position</button>
  `,
})
class ManualUpdateComponent {
  elementRef = viewChild<ElementRef>('element');

  // Disable automatic updates
  bounding = useElementBounding(this.elementRef, {
    windowResize: false,
    windowScroll: false,
  });
}
```

### With Element Signal

```typescript
@Component({
  template: `
    <div #div1>Element 1</div>
    <div #div2>Element 2</div>
    <button (click)="switchElement()">Switch</button>
    <p>Width: {{ bounding().width }}</p>
  `,
})
class SwitchableElementComponent {
  div1Ref = viewChild<ElementRef>('div1');
  div2Ref = viewChild<ElementRef>('div2');

  currentElement = signal<ElementRef | null>(null);
  bounding = useElementBounding(this.currentElement);

  ngAfterViewInit() {
    this.currentElement.set(this.div1Ref()!);
  }

  switchElement() {
    const current = this.currentElement();
    const newElement = current === this.div1Ref() ? this.div2Ref() : this.div1Ref();
    this.currentElement.set(newElement!);
  }
}
```

### Sticky Header Detection

```typescript
@Component({
  template: ` <header #header [class.stuck]="isStuck()">Sticky Header</header> `,
})
class StickyHeaderComponent {
  headerRef = viewChild<ElementRef>('header');
  bounding = useElementBounding(this.headerRef);

  isStuck = computed(() => this.bounding().top <= 0);
}
```

### Intersection Detection

```typescript
@Component({
  template: `
    <div #box1>Box 1</div>
    <div #box2>Box 2</div>
    <p>Boxes overlapping: {{ areOverlapping() }}</p>
  `,
})
class OverlapDetectionComponent {
  box1Ref = viewChild<ElementRef>('box1');
  box2Ref = viewChild<ElementRef>('box2');

  box1Bounding = useElementBounding(this.box1Ref);
  box2Bounding = useElementBounding(this.box2Ref);

  areOverlapping = computed(() => {
    const b1 = this.box1Bounding();
    const b2 = this.box2Bounding();

    return !(b1.right < b2.left || b1.left > b2.right || b1.bottom < b2.top || b1.top > b2.bottom);
  });
}
```

### Viewport Visibility Detection

```typescript
@Component({
  template: `
    <div #element>Content</div>
    <p>Visible: {{ isInViewport() }}</p>
  `,
})
class ViewportVisibilityComponent {
  elementRef = viewChild<ElementRef>('element');
  bounding = useElementBounding(this.elementRef);

  isInViewport = computed(() => {
    const { top, bottom, left, right } = this.bounding();
    return top >= 0 && left >= 0 && bottom <= window.innerHeight && right <= window.innerWidth;
  });
}
```

## Parameters

| Parameter       | Type                                                 | Description                                          |
| --------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `elementSignal` | `Signal<Element \| ElementRef \| null \| undefined>` | Signal containing the element or ElementRef to track |
| `config`        | `object`                                             | Optional configuration object                        |

### Configuration Object

| Property       | Type      | Default | Description                                  |
| -------------- | --------- | ------- | -------------------------------------------- |
| `throttleMs`   | `number`  | `100`   | Throttle delay for scroll/resize events (ms) |
| `windowResize` | `boolean` | `true`  | Whether to update on window resize           |
| `windowScroll` | `boolean` | `true`  | Whether to update on window scroll           |

## Returns

`Signal<ElementBounding>` - A readonly signal containing the element's bounding information

### ElementBounding Type

```typescript
type ElementBounding = {
  x: number; // X position relative to viewport (same as left)
  y: number; // Y position relative to viewport (same as top)
  top: number; // Distance from top of viewport
  right: number; // Distance from right of viewport
  bottom: number; // Distance from bottom of viewport
  left: number; // Distance from left of viewport
  width: number; // Width of the element
  height: number; // Height of the element
  update: () => void; // Force an immediate update
};
```

## Notes

- **Returned signal is readonly** to prevent direct manipulation
- Uses **ResizeObserver** to efficiently track element size changes
- Listens to **window scroll** and **resize** events for position updates (configurable)
- All measurements are in **pixels** relative to the viewport
- `x` is equivalent to `left`, and `y` is equivalent to `top`
- Throttles updates by default (100ms) to prevent excessive recalculations
- Event listeners and observers are **automatically cleaned up** on component destruction
- On the server, returns default values (all zeros) and updates to actual values once hydrated on the client
- Each component instance gets its **own tracking** (not shared like `useMousePosition`)
- The `update()` method can be used to **force an immediate update** of the bounding box
- Disabling `windowResize` and `windowScroll` will only track size changes via ResizeObserver

## Common Use Cases

- **Position tracking**: Track element position for tooltips, popovers, or custom dropdowns
- **Scroll animations**: Trigger animations based on element position in viewport
- **Sticky elements**: Detect when elements become stuck/unsticky
- **Collision detection**: Check if elements overlap or intersect
- **Lazy loading**: Load content when elements enter viewport
- **Responsive layouts**: Adjust layout based on element dimensions
- **Drag and drop**: Track element bounds during drag operations

## Source

<<< @/../src/lib/composables/browser/use-element-bounding/use-element-bounding.composable.ts
