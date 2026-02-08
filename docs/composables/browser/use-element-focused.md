# useElementFocused

Creates a writable signal that tracks and controls the focus state of an element. The signal updates when the element gains or loses focus, and setting the signal programmatically will focus or blur the element.

## Usage

### Basic Usage

```typescript
import { useElementFocused } from 'ng-reactive-utils';
import { Component, viewChild, ElementRef } from '@angular/core';

@Component({
  template: `
    <input #inputElement type="text" placeholder="Focus me">
    <p>Input is focused: {{ isFocused() }}</p>
  `,
})
class FocusTrackerComponent {
  inputRef = viewChild<ElementRef>('inputElement');
  isFocused = useElementFocused(this.inputRef);
}
```

### Programmatic Focus Control

```typescript
@Component({
  template: `
    <input #searchInput type="search" placeholder="Search...">
    <button (click)="focusSearch()">Focus Search</button>
    <button (click)="blurSearch()">Blur Search</button>
  `,
})
class SearchFocusComponent {
  searchInputRef = viewChild<ElementRef>('searchInput');
  isFocused = useElementFocused(this.searchInputRef);

  focusSearch() {
    this.isFocused.set(true); // Programmatically focus
  }

  blurSearch() {
    this.isFocused.set(false); // Programmatically blur
  }
}
```

### Auto-focus on Mount

```typescript
@Component({
  template: `
    <input #nameInput type="text" placeholder="Name">
  `,
})
class AutoFocusComponent {
  nameInputRef = viewChild<ElementRef>('nameInput');
  isFocused = useElementFocused(this.nameInputRef, {
    initialValue: true, // Auto-focus on mount
  });
}
```

### Focus Indicator with Styling

```typescript
@Component({
  template: `
    <div 
      class="input-wrapper"
      [class.focused]="isFocused()">
      <label>Email</label>
      <input 
        #emailInput 
        type="email" 
        placeholder="you@example.com">
      <span class="focus-ring"></span>
    </div>
  `,
  styles: [`
    .input-wrapper {
      position: relative;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
      transition: all 0.2s;
    }
    
    .input-wrapper.focused {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .focus-ring {
      position: absolute;
      inset: -4px;
      border: 2px solid #3b82f6;
      border-radius: 10px;
      opacity: 0;
      transition: opacity 0.2s;
      pointer-events: none;
    }
    
    .input-wrapper.focused .focus-ring {
      opacity: 1;
    }
  `],
})
class StyledFocusComponent {
  emailInputRef = viewChild<ElementRef>('emailInput');
  isFocused = useElementFocused(this.emailInputRef);
}
```

### Focus Trap in Modal

```typescript
@Component({
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Modal Title</h2>
          
          <input 
            #firstInput 
            type="text" 
            placeholder="First input">
          
          <input 
            #lastInput 
            type="text" 
            placeholder="Last input">
          
          <button (click)="close()">Close</button>
        </div>
      </div>
    }
  `,
})
class ModalFocusTrapComponent {
  isOpen = signal(false);
  firstInputRef = viewChild<ElementRef>('firstInput');
  lastInputRef = viewChild<ElementRef>('lastInput');
  
  firstInputFocused = useElementFocused(this.firstInputRef);
  lastInputFocused = useElementFocused(this.lastInputRef);

  constructor() {
    // Auto-focus first input when modal opens
    effect(() => {
      if (this.isOpen()) {
        setTimeout(() => this.firstInputFocused.set(true), 100);
      }
    });
  }

  close() {
    this.isOpen.set(false);
  }
}
```

### Focus Management in Form

```typescript
@Component({
  template: `
    <form (submit)="handleSubmit($event)">
      <input 
        #emailInput 
        type="email" 
        placeholder="Email"
        [class.error]="emailError()">
      
      <input 
        #passwordInput 
        type="password" 
        placeholder="Password"
        [class.error]="passwordError()">
      
      <button type="submit">Sign In</button>
    </form>
    
    @if (emailError()) {
      <p class="error-message">{{ emailError() }}</p>
    }
    
    @if (passwordError()) {
      <p class="error-message">{{ passwordError() }}</p>
    }
  `,
})
class FormFocusComponent {
  emailInputRef = viewChild<ElementRef>('emailInput');
  passwordInputRef = viewChild<ElementRef>('passwordInput');
  
