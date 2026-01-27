import { Signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type SyncLocalStorageEffectConfig = {
  signal: Signal<any>;
  key: string;
  serialize?: (value: any) => string;
};

/**
 * Effect that syncs a signal to localStorage (one-way: signal → storage).
 * This is useful when you want to persist signal changes but don't need
 * two-way sync (use useLocalStorage composable for that).
 *
 * @param config - Configuration object
 * @param config.signal - Signal to sync to localStorage
 * @param config.key - localStorage key to sync to
 * @param config.serialize - Optional custom serialization function
 *
 * Example:
 *
 * export class MyComponent {
 *   private formData = signal({ name: '', email: '' });
 *
 *   constructor() {
 *     // Sync form data to localStorage whenever it changes
 *     syncLocalStorageEffect({
 *       signal: this.formData,
 *       key: 'form-data'
 *     });
 *   }
 * }
 */
export const syncLocalStorageEffect = (config: SyncLocalStorageEffectConfig) => {
  const document = inject(DOCUMENT);
  const storage = document.defaultView?.localStorage;

  if (!storage) {
    console.warn('localStorage is not available');
    return;
  }

  const { signal, key, serialize = JSON.stringify } = config;

  return effect(() => {
    const value = signal();
    try {
      storage.setItem(key, serialize(value));
    } catch (error) {
      console.warn(`Failed to save to localStorage for key "${key}":`, error);
    }
  });
};
