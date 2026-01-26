# Working with Existing Observable-Based Code

Many Angular applications built before signals were introduced rely heavily on RxJS observables. When migrating to signals or building new signal-based features, you'll often need to convert observables to signals. While Angular provides `toSignal()` for this, using it everywhere can be repetitive and error-prone.

NG Reactive Utils provides specialized utilities for the most common observable-to-signal conversions: **forms** and **routes**. These utilities handle the conversion with proper initial values and type safety, eliminating the need to write `toSignal()` calls throughout your codebase.

## The Problem

When working with Angular's reactive forms or router, you're dealing with observables:

```typescript
// Reactive Forms
form.valueChanges        // Observable<T>
form.statusChanges       // Observable<FormControlStatus>
form.valid              // boolean (not reactive)

// Router
route.params            // Observable<Params>
route.queryParams       // Observable<Params>
route.data              // Observable<Data>
```

To use these in signal-based code, you'd typically write:

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

@Component({...})
class MyComponent {
  private route = inject(ActivatedRoute);
  
  // Repetitive toSignal calls everywhere
  userId = toSignal(this.route.params.pipe(
    map(params => params['id'])
  ), { initialValue: this.route.snapshot.params['id'] });
  
  formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value
  });
  
  formValid = toSignal(this.form.statusChanges.pipe(
    map(() => this.form.valid)
  ), { initialValue: this.form.valid });
  
  // ... and so on for every property you need
}
```

This approach has several issues:
- **Repetitive**: You write `toSignal()` with proper initial values everywhere
- **Error-prone**: Easy to forget initial values or use wrong observables
- **Verbose**: Lots of boilerplate for simple conversions
- **Inconsistent**: Different developers might handle it differently

## The Solution: Form Utilities

NG Reactive Utils provides composables that handle all the `toSignal()` boilerplate for reactive forms.

### Individual Form Properties

Instead of manually converting each observable:

```typescript
// ❌ Before: Manual toSignal calls
formValue = toSignal(this.form.valueChanges, {
  initialValue: this.form.value
});
formValid = toSignal(this.form.statusChanges.pipe(
  map(() => this.form.valid)
), { initialValue: this.form.valid });
formDirty = toSignal(this.form.statusChanges.pipe(
  map(() => this.form.dirty)
), { initialValue: this.form.dirty });
```

Use the form composables:

```typescript
// ✅ After: Clean and simple
import { useFormValue, useFormValid, useFormDirty } from 'ng-reactive-utils';

formValue = useFormValue<MyFormType>(this.form);
formValid = useFormValid(this.form);
formDirty = useFormDirty(this.form);
```

### Complete Form State

For comprehensive form state, use `useFormState()` to get all properties at once:

```typescript
// ❌ Before: Many individual toSignal calls
@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="email" />
      <button [disabled]="!isValid() || isPending()">
        Submit
      </button>
      @if (isDirty()) {
        <span>You have unsaved changes</span>
      }
    </form>
  `
})
class UserFormComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });
  
  isValid = toSignal(this.form.statusChanges.pipe(
    map(() => this.form.valid)
  ), { initialValue: this.form.valid });
  
  isPending = toSignal(this.form.statusChanges.pipe(
    map(() => this.form.status === 'PENDING')
  ), { initialValue: this.form.status === 'PENDING' });
  
  isDirty = toSignal(this.form.statusChanges.pipe(
    map(() => this.form.dirty)
  ), { initialValue: this.form.dirty });
}
```

```typescript
// ✅ After: Single composable call
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
  `
})
class UserFormComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });
  
  formState = useFormState<{ email: string }>(this.form);
}
```

### Form Controls

The same utilities work for individual form controls:

```typescript
import { useControlState } from 'ng-reactive-utils';

@Component({
  template: `
    <input [formControl]="emailControl" />
    @if (emailState.invalid() && emailState.touched()) {
      <span class="error">Please enter a valid email</span>
    }
  `
})
class MyComponent {
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  emailState = useControlState<string>(this.emailControl);
}
```

## The Solution: Route Utilities

Similarly, route utilities eliminate `toSignal()` boilerplate for router observables.

### Route Parameters

```typescript
// ❌ Before: Manual conversion
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({...})
class UserProfileComponent {
  private route = inject(ActivatedRoute);
  
  userId = toSignal(
    this.route.params.pipe(map(params => params['id'])),
    { initialValue: this.route.snapshot.params['id'] }
  );
}
```

```typescript
// ✅ After: Simple composable
import { useRouteParam } from 'ng-reactive-utils';

@Component({
  template: `<h1>User: {{ userId() }}</h1>`
})
class UserProfileComponent {
  userId = useRouteParam('id');
}
```

### Multiple Route Parameters

```typescript
// ❌ Before: Multiple toSignal calls
@Component({...})
class PostDetailComponent {
  private route = inject(ActivatedRoute);
  
