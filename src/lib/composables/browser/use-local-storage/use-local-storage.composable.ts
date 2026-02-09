import { WritableSignal } from '@angular/core';
import { useStorage, UseStorageOptions } from '../use-storage-base/use-storage-base.composable';

/**
 * Creates a writable signal that automatically syncs with localStorage. The signal persists
 * its value across page reloads and updates when the storage value changes in other tabs/windows.
 *
 * On the server, returns the default value and syncs to actual value once hydrated on the client.
 *
 * @param key - localStorage key to store the value under
 * @param defaultValue - Default value if no stored value exists
 * @param options - Configuration options
 *
 * @example
 * ```ts
 * // Simple counter that persists
 * const counter = useLocalStorage('counter', 0);
 * counter.set(counter() + 1);
 * ```
 *
 * @example
 * ```ts
 * // User preferences
 * const prefs = useLocalStorage('user-prefs', { theme: 'light', fontSize: 16 });
 * prefs.update(p => ({ ...p, theme: 'dark' }));
 * ```
 *
 * @example
 * ```ts
 * // With custom serializer for Date
 * const lastVisit = useLocalStorage('last-visit', new Date(), {
 *   serializer: {
 *     read: (value) => new Date(value),
 *     write: (value) => value.toISOString(),
 *   },
 * });
 * ```
 *
 * @example
 * ```ts
 * // Remove from storage by setting to null
 * const token = useLocalStorage<string | null>('auth-token', null);
 * token.set(null); // Removes from localStorage
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: UseStorageOptions<T> = {},
): WritableSignal<T> {
  return useStorage('localStorage', key, defaultValue, options);
}
