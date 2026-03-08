import { DestroyRef, Signal, effect, inject, untracked } from '@angular/core';

export function when<T>(
  source: Signal<T>,
  predicate: (value: T) => boolean,
  callback: () => void,
): () => void {
  // TODO: implement
  return () => {};
}

export function whenTrue(source: Signal<unknown>, callback: () => void): () => void {
  // TODO: implement
  return () => {};
}

export function whenFalse(source: Signal<unknown>, callback: () => void): () => void {
  // TODO: implement
  return () => {};
}
