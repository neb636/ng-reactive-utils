import { DecimalPipe, DOCUMENT } from '@angular/common';
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import {
  useDocumentVisibility,
  useElementBounding,
  useEventListener,
  useLocalStorage,
  useMediaQuery,
  useMousePosition,
  useSessionStorage,
  useWindowSize,
} from 'ng-reactive-utils';

@Component({
  selector: 'app-browser-page',
  imports: [DecimalPipe],
  template: `
    <div class="page">
      <h1 class="page-title">Browser Composables</h1>
      <div class="demo-grid">

        <!-- useWindowSize -->
        <div class="card">
          <div class="card-title">useWindowSize()</div>
          <div class="card-desc">Reactive window dimensions. Resize the browser to see updates.</div>
          <div class="value-row">
            <span class="value-label">width</span>
            <span class="value">{{ windowSize().width }}px</span>
          </div>
          <div class="value-row">
            <span class="value-label">height</span>
            <span class="value">{{ windowSize().height }}px</span>
          </div>
        </div>

        <!-- useMousePosition -->
        <div class="card">
          <div class="card-title">useMousePosition()</div>
          <div class="card-desc">Global mouse coordinates. Move your mouse anywhere on the page.</div>
          <div class="value-row">
            <span class="value-label">x</span>
            <span class="value">{{ mousePos().x }}px</span>
          </div>
          <div class="value-row">
            <span class="value-label">y</span>
            <span class="value">{{ mousePos().y }}px</span>
          </div>
          <div class="mouse-target">Move mouse here</div>
        </div>

        <!-- useDocumentVisibility -->
        <div class="card">
          <div class="card-title">useDocumentVisibility()</div>
          <div class="card-desc">
            Tab visibility state. Switch to another tab and come back to see it toggle.
          </div>
          <div class="value-row">
            <span class="value-label">visible</span>
            <span class="value" [class.truthy]="isVisible()" [class.falsy]="!isVisible()">
              {{ isVisible() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">event log</span>
          </div>
          <div class="log">
            @for (entry of visibilityLog(); track $index) {
              <div class="log-entry">{{ entry }}</div>
            } @empty {
              <div class="log-empty">No changes yet — switch tabs</div>
            }
          </div>
        </div>

        <!-- useMediaQuery -->
        <div class="card">
          <div class="card-title">useMediaQuery(query)</div>
          <div class="card-desc">Reactive CSS media query matching.</div>
          <div class="value-row">
            <span class="value-label">mobile (&lt;768px)</span>
            <span class="value" [class.truthy]="isMobile()" [class.falsy]="!isMobile()">
              {{ isMobile() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">dark mode</span>
            <span class="value" [class.truthy]="isDarkMode()" [class.falsy]="!isDarkMode()">
              {{ isDarkMode() }}
            </span>
          </div>
          <div class="value-row">
            <span class="value-label">reduced motion</span>
            <span
              class="value"
              [class.truthy]="prefersReducedMotion()"
              [class.falsy]="!prefersReducedMotion()"
            >
              {{ prefersReducedMotion() }}
            </span>
          </div>
        </div>

        <!-- useEventListener -->
        <div class="card">
          <div class="card-title">useEventListener(event, handler)</div>
          <div class="card-desc">
            Listening for <code>keydown</code> on window. Click in the page and press any key.
          </div>
          <div class="value-row">
            <span class="value-label">last key</span>
            <span class="value">{{ lastKey() || '—' }}</span>
          </div>
          <div class="log">
            @for (entry of keyLog(); track $index) {
              <div class="log-entry">{{ entry }}</div>
            } @empty {
              <div class="log-empty">No keypresses yet</div>
            }
          </div>
        </div>

        <!-- useElementBounding -->
        <div class="card">
          <div class="card-title">useElementBounding(elementSignal)</div>
          <div class="card-desc">
            Tracks the position and dimensions of a DOM element via ResizeObserver.
          </div>
          <div class="bounding-target" #boundingBox>Observed element</div>
          <div class="value-row" style="margin-top: 10px">
            <span class="value-label">width</span>
            <span class="value">{{ bounding().width | number: '1.0-0' }}px</span>
          </div>
          <div class="value-row">
            <span class="value-label">height</span>
            <span class="value">{{ bounding().height | number: '1.0-0' }}px</span>
          </div>
          <div class="value-row">
            <span class="value-label">top</span>
            <span class="value">{{ bounding().top | number: '1.0-0' }}px</span>
          </div>
          <div class="value-row">
            <span class="value-label">left</span>
            <span class="value">{{ bounding().left | number: '1.0-0' }}px</span>
          </div>
        </div>

        <!-- useLocalStorage -->
        <div class="card">
          <div class="card-title">useLocalStorage(key, default)</div>
          <div class="card-desc">
            Writable signal synced to localStorage. Value persists across page reloads.
          </div>
          <div class="value-row">
            <span class="value-label">count</span>
            <span class="value">{{ localCount() }}</span>
          </div>
          <div class="btn-row">
            <button class="primary" (click)="incrementLocal()">+1</button>
            <button (click)="decrementLocal()">-1</button>
            <button (click)="localCount.set(0)">Reset</button>
          </div>
        </div>

        <!-- useSessionStorage -->
        <div class="card">
          <div class="card-title">useSessionStorage(key, default)</div>
          <div class="card-desc">
            Writable signal synced to sessionStorage. Value resets when the tab is closed.
          </div>
          <div class="value-row">
            <span class="value-label">count</span>
            <span class="value">{{ sessionCount() }}</span>
          </div>
          <div class="btn-row">
            <button class="primary" (click)="incrementSession()">+1</button>
            <button (click)="decrementSession()">-1</button>
            <button (click)="sessionCount.set(0)">Reset</button>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class BrowserPage {
  // ── Signals ──────────────────────────────────────────────────────────────

  windowSize = useWindowSize();
  mousePos = useMousePosition();
  isVisible = useDocumentVisibility();
  isMobile = useMediaQuery('(max-width: 767px)');
  isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  localCount = useLocalStorage('ref-app-local-count', 0);
  sessionCount = useSessionStorage('ref-app-session-count', 0);

  // ── Element bounding ─────────────────────────────────────────────────────

  boundingBoxRef = viewChild<ElementRef>('boundingBox');
  bounding = useElementBounding(this.boundingBoxRef);

  // ── Event listener ───────────────────────────────────────────────────────

  lastKey = signal('');
  keyLog = signal<string[]>([]);

  // ── Visibility log ───────────────────────────────────────────────────────

  visibilityLog = signal<string[]>([]);

  constructor() {
    useEventListener('keydown', (event) => {
      this.lastKey.set(event.key);
      this.keyLog.update((log) => [`[${new Date().toLocaleTimeString()}] ${event.key}`, ...log.slice(0, 9)]);
    });

    useEventListener('visibilitychange', () => {
      const state = document.hidden ? 'hidden' : 'visible';
      this.visibilityLog.update((log) => [
        `[${new Date().toLocaleTimeString()}] tab became ${state}`,
        ...log.slice(0, 9),
      ]);
    }, { target: inject(DOCUMENT) });
  }

  // ── LocalStorage methods ─────────────────────────────────────────────────

  incrementLocal(): void {
    this.localCount.update((n) => n + 1);
  }

  decrementLocal(): void {
    this.localCount.update((n) => n - 1);
  }

  // ── SessionStorage methods ───────────────────────────────────────────────

  incrementSession(): void {
    this.sessionCount.update((n) => n + 1);
  }

  decrementSession(): void {
    this.sessionCount.update((n) => n - 1);
  }
}