  userId = toSignal(
    this.route.params.pipe(map(params => params['userId'])),
    { initialValue: this.route.snapshot.params['userId'] }
  );
  
  postId = toSignal(
    this.route.params.pipe(map(params => params['postId'])),
    { initialValue: this.route.snapshot.params['postId'] }
  );
}
```

```typescript
// ✅ After: Single composable
import { useRouteParams } from 'ng-reactive-utils';

@Component({
  template: `
    <h1>User {{ params().userId }} - Post {{ params().postId }}</h1>
  `
})
class PostDetailComponent {
  params = useRouteParams<{ userId: string; postId: string }>();
}
```

### Query Parameters

```typescript
// ❌ Before
@Component({...})
class SearchComponent {
  private route = inject(ActivatedRoute);
  
  searchTerm = toSignal(
    this.route.queryParams.pipe(map(params => params['q'])),
    { initialValue: this.route.snapshot.queryParams['q'] }
  );
  
  page = toSignal(
    this.route.queryParams.pipe(map(params => +params['page'] || 1)),
    { initialValue: +(this.route.snapshot.queryParams['page'] || 1) }
  );
}
```

```typescript
// ✅ After
import { useRouteQueryParam } from 'ng-reactive-utils';

@Component({...})
class SearchComponent {
  searchTerm = useRouteQueryParam('q');
  page = computed(() => +(useRouteQueryParam('page')() || '1'));
}
```

### Route Data

```typescript
// ❌ Before
@Component({...})
class ProductComponent {
  private route = inject(ActivatedRoute);
  
  product = toSignal(
    this.route.data.pipe(map(data => data['product'])),
    { initialValue: this.route.snapshot.data['product'] }
  );
}
```

```typescript
// ✅ After
import { useRouteData } from 'ng-reactive-utils';

@Component({...})
class ProductComponent {
  routeData = useRouteData<{ product: Product }>();
  product = computed(() => this.routeData().product);
}
```

## Complete Example: Form + Route Integration

Here's a real-world example combining both form and route utilities:

```typescript
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  useFormState,
  useRouteQueryParam,
  syncQueryParams,
} from 'ng-reactive-utils';

interface SearchForm {
  query: string;
  category: string;
}

@Component({
  selector: 'app-search',
  template: `
    <form [formGroup]="form">
      <input formControlName="query" placeholder="Search..." />
      <select formControlName="category">
        <option value="">All</option>
        <option value="books">Books</option>
        <option value="movies">Movies</option>
      </select>
      
      @if (formState.invalid() && formState.touched()) {
        <span class="error">Please enter a search query</span>
      }
      
      <button [disabled]="formState.invalid() || formState.pending()">
        Search
      </button>
    </form>
    
    <div>
      <h2>Results for: {{ queryParam() || 'all' }}</h2>
      <!-- Results here -->
    </div>
  `,
})
export class SearchComponent {
  private router = inject(Router);
  
  form = new FormGroup<{
    query: FormControl<string>;
    category: FormControl<string>;
  }>({
    query: new FormControl('', Validators.required),
    category: new FormControl(''),
  });
  
  formState = useFormState<SearchForm>(this.form);
  queryParam = useRouteQueryParam('q');
  
  constructor() {
    // Sync form with URL query params
    syncQueryParams({
      q: computed(() => this.form.value.query || ''),
      category: computed(() => this.form.value.category || ''),
    });
  }
}
```

## Benefits

Using these utilities provides several advantages:

1. **Less Boilerplate**: No need to write `toSignal()` everywhere
2. **Proper Initial Values**: Utilities handle initial values correctly
3. **Type Safety**: Full TypeScript support with proper types
4. **Consistency**: Same API across your codebase
5. **Readability**: Clear, declarative code that's easy to understand
6. **Maintainability**: Less code means fewer bugs and easier updates

## Available Utilities

### Form Utilities

- **`useFormState()`** - Complete form state (value, valid, dirty, touched, etc.)
- **`useFormValue()`** - Form value as signal
- **`useFormValid()`** - Form validity as signal
- **`useFormDirty()`** - Form dirty state as signal
- **`useFormTouched()`** - Form touched state as signal
- **`useFormErrors()`** - Form validation errors as signal
- **`useControlState()`** - Complete control state (for FormControl)
- And more... See the [Forms documentation](/composables/form/use-form-state) for the full list.

### Route Utilities

- **`useRouteParam()`** - Single route parameter
- **`useRouteParams()`** - All route parameters
- **`useRouteQueryParam()`** - Single query parameter
- **`useRouteQueryParams()`** - All query parameters
- **`useRouteData()`** - Route data
- **`useRouteFragment()`** - URL fragment

See the [Route documentation](/composables/route/use-route-param) for details.

## Next Steps

- Learn about [Effects](/effects/sync-query-params) for syncing signals with external systems
- Explore [other composables](/composables/browser/use-document-visibility) for browser APIs and utilities
- Check out the [API reference](/composables/form/use-form-state) for detailed documentation
