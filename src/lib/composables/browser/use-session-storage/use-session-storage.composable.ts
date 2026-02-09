import { WritableSignal } from '@angular/core';
import { useStorage, UseStorageOptions } from '../use-storage-base/use-storage-base.composable';

/**
 * Creates a writable signal that automatically syncs with sessionStorage. The signal persists
 * its value during the page session (until the tab/window is closed) but does not sync across
 * tabs like localStorage.
 *
 * On the server, returns the default value and syncs to actual value once hydrated on the client.
 *
 * @param key - sessionStorage key to store the value under
 * @param defaultValue - Default value if no stored value exists
 * @param options - Configuration options
 *
 * @example
 * ```ts
 * // Wizard state that clears on tab close
 * const wizardStep = useSessionStorage('wizard-step', 1);
 * wizardStep.set(wizardStep() + 1);
 * ```
 *
 * @example
 * ```ts
 * // Temporary filters
 * const filters = useSessionStorage('filters', { category: 'all', sortBy: 'name' });
 * filters.update(f => ({ ...f, category: 'electronics' }));
 * ```
 */
export function useSessionStorage<T>(
  key: string,
  defaultValue: T,
  options: UseStorageOptions<T> = {},
): WritableSignal<T> {
  return useStorage('sessionStorage', key, defaultValue, options);
}
