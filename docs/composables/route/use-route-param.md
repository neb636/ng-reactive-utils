# useRouteParameter

A convenience function that returns a single route parameter as a signal. This is useful when you only need to access one specific parameter from the route.

## Usage

```typescript
import { useRouteParameter } from 'ng-reactive-utils';

// Route: /products/:productId
@Component({
  template: `<h1>Product ID: {{ productId() }}</h1>`,
})
class ProductDetailComponent {
  productId = useRouteParameter<string>('productId');

  productResource = resource({
    params: () => ({ id: this.productId() }),
    loader: ({ params }) => fetchProduct(params.id),
  });
}
```

## Parameters

| Parameter   | Type     | Default    | Description                      |
| ----------- | -------- | ---------- | -------------------------------- |
| `paramName` | `string` | _required_ | The name of the route parameter  |

## Returns

`Signal<T>` - A readonly signal containing the parameter value

## Notes

- Uses `useRouteParams` internally and extracts a single parameter
- Updates reactively when the route parameter changes
- Type parameter `T` defaults to `string | null | undefined`

## Source

<<< @/../projects/ng-reactive-utils/src/lib/composables/route/use-route-param/use-route-param.composable.ts
