---
layout: home

hero:
  name: Angular Reactive Primitives
  text: Reactive building blocks for modern Angular
  tagline: A collection of small, reusable composables and effects for Angular 20+ applications
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/neb636/angular-reactive-primitives

features:
  - icon: 🌳
    title: Fully Tree-Shakeable
    details: Only import what you need. Each primitive is a standalone function that can be imported individually.
  - icon: 💪
    title: Strongly Typed
    details: Full TypeScript support with comprehensive type definitions for excellent developer experience.
  - icon: 🎯
    title: Signal-First
    details: Built on Angular's reactive primitives. Signals in, signals out - seamlessly integrated.
  - icon: 🔧
    title: Composable
    details: Mix and match primitives to build complex behaviors from simple building blocks.
---

## Quick Example

```typescript
import { Component, signal } from '@angular/core';
import { useDebouncedSignal } from 'angular-reactive-primitives';

@Component({
  selector: 'search-box',
  template: `
    <input
      [value]="searchTerm()"
      (input)="searchTerm.set($any($event.target).value)"
    />
    <p>Debounced: {{ debouncedSearch() }}</p>
  `,
})
export class SearchBoxComponent {
  searchTerm = signal('');
  debouncedSearch = useDebouncedSignal(this.searchTerm, 300);
}
```
