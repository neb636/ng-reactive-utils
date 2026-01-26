/**
 * Test setup for Vitest with Angular.
 * This file is loaded before all test files via the setupFiles option in angular.json.
 * 
 * Each test will configure TestBed with provideZonelessChangeDetection() to avoid
 * requiring Zone.js.
 */

// Polyfill ResizeObserver for jsdom test environment
if (typeof ResizeObserver === 'undefined') {
  (globalThis as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

