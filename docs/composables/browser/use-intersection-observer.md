# useIntersectionObserver

Creates a signal that tracks when an element intersects with the viewport or a parent element. This composable wraps the native IntersectionObserver API with a reactive Angular interface.

## Usage

### Basic Visibility Detection

```typescript
import { useIntersectionObserver } from 'ng-reactive-utils';
import { Component, viewChild, ElementRef } from '@angular/core';

@Component({
  template: `
    <div #target class="content">
      <p>Scroll to see me!</p>
    </div>
    <p>Element is visible: {{ isVisible() }}</p>
  `,
})
class VisibilityComponent {
  targetRef = viewChild<ElementRef>('target');
  
  { isIntersecting } = useIntersectionObserver(this.targetRef);
  isVisible = computed(() => this.isIntersecting());
}
```

### Lazy Loading Images

```typescript
@Component({
  template: `
    <div #imageContainer class="image-placeholder">
      @if (isVisible()) {
        <img [src]="imageUrl" alt="Lazy loaded">
      } @else {
        <div class="skeleton"></div>
      }
    </div>
  `,
})
class LazyImageComponent {
  imageContainerRef = viewChild<ElementRef>('imageContainer');
  imageUrl = 'https://example.com/large-image.jpg';
  
  { isIntersecting } = useIntersectionObserver(this.imageContainerRef);
  isVisible = computed(() => this.isIntersecting());
}
```

### Trigger Animation on Scroll

```typescript
@Component({
  template: `
    <div 
      #animatedElement 
      class="box"
      [class.fade-in]="hasAppeared()">
      Content appears with animation
    </div>
  `,
  styles: [`
    .box {
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.5s ease;
    }
    
    .box.fade-in {
      opacity: 1;
      transform: translateY(0);
    }
  `],
})
class AnimateOnScrollComponent {
  elementRef = viewChild<ElementRef>('animatedElement');
  
  { isIntersecting } = useIntersectionObserver(this.elementRef, {
    threshold: 0.5, // Trigger when 50% visible
  });
  
  // Once it appears, keep it visible
  hasAppeared = signal(false);
  
  constructor() {
    effect(() => {
      if (this.isIntersecting() && !this.hasAppeared()) {
        this.hasAppeared.set(true);
      }
    });
  }
}
```

### Infinite Scroll

```typescript
@Component({
  template: `
    <div class="items">
      @for (item of items(); track item.id) {
        <div class="item">{{ item.name }}</div>
      }
    </div>
    
    <div #loadMoreTrigger class="load-more-trigger"></div>
    
    @if (isLoading()) {
      <p>Loading more items...</p>
    }
  `,
})
class InfiniteScrollComponent {
  loadMoreTriggerRef = viewChild<ElementRef>('loadMoreTrigger');
  items = signal<Array<{ id: number; name: string }>>([]);
  isLoading = signal(false);
  
  { isIntersecting } = useIntersectionObserver(this.loadMoreTriggerRef, {
    rootMargin: '200px', // Load before user reaches the trigger
  });

  constructor() {
    effect(() => {
      if (this.isIntersecting() && !this.isLoading()) {
        this.loadMoreItems();
      }
    });
  }

  private async loadMoreItems() {
    this.isLoading.set(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newItems = Array.from({ length: 10 }, (_, i) => ({
      id: this.items().length + i,
      name: `Item ${this.items().length + i}`,
    }));
    
    this.items.update(current => [...current, ...newItems]);
    this.isLoading.set(false);
  }
}
```

### Track Intersection Ratio

```typescript
@Component({
  template: `
    <div #progressElement class="scroll-progress">
      <p>Scroll progress: {{ progress() }}%</p>
      <div 
        class="progress-bar" 
        [style.width.%]="progress()">
      </div>
    </div>
  `,
})
class IntersectionProgressComponent {
  elementRef = viewChild<ElementRef>('progressElement');
  
  { intersectionRatio } = useIntersectionObserver(this.elementRef, {
    threshold: Array.from({ length: 101 }, (_, i) => i / 100), // Track every 1%
  });
  
  progress = computed(() => 
    Math.round(this.intersectionRatio() * 100)
  );
}
```

### Multiple Thresholds

```typescript
@Component({
  template: `
    <div #element class="element" [class.level]="visibilityLevel()">
      <p>Visibility: {{ visibilityLevel() }}</p>
    </div>
  `,
})
class ThresholdComponent {
  elementRef = viewChild<ElementRef>('element');
  
  { intersectionRatio } = useIntersectionObserver(this.elementRef, {
    threshold: [0, 0.25, 0.5, 0.75, 1],
  });
  
  visibilityLevel = computed(() => {
    const ratio = this.intersectionRatio();
    if (ratio === 0) return 'hidden';
    if (ratio < 0.5) return 'partially-visible';
    if (ratio < 1) return 'mostly-visible';
    return 'fully-visible';
  });
}
```

### Custom Root Container

```typescript
@Component({
  template: `
    <div #scrollContainer class="scroll-container">
      <div #target class="target">
        Target element
      </div>
      <p>Visible in container: {{ isVisible() }}</p>
    </div>
  `,
  styles: [`
    .scroll-container {
      height: 400px;
      overflow-y: auto;
    }
  `],
})
class CustomRootComponent {
  scrollContainerRef = viewChild<ElementRef>('scrollContainer');
  targetRef = viewChild<ElementRef>('target');
  
  { isIntersecting } = useIntersectionObserver(this.targetRef, {
    root: this.scrollContainerRef,
  });
  
  isVisible = computed(() => this.isIntersecting());
}
```

### Pause/Resume Observation

