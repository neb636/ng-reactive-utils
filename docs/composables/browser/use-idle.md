# useIdle

Creates a signal that tracks whether the user is idle (inactive) on the page. The signal automatically updates based on user interactions like mouse movement, keyboard input, and touch events.

## Usage

### Basic Usage

```typescript
import { useIdle } from 'ng-reactive-utils';

@Component({
  template: `
    <div>
      <p>User is {{ isIdle() ? 'idle' : 'active' }}</p>
      <p>Last activity: {{ lastActive() | date:'medium' }}</p>
    </div>
  `,
})
class IdleTrackerComponent {
  { isIdle, lastActive } = useIdle(60000); // 1 minute
}
```

### Auto-Lock Screen

```typescript
@Component({
  template: `
    @if (isLocked()) {
      <div class="lock-screen">
        <h2>Screen Locked</h2>
        <button (click)="unlock()">Unlock</button>
      </div>
    } @else {
      <main>
        <p>Protected content</p>
        <p>Auto-locks after {{ idleTimeoutSeconds() }}s of inactivity</p>
      </main>
    }
  `,
})
class AutoLockComponent {
  idleTimeoutSeconds = 30;
  isLocked = signal(false);
  
  { isIdle, reset } = useIdle(this.idleTimeoutSeconds * 1000);

  constructor() {
    effect(() => {
      if (this.isIdle() && !this.isLocked()) {
        this.isLocked.set(true);
        console.log('Screen locked due to inactivity');
      }
    });
  }

  unlock() {
    this.isLocked.set(false);
    reset(); // Reset idle timer
  }
}
```

### Session Timeout Warning

```typescript
@Component({
  template: `
    @if (showWarning()) {
      <div class="warning-banner">
        Your session will expire in {{ timeUntilExpiry() }}s due to inactivity.
        <button (click)="extendSession()">Stay Logged In</button>
      </div>
    }
    
    <main>Application content</main>
  `,
})
class SessionTimeoutComponent {
  private sessionTimeout = 15 * 60 * 1000; // 15 minutes
  private warningTime = 13 * 60 * 1000; // Show warning at 13 minutes
  
  { isIdle, lastActive, reset } = useIdle(this.sessionTimeout);
  
  showWarning = computed(() => {
    const idleTime = Date.now() - this.lastActive().getTime();
    return idleTime >= this.warningTime && !this.isIdle();
  });
  
  timeUntilExpiry = computed(() => {
    const idleTime = Date.now() - this.lastActive().getTime();
    const remaining = this.sessionTimeout - idleTime;
    return Math.max(0, Math.floor(remaining / 1000));
  });

  constructor() {
    effect(() => {
      if (this.isIdle()) {
        this.logout();
      }
    });
  }

  extendSession() {
    reset();
  }

  private logout() {
    console.log('Session expired - logging out');
    // Redirect to login
  }
}
```

### Pause Video on Idle

```typescript
@Component({
  template: `
    <video 
      #videoPlayer 
      [src]="videoUrl"
      (play)="onPlay()"
      (pause)="onPause()">
    </video>
    
    @if (isIdle() && wasPlaying()) {
      <div class="idle-overlay">
        <p>Video paused due to inactivity</p>
        <button (click)="resumeVideo()">Resume</button>
      </div>
    }
  `,
})
class VideoPauseComponent {
  videoPlayerRef = viewChild<ElementRef<HTMLVideoElement>>('videoPlayer');
  videoUrl = 'https://example.com/video.mp4';
  wasPlaying = signal(false);
  
  { isIdle, reset } = useIdle(2 * 60 * 1000); // 2 minutes

  constructor() {
    effect(() => {
      const video = this.videoPlayerRef()?.nativeElement;
      if (!video) return;
      
      if (this.isIdle() && !video.paused) {
        this.wasPlaying.set(true);
        video.pause();
      }
    });
  }

  onPlay() {
    this.wasPlaying.set(true);
  }

  onPause() {
    this.wasPlaying.set(false);
  }

  resumeVideo() {
    const video = this.videoPlayerRef()?.nativeElement;
    if (video && this.wasPlaying()) {
      video.play();
      this.wasPlaying.set(false);
    }
    reset();
  }
}
```

