import { inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  useStorage,
  UseStorageOptions,
  UseStorageReturn,
  StorageSerializers,
  StorageSerializer,
} from '../use-storage/use-storage.composable';

export { StorageSerializers, StorageSerializer, UseStorageOptions, UseStorageReturn };

/**
 * Creates a reactive signal bound to localStorage.
 * The signal stays in sync with localStorage and updates across browser tabs.
 *
 * @param key - The localStorage key
 * @param defaultValue - Default value when localStorage is empty
 * @param options - Configuration options
 *
 * @example
 * // Simple string
 * const { value: theme } = useLocalStorage('theme', 'light');
 * theme.set('dark');
 *
 * @example
 * // Object with auto-serialization
 * const { value: settings } = useLocalStorage('settings', { notifications: true, volume: 80 });
 * settings.update(s => ({ ...s, volume: 50 }));
 *
 * @example
 * // With mergeDefaults to handle schema changes
 * const { value: config } = useLocalStorage(
 *   'app-config',
 *   { version: 1, theme: 'light', newFeature: true },
 *   { mergeDefaults: true }
 * );
 *
 * @example
 * // With custom serializer for Date
 * const { value: lastVisit } = useLocalStorage('last-visit', new Date(), {
 *   serializer: StorageSerializers.date
 * });
 *
 * @example
 * // Remove from storage
 * const { value, remove } = useLocalStorage('temp-data', null);
 * remove(); // Clears from localStorage and resets signal
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: UseStorageOptions<T> = {}
): UseStorageReturn<T> {
  const document = inject(DOCUMENT);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  const storage = isBrowser ? document.defaultView?.localStorage : undefined;

  return useStorage(key, defaultValue, storage, options);
}
