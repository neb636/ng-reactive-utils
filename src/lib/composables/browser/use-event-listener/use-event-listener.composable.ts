import {
  inject,
  PLATFORM_ID,
  DestroyRef,
  effect,
  Signal,
  ElementRef,
  isSignal,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type UseEventListenerTarget =
  | Window
  | Document
  | Element
  | ElementRef
  | Signal<Element | ElementRef | null | undefined>
  | null
  | undefined;

export interface UseEventListenerOptions extends AddEventListenerOptions {
  target?: UseEventListenerTarget;
}

/**
 * Attaches an event listener to a target (window, document, or element) with automatic cleanup.
 * The listener is automatically removed when the component is destroyed.
 *
 * @param event - Event name (e.g., 'click', 'keydown')
 * @param handler - Event handler function
 * @param options - Configuration options
 *
 * @remarks
 * **IMPORTANT**: When using signal targets from `viewChild()` or `viewChildren()`, be aware that
 * these signals are `undefined` during constructor execution. The effect will handle this gracefully
 * by not attaching listeners until the signal has a valid value. However, for immediate element
 * access, consider using this in `afterNextRender()` or other lifecycle hooks.
 *
 * **Signal targets**: When a signal target changes, the listener is automatically removed from the
 * old element and attached to the new element. The implementation checks element identity to avoid
 * unnecessary re-registration when the signal emits the same element reference.
 *
 * @example
 * ```ts
 * // Listen to window events - works in constructor
 * constructor() {
 *   useEventListener('keydown', (event) => {
 *     console.log('Key pressed:', event.key);
 *   });
 * }
 * ```
 *
 * @example
 * ```ts
 * // Listen to document events - works in constructor
 * constructor() {
 *   const document = inject(DOCUMENT);
 *   useEventListener('click', (event) => {
 *     console.log('Clicked at:', event.clientX, event.clientY);
 *   }, { target: document });
 * }
 * ```
 *
 * @example
 * ```ts
 * // Listen to element events with viewChild signal
 * // Signal is undefined in constructor but effect handles it gracefully
 * boxRef = viewChild<ElementRef>('box');
 *
 * constructor() {
 *   useEventListener('mouseenter', () => {
 *     console.log('Mouse entered box');
 *   }, { target: this.boxRef });
 * }
 * ```
 *
 * @example
 * ```ts
 * // With passive option for better scroll performance
 * constructor() {
 *   useEventListener('scroll', (event) => {
 *     console.log('Scrolled');
 *   }, { passive: true });
 * }
 * ```
 *
 * @example
 * ```ts
 * // Manual cleanup before component destroy
 * constructor() {
 *   const cleanup = useEventListener('mousemove', (event) => {
 *     console.log('Mouse moved:', event.clientX, event.clientY);
 *   });
 *
 *   // Later, remove the listener early
 *   cleanup();
 * }
 * ```
 *
 * @returns A cleanup function that removes the event listener. Safe to call multiple times.
 */
export function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: UseEventListenerOptions,
): () => void;

export function useEventListener<K extends keyof DocumentEventMap>(
  event: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: UseEventListenerOptions,
): () => void;

export function useEventListener<K extends keyof HTMLElementEventMap>(
  event: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: UseEventListenerOptions,
): () => void;

export function useEventListener(
  event: string,
  handler: (event: Event) => void,
  options?: UseEventListenerOptions,
): () => void;

export function useEventListener(
  event: string,
  handler: (event: Event) => void,
  options: UseEventListenerOptions = {},
): () => void {
  const document = inject(DOCUMENT);
  const platformId = inject(PLATFORM_ID);
  const destroyRef = inject(DestroyRef);
  const isBrowser = isPlatformBrowser(platformId);

  const noop = () => {};

  if (!isBrowser) {
    return noop; // No-op on server
  }

  const { target: targetOption, ...listenerOptions } = options;

  // Determine if target is a signal
  const targetIsSignal = isSignal(targetOption);

  // Track whether cleanup has already been called to make it safe to call multiple times
  let isCleanedUp = false;

  if (targetIsSignal) {
    // Handle signal target with effect
    let currentListenerCleanup: (() => void) | null = null;
    let previousElement: EventTarget | null = null;

    const cleanupEffect = effect(() => {
      const signalValue = (targetOption as Signal<Element | ElementRef | null | undefined>)();
      // For signals, don't default to window - wait for a valid value
      const element = resolveTarget(signalValue, document, false);

      // Only update listener if element reference actually changed
      // This prevents unnecessary re-registration when signal emits same element
      if (element !== previousElement) {
        // Clean up previous listener
        if (currentListenerCleanup) {
          currentListenerCleanup();
          currentListenerCleanup = null;
        }

        // Add new listener if element exists and not already cleaned up
        if (element && !isCleanedUp) {
          element.addEventListener(event, handler, listenerOptions);
          currentListenerCleanup = () => {
            element.removeEventListener(event, handler, listenerOptions);
          };
        }

        previousElement = element;
      }
    });

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      cleanupEffect.destroy();
      if (currentListenerCleanup) {
        currentListenerCleanup();
        currentListenerCleanup = null;
      }
    };

    // Cleanup on destroy: first destroy effect, then remove any remaining listener
    destroyRef.onDestroy(cleanup);

    return cleanup;
  } else {
    // Handle non-signal target
    // For non-signals, default to window if target is null/undefined
    const target = resolveTarget(targetOption, document, true);

    if (!target) {
      return noop;
    }

    target.addEventListener(event, handler, listenerOptions);

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      target.removeEventListener(event, handler, listenerOptions);
    };

    // Cleanup on destroy
    destroyRef.onDestroy(cleanup);

    return cleanup;
  }
}

/**
 * Resolves the target to an event target (Window, Document, or Element)
 * @param target - The target to resolve
 * @param document - The document instance
 * @param defaultToWindow - Whether to default to window when target is null/undefined
 */
function resolveTarget(
  target: Window | Document | Element | ElementRef | null | undefined,
  document: Document,
  defaultToWindow: boolean,
): EventTarget | null {
  if (!target) {
    // For non-signal targets, default to window
    // For signal targets, return null to wait for a valid value
    return defaultToWindow ? document.defaultView : null;
  }

  if (target instanceof ElementRef) {
    return target.nativeElement;
  }

  return target as EventTarget;
}
