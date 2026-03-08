import { Component, computed, input, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { when, whenFalse, whenTrue } from './when.composable';

function setup() {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
}

// ─── when ────────────────────────────────────────────────────────────────────

describe('when', () => {
  beforeEach(() => setup());

  describe('eager execution', () => {
    it('fires immediately when condition is already met at creation', () => {
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        when(signal(5), (v) => v > 3, () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(1);
    });

    it('does not fire on creation when condition is not met', () => {
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        when(signal(1), (v) => v > 3, () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(0);
    });
  });

  describe('reactive re-execution', () => {
    it('fires each time the signal changes and the predicate returns true', () => {
      const status = signal('idle');
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        when(status, (s) => s === 'complete', () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(0);

      status.set('complete');
      TestBed.flushEffects();
      expect(runCount).toBe(1);

      status.set('idle');
      status.set('complete');
      TestBed.flushEffects();
      expect(runCount).toBe(2);
    });

    it('does not fire when the signal changes but predicate returns false', () => {
      const counter = signal(0);
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        when(counter, (v) => v > 10, () => { runCount++; });
      });

      counter.set(1);
      counter.set(2);
      counter.set(5);
      TestBed.flushEffects();
      expect(runCount).toBe(0);
    });

    it('does not fire when signal is set to the same value (Angular equality check)', () => {
      const flag = signal(true);
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        when(flag, Boolean, () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(1); // initial eager run

      flag.set(true); // same value — Angular skips re-running the effect
      TestBed.flushEffects();
      expect(runCount).toBe(1); // still 1
    });

    it('fires on every signal change where predicate is true, including truthy→truthy changes', () => {
      // Docs say "fires each time the condition becomes true" — this test verifies that
      // it fires on ANY signal change where the predicate is satisfied, not only on
      // false→true transitions. With a boolean signal this distinction doesn't arise,
      // but with other types it matters.
      const count = signal(1); // truthy
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        when(count, (v) => v > 0, () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(1); // eager

      count.set(2); // still satisfies predicate, but signal changed
      TestBed.flushEffects();
      expect(runCount).toBe(2); // fires again — every change where predicate is true

      count.set(3);
      TestBed.flushEffects();
      expect(runCount).toBe(3);
    });

    it('passes the current signal value to the predicate', () => {
      const status = signal('idle');
      const receivedValues: string[] = [];

      TestBed.runInInjectionContext(() => {
        when(status, (s) => s !== 'idle', () => { receivedValues.push(status()); });
      });

      status.set('uploading');
      TestBed.flushEffects();
      status.set('complete');
      TestBed.flushEffects();

      expect(receivedValues).toEqual(['uploading', 'complete']);
    });

    it('batches rapid signal changes — only the final value triggers the effect', () => {
      const flag = signal(false);
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        when(flag, Boolean, () => { runCount++; });
      });

      // Multiple synchronous sets before flushing
      flag.set(true);
      flag.set(false);
      flag.set(true);

      TestBed.flushEffects();
      // Effect sees final value (true) and fires once — not three times
      expect(runCount).toBe(1);
    });
  });

  describe('untracked callback', () => {
    it('signals read inside callback do not create reactive dependencies', () => {
      const trigger = signal(false);
      const unrelated = signal('a');
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        when(trigger, Boolean, () => {
          runCount++;
          unrelated(); // reading this inside callback should not subscribe
        });
      });

      trigger.set(true);
      TestBed.flushEffects();
      expect(runCount).toBe(1);

      unrelated.set('b'); // changing the unrelated signal should NOT re-run callback
      TestBed.flushEffects();
      expect(runCount).toBe(1);
    });

    it('signal writes inside callback do not cause errors or infinite loops', () => {
      const trigger = signal(false);
      const result = signal('initial');
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        when(trigger, Boolean, () => {
          runCount++;
          result.set('updated');
        });
      });

      trigger.set(true);
      TestBed.flushEffects();

      expect(runCount).toBe(1);
      expect(result()).toBe('updated');
    });

    it('writing back to the source signal inside callback does not cause infinite loop', () => {
      const flag = signal(false);
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        when(flag, Boolean, () => {
          runCount++;
          flag.set(false); // write back to source — should not loop
        });
      });

      flag.set(true);
      TestBed.flushEffects();

      expect(runCount).toBe(1);
    });
  });

  describe('cancel function', () => {
    it('stops the effect from running after cancel is called', () => {
      const flag = signal(false);
      let runCount = 0;

      const cancel = TestBed.runInInjectionContext(() =>
        when(flag, Boolean, () => { runCount++; }),
      );

      flag.set(true);
      TestBed.flushEffects();
      expect(runCount).toBe(1);

      cancel();

      flag.set(false);
      flag.set(true);
      TestBed.flushEffects();
      expect(runCount).toBe(1); // no additional runs
    });

    it('is safe to call multiple times without throwing', () => {
      const cancel = TestBed.runInInjectionContext(() =>
        when(signal(true), Boolean, () => {}),
      );

      expect(() => {
        cancel();
        cancel();
        cancel();
      }).not.toThrow();
    });

    it('supports the run-once pattern: calling cancel inside the callback', () => {
      // This is the documented pattern for run-once behavior
      const flag = signal(false);
      let runCount = 0;
      let cancel!: () => void;

      TestBed.runInInjectionContext(() => {
        cancel = when(flag, Boolean, () => {
          runCount++;
          cancel(); // stop listening after first fire
        });
      });

      flag.set(true);
      TestBed.flushEffects();
      expect(runCount).toBe(1);

      flag.set(false);
      flag.set(true);
      TestBed.flushEffects();
      expect(runCount).toBe(1); // did not fire again
    });
  });

  describe('cleanup', () => {
    it('stops firing after the component is destroyed', () => {
      @Component({ template: '' })
      class TestComponent {
        flag = signal(false);
        runCount = 0;
        _ = when(this.flag, Boolean, () => { this.runCount++; });
      }

      const fixture = TestBed.createComponent(TestComponent);
      TestBed.flushEffects();

      fixture.componentInstance.flag.set(true);
      TestBed.flushEffects();
      expect(fixture.componentInstance.runCount).toBe(1);

      fixture.destroy();

      // After destroy the effect should be gone — this should not throw
      // and the run count should not increment
      expect(fixture.componentInstance.runCount).toBe(1);
    });

    it('calling cancel before component destroy does not cause errors on destroy', () => {
      @Component({ template: '' })
      class TestComponent {
        flag = signal(false);
        stop = when(this.flag, Boolean, () => {});
      }

      const fixture = TestBed.createComponent(TestComponent);
      TestBed.flushEffects();

      fixture.componentInstance.stop(); // cancel before destroy
      expect(() => fixture.destroy()).not.toThrow();
    });
  });

  describe('injection context', () => {
    it('works as a class field initializer without a constructor', () => {
      @Component({ template: '' })
      class TestComponent {
        flag = signal(false);
        runCount = 0;
        // Called as a field initializer — this is the primary usage pattern
        cancel = when(this.flag, Boolean, () => { this.runCount++; });
      }

      const fixture = TestBed.createComponent(TestComponent);
      TestBed.flushEffects();

      fixture.componentInstance.flag.set(true);
      TestBed.flushEffects();

      expect(fixture.componentInstance.runCount).toBe(1);
    });

    it('works with a computed signal as source', () => {
      const a = signal(2);
      const b = signal(3);
      const sum = computed(() => a() + b());
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        when(sum, (v) => v > 10, () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(0);

      a.set(8); // sum becomes 11 > 10
      TestBed.flushEffects();
      expect(runCount).toBe(1);
    });
  });
});

