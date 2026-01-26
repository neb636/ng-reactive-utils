import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

export const useRouteFragment = () => {
  const route = inject(ActivatedRoute);

  return toSignal(route.fragment, { initialValue: route.snapshot.fragment });
};
