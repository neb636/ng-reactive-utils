import { Signal, EffectRef, effect, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type SyncLocalStorageEffectConfig<T> = {
  signal: Signal<T>;
  key: string;
  serialize?: (value: T) => string;
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
export const syncLocalStorageEffect = <T>(config: SyncLocalStorageEffectConfig<T>): EffectRef => {
  const platformId = inject(PLATFORM_ID);
  const document = inject(DOCUMENT);
  const isBrowser = isPlatformBrowser(platformId);

  const { signal, key, serialize = (value: T) => JSON.stringify(value) } = config;

  return effect(() => {
    const value = signal();

    if (!isBrowser) return;

    const storage = document.defaultView?.localStorage;
    if (!storage) return;

    try {
      storage.setItem(key, serialize(value));
    } catch (error) {
      console.warn(`Failed to save to localStorage for key "${key}":`, error);
    }
  });
};
