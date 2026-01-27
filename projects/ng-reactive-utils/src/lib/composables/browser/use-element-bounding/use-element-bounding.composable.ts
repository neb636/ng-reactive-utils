import { signal, inject, PLATFORM_ID, effect, DestroyRef, Signal, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import throttle from 'lodash-es/throttle';

export type ElementBounding = {
  /** X position relative to the viewport (same as left) */
  x: number;
  /** Y position relative to the viewport (same as top) */
  y: number;
  /** Distance from the top of the viewport */
  top: number;
  /** Distance from the right of the viewport */
  right: number;
  /** Distance from the bottom of the viewport */
  bottom: number;
  /** Distance from the left of the viewport */
  left: number;
  /** Width of the element */
  width: number;
  /** Height of the element */
  height: number;
  /** Forces an update of the bounding box */
  update: () => void;
};

const defaultBounding: Omit<ElementBounding, 'update'> = {
  x: 0,
  y: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: 0,
  height: 0,
};

/**
 * Creates a signal that tracks an element's bounding box (position and dimensions).
 * The signal updates when the element is resized or when the page is scrolled/resized.
 *
 * @param elementSignal - A signal containing the element or ElementRef to track, or null
 * @param config - Optional configuration
 * @param config.throttleMs - Throttle delay for scroll/resize events (default: 100ms)
 * @param config.windowResize - Whether to update on window resize (default: true)
 * @param config.windowScroll - Whether to update on window scroll (default: true)
 *
 * @example
 * ```ts
 * // Track a div element
 * class MyComponent {
 *   divRef = viewChild<ElementRef<HTMLDivElement>>('myDiv');
 *   bounding = useElementBounding(this.divRef);
 *
 *   logPosition() {
 *     const { x, y, width, height } = this.bounding();
 *     console.log(`Position: (${x}, ${y}), Size: ${width}x${height}`);
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * // With custom throttle
 * class MyComponent {
 *   elementRef = viewChild<ElementRef>('element');
 *   bounding = useElementBounding(this.elementRef, { throttleMs: 200 });
 * }
 * ```
 *
 * @example
 * ```ts
 * // Manual updates only (no scroll/resize listeners)
 * class MyComponent {
 *   elementRef = viewChild<ElementRef>('element');
 *   bounding = useElementBounding(this.elementRef, {
 *     windowResize: false,
 *     windowScroll: false,
 *   });
 *
 *   manualUpdate() {
 *     this.bounding().update();
 *   }
 * }
 * ```
 */
export function useElementBounding(
  elementSignal: Signal<Element | ElementRef | null | undefined>,
  config: {
    throttleMs?: number;
    windowResize?: boolean;
    windowScroll?: boolean;
  } = {},
): Signal<ElementBounding> {
  const { throttleMs = 100, windowResize = true, windowScroll = true } = config;

  const platformId = inject(PLATFORM_ID);
  const destroyRef = inject(DestroyRef);
  const isBrowser = isPlatformBrowser(platformId);

  const boundingSignal = signal<ElementBounding>({
    ...defaultBounding,
    update: () => {},
  });

  let resizeObserver: ResizeObserver | null = null;
  let windowListenersActive = false;

  const updateBounding = () => {
    const elementOrRef = elementSignal();
    const element = elementOrRef instanceof ElementRef ? elementOrRef.nativeElement : elementOrRef;

    if (!element || !isBrowser) {
      boundingSignal.update((prev) => ({ ...defaultBounding, update: prev.update }));
      return;
    }

    const rect = element.getBoundingClientRect();
    boundingSignal.update((prev) => ({
      x: rect.x,
      y: rect.y,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      update: prev.update,
    }));
  };

  const throttledUpdate = throttle(updateBounding, throttleMs);

  // Set the update function
  boundingSignal.update((prev) => ({
    ...prev,
    update: updateBounding,
  }));

  if (isBrowser) {
    // Watch for element changes
    effect(() => {
      const elementOrRef = elementSignal();
      const element =
        elementOrRef instanceof ElementRef ? elementOrRef.nativeElement : elementOrRef;

      // Clean up previous observer
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }

      // Clean up window event listeners
      if (windowListenersActive) {
        if (windowResize) {
          window.removeEventListener('resize', throttledUpdate);
        }
        if (windowScroll) {
          window.removeEventListener('scroll', throttledUpdate, true);
        }
        windowListenersActive = false;
      }

      if (element) {
        // Initial update
        updateBounding();

        // Set up ResizeObserver for size changes
        resizeObserver = new ResizeObserver(throttledUpdate);
        resizeObserver.observe(element);

        // Set up window event listeners if enabled
        if (windowResize) {
          window.addEventListener('resize', throttledUpdate);
        }
        if (windowScroll) {
          window.addEventListener('scroll', throttledUpdate, true); // Use capture to catch all scroll events
        }
        windowListenersActive = true;
      } else {
        boundingSignal.update((prev) => ({ ...defaultBounding, update: prev.update }));
      }
    });
  }

  // Cleanup
  destroyRef.onDestroy(() => {
    throttledUpdate.cancel();

    if (resizeObserver) {
      resizeObserver.disconnect();
    }

    if (isBrowser && windowListenersActive) {
      if (windowResize) {
        window.removeEventListener('resize', throttledUpdate);
      }

      if (windowScroll) {
        window.removeEventListener('scroll', throttledUpdate, true);
      }
    }
  });

  return boundingSignal.asReadonly();
}
