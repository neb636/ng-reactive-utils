# useCancelResource

Returns a `cancel()` function that aborts the in-flight request of a `ResourceRef` and allows retrying. Useful for giving users explicit control over long-running or unwanted network requests.

## Usage

### Basic Cancel Button

```typescript
import { resource } from '@angular/core';
import { useCancelResource } from 'ng-reactive-utils';

@Component({
  template: `
    @if (reportResource.isLoading()) {
      <p>Generating report...</p>
      <button (click)="cancelReport.cancel()">Cancel</button>
    } @else {
      <button (click)="reportResource.reload()">Generate Report</button>
    }

    @if (reportResource.value(); as report) {
      <app-report-viewer [report]="report" />
    }
  `,
})
class ReportComponent {
  reportResource = resource({
    loader: ({ abortSignal }) => generateReport({ signal: abortSignal }),
  });

  cancelReport = useCancelResource(this.reportResource);
}
```

### Cancel and Retry

```typescript
import { resource } from '@angular/core';
import { useCancelResource } from 'ng-reactive-utils';

@Component({
  template: `
    @if (dataResource.isLoading()) {
      <app-spinner />
      <button (click)="cancelData.cancel()">Cancel</button>
    }

    @if (cancelData.isCancelled()) {
      <p>Request was cancelled.</p>
      <button (click)="cancelData.retry()">Retry</button>
    }

    @if (dataResource.value(); as data) {
      <app-data-table [data]="data" />
    }
  `,
})
class DataTableComponent {
  dataResource = resource({
    loader: ({ abortSignal }) => fetchLargeDataset({ signal: abortSignal }),
  });

  cancelData = useCancelResource(this.dataResource);
}
```

### With rxResource

```typescript
import { rxResource } from '@angular/core/rxjs-interop';
import { useCancelResource } from 'ng-reactive-utils';

@Component({
  template: `
    @if (exportResource.isLoading()) {
      <button (click)="cancelExport.cancel()">Cancel Export</button>
    }

    @if (cancelExport.isCancelled()) {
      <p>Export cancelled. <a (click)="cancelExport.retry()">Try again?</a></p>
    }
  `,
})
class ExportComponent {
  private http = inject(HttpClient);

  exportResource = rxResource({
    loader: () => this.http.get('/api/export/large-dataset'),
  });

  cancelExport = useCancelResource(this.exportResource);
}
```

### Timeout with Auto-Cancel

```typescript
import { resource } from '@angular/core';
import { useCancelResource } from 'ng-reactive-utils';

@Component({
  template: `
    @if (cancelSearch.isCancelled()) {
      <p>Search timed out. <button (click)="cancelSearch.retry()">Retry</button></p>
    }
    @if (searchResource.value(); as results) {
      <app-search-results [results]="results" />
    }
  `,
})
class SearchWithTimeoutComponent {
  private query = signal('');

  searchResource = resource({
    params: () => ({ q: this.query() }),
    loader: ({ params, abortSignal }) => searchApi(params.q, { signal: abortSignal }),
  });

  cancelSearch = useCancelResource(this.searchResource);

  constructor() {
    // Auto-cancel after 10 seconds
    effect(() => {
      if (this.searchResource.isLoading()) {
        const timer = setTimeout(() => this.cancelSearch.cancel(), 10_000);
        return () => clearTimeout(timer);
      }
    });
  }
}
```

## Parameters

| Parameter  | Type              | Default    | Description                                              |
| ---------- | ----------------- | ---------- | -------------------------------------------------------- |
| `resource` | `ResourceRef<T>`  | _required_ | A resource created via `resource()` or `rxResource()`    |

## Returns

`UseCancelResourceReturn` — An object with the following properties:

| Property      | Type             | Description                                                       |
| ------------- | ---------------- | ----------------------------------------------------------------- |
| `cancel`      | `() => void`     | Aborts the in-flight request. No-op if the resource isn't loading |
| `retry`       | `() => boolean`  | Calls `resource.reload()` and resets the cancelled state. Returns the result of `reload()` |
| `isCancelled` | `Signal<boolean>` | Reactive signal that is `true` after `cancel()` is called, and resets to `false` on `retry()` or when the resource begins a new load |

## How It Works

Internally, `useCancelResource` leverages `resource.destroy()` to abort the in-flight HTTP request, then manages restoration of the resource's loadability through `reload()`. When `cancel()` is called:

