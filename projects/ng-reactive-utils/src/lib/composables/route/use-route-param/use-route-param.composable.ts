import { computed } from '@angular/core';
import { useRouteParams } from '../use-route-params/use-route-params.composable';

export const useRouteParameter = <T extends string | null | undefined>(
  paramName: string,
) => {
  const parameters = useRouteParams();

  return computed(() => parameters()[paramName] as T);
};
