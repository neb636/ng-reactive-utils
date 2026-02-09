import { signal, inject, PLATFORM_ID, WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { useEventListener } from '../use-event-listener/use-event-listener.composable';

export interface StorageSerializer<T> {
  /**
   * Deserialize value from storage string
   */
  read: (value: string) => T;
  /**
   * Serialize value to storage string
   */
  write: (value: T) => string;
}

export interface UseStorageOptions<T> {
  /**
   * Custom serializer for complex types.
   * @default JSON serializer
   */
  serializer?: StorageSerializer<T>;
  /**
   * Listen to storage events from other tabs/windows.
   * @default true
   */
  listenToStorageChanges?: boolean;
  /**
   * Write default value to storage on initialization if not present.
   * @default true
   */
  writeDefaults?: boolean;
}

const defaultSerializer: StorageSerializer<any> = {
  read: (value: string) => JSON.parse(value),
  write: (value: any) => JSON.stringify(value),
};

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

/**
 * Internal implementation for storage composables
 */
function useStorage<T>(
  storageType: 'localStorage' | 'sessionStorage',
  key: string,
  defaultValue: T,
  options: UseStorageOptions<T> = {},
): WritableSignal<T> {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  const {
    serializer = defaultSerializer,
    listenToStorageChanges = true,
    writeDefaults = true,
  } = options;

  const storage = isBrowser ? window[storageType] : null;

  // Read initial value from storage or use default
  const getInitialValue = (): T => {
    if (!storage) {
      return defaultValue;
    }

    try {
      const item = storage.getItem(key);
      if (item === null) {
        // No stored value, write default if enabled
        if (writeDefaults) {
          writeToStorage(defaultValue);
        }
        return defaultValue;
      }
      return serializer.read(item);
    } catch (error) {
      console.warn(`Error reading from ${storageType} key "${key}":`, error);
      return defaultValue;
    }
  };

  // Write value to storage
  const writeToStorage = (value: T): void => {
    if (!storage) {
      return;
    }

    try {
      if (value === null) {
        // Remove from storage when value is null
        storage.removeItem(key);
      } else {
        storage.setItem(key, serializer.write(value));
      }
    } catch (error) {
      // Handle quota exceeded errors and other storage errors
      console.warn(`Error writing to ${storageType} key "${key}":`, error);
    }
  };

  // Create writable signal with custom set/update
  const writableSignal = signal<T>(getInitialValue()) as WritableSignal<T>;

  // Override set to persist to storage
  const originalSet = writableSignal.set.bind(writableSignal);
  writableSignal.set = (value: T) => {
    originalSet(value);
    writeToStorage(value);
  };

  // Override update to persist to storage
  const originalUpdate = writableSignal.update.bind(writableSignal);
  writableSignal.update = (updateFn: (value: T) => T) => {
    originalUpdate((currentValue) => {
      const newValue = updateFn(currentValue);
      writeToStorage(newValue);
      return newValue;
    });
  };

  // Listen to storage events for cross-tab synchronization
  if (isBrowser && listenToStorageChanges) {
    const handleStorageChange = (event: StorageEvent) => {
      // Only respond to changes for our key and from other tabs
      if (event.key === key && event.storageArea === storage) {
        try {
          // When storage is cleared/removed, use defaultValue as fallback
          const newValue = event.newValue === null ? defaultValue : serializer.read(event.newValue);
          originalSet(newValue);
        } catch (error) {
          console.warn(`Error handling storage event for key "${key}":`, error);
        }
      }
    };

    // Use useEventListener for automatic cleanup
    useEventListener('storage', handleStorageChange);
  }

  return writableSignal;
}
