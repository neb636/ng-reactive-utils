# useRouteQueryParams

Exposes all query parameters as a signal-based object. This is useful when you need to access multiple query parameters at once or work with the entire query parameter object reactively.

## Usage

```typescript
import { useRouteQueryParams } from 'ng-reactive-utils';

// URL: /products?category=electronics&sort=price&order=asc
@Component({
  template: `<h1>Category: {{ queryParams().category }}</h1>`,
})
class ProductListComponent {
  queryParams = useRouteQueryParams<{ category?: string; sort?: string; order?: string }>();

  productsResource = resource({
    params: () => this.queryParams(),
    loader: ({ params }) => fetchProducts(params),
  });
}
```

## Returns

`Signal<T>` - A readonly signal containing all query parameters as an object

## Notes

- Uses `toSignal` with `route.queryParams` observable
- Type parameter `T` defaults to `{ [key: string]: string | undefined }`
- Updates reactively when any query parameter changes
- For single parameter access, consider using `useRouteQueryParam` instead

## Source

<<< @/../src/lib/composables/route/use-route-query-params/use-route-query-params.composable.ts
