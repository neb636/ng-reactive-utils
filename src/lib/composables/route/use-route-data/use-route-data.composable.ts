import { inject, Signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

export const useRouteData = <T extends { [key: string]: any }>() => {
  const route = inject(ActivatedRoute);
  const routeData = toSignal(route.data, { initialValue: route.snapshot.data }) as Signal<T>;

  return computed(() => routeData() ?? ({} as T));
};
