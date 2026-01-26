# useRouteParams

A convenience function that wraps Angular's ActivatedRoute.params, exposing all route parameters as a signal-based object. This is useful when you need to access multiple route parameters at once or work with the entire parameter object reactively.

## Usage

```typescript
import { useRouteParams } from 'ng-reactive-utils';

// Route: /users/:userId/posts/:postId
@Component({
  template: `<h1>User {{ params().userId }} - Post {{ params().postId }}</h1>`,
})
class PostDetailComponent {
  params = useRouteParams<{ userId: string; postId: string }>();

  postResource = resource({
    params: () => this.params(),
    loader: ({ params }) => fetchPost(params.userId, params.postId),
  });
}
```

## Returns

`Signal<T>` - A readonly signal containing all route parameters as an object

## Notes

- Uses `toSignal` with `route.params` observable
- Type parameter `T` defaults to `{ [key: string]: string | null }`
- Updates reactively when any route parameter changes
- For single parameter access, consider using `useRouteParameter` instead

## Source

<<< @/../projects/ng-reactive-utils/src/lib/composables/route/use-route-params/use-route-params.composable.ts