```typescript
@Component({
  template: `
    <div #element>Observed element</div>
    <button (click)="toggleObservation()">
      {{ isPaused() ? 'Resume' : 'Pause' }} Observation
    </button>
    <p>Is visible: {{ isVisible() }}</p>
  `,
})
class PausableObserverComponent {
  elementRef = viewChild<ElementRef>('element');
  isPaused = signal(false);
  
  { isIntersecting, pause, resume } = useIntersectionObserver(
    this.elementRef,
    { immediate: true }
  );
  
  isVisible = computed(() => this.isIntersecting());
  
  toggleObservation() {
    if (this.isPaused()) {
      resume();
      this.isPaused.set(false);
    } else {
      pause();
      this.isPaused.set(true);
    }
  }
}
```

### Access Full Entry Data

```typescript
@Component({
  template: `
    <div #element class="element">
      <p>Is Intersecting: {{ entry()?.isIntersecting }}</p>
      <p>Intersection Ratio: {{ entry()?.intersectionRatio?.toFixed(2) }}</p>
      <p>Bounding Box: {{ boundingInfo() }}</p>
    </div>
  `,
})
class DetailedIntersectionComponent {
  elementRef = viewChild<ElementRef>('element');
  
  { entry } = useIntersectionObserver(this.elementRef);
  
  boundingInfo = computed(() => {
    const rect = this.entry()?.boundingClientRect;
    if (!rect) return 'N/A';
    return `${rect.width}x${rect.height} at (${rect.x}, ${rect.y})`;
  });
}
```

## Parameters

| Parameter       | Type                                                 | Description                                          |
| --------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `elementSignal` | `Signal<Element \| ElementRef \| null \| undefined>` | Signal containing the element or ElementRef to observe |
| `options`       | `UseIntersectionObserverOptions` (optional)          | Configuration options                                |

### Options Object

| Property      | Type                                                | Default     | Description                                         |
| ------------- | --------------------------------------------------- | ----------- | --------------------------------------------------- |
| `root`        | `Element \| Document \| Signal<Element \| ElementRef \| null \| undefined>` | `null` (viewport) | Root element for intersection (viewport if null) |
| `rootMargin`  | `string`                                            | `'0px'`     | Margin around root (CSS margin syntax)              |
| `threshold`   | `number \| number[]`                                | `0`         | Threshold(s) at which to trigger (0-1)              |
| `immediate`   | `boolean`                                           | `true`      | Start observing immediately                         |

## Returns

Returns an object with the following properties:

| Property             | Type                                    | Description                                              |
| -------------------- | --------------------------------------- | -------------------------------------------------------- |
| `isIntersecting`     | `Signal<boolean>`                       | Whether the element is intersecting                      |
| `intersectionRatio`  | `Signal<number>`                        | How much of the element is visible (0-1)                 |
| `entry`              | `Signal<IntersectionObserverEntry \| null>` | Full IntersectionObserverEntry data                  |
| `pause`              | `() => void`                            | Pause observation                                        |
| `resume`             | `() => void`                            | Resume observation                                       |

## Notes

- **Returned signals are readonly** to prevent direct manipulation
- Uses the native **IntersectionObserver API** for efficient viewport detection
- Automatically **cleans up observer** when component is destroyed
- Handles **dynamic element changes** - if the element signal changes, observation switches to the new element
- On the server, returns default values (`isIntersecting: false`, `intersectionRatio: 0`, `entry: null`) and starts observing once hydrated on the client
- The `threshold` can be a single number or array of numbers between 0 and 1
  - `0` means trigger as soon as any pixel is visible
  - `1` means trigger only when 100% of element is visible
  - `[0, 0.5, 1]` means trigger at 0%, 50%, and 100% visibility
- `rootMargin` accepts CSS margin syntax (e.g., `'10px 20px 30px 40px'` or `'-50px'`)
- When `immediate: false`, observation doesn't start until you call `resume()`

## Common Use Cases

- **Lazy loading**: Load images, videos, or components only when visible
- **Infinite scroll**: Load more content as user scrolls to bottom
- **Analytics**: Track when elements become visible for engagement metrics
- **Animations**: Trigger animations when elements enter viewport
- **Performance**: Defer expensive operations until elements are visible
- **Content loading**: Load article content progressively as user scrolls
- **Ad viewability**: Track when ads are actually viewed

## Performance Tips

- Use `rootMargin` to load content before it's visible (improves perceived performance)
- For infinite scroll, use a generous `rootMargin` like `'200px'` to load before user reaches end
- Use `threshold: 0` for simple visibility detection (most performant)
- Use multiple thresholds only when you need granular visibility tracking
- Consider using `{ passive: true }` with scroll events if combining with other scroll listeners
- Pause observation when not needed to save resources

## Browser Compatibility

IntersectionObserver is supported in all modern browsers. For older browsers, consider using a polyfill or provide fallback behavior.

## Best Practices

### Lazy Loading Pattern

```typescript
// ✅ Good: Load once when visible, then keep loaded
hasLoaded = signal(false);

constructor() {
  effect(() => {
    if (this.isIntersecting() && !this.hasLoaded()) {
      this.loadContent();
      this.hasLoaded.set(true);
    }
  });
}
```

### Infinite Scroll Pattern

```typescript
// ✅ Good: Prevent duplicate loads with loading flag
constructor() {
  effect(() => {
    if (this.isIntersecting() && !this.isLoading() && this.hasMore()) {
      this.loadMore();
    }
  });
}
```

### Animation Pattern

```typescript
// ✅ Good: Use threshold to ensure element is reasonably visible
{ isIntersecting } = useIntersectionObserver(this.elementRef, {
  threshold: 0.3, // Trigger when 30% visible
});
```

## Source

<<< @/../src/lib/composables/browser/use-intersection-observer/use-intersection-observer.composable.ts
