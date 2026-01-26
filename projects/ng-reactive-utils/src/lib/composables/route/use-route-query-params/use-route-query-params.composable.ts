import { computed, inject, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

export const useRouteQueryParams = <
  T extends { [key: string]: undefined | string },
>() => {
  const route = inject(ActivatedRoute);

  return toSignal(route.queryParams, {
    initialValue: route.snapshot.queryParams,
  }) as Signal<T>;
};
