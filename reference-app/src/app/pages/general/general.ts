import { Component, signal } from '@angular/core';
import {
  createSharedComposable,
  usePreviousSignal,
  when,
  whenFalse,
  whenTrue,
} from 'ng-reactive-utils';

// ── Shared composable demo ────────────────────────────────────────────────────
// Both widget components below will use this same composable. Because it is
// wrapped with createSharedComposable, they share one signal instance — updating
// in one widget reflects immediately in the other.

const useSharedCounter = createSharedComposable(() => {
  const count = signal(0);
  return { value: count };
});

@Component({
  selector: 'app-shared-widget',
  template: `
    <div class="value-row">
      <span class="value-label">shared count</span>
      <span class="value">{{ counter() }}</span>
    </div>
    <div class="btn-row">
      <button class="primary" (click)="increment()">+1</button>
      <button (click)="decrement()">-1</button>
    </div>
  `,
})
class SharedWidget {
  counter = useSharedCounter();

  increment(): void {
    this.counter.update((n) => n + 1);
  }

  decrement(): void {
    this.counter.update((n) => n - 1);
  }
}

// ── Main page ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-general-page',
  imports: [SharedWidget],
  template: `
    <div class="page">
      <h1 class="page-title">General Composables</h1>
      <div class="demo-grid">

        <!-- usePreviousSignal -->
        <div class="card">
          <div class="card-title">usePreviousSignal(signal)</div>
          <div class="card-desc">
            Tracks the previous value of any signal. The counter below shows both the current
            and previous values updating together.
          </div>
          <div class="value-row">
            <span class="value-label">current</span>
            <span class="value">{{ counter() }}</span>
          </div>
          <div class="value-row">
            <span class="value-label">previous</span>
            <span class="value">{{ previousCounter() ?? '—' }}</span>
          </div>
          <div class="btn-row">
            <button class="primary" (click)="incrementCounter()">+1</button>
            <button (click)="decrementCounter()">-1</button>
            <button (click)="counter.set(0)">Reset</button>
          </div>
        </div>

        <!-- whenTrue / whenFalse -->
        <div class="card">
          <div class="card-title">whenTrue(signal, fn) / whenFalse(signal, fn)</div>
          <div class="card-desc">
            Run a side effect when a signal becomes truthy or falsy. The log below records
            each state transition. Toggle the panel to see both fire.
          </div>
          <div class="value-row">
            <span class="value-label">isOpen</span>
            <span class="value" [class.truthy]="isOpen()" [class.falsy]="!isOpen()">
              {{ isOpen() }}
            </span>
          </div>
          <div class="btn-row">
            <button class="primary" (click)="isOpen.set(true)">Open</button>
            <button (click)="isOpen.set(false)">Close</button>
          </div>
          <div class="log">
            @for (entry of panelLog(); track $index) {
              <div class="log-entry">{{ entry }}</div>
            } @empty {
              <div class="log-empty">Toggle the panel to see events</div>
            }
          </div>
        </div>

        <!-- when -->
        <div class="card">
          <div class="card-title">when(signal, predicate, fn)</div>
          <div class="card-desc">
            Run a side effect whenever a predicate is satisfied. This simulates an upload
            flow — the log fires only when status reaches <code>'complete'</code> or
            <code>'error'</code>.
          </div>
          <div class="value-row">
            <span class="value-label">status</span>
            <span class="value">{{ uploadStatus() }}</span>
          </div>
          <div class="btn-row">
            <button (click)="uploadStatus.set('idle')">idle</button>
            <button (click)="uploadStatus.set('uploading')">uploading</button>
            <button class="primary" (click)="uploadStatus.set('complete')">complete</button>
            <button style="border-color: #dc2626; color: #dc2626" (click)="uploadStatus.set('error')">error</button>
          </div>
          <div class="log">
            @for (entry of uploadLog(); track $index) {
              <div class="log-entry">{{ entry }}</div>
            } @empty {
              <div class="log-empty">Set status to complete or error to trigger</div>
            }
          </div>
        </div>

        <!-- createSharedComposable -->
        <div class="card">
          <div class="card-title">createSharedComposable(factory)</div>
          <div class="card-desc">
            Two separate component instances (<code>&lt;app-shared-widget&gt;</code>) sharing
            one signal via reference counting. Incrementing in one widget updates the other
            because they resolve to the same underlying signal.
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px">
            <div style="padding: 10px; background: #fafafa; border: 1px solid #eee; border-radius: 6px">
              <div style="font-size: 11px; color: #888; margin-bottom: 8px">Widget A</div>
              <app-shared-widget />
            </div>
            <div style="padding: 10px; background: #fafafa; border: 1px solid #eee; border-radius: 6px">
              <div style="font-size: 11px; color: #888; margin-bottom: 8px">Widget B</div>
              <app-shared-widget />
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class GeneralPage {
  // ── usePreviousSignal ────────────────────────────────────────────────────
  counter = signal(0);
  previousCounter = usePreviousSignal(this.counter);

  // ── whenTrue / whenFalse ─────────────────────────────────────────────────
  isOpen = signal(false);
  panelLog = signal<string[]>([]);

  onOpen = whenTrue(this.isOpen, () => {
    this.panelLog.update((log) => [
      `[${new Date().toLocaleTimeString()}] whenTrue fired — panel opened`,
      ...log.slice(0, 9),
    ]);
  });

  onClose = whenFalse(this.isOpen, () => {
    this.panelLog.update((log) => [
      `[${new Date().toLocaleTimeString()}] whenFalse fired — panel closed`,
      ...log.slice(0, 9),
    ]);
  });

  // ── when ─────────────────────────────────────────────────────────────────
  uploadStatus = signal<'idle' | 'uploading' | 'complete' | 'error'>('idle');
  uploadLog = signal<string[]>([]);

  onComplete = when(this.uploadStatus, (s) => s === 'complete', () => {
    this.uploadLog.update((log) => [
      `[${new Date().toLocaleTimeString()}] when() → complete: showing success toast`,
      ...log.slice(0, 9),
    ]);
  });

  onError = when(this.uploadStatus, (s) => s === 'error', () => {
    this.uploadLog.update((log) => [
      `[${new Date().toLocaleTimeString()}] when() → error: showing error dialog`,
      ...log.slice(0, 9),
    ]);
  });

  // ── Counter methods ───────────────────────────────────────────────────────

  incrementCounter(): void {
    this.counter.update((n) => n + 1);
  }

  decrementCounter(): void {
    this.counter.update((n) => n - 1);
  }
}
