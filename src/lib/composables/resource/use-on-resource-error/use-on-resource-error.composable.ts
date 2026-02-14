import { effect, Resource } from '@angular/core';

/**
 * Registers a side-effect callback that fires whenever a Resource enters the error state.
 * Works with any Resource, WritableResource, or ResourceRef — whether created via resource(),
 * rxResource(), or any other source.
 *
 * @param resource - Any Resource instance to monitor for errors
 * @param callback - Function invoked each time the resource enters error state
 */
// TODO: implement
export function useOnResourceError(
  resource: Resource<unknown>,
  callback: (error: Error) => void
): void {}
