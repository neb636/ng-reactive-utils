# useRouteQueryParam

A convenience function that returns a single query parameter as a signal. This is useful when you only need to access one specific query parameter from the URL.

## Usage

```typescript
import { useRouteQueryParam } from 'ng-reactive-utils';

// URL: /search?query=angular&sort=date
@Component({
  template: `<h1>Searching for: {{ searchQuery() }}</h1>`,
})
class SearchComponent {
  searchQuery = useRouteQueryParam<string>('query');

  searchResults = resource({
    params: () => ({ q: this.searchQuery() }),
    loader: ({ params }) => fetchSearchResults(params.q),
  });
}
```

## Parameters

| Parameter   | Type     | Default    | Description                     |
| ----------- | -------- | ---------- | ------------------------------- |
| `paramName` | `string` | _required_ | The name of the query parameter |

## Returns

`Signal<T>` - A readonly signal containing the query parameter value

## Notes

- Delegates to `useRouteQueryParams` and wraps the result in a `computed` signal to extract a single key
- Updates reactively when the query parameter changes
- Type parameter `T` is **constrained** to `string | undefined` — it does not default to that union; calling without a type argument infers the full constraint as the type
- Returns `undefined` when the query parameter is not present in the URL

## Source

<<< @/../src/lib/composables/route/use-route-query-param/use-route-query-param.composable.ts