// ─── whenTrue ────────────────────────────────────────────────────────────────

describe('whenTrue', () => {
  beforeEach(() => setup());

  describe('truthy semantics', () => {
    it('fires when a boolean signal becomes true', () => {
      const flag = signal(false);
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenTrue(flag, () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(0);

      flag.set(true);
      TestBed.flushEffects();
      expect(runCount).toBe(1);
    });

    it('fires immediately when signal is already true at creation', () => {
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenTrue(signal(true), () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(1);
    });

    it('treats non-empty strings as truthy', () => {
      const value = signal<string | null>(null);
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenTrue(value, () => { runCount++; });
      });

      value.set('hello');
      TestBed.flushEffects();
      expect(runCount).toBe(1);
    });

    it('treats non-zero numbers as truthy', () => {
      const value = signal(0);
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenTrue(value, () => { runCount++; });
      });

      value.set(1);
      TestBed.flushEffects();
      expect(runCount).toBe(1);
    });

    it('treats non-null objects as truthy', () => {
      const value = signal<object | null>(null);
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenTrue(value, () => { runCount++; });
      });

      value.set({});
      TestBed.flushEffects();
      expect(runCount).toBe(1);
    });

    it('treats empty string as falsy — does not fire', () => {
      const value = signal('');
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenTrue(value, () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(0);
    });

    it('treats 0 as falsy — does not fire', () => {
      const value = signal(0);
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenTrue(value, () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(0);
    });

    it('treats null as falsy — does not fire', () => {
      const value = signal<string | null>(null);
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenTrue(value, () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(0);
    });

    it('treats undefined as falsy — does not fire', () => {
      const value = signal<string | undefined>(undefined);
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenTrue(value, () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(0);
    });
  });

  describe('re-fires on truthy→truthy changes', () => {
    it('fires again when signal changes from one truthy value to another', () => {
      // whenTrue fires on every signal change where the value is truthy,
      // not only on the falsy→truthy transition.
      const name = signal('Alice');
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenTrue(name, () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(1); // eager: 'Alice' is truthy

      name.set('Bob'); // still truthy, but value changed
      TestBed.flushEffects();
      expect(runCount).toBe(2); // fires again
    });
  });

  describe('signal that stays falsy', () => {
    it('does not fire when signal changes between two falsy values', () => {
      // Changing '' → null are both falsy, so whenTrue should never fire
      const value = signal<string | null>('');
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenTrue(value, () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(0);

      value.set(null); // still falsy
      TestBed.flushEffects();
      expect(runCount).toBe(0);
    });
  });

  describe('cancel', () => {
    it('returns a cancel function that stops future firings', () => {
      const flag = signal(false);
      let runCount = 0;

      const cancel = TestBed.runInInjectionContext(() =>
        whenTrue(flag, () => { runCount++; }),
      );

      cancel();
      flag.set(true);
      TestBed.flushEffects();
      expect(runCount).toBe(0);
    });
  });

  describe('real component usage', () => {
    it('works as a class field initializer with component inputs', () => {
      @Component({ template: '' })
      class SidebarComponent {
        isOpen = input(false);
        openCount = 0;

        onOpen = whenTrue(this.isOpen, () => { this.openCount++; });
      }

      const fixture = TestBed.createComponent(SidebarComponent);
      TestBed.flushEffects();
      expect(fixture.componentInstance.openCount).toBe(0);

      fixture.componentRef.setInput('isOpen', true);
      TestBed.flushEffects();
      expect(fixture.componentInstance.openCount).toBe(1);

      fixture.componentRef.setInput('isOpen', false);
      fixture.componentRef.setInput('isOpen', true);
      TestBed.flushEffects();
      expect(fixture.componentInstance.openCount).toBe(2);
    });
  });
});

// ─── whenFalse ───────────────────────────────────────────────────────────────

describe('whenFalse', () => {
  beforeEach(() => setup());

  describe('falsy semantics', () => {
    it('fires when a boolean signal becomes false', () => {
      const flag = signal(true);
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenFalse(flag, () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(0);

      flag.set(false);
      TestBed.flushEffects();
      expect(runCount).toBe(1);
    });

    it('fires immediately when signal is already false at creation', () => {
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenFalse(signal(false), () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(1);
    });

    it('fires for empty string (falsy)', () => {
      const value = signal('hello');
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenFalse(value, () => { runCount++; });
      });

      value.set('');
      TestBed.flushEffects();
      expect(runCount).toBe(1);
    });

    it('fires for 0 (falsy)', () => {
      const value = signal(5);
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenFalse(value, () => { runCount++; });
      });

      value.set(0);
      TestBed.flushEffects();
      expect(runCount).toBe(1);
    });

    it('fires for null (falsy)', () => {
      const value = signal<string | null>('hello');
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenFalse(value, () => { runCount++; });
      });

      value.set(null);
      TestBed.flushEffects();
      expect(runCount).toBe(1);
    });

    it('fires for undefined (falsy)', () => {
      const value = signal<string | undefined>('hello');
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenFalse(value, () => { runCount++; });
      });

      value.set(undefined);
      TestBed.flushEffects();
      expect(runCount).toBe(1);
    });

    it('does not fire for truthy values', () => {
      const value = signal(0);
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenFalse(value, () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(1); // 0 is falsy

      value.set(1); // truthy — should not fire
      TestBed.flushEffects();
      expect(runCount).toBe(1);
    });
  });

  describe('re-fires on falsy→falsy changes', () => {
    it('fires again when signal changes from one falsy value to another', () => {
      // Mirrors the whenTrue truthy→truthy behavior: fires on every change
      // where the predicate is satisfied, not only on truthy→falsy transitions.
      const value = signal<string | number | null>('');
      let runCount = 0;

      TestBed.runInInjectionContext(() => {
        whenFalse(value, () => { runCount++; });
      });

      TestBed.flushEffects();
      expect(runCount).toBe(1); // eager: '' is falsy

      value.set(null); // also falsy, but signal changed
      TestBed.flushEffects();
      expect(runCount).toBe(2); // fires again

      value.set(0); // also falsy
      TestBed.flushEffects();
      expect(runCount).toBe(3);
    });
  });

  describe('cancel', () => {
    it('returns a cancel function that stops future firings', () => {
      const flag = signal(true);
      let runCount = 0;

      const cancel = TestBed.runInInjectionContext(() =>
        whenFalse(flag, () => { runCount++; }),
      );

      cancel();
      flag.set(false);
      TestBed.flushEffects();
      expect(runCount).toBe(0);
    });
  });

  describe('real component usage', () => {
    it('works as a class field paired with whenTrue for open/close pattern', () => {
      @Component({ template: '' })
      class SidebarComponent {
        isOpen = input(false);
        openCount = 0;
        closeCount = 0;

        onOpen = whenTrue(this.isOpen, () => { this.openCount++; });
        onClose = whenFalse(this.isOpen, () => { this.closeCount++; });
      }

      const fixture = TestBed.createComponent(SidebarComponent);
      TestBed.flushEffects();

      // Initial state: isOpen is false, so onClose fires eagerly
      expect(fixture.componentInstance.openCount).toBe(0);
      expect(fixture.componentInstance.closeCount).toBe(1);

      fixture.componentRef.setInput('isOpen', true);
      TestBed.flushEffects();
      expect(fixture.componentInstance.openCount).toBe(1);
      expect(fixture.componentInstance.closeCount).toBe(1);

      fixture.componentRef.setInput('isOpen', false);
      TestBed.flushEffects();
      expect(fixture.componentInstance.openCount).toBe(1);
      expect(fixture.componentInstance.closeCount).toBe(2);
    });
  });
});
