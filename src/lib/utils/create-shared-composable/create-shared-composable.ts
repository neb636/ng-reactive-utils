import { DestroyRef, inject } from '@angular/core';

interface ComposableResult<T> {
  value: T;
  cleanup?: () => void;
}

interface CacheEntry<T> {
  result: T;
  refCount: number;
  cleanup?: () => void;
}

/**
 * Creates a shared instance of a wrapped composable function that uses reference counting.
 * When the last consumer is destroyed, the shared instance and its resources are cleaned up automatically.
 *
 * @example
 * // Basic usage without parameters
 * const useWebSocket = createSharedComposable(() => {
 *   const socket = new WebSocket('wss://api.example.com');
 *   const messages = signal<string[]>([]);
 *
 *   socket.onmessage = (event) => {
 *     messages.update((m) => [...m, event.data]);
 *   };
 *
 *   return {
 *     value: messages.asReadonly(),
 *     cleanup: () => socket.close(),
 *   };
 * });
 *
 * @example
 * // With parameters
 * const useMediaQuery = createSharedComposable((query: string) => {
 *   const document = inject(DOCUMENT);
 *   const mediaQuery = document.defaultView?.matchMedia(query);
 *   const matches = signal(mediaQuery?.matches ?? false);
 *
 *   const handleChange = (event: MediaQueryListEvent) => matches.set(event.matches);
 *   mediaQuery?.addEventListener('change', handleChange);
 *
 *   return {
 *     value: matches.asReadonly(),
 *     cleanup: () => mediaQuery?.removeEventListener('change', handleChange),
 *   };
 * });
 */
export function createSharedComposable<T, Args extends any[]>(
  factory: (...args: Args) => ComposableResult<T>,
): (...args: Args) => T {
  // Cache is scoped to the factory function itself
  const cache = new Map<string, CacheEntry<T>>();

  return (...args: Args): T => {
    const destroyRef = inject(DestroyRef);

    // Create cache key from arguments
    const cacheKey = args.length > 0 ? JSON.stringify(args) : '__default__';

    // Get or create cached entry
    let entry = cache.get(cacheKey);

    if (!entry) {
      // Create new instance
      const result = factory(...args);

      entry = {
        result: result.value,
        refCount: 0,
        cleanup: result.cleanup,
      };

      cache.set(cacheKey, entry);
    }

    // Increment reference count
    entry.refCount++;

    // Register cleanup on component destruction
    destroyRef.onDestroy(() => {
      if (entry) {
        entry.refCount--;

        // If no more references, cleanup and remove from cache
        if (entry.refCount <= 0) {
          entry.cleanup?.();
          cache.delete(cacheKey);
        }
      }
    });

    return entry.result;
  };
}
