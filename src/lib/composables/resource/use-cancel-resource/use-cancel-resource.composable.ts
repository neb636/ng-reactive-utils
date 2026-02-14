import { ResourceRef, Signal } from '@angular/core';

/**
 * Return type for useCancelResource.
 */
export interface UseCancelResourceReturn {
  /** Aborts the in-flight request. No-op if the resource isn't loading. */
  cancel: () => void;
  /** Calls resource.reload() and resets the cancelled state. Returns the result of reload(). */
  retry: () => boolean;
  /** Reactive signal that is true after cancel() is called, resets on retry() or new load. */
  isCancelled: Signal<boolean>;
}

/**
 * Returns a cancel() function that aborts the in-flight request of a ResourceRef
 * and allows retrying. Useful for giving users explicit control over long-running
 * or unwanted network requests.
 *
 * @param resource - A ResourceRef created via resource() or rxResource()
 * @returns An object with cancel(), retry(), and isCancelled signal
 */
// TODO: implement — see docs for design considerations around Angular Resource API constraints
export function useCancelResource<T>(resource: ResourceRef<T>): UseCancelResourceReturn {
  throw new Error('useCancelResource is not yet implemented');
}
