# syncQueryParamsEffect

Effect that syncs signal state to URL query parameters (one-way: signal → URL). This is useful when you want to make application state shareable via URL without reading from query params.

## Usage

```typescript
import { syncQueryParamsEffect } from 'angular-reactive-primitives';

@Component({})
class SearchComponent {
  query = signal('');
  category = signal('all');

  constructor() {
    syncQueryParamsEffect({
      queryParams: computed(() => ({
        query: this.query(),
        category: this.category(),
      })),
      options: {
        queryParamsHandling: 'merge',
        replaceUrl: true,
      },
    });
  }
}
```

## Parameters

| Parameter                      | Type                          | Default   | Description                                          |
| ------------------------------ | ----------------------------- | --------- | ---------------------------------------------------- |
| `queryParams`                  | `Signal<Record<string, any>>` | _required_ | Signal containing query parameters                   |
| `options.queryParamsHandling`  | `'merge' \| 'preserve'`       | `'merge'` | How to handle existing query params                  |
| `options.replaceUrl`           | `boolean`                     | `false`   | Replace current URL instead of pushing to history    |
| `options.skipLocationChange`   | `boolean`                     | `false`   | Update router state without changing browser URL     |

## Notes

- This is **one-way sync**: signal → URL
- Effect runs automatically whenever the queryParams signal changes
- Uses Angular Router's navigate method under the hood
- For reading query params, use `useRouteQueryParams` or `useRouteQueryParam` instead
- Set `replaceUrl: true` to avoid polluting browser history with every state change

## Source

<<< @/../projects/angular-reactive-primitives/src/lib/effects/sync-query-params/sync-query-params.effect.ts
