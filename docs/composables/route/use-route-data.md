# useRouteData

Exposes route data as a signal-based object. This is useful when you need to access route data reactively, such as for permissions, page titles, or custom metadata attached to routes.

## Usage

```typescript
import { useRouteData } from 'angular-reactive-primitives';

// Route config: { path: 'admin', data: { role: 'admin', title: 'Admin Panel' } }
@Component({
  template: `<h1>{{ routeData().title }}</h1>`,
})
class AdminComponent {
  routeData = useRouteData<{ role: string; title: string }>();
  
  hasAccess = computed(() => this.routeData().role === 'admin');
}
```

## Returns

`Signal<T>` - A readonly signal containing route data (empty object if no data)

## Notes

- Uses `toSignal` with `route.data` observable
- Returns an empty object `{}` if no route data is present
- Type parameter `T` allows for type-safe access to route data properties
- Updates reactively when route data changes

## Source

<<< @/../projects/angular-reactive-primitives/src/lib/composables/route/use-route-data/use-route-data.composable.ts
