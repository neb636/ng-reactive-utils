import { DestroyRef, Signal, effect, inject, untracked } from '@angular/core';

/**
 * Runs a callback whenever a signal satisfies a predicate condition. The callback is automatically
 * wrapped in `untracked` so that any signals read or written inside it do not create additional
 * reactive dependencies — only the source signal drives re-execution.
 *
 * @param source - The signal to watch
 * @param predicate - A function that receives the signal's current value and returns true when the callback should run
 * @param callback - The side effect to run when the predicate is satisfied
 * @returns A cancel function that stops the effect immediately. Safe to call multiple times.
 *
 * @example
 * onUploadComplete = when(this.uploadStatus, (status) => status === 'complete', () => {
 *   this.showSuccessToast();
 * });
 */
export function when<T>(
  source: Signal<T>,
  predicate: (value: T) => boolean,
  callback: () => void,
): () => void {
  const destroyRef = inject(DestroyRef);

  const effectRef = effect(() => {
    if (predicate(source())) {
      untracked(callback);
    }
  });

  let isCancelled = false;

  const cancel = () => {
    if (isCancelled) return;
    isCancelled = true;
    effectRef.destroy();
  };

  destroyRef.onDestroy(cancel);

  return cancel;
}

/**
 * Runs a callback each time a signal becomes truthy. The callback is automatically wrapped in
 * `untracked` so that any signals read or written inside it do not create additional reactive
 * dependencies — only the source signal drives re-execution.
 *
 * @param source - The signal to watch
 * @param callback - The side effect to run when the signal becomes truthy
 * @returns A cancel function that stops the effect immediately. Safe to call multiple times.
 *
 * @example
 * onOpen = whenTrue(this.isOpen, () => {
 *   this.dashboardCopy.set(cloneDeep(this.dashboard()));
 * });
 */
export function whenTrue(source: Signal<unknown>, callback: () => void): () => void {
  return when(source, Boolean, callback);
}

/**
 * Runs a callback each time a signal becomes falsy. The callback is automatically wrapped in
 * `untracked` so that any signals read or written inside it do not create additional reactive
 * dependencies — only the source signal drives re-execution.
 *
 * @param source - The signal to watch
 * @param callback - The side effect to run when the signal becomes falsy
 * @returns A cancel function that stops the effect immediately. Safe to call multiple times.
 *
 * @example
 * onClose = whenFalse(this.isOpen, () => {
 *   this.dashboardCopy.set(null);
 * });
 */
export function whenFalse(source: Signal<unknown>, callback: () => void): () => void {
  return when(source, (value) => !value, callback);
}
