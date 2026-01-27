import { Signal, effect, signal, DestroyRef, inject } from '@angular/core';
import throttle from 'lodash-es/throttle';

/*
 * Creates a throttled signal from a source signal. The initial value is set immediately when created,
 * then subsequent updates are throttled to emit at most once per throttle period. The throttle period
 * begins when the composable is created, so all updates after initialization are throttled.
 *
 * Unlike debounce which waits for a "quiet period", throttle ensures updates happen at regular
 * intervals during continuous activity.
 *
 * @param sourceSignal - The source signal to throttle.
 * @param delayMs - The throttle delay in milliseconds (default: 300).
 *
 * Example:
 *
 * const mouseX = signal(0);
 *
 * // Create a throttled signal for mouse position
 * const throttledX = useThrottledSignal(mouseX, 500);
 *
 * // The initial value (0) is set immediately
 * // Updates will be emitted at most once every 500ms during mouse movement
 */
export function useThrottledSignal<T>(sourceSignal: Signal<T>, delayMs: number = 300): Signal<T> {
  const throttledSignal = signal<T>(sourceSignal());
  const destroyRef = inject(DestroyRef);

  const throttledUpdate = throttle((value: T) => {
    throttledSignal.set(value);
  }, delayMs);

  effect(() => {
    const value = sourceSignal();
    throttledUpdate(value);
  });

  destroyRef.onDestroy(() => {
    throttledUpdate.cancel();
  });

  return throttledSignal.asReadonly();
}
