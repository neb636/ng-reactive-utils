# useMediaQuery

Creates a signal that tracks whether a CSS media query matches. The signal automatically updates when the match state changes (e.g., when the window is resized or device orientation changes).

## Usage

### Basic Usage

```typescript
import { useMediaQuery } from 'ng-reactive-utils';

@Component({
  template: `
    <div [class.mobile]="isMobile()">
      @if (isMobile()) {
        <p>Mobile view</p>
      } @else {
        <p>Desktop view</p>
      }
    </div>
  `,
})
class ResponsiveComponent {
  isMobile = useMediaQuery('(max-width: 768px)');
}
```

### Multiple Media Queries

```typescript
@Component({
  template: `
    <div [class]="deviceClass()">
      <p>Current breakpoint: {{ breakpoint() }}</p>
    </div>
  `,
})
class BreakpointComponent {
  isMobile = useMediaQuery('(max-width: 640px)');
  isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  isDesktop = useMediaQuery('(min-width: 1025px)');

  breakpoint = computed(() => {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    if (this.isDesktop()) return 'desktop';
    return 'unknown';
  });

  deviceClass = computed(() => `device-${this.breakpoint()}`);
}
```

### Dark Mode Detection

```typescript
@Component({
  template: `
    <div [class.dark-mode]="prefersDark()">
      <p>Theme: {{ prefersDark() ? 'Dark' : 'Light' }}</p>
    </div>
  `,
})
class ThemeDetectionComponent {
  prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
}
```

### Device Orientation

```typescript
@Component({
  template: `
    <div>
      <p>Orientation: {{ isPortrait() ? 'Portrait' : 'Landscape' }}</p>
    </div>
  `,
})
class OrientationComponent {
  isPortrait = useMediaQuery('(orientation: portrait)');
  isLandscape = useMediaQuery('(orientation: landscape)');
}
```

### Print Media Query

```typescript
@Component({
  template: `
    @if (isPrint()) {
      <div>Print-friendly version</div>
    } @else {
      <div>Screen version with interactive elements</div>
    }
  `,
})
class PrintableComponent {
  isPrint = useMediaQuery('print');
}
```

### Reduced Motion Preference

```typescript
@Component({
  template: `<div [class.no-animations]="prefersReducedMotion()">Content</div>`,
})
class AccessibilityComponent {
  prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
}
```

### High Resolution Display

```typescript
@Component({
  template: `
    <img [src]="imageSrc()" alt="Logo" />
  `,
})
class RetinaImageComponent {
  isHighDPI = useMediaQuery('(min-resolution: 2dppx)');

  imageSrc = computed(() => {
    return this.isHighDPI() ? 'logo@2x.png' : 'logo.png';
  });
}
```

### Responsive Layout with Shared Instance

```typescript
@Component({
  selector: 'app-header',
  template: `<header [class.compact]="isMobile()">Header</header>`,
})
class HeaderComponent {
  // Shared across all components in the same injector context
  isMobile = useMediaQuery('(max-width: 768px)');
}

@Component({
  selector: 'app-sidebar',
  template: `<aside [class.collapsed]="isMobile()">Sidebar</aside>`,
})
class SidebarComponent {
  // Same query = same shared instance as HeaderComponent
  isMobile = useMediaQuery('(max-width: 768px)');
}
```

## Parameters

| Parameter | Type     | Description                                            |
| --------- | -------- | ------------------------------------------------------ |
| `query`   | `string` | CSS media query string (e.g., '(max-width: 768px)')   |

## Returns

`Signal<boolean>` - A readonly signal that is `true` when the media query matches, `false` otherwise

## Notes

- **Returned signal is readonly** to prevent direct manipulation
- Uses `createSharedComposable` internally - components with the same query string share a single instance
- Query strings are normalized (lowercased, whitespace collapsed) for consistent sharing behavior
- Different query strings create separate instances with their own `MediaQueryList` listeners
- Uses native `window.matchMedia()` API for efficient media query matching
- Event listeners are **automatically cleaned up** when no more subscribers
- On the server, returns `false` by default and updates to actual value once hydrated on the client
- Media query syntax follows standard CSS media query rules
- Supports all standard media features: width, height, orientation, resolution, color-scheme, etc.
- **Invalid media queries**: The browser's `matchMedia()` API does not throw errors for invalid queries. Instead, invalid queries will always return `false`. Ensure your query syntax is correct to avoid unexpected behavior.

## Common Media Queries

### Breakpoints
- `(max-width: 640px)` - Mobile
- `(min-width: 641px) and (max-width: 1024px)` - Tablet
- `(min-width: 1025px)` - Desktop
- `(min-width: 1280px)` - Large desktop

### User Preferences
- `(prefers-color-scheme: dark)` - Dark mode preference
- `(prefers-color-scheme: light)` - Light mode preference
- `(prefers-reduced-motion: reduce)` - Reduced motion preference
- `(prefers-contrast: high)` - High contrast preference

### Device Features
- `(orientation: portrait)` - Portrait orientation
- `(orientation: landscape)` - Landscape orientation
- `(hover: hover)` - Device supports hover interactions
- `(pointer: fine)` - Device has precise pointing (mouse)
- `(pointer: coarse)` - Device has imprecise pointing (touch)

### Display Quality
- `(min-resolution: 2dppx)` - Retina/high-DPI displays
- `(min-resolution: 192dpi)` - Same as above, different unit

### Print
- `print` - Print media type
- `screen` - Screen media type

## Common Use Cases

- **Responsive design**: Show/hide elements based on screen size
- **Dark mode**: Detect and respond to system theme preferences
- **Accessibility**: Respect user preferences for reduced motion or high contrast
- **Device optimization**: Load different assets or layouts for mobile vs desktop
- **Print styles**: Display print-friendly content when printing
- **Progressive enhancement**: Detect device capabilities and adjust features accordingly

## Source

<<< @/../src/lib/composables/browser/use-media-query/use-media-query.composable.ts