1. The resource's current in-flight request is aborted (the loader's `AbortSignal` is triggered)
2. The `isCancelled` signal is set to `true`
3. The resource transitions to an idle-like state

When `retry()` is called:

1. `isCancelled` is reset to `false`
2. `resource.reload()` is called to re-initiate the loading operation

## Known Limitations & Design Considerations

::: warning Angular Resource API Constraints
The Angular `Resource` API (as of v20) does **not** expose a public method to cancel an in-flight request without side effects. The available mechanisms are:

- **`destroy()`** — Cancels the in-flight request but **permanently** destroys the resource. The internal load effect is torn down, and subsequent `reload()` calls have no effect.
- **`reload()`** — Aborts the current request but **immediately starts a new one**. This is "restart", not "cancel".

There is no public "pause" or "cancel current request only" API on `ResourceRef`.
:::

### Implementation Approaches Under Consideration

We are evaluating the following strategies for implementation. Feedback is welcome before we commit to one:

#### Approach A: Wrapper Around Resource Creation

Instead of accepting an already-created resource, the composable wraps the resource creation to intercept the loader and manage its own `AbortController`:

```typescript
// Alternative API — wraps resource creation
const { resource: dataResource, cancel, retry, isCancelled } = useCancellableResource({
  params: () => ({ id: userId() }),
  loader: ({ params, abortSignal }) => fetchData(params.id, { signal: abortSignal }),
});
```

**Pros**: Full control over the `AbortController`; can abort without destroying the resource.
**Cons**: Different API shape — user doesn't create the resource themselves; composable must mirror all `resource()` / `rxResource()` options.

#### Approach B: Destroy + Re-trigger via reload()

Use `destroy()` to abort in-flight, then rely on `reload()` for retry. This is the simplest approach but has a critical caveat: after `destroy()`, the resource's internal effect is torn down, so `reload()` may not work.

**Pros**: Simple, no internal API usage.
**Cons**: `destroy()` is permanent — the resource cannot be reloaded after destruction without re-creation.

#### Approach C: Request-gating via signal

Introduce a gating signal that the user threads through their `params` function. When cancelled, the gate signal returns `undefined`, causing the resource to go idle (which aborts in-flight). On retry, the gate is re-opened.

```typescript
// User must integrate the gate into their resource params
const { gate, cancel, retry, isCancelled } = useCancelResource();

const dataResource = resource({
  params: () => (gate() ? { id: userId() } : undefined),
  loader: ({ params }) => fetchData(params.id),
});
```

**Pros**: Works with the public API; no internal hacks; resource stays alive.
**Cons**: Requires user to integrate the gate into their `params` function — not as ergonomic. Setting params to `undefined` cancels but also clears the previous value.

### Recommendation

**Approach A** (wrapper around resource creation) provides the best developer experience and is the most reliable. It avoids the `destroy()` permanence issue and doesn't require users to change their `params` function. The tradeoff is that the composable creates the resource rather than wrapping an existing one, which changes the API from `useCancelResource(resource)` to a factory-style API.

**Approach C** (request-gating) is the most "Angular-native" approach and works entirely within the public API, but requires more setup from the user.

## Notes

- **Loader must respect `AbortSignal`**: For cancellation to actually stop the HTTP request, the loader must forward the `AbortSignal` to `fetch()` or use `takeUntil` with RxJS. If the loader ignores the signal, the request continues in the background
- **Injection context required**: Must be called within an Angular injection context (constructor, field initializer, or `runInInjectionContext`)
- **Automatic cleanup**: The composable cleans up when the enclosing injection context is destroyed
- **`isCancelled` resets automatically**: The cancelled state resets when the resource starts a new load (e.g., due to request parameter changes), not just on explicit `retry()`
- **No-op when not loading**: Calling `cancel()` when the resource is in `resolved`, `idle`, or `error` state has no effect

## Common Use Cases

- **User-initiated cancel**: "Cancel" button for long-running report generation or data exports
- **Timeout handling**: Auto-cancel requests that exceed a time limit
- **Navigation guards**: Cancel in-flight requests when the user navigates away
- **Debounced search**: Cancel the previous search when a new query is typed (though `resource` already handles this via request reactivity)
- **Rate limiting**: Cancel excess requests to prevent API overload

## Source

<<< @/../src/lib/composables/resource/use-cancel-resource/use-cancel-resource.composable.ts
