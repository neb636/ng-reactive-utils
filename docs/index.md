---
layout: home

hero:
  name: NG Reactive Utils
  text: Composable Building Blocks for Modern Angular
  tagline: A collection of small, reusable reactive utilities built around signals for Angular 20+
  image:
    src: /hero-illustration.svg
    alt: Reactive signals and composables illustration
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/neb636/ng-reactive-utils
    - theme: alt
      text: View on npm
      link: https://www.npmjs.com/package/ng-reactive-utils

features:
  - icon: 🌳
    title: Tree-Shakeable
    details: Only import what you need. Each primitive is independently packaged for optimal bundle size.

  - icon: 💪
    title: Strongly Typed
    details: Full TypeScript support with comprehensive type definitions for a better developer experience.

  - icon: 🎯
    title: Signal-First
    details: Built on Angular's reactive primitives using signals for optimal performance and reactivity.

  - icon: 🔧
    title: Composable
    details: Mix and match primitives to build complex behaviors from simple, focused building blocks.

  - icon: 🧪
    title: Well Tested
    details: Comprehensive test coverage ensures reliability and helps prevent regressions.

  - icon: 📦
    title: Minimal Dependencies
    details: Lightweight with only essential dependencies (lodash-es for debounce/throttle utilities).
---

<style>
.home-content {
  max-width: 1152px;
  margin: 0 auto;
  padding: 64px 24px;
}

.home-section-title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
  background: linear-gradient(120deg, #c51162 30%, #e91e63);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.home-section-subtitle {
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 18px;
  margin-bottom: 48px;
}

.code-showcase {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 64px;
}

@media (max-width: 768px) {
  .code-showcase {
    grid-template-columns: 1fr;
  }
}

.code-card {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.code-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--vp-c-brand-1);
}

.code-card h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.code-card p {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 64px;
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  text-align: center;
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #c51162;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.cta-section {
  text-align: center;
  padding: 48px;
  background: linear-gradient(135deg, rgba(197, 17, 98, 0.05), rgba(233, 30, 99, 0.05));
  border-radius: 16px;
  border: 1px solid rgba(197, 17, 98, 0.1);
}

.cta-section h2 {
  font-size: 28px;
  margin-bottom: 16px;
}

.cta-section p {
  color: var(--vp-c-text-2);
  margin-bottom: 24px;
  font-size: 16px;
}

.cta-button {
  display: inline-block;
  padding: 12px 32px;
  background: linear-gradient(120deg, #c51162 30%, #e91e63);
  color: white !important;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none !important;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(197, 17, 98, 0.3);
}
</style>

<div class="home-content">

<h2 class="home-section-title">Simple, Expressive APIs</h2>
<p class="home-section-subtitle">Write cleaner Angular code with composables that feel natural</p>

<div class="code-showcase">
<div class="code-card">
<h3>Browser APIs</h3>
<p>Track window size, mouse position, element bounds, and visibility</p>

```typescript
import { useWindowSize } from 'ng-reactive-utils';

@Component({ /* ... */ })
export class MyComponent {
  windowSize = useWindowSize();

  // Reactive signals automatically update
  template = `Width: ${this.windowSize.width()}`
}
```

</div>
<div class="code-card">
<h3>Route Helpers</h3>
<p>Reactive signals for route params, query strings, and data</p>

```typescript
import { useRouteParam } from 'ng-reactive-utils';

@Component({ /* ... */ })
export class UserComponent {
  // Auto-updates when route changes
  userId = useRouteParam('id');

  user = computed(() => this.getUser(this.userId()));
}
```

</div>
<div class="code-card">
<h3>Form State</h3>
<p>Easily track form and control state as reactive signals</p>

```typescript
import { useFormState } from 'ng-reactive-utils';

@Component({ /* ... */ })
export class FormComponent {
  form = new FormGroup({ /* ... */ });
  state = useFormState(this.form);

  // state.valid(), state.dirty(), state.value()
}
```

</div>
<div class="code-card">
<h3>Effects</h3>
<p>Sync state with localStorage, query params, and more</p>

```typescript
import { syncLocalStorage } from 'ng-reactive-utils';

@Component({ /* ... */ })
export class SettingsComponent {
  theme = signal('light');

  constructor() {
    // Auto-persists to localStorage
    syncLocalStorage(this.theme, 'theme');
  }
}
```

</div>
</div>

<div class="stats-section">
  <div class="stat-card">
    <div class="stat-number">30+</div>
    <div class="stat-label">Composables & Effects</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">100%</div>
    <div class="stat-label">TypeScript</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">0</div>
    <div class="stat-label">Runtime Dependencies*</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">∞</div>
    <div class="stat-label">Possibilities</div>
  </div>
</div>

<div class="cta-section">
  <h2>Ready to simplify your Angular code?</h2>
  <p>Get started in minutes with npm install</p>
  <a href="/ng-reactive-utils/getting-started/installation" class="cta-button">Install Now</a>
</div>

<p style="text-align: center; font-size: 12px; color: var(--vp-c-text-3); margin-top: 16px;">*Only lodash-es for debounce/throttle utilities</p>

</div>
