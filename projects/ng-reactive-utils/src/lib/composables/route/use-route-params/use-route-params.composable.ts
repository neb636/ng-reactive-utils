import { Signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

export const useRouteParams = <
  T extends { [key: string]: string | null },
>() => {
  const route = inject(ActivatedRoute);

  return toSignal(route.params, {
    initialValue: route.snapshot.params,
  }) as Signal<T>;
};
