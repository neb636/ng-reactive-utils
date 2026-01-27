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

- Uses `useRouteQueryParams` internally and extracts a single parameter
- Updates reactively when the query parameter changes
- Type parameter `T` defaults to `string | undefined`
- Returns `undefined` when the query parameter is not present

## Source

<<< @/../src/lib/composables/route/use-route-query-param/use-route-query-param.composable.ts
