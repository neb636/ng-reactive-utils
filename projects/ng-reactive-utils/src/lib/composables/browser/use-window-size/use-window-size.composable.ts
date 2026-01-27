import { signal, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { debounce } from 'lodash-es';
import { createSharedComposable } from '../../../utils/create-shared-composable/create-shared-composable';

export type WindowSize = {
  width: number;
  height: number;
};

/**
 * Creates signals that track the window size (width and height). The signals update
 * when the window is resized, with debouncing to prevent excessive updates.
 *
 * This composable is shared across components with the same parameters in the same injector context.
 * Components using the same debounce value share one instance; different values create separate instances.
 *
 * On the server, returns default values (0, 0) and updates to actual values once hydrated on the client.
 *
 * @param debounceMs - Debounce delay for resize events (default: 100ms)
 *
 * @example
 * ```ts
 * // Default debounce (100ms) - shares instance with other components using default
 * const windowSize = useWindowSize();
 * const { width, height } = windowSize();
 * ```
 *
 * @example
 * ```ts
 * // Custom debounce (300ms) - creates separate instance for this debounce value
 * const windowSize = useWindowSize(300);
 * ```
 */
export const useWindowSize = createSharedComposable((debounceMs: number = 100) => {
  const document = inject(DOCUMENT);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  const getWindowSize = (): WindowSize => ({
    width: document.defaultView?.innerWidth ?? 0,
    height: document.defaultView?.innerHeight ?? 0,
  });

  const windowSizeSignal = signal<WindowSize>(getWindowSize());
  const handleResize = () => windowSizeSignal.set(getWindowSize());
  const debouncedHandleResize = debounce(handleResize, debounceMs);

  // Only set up event listeners in the browser
  if (isBrowser && document.defaultView) {
    document.defaultView.addEventListener('resize', debouncedHandleResize);
  }

  // Cleanup and return readonly signal
  return {
    value: windowSizeSignal.asReadonly(),
    cleanup: () => {
      if (isBrowser && document.defaultView) {
        document.defaultView.removeEventListener('resize', debouncedHandleResize);
      }
      debouncedHandleResize.cancel();
    },
  };
});
