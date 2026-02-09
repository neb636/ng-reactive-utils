import { signal, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { createSharedComposable } from '../../../utils/create-shared-composable/create-shared-composable';
import { useEventListener } from '../use-event-listener/use-event-listener.composable';

/**
 * Creates a signal that tracks whether a CSS media query matches. The signal automatically
 * updates when the match state changes (e.g., when the window is resized or device orientation changes).
 *
 * This composable is shared across components with the same query string in the same injector context.
 * Components using the same query share one instance; different queries create separate instances.
 * Query strings are normalized (lowercased, whitespace collapsed) for consistent sharing.
 *
 * On the server, returns `false` by default and updates to actual value once hydrated on the client.
 *
 * **Note**: Invalid media query strings will not throw errors but will always return `false`.
 * The browser's `matchMedia()` API silently accepts invalid queries. Ensure your query syntax is correct.
 *
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 *
 * @example
 * ```ts
 * // Basic responsive breakpoint
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * ```
 *
 * @example
 * ```ts
 * // Dark mode detection
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 * ```
 *
 * @example
 * ```ts
 * // Orientation detection
 * const isPortrait = useMediaQuery('(orientation: portrait)');
 * ```
 *
 * @example
 * ```ts
 * // High DPI display detection
 * const isHighDPI = useMediaQuery('(min-resolution: 2dppx)');
 * ```
 */
export const useMediaQuery = (query: string) => {
  // Normalize query BEFORE passing to createSharedComposable to ensure consistent cache keys
  const normalizedQuery = query.toLowerCase().replace(/\s+/g, ' ').trim();

  return createSharedComposable((normalizedQuery: string) => {
    const document = inject(DOCUMENT);
    const platformId = inject(PLATFORM_ID);
    const isBrowser = isPlatformBrowser(platformId);

    const getInitialMatches = () => {
      if (!isBrowser || !document.defaultView) {
        return false;
      }
      return document.defaultView.matchMedia(normalizedQuery).matches;
    };

    const matchesSignal = signal<boolean>(getInitialMatches());

    const handleChange = (event: MediaQueryListEvent) => {
      matchesSignal.set(event.matches);
    };

    // Only set up media query listener in the browser
    if (isBrowser && document.defaultView) {
      const mediaQueryList = document.defaultView.matchMedia(normalizedQuery);

      // Use useEventListener for automatic cleanup
      // MediaQueryList implements EventTarget in modern browsers
      useEventListener('change', handleChange as any, { target: mediaQueryList as any });
    }

    return {
      value: matchesSignal.asReadonly(),
      cleanup: () => {
        // Cleanup is handled by useEventListener or destroyRef
      },
    };
  })(normalizedQuery);
};