### Reduce Background Activity

```typescript
@Component({
  template: `
    <div>
      <p>Status: {{ status() }}</p>
      <p>Polling: {{ isPolling() ? 'Active' : 'Paused' }}</p>
    </div>
  `,
})
class BackgroundActivityComponent {
  { isIdle } = useIdle(5 * 60 * 1000); // 5 minutes
  isPolling = signal(true);
  
  status = computed(() => 
    this.isIdle() ? 'Idle - reduced activity' : 'Active'
  );

  constructor() {
    // Adjust polling based on idle state
    effect(() => {
      if (this.isIdle()) {
        this.isPolling.set(false);
        console.log('User idle - stopping background polling');
      } else {
        this.isPolling.set(true);
        console.log('User active - resuming background polling');
      }
    });
    
    // Start polling
    this.startPolling();
  }

  private startPolling() {
    setInterval(() => {
      if (this.isPolling()) {
        this.fetchUpdates();
      }
    }, 30000); // Poll every 30 seconds when active
  }

  private async fetchUpdates() {
    // Fetch data from server
    console.log('Polling for updates...');
  }
}
```

### Custom Events Tracking

```typescript
@Component({
  template: `
    <div>
      <p>User idle: {{ isIdle() }}</p>
      <p>Tracking: mouse, keyboard, and custom events</p>
    </div>
  `,
})
class CustomEventsIdleComponent {
  { isIdle, lastActive } = useIdle(60000, {
    events: [
      'mousemove',
      'keydown',
      'mousedown',
      'touchstart',
      'click',
      'scroll',
      'custom-activity', // Custom event
    ],
  });

  triggerActivity() {
    // Dispatch custom event to reset idle timer
    window.dispatchEvent(new Event('custom-activity'));
  }
}
```

### Idle Indicator with Timer