  emailFocused = useElementFocused(this.emailInputRef);
  passwordFocused = useElementFocused(this.passwordInputRef);
  
  emailError = signal<string | null>(null);
  passwordError = signal<string | null>(null);

  handleSubmit(event: Event) {
    event.preventDefault();
    
    const email = this.emailInputRef()?.nativeElement.value;
    const password = this.passwordInputRef()?.nativeElement.value;
    
    // Validation
    if (!email) {
      this.emailError.set('Email is required');
      this.emailFocused.set(true); // Focus first error field
      return;
    }
    
    if (!password) {
      this.passwordError.set('Password is required');
      this.passwordFocused.set(true);
      return;
    }
    
    // Submit form
    console.log('Submitting form');
  }
}
```

### Keyboard Navigation

```typescript
@Component({
  template: `
    <div class="menu">
      @for (item of menuItems; track item.id; let i = $index) {
        <button
          #menuItem
          [attr.data-index]="i"
          [class.focused]="focusStates()[i]()"
          (click)="selectItem(item)">
          {{ item.label }}
        </button>
      }
    </div>
  `,
})
class KeyboardMenuComponent {
  menuItems = [
    { id: 1, label: 'Home' },
    { id: 2, label: 'Profile' },
    { id: 3, label: 'Settings' },
    { id: 4, label: 'Logout' },
  ];
  
  menuItemRefs = viewChildren<ElementRef>('menuItem');
  focusStates = computed(() => 
    this.menuItemRefs().map(ref => useElementFocused(signal(ref)))
  );

  constructor() {
    useEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.focusNext();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.focusPrevious();
      }
    });
  }

  private getCurrentFocusIndex(): number {
    return this.focusStates().findIndex(focused => focused());
  }

  private focusNext() {
    const current = this.getCurrentFocusIndex();
    const next = (current + 1) % this.menuItems.length;
    this.focusStates()[next].set(true);
  }

  private focusPrevious() {
    const current = this.getCurrentFocusIndex();
    const prev = (current - 1 + this.menuItems.length) % this.menuItems.length;
    this.focusStates()[prev].set(true);
  }

  selectItem(item: any) {
    console.log('Selected:', item.label);
  }
}
```

### Focus Visible Support

```typescript
@Component({
  template: `
    <button 
      #actionButton
      [class.focus-visible]="isFocusVisible()">
      Click or Tab to me
    </button>
  `,
  styles: [`
    button {
      padding: 1rem 2rem;
      outline: none;
    }
    
    /* Only show focus ring for keyboard navigation */
    button.focus-visible {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
    }
  `],
})
class FocusVisibleComponent {
  buttonRef = viewChild<ElementRef>('actionButton');
  
  isFocused = useElementFocused(this.buttonRef, {
    focusVisible: true, // Only track keyboard focus
  });
  
  isFocusVisible = computed(() => this.isFocused());
}
```

### Conditional Focus on Search

```typescript
@Component({
  template: `
    <button (click)="toggleSearch()">
      {{ showSearch() ? 'Hide' : 'Show' }} Search
    </button>
    
    @if (showSearch()) {
      <input 
        #searchInput 
        type="search" 
        placeholder="Search..."
        (input)="onSearch($event)">
      
      <p>Focused: {{ isFocused() }}</p>
    }
  `,
})
class ConditionalFocusComponent {
  showSearch = signal(false);
  searchInputRef = viewChild<ElementRef>('searchInput');
  isFocused = useElementFocused(this.searchInputRef);

  toggleSearch() {
    this.showSearch.update(v => !v);
    
    // Auto-focus when showing search
    if (this.showSearch()) {
      setTimeout(() => this.isFocused.set(true), 0);
    }
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    console.log('Searching for:', value);
  }
}
```

### Focus State in Dropdown

```typescript
@Component({
  template: `
    <div class="dropdown">
      <button 
        #trigger
        (click)="toggleDropdown()"
        [class.active]="isOpen()">
        {{ selectedOption() || 'Select option' }}
      </button>
      
      @if (isOpen()) {
        <ul class="dropdown-menu">
          @for (option of options; track option) {
            <li 
              #option
              tabindex="0"
              (click)="selectOption(option)"
              (keydown.enter)="selectOption(option)">
              {{ option }}
            </li>
          }
        </ul>
      }
    </div>
  `,
})
class DropdownFocusComponent {
  isOpen = signal(false);
  selectedOption = signal<string | null>(null);
  options = ['Option 1', 'Option 2', 'Option 3'];
  
