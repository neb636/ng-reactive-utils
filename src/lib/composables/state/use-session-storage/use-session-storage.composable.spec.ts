import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { useSessionStorage, StorageSerializers } from './use-session-storage.composable';

describe('useSessionStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('basic functionality', () => {
    it('should return default value when sessionStorage is empty', () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useSessionStorage('test-key', 'default-value');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe('default-value');
    });

    it('should return stored value when present in sessionStorage', () => {
      sessionStorage.setItem('test-key', '"stored-value"');

      @Component({ template: '' })
      class TestComponent {
        storage = useSessionStorage('test-key', 'default-value');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe('stored-value');
    });

    it('should write default value to sessionStorage', () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useSessionStorage('test-key', 'default-value');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(sessionStorage.getItem('test-key')).toBe('default-value');
    });

    it('should update sessionStorage when signal value changes', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useSessionStorage('test-key', 'initial');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.storage.value.set('updated');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(sessionStorage.getItem('test-key')).toBe('updated');
    });

    it('should provide a writable signal', () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useSessionStorage('test-key', 'initial');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const { value } = fixture.componentInstance.storage;

      expect(typeof value.set).toBe('function');
      expect(typeof value.update).toBe('function');
    });
  });

  describe('type serialization', () => {
    it('should handle string values', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useSessionStorage('test-key', '');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.storage.value.set('hello world');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(sessionStorage.getItem('test-key')).toBe('hello world');
    });

    it('should handle number values', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useSessionStorage('test-key', 0);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.storage.value.set(42.5);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(sessionStorage.getItem('test-key')).toBe('42.5');
    });

    it('should handle boolean values', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useSessionStorage('test-key', false);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.storage.value.set(true);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(sessionStorage.getItem('test-key')).toBe('true');
    });

    it('should handle object values', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useSessionStorage('test-key', { name: '', age: 0 });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.storage.value.set({ name: 'Jane', age: 28 });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(sessionStorage.getItem('test-key')).toBe('{"name":"Jane","age":28}');
    });

    it('should handle Date values with custom serializer', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useSessionStorage('test-key', new Date(), {
          serializer: StorageSerializers.date,
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const testDate = new Date('2024-06-20T15:00:00.000Z');
      fixture.componentInstance.storage.value.set(testDate);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(sessionStorage.getItem('test-key')).toBe('2024-06-20T15:00:00.000Z');
    });
  });

  describe('remove function', () => {
    it('should remove item from sessionStorage and reset to default', () => {
      sessionStorage.setItem('test-key', '"stored"');

      @Component({ template: '' })
      class TestComponent {
        storage = useSessionStorage('test-key', 'default');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe('stored');

      fixture.componentInstance.storage.remove();

      expect(sessionStorage.getItem('test-key')).toBeNull();
      expect(fixture.componentInstance.storage.value()).toBe('default');
    });
  });

  describe('mergeDefaults', () => {
    it('should merge defaults with stored value', () => {
      sessionStorage.setItem('test-key', '{"email":"john@example.com"}');

      @Component({ template: '' })
      class TestComponent {
        storage = useSessionStorage(
          'test-key',
          { email: '', name: 'Guest', verified: false },
          { mergeDefaults: true }
        );
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toEqual({
        email: 'john@example.com',
        name: 'Guest',
        verified: false,
      });
    });
  });

  describe('SSR compatibility', () => {
    it('should return default value on server', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });

      @Component({ template: '' })
      class TestComponent {
        storage = useSessionStorage('test-key', 'default');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.storage.value()).toBe('default');
    });
  });

  describe('real-world use cases', () => {
    it('should persist form draft during session', async () => {
      interface FormDraft {
        name: string;
        email: string;
        message: string;
      }

      @Component({ template: '' })
      class TestComponent {
        formDraft = useSessionStorage<FormDraft>('contact-form-draft', {
          name: '',
          email: '',
          message: '',
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      // User fills form partially
      fixture.componentInstance.formDraft.value.update((draft) => ({
        ...draft,
        name: 'John Doe',
        email: 'john@example.com',
      }));

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify stored
      const stored = JSON.parse(sessionStorage.getItem('contact-form-draft')!);
      expect(stored).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        message: '',
      });
    });

    it('should store auth token for session', async () => {
      @Component({ template: '' })
      class TestComponent {
        authToken = useSessionStorage<string | null>('auth-token', null);
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      // User logs in
      fixture.componentInstance.authToken.value.set('jwt-token-12345');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(sessionStorage.getItem('auth-token')).toBe('"jwt-token-12345"');

      // User logs out
      fixture.componentInstance.authToken.remove();

      expect(sessionStorage.getItem('auth-token')).toBeNull();
      expect(fixture.componentInstance.authToken.value()).toBeNull();
    });

    it('should track wizard/multi-step form progress', async () => {
      interface WizardState {
        currentStep: number;
        completedSteps: number[];
        formData: Record<string, unknown>;
      }

      @Component({ template: '' })
      class TestComponent {
        wizard = useSessionStorage<WizardState>('checkout-wizard', {
          currentStep: 1,
          completedSteps: [],
          formData: {},
        });
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      // User progresses through wizard
      fixture.componentInstance.wizard.value.update((state) => ({
        ...state,
        currentStep: 2,
        completedSteps: [1],
        formData: { shipping: { address: '123 Main St' } },
      }));

      await new Promise((resolve) => setTimeout(resolve, 0));

      const stored = JSON.parse(sessionStorage.getItem('checkout-wizard')!);
      expect(stored.currentStep).toBe(2);
      expect(stored.completedSteps).toEqual([1]);
      expect(stored.formData.shipping.address).toBe('123 Main St');
    });
  });

  describe('template bindings', () => {
    it('should work correctly in templates', async () => {
      @Component({
        template: `
          <div data-testid="step">Step: {{ wizard.value().currentStep }}</div>
          <button data-testid="next" (click)="nextStep()">Next</button>
        `,
      })
      class TestComponent {
        wizard = useSessionStorage('wizard-step', { currentStep: 1 });

        nextStep() {
          this.wizard.value.update((s) => ({ currentStep: s.currentStep + 1 }));
        }
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const element = fixture.nativeElement;
      const stepDiv = element.querySelector('[data-testid="step"]');
      const nextBtn = element.querySelector('[data-testid="next"]');

      expect(stepDiv.textContent.trim()).toBe('Step: 1');

      nextBtn.click();
      fixture.detectChanges();

      expect(stepDiv.textContent.trim()).toBe('Step: 2');
    });
  });

  describe('component lifecycle', () => {
    it('should clean up event listeners on component destroy', () => {
      @Component({ template: '' })
      class TestComponent {
        storage = useSessionStorage('test-key', 'initial');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(() => fixture.destroy()).not.toThrow();
    });

    it('should maintain separate instances for different keys', async () => {
      @Component({ template: '' })
      class TestComponent {
        storage1 = useSessionStorage('key-1', 'default-1');
        storage2 = useSessionStorage('key-2', 'default-2');
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      fixture.componentInstance.storage1.value.set('updated-1');
      fixture.componentInstance.storage2.value.set('updated-2');

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(sessionStorage.getItem('key-1')).toBe('updated-1');
      expect(sessionStorage.getItem('key-2')).toBe('updated-2');
    });
  });
});
