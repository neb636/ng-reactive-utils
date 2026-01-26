import { computed } from '@angular/core';
import { useRouteQueryParams } from '../use-route-query-params/use-route-query-params.composable';

export const useRouteQueryParam = <T extends undefined | string>(
  paramName: string,
) => {
  const queryParams = useRouteQueryParams();

  return computed(() => queryParams()[paramName] as T);
};
