# useRouteFragment

Exposes the route fragment (the part after #) as a signal. This is useful for implementing smooth scrolling to sections, deep linking, or tracking which section of a page is active.

## Usage

```typescript
import { useRouteFragment } from 'angular-reactive-primitives';

// URL: /docs#installation
@Component({
  template: `<p>Current section: {{ fragment() }}</p>`,
})
class DocumentationComponent {
  fragment = useRouteFragment();

  constructor() {
    effect(() => {
      const section = this.fragment();
      if (section) {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}
```

## Returns

`Signal<string | null>` - A readonly signal containing the route fragment (null if no fragment)

## Notes

- Uses `toSignal` with `route.fragment` observable
- Returns `null` when no fragment is present in the URL
- Updates reactively when the fragment changes
- Perfect for implementing smooth scrolling or highlighting active sections

## Source

<<< @/../projects/angular-reactive-primitives/src/lib/composables/route/use-route-fragment/use-route-fragment.composable.ts
