import { Signal, inject, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

export type QueryParamEffectOptions = {
  queryParamsHandling?: 'merge' | 'preserve';
  replaceUrl?: boolean;
  skipLocationChange?: boolean;
};

export type SyncQueryParamsEffectConfig = {
  queryParams: Signal<Record<string, unknown>>;
  options?: QueryParamEffectOptions;
};

/**
 * Effect to sync query params with the application state for the current route.
 *
 * @param config - Configuration object
 * @param config.queryParams - Signal containing query params
 * @param config.options - Optional options for query params handling
 *   - queryParamsHandling: 'merge' (default) | 'preserve'
 *   - replaceUrl: Whether to replace the current URL with the new one (default: false)
 *   - skipLocationChange: Whether to skip location change (default: false)
 *
 * Example:
 *
 * export class MyComponent {
 *   private selectedLabel = signal('');
 *   private query = signal('');
 *
 *   constructor() {
 *     syncQueryParamsEffect({
 *       queryParams: computed(() => ({ selectedLabel: this.selectedLabel(), query: this.query() })),
 *       options: { queryParamsHandling: 'preserve' }
 *     });
 *   }
 * }
 */
export const syncQueryParamsEffect = (config: SyncQueryParamsEffectConfig) => {
  const activatedRoute = inject(ActivatedRoute);
  const router = inject(Router);

  const {
    queryParamsHandling = 'merge',
    skipLocationChange = false,
    replaceUrl = false,
  } = config.options || {};

  return effect(() => {
    const queryParams = config.queryParams();

    router.navigate([], {
      relativeTo: activatedRoute,
      queryParams,
      queryParamsHandling,
      skipLocationChange,
      replaceUrl,
    });
  });
};
