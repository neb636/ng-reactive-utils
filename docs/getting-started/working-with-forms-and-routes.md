# Working with Forms and Routes

Angular's reactive forms and router use observables. When building signal-based components, you need to convert these observables to signals. While Angular provides `toSignal()` for this, it quickly becomes repetitive and error-prone.

NG Reactive Utils provides specialized composables for the most common conversions: **forms** and **routes**.

## The Problem with toSignal()

Converting form and route observables to signals requires repetitive boilerplate:

```typescript
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({...})
class MyComponent {
  private route = inject(ActivatedRoute);

  // Repetitive patterns everywhere
  userId = toSignal(
    this.route.params.pipe(map(params => params['id'])),
    { initialValue: this.route.snapshot.params['id'] }
  );

  formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value
  });

  formValid = toSignal(
    this.form.statusChanges.pipe(map(() => this.form.valid)),
    { initialValue: this.form.valid }
  );
}
```

**Issues:**
- Repetitive `toSignal()` calls with initial values
- Easy to forget initial values or use wrong observables
- Inconsistent patterns across the codebase

## The Solution: Specialized Composables

NG Reactive Utils provides composables that eliminate the boilerplate:

### Form State

Get complete form state with a single composable:

```typescript
import { useFormState } from 'ng-reactive-utils';

@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="email" />
      <button [disabled]="!formState.valid() || formState.pending()">
        Submit
      </button>
      @if (formState.dirty()) {
        <span>You have unsaved changes</span>
      }
    </form>
  `,
})
class UserFormComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  formState = useFormState<{ email: string }>(this.form);
  // Access: formState.value(), formState.valid(), formState.dirty(), etc.
}
```

### Form Controls

```typescript
import { useControlState } from 'ng-reactive-utils';

@Component({
  template: `
    <input [formControl]="emailControl" />
    @if (emailState.invalid() && emailState.touched()) {
      <span class="error">Invalid email</span>
    }
  `,
})
class MyComponent {
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  emailState = useControlState<string>(this.emailControl);
}
```

### Route Parameters

```typescript
import { useRouteParam, useRouteParams } from 'ng-reactive-utils';

@Component({
  template: `<h1>User: {{ userId() }}</h1>`,
})
class UserProfileComponent {
  userId = useRouteParam('id');
}

// Or get all params at once
@Component({
  template: `<h1>User {{ params().userId }} - Post {{ params().postId }}</h1>`,
})
class PostDetailComponent {
  params = useRouteParams<{ userId: string; postId: string }>();
}
```

### Query Parameters

```typescript
import { useRouteQueryParam } from 'ng-reactive-utils';

@Component({
  template: `<h1>Search: {{ searchTerm() }}</h1>`,
})
class SearchComponent {
  searchTerm = useRouteQueryParam('q');
  page = useRouteQueryParam('page');
}
```

### Route Data

```typescript
import { useRouteData } from 'ng-reactive-utils';

@Component({...})
class ProductComponent {
  routeData = useRouteData<{ product: Product }>();
  product = computed(() => this.routeData().product);
}
```

## Real-World Example

Combining form and route utilities in a search component:

```typescript
import { Component, computed } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { useFormState, useRouteQueryParam } from 'ng-reactive-utils';

@Component({
  selector: 'app-search',
  template: `
    <form [formGroup]="form">
      <input formControlName="query" placeholder="Search..." />
      <select formControlName="category">
        <option value="">All</option>
        <option value="books">Books</option>
      </select>

      @if (formState.invalid() && formState.touched()) {
        <span class="error">Please enter a search query</span>
      }

      <button [disabled]="formState.invalid()">Search</button>
    </form>

    <h2>Results for: {{ queryParam() || 'all' }}</h2>
  `,
})
export class SearchComponent {
  form = new FormGroup({
    query: new FormControl('', Validators.required),
    category: new FormControl(''),
  });

  formState = useFormState<{ query: string; category: string }>(this.form);
  queryParam = useRouteQueryParam('q');
}
```

## Key Benefits

- **Less boilerplate** - No repetitive `toSignal()` calls
- **Type-safe** - Full TypeScript support with proper inference
- **Correct initial values** - Handled automatically from snapshots
- **Consistent API** - Same pattern across all utilities

## Available Composables

### Forms
- [`useFormState()`](/composables/form/use-form-state) - Complete form state
- [`useFormValue()`](/composables/form/use-form-value) - Form value
- [`useFormValid()`](/composables/form/use-form-valid) - Validity status
- [`useControlState()`](/composables/control/use-control-state) - Control state
- [View all form composables →](/composables/form/use-form-state)

### Routes
- [`useRouteParam()`](/composables/route/use-route-param) - Single parameter
- [`useRouteParams()`](/composables/route/use-route-params) - All parameters
- [`useRouteQueryParam()`](/composables/route/use-route-query-param) - Single query param
- [`useRouteData()`](/composables/route/use-route-data) - Route data
- [View all route composables →](/composables/route/use-route-param)

## Next Steps

- Explore [Browser Composables](/composables/browser/use-window-size) for window size, mouse position, and more
- Learn about [Effects](/effects/sync-local-storage) for syncing signals with localStorage and query params
- Check out [General Composables](/composables/general/use-debounced-signal) for debouncing, throttling, and more
