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
 * Creates a reactive signal bound to sessionStorage.
 * The signal stays in sync with sessionStorage during the browser session.
 * Unlike localStorage, sessionStorage is cleared when the tab/window is closed.
 *
 * @param key - The sessionStorage key
 * @param defaultValue - Default value when sessionStorage is empty
 * @param options - Configuration options
 *
 * @example
 * // Simple string for session data
 * const { value: sessionId } = useSessionStorage('session-id', '');
 *
 * @example
 * // Form draft that persists during the session
 * const { value: formDraft } = useSessionStorage('checkout-form', {
 *   name: '',
 *   email: '',
 *   address: ''
 * });
 *
 * @example
 * // Auth token for the session
 * const { value: token, remove } = useSessionStorage('auth-token', null);
 *
 * // On logout
 * remove();
 *
 * @example
 * // Shopping cart for the session
 * const { value: cart } = useSessionStorage<string[]>('cart-items', []);
 * cart.update(items => [...items, 'new-product-id']);
 *
 * @example
 * // With custom serializer
 * const { value: lastAction } = useSessionStorage('last-action', new Date(), {
 *   serializer: StorageSerializers.date
 * });
 */
export function useSessionStorage<T>(
  key: string,
  defaultValue: T,
  options: UseStorageOptions<T> = {}
): UseStorageReturn<T> {
  const document = inject(DOCUMENT);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  const storage = isBrowser ? document.defaultView?.sessionStorage : undefined;

  return useStorage(key, defaultValue, storage, options);
}
