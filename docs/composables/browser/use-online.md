# useOnline

Creates a signal that tracks the network connection status. The signal updates automatically when the browser goes online or offline.

## Usage

### Basic Usage

```typescript
import { useOnline } from 'ng-reactive-utils';

@Component({
  template: `
    <div [class.offline]="!isOnline()">
      @if (isOnline()) {
        <p>✓ Connected to the internet</p>
      } @else {
        <p>⚠ No internet connection</p>
      }
    </div>
  `,
})
class NetworkStatusComponent {
  isOnline = useOnline();
}
```

### Conditional Data Fetching

```typescript
@Component({
  template: `
    <button 
      (click)="syncData()" 
      [disabled]="!isOnline()">
      Sync Data
    </button>
    <p>{{ statusMessage() }}</p>
  `,
})
class DataSyncComponent {
  isOnline = useOnline();
  
  statusMessage = computed(() => 
    this.isOnline() 
      ? 'Ready to sync' 
      : 'Offline - sync disabled'
  );

  syncData() {
    if (this.isOnline()) {
      // Perform sync operation
      console.log('Syncing data...');
    }
  }
}
```

### With Effects

```typescript
@Component({
  template: `<p>Connection status tracked in console</p>`,
})
class ConnectionTrackerComponent {
  isOnline = useOnline();

  constructor() {
    effect(() => {
      if (this.isOnline()) {
        console.log('Connection restored - resuming operations');
        this.resumeBackgroundSync();
      } else {
        console.log('Connection lost - pausing operations');
        this.pauseBackgroundSync();
      }
    });
  }

  private resumeBackgroundSync() {
    // Resume background operations
  }

  private pauseBackgroundSync() {
    // Pause background operations
  }
}
```

### Offline Indicator

```typescript
@Component({
  template: `
    @if (!isOnline()) {
      <div class="offline-banner">
        You are currently offline. Some features may be unavailable.
      </div>
    }
    
    <main>
      <!-- App content -->
    </main>
  `,
  styles: [`
    .offline-banner {
      background: #f59e0b;
      color: white;
      padding: 1rem;
      text-align: center;
    }
  `],
})
class AppComponent {
  isOnline = useOnline();
}
```

### Queue Requests When Offline

```typescript
@Component({
  template: `
    <button (click)="submitForm()">Submit</button>
    <p>{{ queueSize() }} requests queued</p>
  `,
})
class OfflineQueueComponent {
  isOnline = useOnline();
  requestQueue = signal<Array<() => Promise<void>>>([]);
  
  queueSize = computed(() => this.requestQueue().length);

  constructor() {
    // Process queue when connection is restored
    effect(() => {
      if (this.isOnline() && this.requestQueue().length > 0) {
        this.processQueue();
      }
    });
  }

  submitForm() {
    const request = () => this.sendToServer();
    
    if (this.isOnline()) {
      request();
    } else {
      this.requestQueue.update(queue => [...queue, request]);
    }
  }

  private async processQueue() {
    const queue = this.requestQueue();
    for (const request of queue) {
      await request();
    }
    this.requestQueue.set([]);
  }

  private async sendToServer() {
    // Send data to server
    console.log('Sending data...');
  }
}
```

### Online-Only Features

```typescript
@Component({
  template: `
    <nav>
      <button [disabled]="!isOnline()">Cloud Sync</button>
      <button [disabled]="!isOnline()">Share</button>
      <button>Local Save</button>
    </nav>
    
    @if (!isOnline()) {
      <p class="notice">Some features require an internet connection</p>
    }
  `,
})
class FeatureGatingComponent {
  isOnline = useOnline();
}
```

## Returns

`Signal<boolean>` - A readonly signal that is `true` when online, `false` when offline.

## Notes

- **Returned signal is readonly** to prevent direct manipulation
- Uses `createSharedComposable` internally so there is only one shared instance and event listeners are automatically cleaned up when no more components are using it
- Listens to the browser's `online` and `offline` events on the `window` object
- On the server, returns `true` (online) by default and updates to actual value once hydrated on the client
- The signal reflects the browser's network state, not whether internet is actually reachable (a device can be "online" but not connected to the internet)
- Event listeners are automatically cleaned up when the last component unsubscribes

## Common Use Cases

- **Offline indicators**: Show banners or badges when connection is lost
- **Conditional features**: Disable cloud sync, sharing, or other online-only features
- **Request queuing**: Queue API requests while offline and process when connection returns
- **Auto-retry logic**: Automatically retry failed requests when connection is restored
- **PWA functionality**: Essential for Progressive Web Apps that work offline
- **User notifications**: Notify users when connection status changes

## Browser Compatibility

The composable uses the standard `online` and `offline` events which are supported in all modern browsers. The initial state is determined by `navigator.onLine`.

## Best Practices

### Don't Rely on Initial State

```typescript
// ⚠ Don't assume initial state means internet access
if (isOnline()) {
  // Browser says online, but might not have actual internet
}

// ✅ Do verify with actual request if critical
async function verifyConnection() {
  if (!isOnline()) return false;
  
  try {
    await fetch('/api/health', { method: 'HEAD' });
    return true;
  } catch {
    return false;
  }
}
```

### Combine with Loading States

```typescript
@Component({
  template: `
    <button 
      (click)="save()" 
      [disabled]="!isOnline() || isSaving()">
      {{ buttonText() }}
    </button>
  `,
})
class SaveComponent {
  isOnline = useOnline();
  isSaving = signal(false);
  
  buttonText = computed(() => {
    if (!this.isOnline()) return 'Offline';
    if (this.isSaving()) return 'Saving...';
    return 'Save';
  });

  async save() {
    this.isSaving.set(true);
    try {
      await this.saveToServer();
    } finally {
      this.isSaving.set(false);
    }
  }

  private async saveToServer() {
    // Save logic
  }
}
```

### Provide Feedback on Status Changes

```typescript
@Component({
  template: `<div>Network: {{ status() }}</div>`,
})
class NetworkFeedbackComponent {
  isOnline = useOnline();
  private toastService = inject(ToastService);

  constructor() {
    let previousState = this.isOnline();
    
    effect(() => {
      const currentState = this.isOnline();
      
      // Only show notification on changes (not initial state)
      if (previousState !== currentState) {
        if (currentState) {
          this.toastService.success('Connection restored');
        } else {
          this.toastService.warning('Connection lost');
        }
      }
      
      previousState = currentState;
    });
  }

  status = computed(() => this.isOnline() ? 'Online' : 'Offline');
}
```

## Source

<<< @/../src/lib/composables/browser/use-online/use-online.composable.ts
