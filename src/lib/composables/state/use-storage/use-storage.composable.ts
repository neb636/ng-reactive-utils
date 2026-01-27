import {
  Signal,
  WritableSignal,
  signal,
  effect,
  inject,
  DestroyRef,
  PLATFORM_ID,
  untracked,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

/**
 * Interface for custom serialization of storage values
 */
export interface StorageSerializer<T> {
  read: (raw: string) => T;
  write: (value: T) => string;
}

/**
 * Built-in serializers for common types
 */
export const StorageSerializers: Record<
  'boolean' | 'object' | 'number' | 'string' | 'map' | 'set' | 'date' | 'any',
  StorageSerializer<any>
> = {
  boolean: {
    read: (v: string) => v === 'true',
    write: (v: boolean) => String(v),
  },
  object: {
    read: (v: string) => JSON.parse(v),
    write: (v: any) => JSON.stringify(v),
  },
  number: {
    read: (v: string) => Number.parseFloat(v),
    write: (v: number) => String(v),
  },
  string: {
    read: (v: string) => v,
    write: (v: string) => v,
  },
  map: {
    read: (v: string) => new Map(JSON.parse(v)),
    write: (v: Map<any, any>) => JSON.stringify(Array.from(v.entries())),
  },
  set: {
    read: (v: string) => new Set(JSON.parse(v)),
    write: (v: Set<any>) => JSON.stringify(Array.from(v)),
  },
  date: {
    read: (v: string) => new Date(v),
    write: (v: Date) => v.toISOString(),
  },
  any: {
    read: (v: string) => v,
    write: (v: any) => String(v),
  },
};

/**
 * Options for useStorage composable
 */
export interface UseStorageOptions<T> {
  /**
   * Custom serializer for reading/writing values
   * If not provided, will be auto-detected based on the default value type
   */
  serializer?: StorageSerializer<T>;

  /**
   * Write the default value to storage when it does not exist
   * @default true
   */
  writeDefaults?: boolean;

  /**
   * Listen to storage changes from other tabs/windows
   * @default true
   */
  listenToStorageChanges?: boolean;

  /**
   * Merge the default value with the value read from storage
   * When true, performs a shallow merge for objects
   * Can also be a custom merge function
   * @default false
   */
  mergeDefaults?: boolean | ((storageValue: T, defaults: T) => T);

  /**
   * Error handler for storage operations
   * @default console.error
   */
  onError?: (error: unknown) => void;
}

/**
 * Return type for useStorage composable
 */
export interface UseStorageReturn<T> {
  /**
   * Reactive signal containing the storage value
   */
  readonly value: WritableSignal<T>;

  /**
   * Remove the item from storage and reset to default value
   */
  remove: () => void;
}

type SerializerType = 'boolean' | 'object' | 'number' | 'string' | 'map' | 'set' | 'date' | 'any';

/**
 * Guess the serializer type based on the default value
 */
function guessSerializerType<T>(value: T): SerializerType {
  if (value === null || value === undefined) {
    return 'any';
  }

  if (value instanceof Map) {
    return 'map';
  }

  if (value instanceof Set) {
    return 'set';
  }

  if (value instanceof Date) {
    return 'date';
  }

  const type = typeof value;

  if (type === 'boolean') {
    return 'boolean';
  }

  if (type === 'number') {
    return 'number';
  }

  if (type === 'string') {
    return 'string';
  }

  if (type === 'object') {
    return 'object';
  }

  return 'any';
}

/**
 * Custom event name for same-document storage sync
 */
export const STORAGE_CUSTOM_EVENT_NAME = 'ng-reactive-utils-storage';

interface StorageEventLike {
  key: string | null;
  newValue: string | null;
  storageArea: Storage | null;
}

/**
 * Creates a reactive signal bound to Web Storage (localStorage or sessionStorage).
 * The signal stays in sync with storage and updates across browser tabs.
 *
 * @param key - The storage key
 * @param defaultValue - Default value when storage is empty
 * @param storage - Storage instance (localStorage or sessionStorage)
 * @param options - Configuration options
 *
 * @example
 * // Use with localStorage
 * const { value: theme } = useStorage('theme', 'light', localStorage);
 *
 * // Use with sessionStorage
 * const { value: token } = useStorage('auth-token', '', sessionStorage);
 *
 * // With custom serializer
 * const { value: date } = useStorage('lastVisit', new Date(), localStorage, {
 *   serializer: StorageSerializers.date
 * });
 */
export function useStorage<T>(
  key: string,
  defaultValue: T,
  storage: Storage | undefined,
  options: UseStorageOptions<T> = {}
): UseStorageReturn<T> {
  const document = inject(DOCUMENT);
  const platformId = inject(PLATFORM_ID);
  const destroyRef = inject(DestroyRef);
  const isBrowser = isPlatformBrowser(platformId);
  const window = document.defaultView;

  const {
    writeDefaults = true,
    listenToStorageChanges = true,
    mergeDefaults = false,
    onError = (e) => console.error(e),
  } = options;

  // Determine serializer
  const serializerType = guessSerializerType(defaultValue);
  const serializer = options.serializer ?? StorageSerializers[serializerType];

  // Read initial value from storage
  const readStorageValue = (): T => {
    if (!storage) {
      return defaultValue;
    }

    try {
      const rawValue = storage.getItem(key);

      if (rawValue === null) {
        if (writeDefaults && defaultValue !== null && defaultValue !== undefined) {
          storage.setItem(key, serializer.write(defaultValue));
        }
        return defaultValue;
      }

      const parsedValue = serializer.read(rawValue);

      // Handle merge defaults
      if (mergeDefaults) {
        if (typeof mergeDefaults === 'function') {
          return mergeDefaults(parsedValue, defaultValue);
        }

        // Shallow merge for objects (not arrays)
        if (serializerType === 'object' && !Array.isArray(parsedValue)) {
          return { ...defaultValue, ...parsedValue };
        }
      }

      return parsedValue;
    } catch (error) {
      onError(error);
      return defaultValue;
    }
  };

  // Create the signal with initial value
  const storageSignal = signal<T>(readStorageValue());

  // Flag to prevent infinite loops when updating
  let isUpdatingFromStorage = false;

  // Write value to storage
  const writeToStorage = (value: T): void => {
    if (!storage || isUpdatingFromStorage) {
      return;
    }

    try {
      if (value === null || value === undefined) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, serializer.write(value));
      }

      // Dispatch custom event for same-document sync
      if (window) {
        window.dispatchEvent(
          new CustomEvent<StorageEventLike>(STORAGE_CUSTOM_EVENT_NAME, {
            detail: {
              key,
              newValue: value === null || value === undefined ? null : serializer.write(value),
              storageArea: storage,
            },
          })
        );
      }
    } catch (error) {
      onError(error);
    }
  };

  // Set up effect to sync signal changes to storage
  if (isBrowser && storage) {
    effect(() => {
      const value = storageSignal();
      untracked(() => writeToStorage(value));
    });
  }

  // Handle storage events from other tabs/windows
  const handleStorageEvent = (event: StorageEvent): void => {
    if (event.key !== key || event.storageArea !== storage) {
      return;
    }

    isUpdatingFromStorage = true;
    try {
      if (event.newValue === null) {
        storageSignal.set(defaultValue);
      } else {
        storageSignal.set(serializer.read(event.newValue));
      }
    } catch (error) {
      onError(error);
    } finally {
      isUpdatingFromStorage = false;
    }
  };

  // Handle custom storage events from same document
  const handleCustomStorageEvent = (event: CustomEvent<StorageEventLike>): void => {
    const { key: eventKey, newValue, storageArea } = event.detail;

    if (eventKey !== key || storageArea !== storage) {
      return;
    }

    isUpdatingFromStorage = true;
    try {
      if (newValue === null) {
        storageSignal.set(defaultValue);
      } else {
        storageSignal.set(serializer.read(newValue));
      }
    } catch (error) {
      onError(error);
    } finally {
      isUpdatingFromStorage = false;
    }
  };

  // Set up event listeners for cross-tab sync
  if (isBrowser && window && listenToStorageChanges && storage) {
    window.addEventListener('storage', handleStorageEvent, { passive: true });
    window.addEventListener(STORAGE_CUSTOM_EVENT_NAME, handleCustomStorageEvent as EventListener, {
      passive: true,
    });

    destroyRef.onDestroy(() => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener(
        STORAGE_CUSTOM_EVENT_NAME,
        handleCustomStorageEvent as EventListener
      );
    });
  }

  // Remove function
  const remove = (): void => {
    if (storage) {
      try {
        storage.removeItem(key);
      } catch (error) {
        onError(error);
      }
    }
    storageSignal.set(defaultValue);
  };

  return {
    value: storageSignal,
    remove,
  };
}
