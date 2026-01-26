import { signal, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import throttle from 'lodash-es/throttle';
import { createSharedComposable } from '../../../utils/create-shared-composable/create-shared-composable';

export type MousePosition = { x: number; y: number };

/**
 * Creates signals that track the mouse position (x and y coordinates). The signals update
 * when the mouse moves, with throttling to prevent excessive updates.
 *
 * This composable is shared across components with the same parameters in the same injector context.
 * Components using the same throttle value share one instance; different values create separate instances.
 *
 * On the server, returns default values (0, 0) and updates to actual values once hydrated on the client.
 *
 * @param throttleMs - Throttle delay for mouse move events (default: 100ms)
 *
 * @example
 * ```ts
 * // Default throttle (100ms) - shares instance with other components using default
 * const mousePosition = useMousePosition();
 * const { x, y } = mousePosition();
 * ```
 *
 * @example
 * ```ts
 * // Custom throttle (200ms) - creates separate instance for this throttle value
 * const mousePosition = useMousePosition(200);
 * ```
 */
export const useMousePosition = createSharedComposable(
  (throttleMs: number = 100) => {
    const document = inject(DOCUMENT);
    const platformId = inject(PLATFORM_ID);
    const isBrowser = isPlatformBrowser(platformId);
    const mousePosition = signal<MousePosition>({ x: 0, y: 0 });

    const updatePosition = (event: MouseEvent) => {
      mousePosition.set({ x: event.clientX, y: event.clientY });
    };

    const throttledUpdatePosition = throttle(updatePosition, throttleMs);

    // Only set up event listeners in the browser
    if (isBrowser && document.defaultView) {
      document.defaultView.addEventListener(
        'mousemove',
        throttledUpdatePosition,
      );
    }

    return {
      value: mousePosition.asReadonly(),
      cleanup: () => {
        throttledUpdatePosition.cancel();
        if (isBrowser && document.defaultView) {
          document.defaultView.removeEventListener(
            'mousemove',
            throttledUpdatePosition,
          );
        }
      },
    };
  },
);
