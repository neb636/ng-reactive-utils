# useRouteParam

A convenience function that returns a single route parameter as a signal. This is useful when you only need to access one specific parameter from the route.

## Usage

```typescript
import { useRouteParam } from 'ng-reactive-utils';

// Route: /products/:productId
@Component({
  template: `<h1>Product ID: {{ productId() }}</h1>`,
})
class ProductDetailComponent {
  productId = useRouteParam<string>('productId');

  productResource = resource({
    params: () => ({ id: this.productId() }),
    loader: ({ params }) => fetchProduct(params.id),
  });
}
```

## Parameters

| Parameter   | Type     | Default    | Description                     |
| ----------- | -------- | ---------- | ------------------------------- |
| `paramName` | `string` | _required_ | The name of the route parameter |

## Returns

`Signal<T>` - A readonly signal containing the parameter value

## Notes

- Delegates to `useRouteParams` and wraps the result in a `computed` signal to extract a single key
- Updates reactively when the route parameter changes
- Type parameter `T` is **constrained** to `string | null | undefined` — it does not default to that union; calling without a type argument infers the full constraint as the type

## Source

<<< @/../src/lib/composables/route/use-route-param/use-route-param.composable.ts