```typescript
@Component({
  template: `
    <div class="idle-indicator" [class.idle]="isIdle()">
      <span class="status-dot"></span>
      <span>{{ statusText() }}</span>
      <span class="timer">{{ idleTimeDisplay() }}</span>
    </div>
  `,
  styles: [`
    .idle-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #10b981;
      color: white;
      border-radius: 4px;
    }
    
    .idle-indicator.idle {
      background: #6b7280;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
  `],
})
class IdleIndicatorComponent {
  { isIdle, lastActive } = useIdle(5 * 60 * 1000); // 5 minutes
  
  statusText = computed(() => 
    this.isIdle() ? 'Idle' : 'Active'
  );
  
  idleTimeDisplay = computed(() => {
    const now = Date.now();
    const last = this.lastActive().getTime();
    const seconds = Math.floor((now - last) / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  });
  
  constructor() {
    // Update display every second
    setInterval(() => {
      // Force recomputation by reading signal
      this.lastActive();
    }, 1000);
  }
}
```

### Prevent Idle During Form Editing

```typescript
@Component({
  template: `
    <form [formGroup]="form">
      <input formControlName="email" placeholder="Email">
      <textarea formControlName="message" placeholder="Message"></textarea>
    </form>
    
    @if (isIdle() && !isEditing()) {
      <p>Session will timeout soon</p>
    }
  `,
})
class FormIdleComponent {
  form = new FormGroup({
    email: new FormControl(''),
    message: new FormControl(''),
  });
  
  { isIdle, reset } = useIdle(10 * 60 * 1000); // 10 minutes
  isEditing = signal(false);

  constructor() {
    // Reset idle timer when user types in form
    this.form.valueChanges.subscribe(() => {
      this.isEditing.set(true);
      reset();
      
      // Clear editing flag after a delay
      setTimeout(() => this.isEditing.set(false), 5000);
    });
  }
}
```

## Parameters

| Parameter | Type                           | Default | Description                                          |
| --------- | ------------------------------ | ------- | ---------------------------------------------------- |
| `timeout` | `number`                       | `60000` | Idle timeout in milliseconds (default: 1 minute)     |
| `options` | `UseIdleOptions` (optional)    | `{}`    | Configuration options                                |

### Options Object

| Property        | Type       | Default                                                                    | Description                                    |
| --------------- | ---------- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| `events`        | `string[]` | `['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel', 'resize']` | Events that indicate user activity             |
| `initialState`  | `boolean`  | `false`                                                                    | Initial idle state                             |

## Returns

Returns an object with the following properties:

| Property     | Type              | Description                                       |
| ------------ | ----------------- | ------------------------------------------------- |
| `isIdle`     | `Signal<boolean>` | Whether the user is currently idle                |
| `lastActive` | `Signal<Date>`    | Timestamp of last user activity                   |
| `reset`      | `() => void`      | Reset the idle timer (mark user as active)        |

## Notes

- **Returned signals are readonly** to prevent direct manipulation
- Listens to multiple **user interaction events** on the window to detect activity
- Default events tracked: `mousemove`, `mousedown`, `keydown`, `touchstart`, `wheel`, `resize`
- Event listeners are **automatically cleaned up** when component is destroyed
- Uses **throttling** internally (500ms) to avoid excessive updates from high-frequency events
- On the server, always returns `isIdle: false` and syncs once hydrated on the client
- Calling `reset()` manually resets the idle timer and marks user as active
- The `lastActive` signal updates every time user activity is detected
- Consider using `createSharedComposable` if you want a single shared idle state across components

## Common Use Cases

- **Auto-lock screens**: Lock sensitive screens after period of inactivity
- **Session timeouts**: Log out users after being idle too long
- **Resource optimization**: Pause polling, animations, or videos when user is idle
- **Analytics**: Track user engagement and active time
- **Power saving**: Reduce background activity for better battery life
- **Auto-save**: Trigger auto-save when user stops typing
- **Notifications**: Show warnings before session expires
- **Game pause**: Auto-pause games when player is inactive

## Performance Considerations

- Uses **throttled event handlers** (500ms) to prevent excessive checks
- Only tracks events on `window` - doesn't observe individual elements
- Very lightweight - minimal performance impact
- Event listeners are passive where supported

## Best Practices

### Set Appropriate Timeouts

```typescript
// ✅ Good: Choose timeout based on use case
useIdle(30 * 1000);        // 30s for auto-pause video
useIdle(5 * 60 * 1000);    // 5m for reduced activity
useIdle(15 * 60 * 1000);   // 15m for session timeout
useIdle(30 * 60 * 1000);   // 30m for auto-lock
```

### Provide Warning Before Action

```typescript
// ✅ Good: Warn user before taking action
const warningTime = sessionTimeout * 0.8; // 80% of timeout

effect(() => {
  const timeSinceActive = Date.now() - lastActive().getTime();
  
  if (timeSinceActive >= warningTime && !hasWarned()) {
    showWarning();
    setHasWarned(true);
  }
  
  if (isIdle()) {
    logout();
  }
});
```

### Reset on Explicit Actions

```typescript
// ✅ Good: Reset timer on important user actions
saveButton.addEventListener('click', () => {
  save();
  reset(); // Keep session alive
});
```

### Combine with Visibility

```typescript
// ✅ Good: Account for hidden tabs
const isVisible = useDocumentVisibility();

effect(() => {
  // Only take action if tab is visible and user is idle
  if (isVisible() && isIdle()) {
    pauseActivity();
  }
});
```

## Source

<<< @/../src/lib/composables/browser/use-idle/use-idle.composable.ts
