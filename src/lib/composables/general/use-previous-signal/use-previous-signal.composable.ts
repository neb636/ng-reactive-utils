import { Signal, effect, signal } from '@angular/core';

/*
 * Creates a signal that tracks the previous value of a source signal. Useful for comparing
 * current vs previous state or implementing undo functionality.
 *
 * @param sourceSignal - The source signal to track the previous value of.
 *
 * Example:
 *
 * const currentValue = signal('hello');
 * const previousValue = usePreviousSignal(currentValue);
 *
 * // previousValue() will be undefined initially, then track the previous value
 * console.log(previousValue()); // undefined
 * currentValue.set('world');
 * console.log(previousValue()); // 'hello'
 */
export function usePreviousSignal<T>(sourceSignal: Signal<T>): Signal<T | undefined> {
  const previousSignal = signal<T | undefined>(undefined);
  let lastValue: T | undefined = undefined;
  let isFirstRun = true;

  // Track changes via effect to avoid side effects inside computed
  effect(() => {
    const currentValue = sourceSignal();
    if (!isFirstRun) {
      previousSignal.set(lastValue);
    }
    lastValue = currentValue;
    isFirstRun = false;
  });

  return previousSignal.asReadonly();
}
