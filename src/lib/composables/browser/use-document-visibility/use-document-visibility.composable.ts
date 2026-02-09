import { signal, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { createSharedComposable } from '../../../utils/create-shared-composable/create-shared-composable';
import { useEventListener } from '../use-event-listener/use-event-listener.composable';

/*
 * Creates a signal that tracks whether the document/tab is visible or hidden.
 * The signal updates when the user switches tabs or minimizes the window.
 *
 * On the server, returns `true` (visible) by default and updates to actual value once hydrated on the client.
 *
 * Example:
 *
 * const isVisible = useDocumentVisibility();
 *
 * // Use in template
 * @if (isVisible()) {
 *   <div>Tab is visible</div>
 * } @else {
 *   <div>Tab is hidden</div>
 * }
 */
export const useDocumentVisibility = createSharedComposable(() => {
  const document = inject(DOCUMENT);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // On server, default to visible (true). On client, use actual document.hidden state
  const getInitialVisibility = () => (isBrowser ? !document.hidden : true);

  const visibilitySignal = signal<boolean>(getInitialVisibility());

  const handleVisibilityChange = () => visibilitySignal.set(!document.hidden);

  // Use useEventListener for automatic cleanup
  // Note: visibilitychange event bubbles to window from document
  useEventListener('visibilitychange', handleVisibilityChange);

  return {
    value: visibilitySignal.asReadonly(),
    cleanup: () => {
      // Cleanup is handled by useEventListener
    },
  };
});
