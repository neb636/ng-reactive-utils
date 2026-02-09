import { signal, inject, PLATFORM_ID, DestroyRef, WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StorageSerializer, UseStorageOptions } from './types';

const defaultSerializer: StorageSerializer<any> = {
  read: (value: string) => JSON.parse(value),
  write: (value: any) => JSON.stringify(value),
};

/**
 * Internal implementation for storage composables
 */
export function useStorage<T>(
  storageType: 'localStorage' | 'sessionStorage',
  key: string,
  defaultValue: T,
  options: UseStorageOptions<T> = {},
): WritableSignal<T> {
  const platformId = inject(PLATFORM_ID);
  const destroyRef = inject(DestroyRef);
  const isBrowser = isPlatformBrowser(platformId);

  const { serializer = defaultSerializer, writeDefaults = true } = options;

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
  if (isBrowser) {
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

    window.addEventListener('storage', handleStorageChange);

    destroyRef.onDestroy(() => {
      window.removeEventListener('storage', handleStorageChange);
    });
  }

  return writableSignal;
}
