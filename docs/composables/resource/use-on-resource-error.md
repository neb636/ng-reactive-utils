# useOnResourceError

Registers a side-effect callback that fires whenever a `Resource` enters the `error` state. Works with any `Resource`, `WritableResource`, or `ResourceRef` — whether created via `resource()`, `rxResource()`, or any other source.

## Usage

### Basic Error Handling

```typescript
import { resource } from '@angular/core';
import { useOnResourceError } from 'ng-reactive-utils';

@Component({
  template: `
    <p>{{ userResource.value() }}</p>
  `,
})
class UserProfileComponent {
  private userId = input.required<string>();

  userResource = resource({
    params: () => ({ id: this.userId() }),
    loader: ({ params }) => fetchUser(params.id),
  });

  constructor() {
    useOnResourceError(this.userResource, (error) => {
      console.error('Failed to load user:', error.message);
    });
  }
}
```

### Show a Toast / Snackbar on Error

```typescript
import { resource } from '@angular/core';
import { useOnResourceError } from 'ng-reactive-utils';

@Component({
  template: `
    @if (ordersResource.value(); as orders) {
      <app-orders-table [orders]="orders" />
    }
  `,
})
class OrdersComponent {
  private snackBar = inject(MatSnackBar);

  ordersResource = resource({
    loader: () => fetchOrders(),
  });

  constructor() {
    useOnResourceError(this.ordersResource, (error) => {
      this.snackBar.open(`Failed to load orders: ${error.message}`, 'Dismiss', {
        duration: 5000,
      });
    });
  }
}
```

### With rxResource

```typescript
import { rxResource } from '@angular/core/rxjs-interop';
import { useOnResourceError } from 'ng-reactive-utils';

@Component({
  template: `<p>{{ searchResults.value() }}</p>`,
})
class SearchComponent {
  private query = signal('');
  private errorLog = inject(ErrorLogService);

  searchResults = rxResource({
    params: () => ({ q: this.query() }),
    loader: ({ params }) => this.http.get(`/api/search?q=${params.q}`),
  });

  constructor() {
    useOnResourceError(this.searchResults, (error) => {
      this.errorLog.capture('search-failed', error);
    });
  }
}
```

### Multiple Resources

```typescript
@Component({
  template: `...`,
})
class DashboardComponent {
  usersResource = resource({ loader: () => fetchUsers() });
  analyticsResource = resource({ loader: () => fetchAnalytics() });

  private alertService = inject(AlertService);

  constructor() {
    useOnResourceError(this.usersResource, (error) => {
      this.alertService.warn('Users failed to load');
    });

    useOnResourceError(this.analyticsResource, (error) => {
      this.alertService.warn('Analytics failed to load');
    });
  }
}
```

### Automatic Retry on Error

```typescript
@Component({
  template: `
    @if (dataResource.isLoading()) {
      <app-spinner />
    }
    <p>{{ dataResource.value() }}</p>
  `,
})
class AutoRetryComponent {
  private retryCount = signal(0);
  private maxRetries = 3;

  dataResource = resource({
    loader: () => fetchData(),
  });

  constructor() {
    useOnResourceError(this.dataResource, (error) => {
      const attempts = this.retryCount();
      if (attempts < this.maxRetries) {
        this.retryCount.update((count) => count + 1);
        setTimeout(() => this.dataResource.reload(), 1000 * Math.pow(2, attempts));
      }
    });
  }
}
```

## Parameters

| Parameter  | Type                    | Default    | Description                                             |
| ---------- | ----------------------- | ---------- | ------------------------------------------------------- |
| `resource` | `Resource<unknown>`     | _required_ | Any resource (from `resource()`, `rxResource()`, etc.)  |
| `callback` | `(error: Error) => void` | _required_ | Function invoked each time the resource enters error state |

## Returns

`void` - No return value. Cleanup is handled automatically via Angular's `DestroyRef`.

## How It Works

Internally, `useOnResourceError` creates a reactive `effect` that watches `resource.status()`. When the status transitions to `'error'`, the callback is invoked with the value from `resource.error()`.

Because it uses an Angular `effect`, it:
- Automatically tracks the reactive dependency on `resource.status()`
- Re-runs whenever the status changes
- Is cleaned up when the enclosing injection context is destroyed

## Notes

- **Fires on every error transition**: If a resource errors, is reloaded, and errors again, the callback fires each time the status becomes `'error'`
- **Accepts any `Resource`**: The input type is `Resource<unknown>`, so it works with `resource()`, `rxResource()`, `WritableResource`, and `ResourceRef` alike
- **Does not suppress the error**: The resource's `error()` signal remains set — this composable is purely for side effects (logging, toasts, analytics, retry logic)
- **Injection context required**: Must be called within an Angular injection context (constructor, field initializer, or `runInInjectionContext`)
- **Automatic cleanup**: The effect is tied to `DestroyRef`, so it is cleaned up when the component/service is destroyed
- **Callback runs outside the reactive graph**: The callback is a side-effect and should not set signals that `resource.status()` depends on, as this could cause circular updates

## Common Use Cases

- **Error logging**: Send errors to a logging service or error tracker
- **User notifications**: Display toast messages, snackbars, or inline error banners
- **Automatic retry**: Implement exponential backoff retry logic
- **Analytics**: Track error rates and failure patterns
- **Fallback behavior**: Switch to a cached value or alternative data source on error

## Source

<<< @/../src/lib/composables/resource/use-on-resource-error/use-on-resource-error.composable.ts