  triggerRef = viewChild<ElementRef>('trigger');
  triggerFocused = useElementFocused(this.triggerRef);

  constructor() {
    // Close dropdown when trigger loses focus
    effect(() => {
      if (!this.triggerFocused() && this.isOpen()) {
        setTimeout(() => this.isOpen.set(false), 200);
      }
    });
  }

  toggleDropdown() {
    this.isOpen.update(v => !v);
  }

  selectOption(option: string) {
    this.selectedOption.set(option);
    this.isOpen.set(false);
    this.triggerFocused.set(true); // Return focus to trigger
  }
}
```

## Parameters

| Parameter       | Type                                                 | Description                                          |
| --------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `elementSignal` | `Signal<Element \| ElementRef \| null \| undefined>` | Signal containing the element or ElementRef to track |
| `options`       | `UseElementFocusedOptions` (optional)                | Configuration options                                |

### Options Object

| Property        | Type      | Default | Description                                           |
| --------------- | --------- | ------- | ----------------------------------------------------- |
| `initialValue`  | `boolean` | `false` | Whether to focus the element on initialization        |
| `focusVisible`  | `boolean` | `false` | Only track focus from keyboard (like :focus-visible)  |

## Returns

`WritableSignal<boolean>` - A writable signal representing the focus state

- **Read**: Returns `true` if element is focused, `false` otherwise
- **Write**: Set to `true` to focus element, `false` to blur element

## Notes

- **Returned signal is writable** - setting it to `true` focuses the element, `false` blurs it
- Uses **effect** internally to watch for element changes and sync focus state
- Automatically **cleans up event listeners** when component is destroyed
- When `focusVisible: true`, only keyboard focus (not mouse clicks) will set the signal to `true`
- Setting the signal to `true` will call `element.focus()` under the hood
- Setting the signal to `false` will call `element.blur()` under the hood
- On the server, returns `false` and syncs to actual state once hydrated on the client
- When element is `null` or `undefined`, the signal reflects the last known state
- Supports both `Element` and `ElementRef` types

## Common Use Cases

- **Focus indicators**: Show custom focus indicators around focused elements
- **Auto-focus**: Automatically focus inputs when components mount or become visible
- **Form validation**: Focus first invalid field when form is submitted
- **Keyboard navigation**: Implement custom keyboard navigation in menus, lists, dropdowns
- **Focus traps**: Keep focus within modals or dialogs for accessibility
- **Focus management**: Restore focus after closing modals or completing actions
- **Accessibility**: Improve keyboard navigation and screen reader support
- **Search interfaces**: Auto-focus search inputs when toggled

## Accessibility Considerations

This composable is particularly useful for implementing accessible focus management:

- Trap focus within modals and dialogs
- Manage focus order in custom widgets
- Return focus to triggering element after closing overlays
- Provide keyboard navigation in custom components
- Implement skip-to-content links
- Follow ARIA authoring practices for focus management

## Best Practices

### Auto-focus Pattern

```typescript
// ✅ Good: Focus after a small delay to ensure element is rendered
effect(() => {
  if (shouldFocus()) {
    setTimeout(() => isFocused.set(true), 0);
  }
});
```

### Focus Restoration

```typescript
// ✅ Good: Restore focus after modal closes
const previouslyFocused = document.activeElement;

openModal();

onModalClose(() => {
  (previouslyFocused as HTMLElement)?.focus();
});
```

### Focus Visible for Buttons

```typescript
// ✅ Good: Use focusVisible for buttons to avoid mouse focus ring
const isFocused = useElementFocused(buttonRef, {
  focusVisible: true, // Only keyboard focus shows ring
});
```

### Conditional Auto-focus

```typescript
// ✅ Good: Only auto-focus if appropriate
const isFocused = useElementFocused(inputRef, {
  initialValue: !isMobile(), // Don't auto-focus on mobile (shows keyboard)
});
```

## Performance Tips

- Setting the signal to the same value (e.g., `true` when already focused) is a no-op
- The composable uses passive event listeners for better performance
- Focus/blur operations are debounced internally to prevent rapid state changes

## Source

<<< @/../src/lib/composables/browser/use-element-focused/use-element-focused.composable.ts
