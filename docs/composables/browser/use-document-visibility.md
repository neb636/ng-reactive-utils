# useDocumentVisibility

Creates a signal that tracks whether the document/tab is visible or hidden. The signal updates when the user switches tabs or minimizes the window.

**MDN Reference:** [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)

## When to Use

Use `useDocumentVisibility` when you want to pause or resume activity based on tab focus — for example, pausing animations, stopping polling, or pausing video playback when the user switches away.

## Usage

```typescript
import { useDocumentVisibility } from 'ng-reactive-utils';

@Component({
  template: `<h1>Tab currently visible: {{ isVisible() }}</h1>`,
})
class ExampleComponent {
  isVisible = useDocumentVisibility();
}
```

### Pause Polling When Hidden

```typescript
import { useDocumentVisibility } from 'ng-reactive-utils';

@Component({ template: `...` })
class DashboardComponent {
  isVisible = useDocumentVisibility();

  constructor() {
    effect(() => {
      if (this.isVisible()) {
        this.startPolling();
      } else {
        this.stopPolling();
      }
    });
  }
}
```

## Parameters

This composable takes no parameters.

## Returns

`Signal<boolean>` — A readonly signal that is `true` when the page is visible, `false` when hidden (tab is backgrounded or window is minimized). Defaults to `true` on the server (SSR).

## Notes

- Returned signal is **readonly** to prevent direct manipulation
- Uses `createSharedComposable` internally so there is only one shared instance at a time; event listeners are torn down automatically when no more consumers exist
- **SSR safe**: defaults to `true` on the server where `document` is not available

## Source

<<< @/../src/lib/composables/browser/use-document-visibility/use-document-visibility.composable.ts
