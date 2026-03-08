# Problem

I often see people needing to do some side effect or something when just one value changes as a trigger.

# Code example I often see

The code example below is a made up example of stuff I often see. It might not be the best laid out itself but using it to illustrate the problem.

```ts
import { Component, effect, input, signal, untracked } from '@angular/core';
import ComponentLibSidebarComponent from '@component-lib/sidebar';
import cloneDeep from 'lodash-es/cloneDeep';

// Component always is instantiated by default to support animation timing correctly for the component lib we use
@Component({
  selector: 'app-sidebar',
  imports: [ComponentLibSidebarComponent],
  template: ` <component-lib-sidebar [isOpen]="isOpen()"> Inner content </component-lib-sidebar> `,
})
export class EditDashboardSidebarComponent {
  isOpen = input(false);

  // Original source dashboard
  dashboard = input(null);

  // The copy that is being edited
  dashboardCopy = signal<any>(null);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        untracked(() => {
          this.dashboardCopy = cloneDeep(this.dashboard());
          this.fetchSomeMetadata();
        });
      }
    });

    effect(() => {
      // teardown logic
      if (!this.isOpen()) {
        untracked(() => {
          this.dashboardCopy.set(null);
        });
      }
    });
  }

  updateDashboardProperty(property: string, value: any) {
    // implementation
  }

  revertDashboard() {
    // implementation
  }

  fetchSomeMetadata() {
    // implementation
  }
}
```

# Why I don't like the above example

The effects code in the constructor is a bit noisy and when glancling at it quickly its hard to parse what the code is doing along with what the trigger is supposed to be. Often in pr reviews i ask people to add comments above the effect explaining what it is used for. I prefer code that is declaritive and self explanitory which these effect examples are not.
If these were in a ngOnInit or ngOnDestroy hook (which can't due to always instanciated component) the above code would read much better and be easy to reson about.

- People need to remember to add the untracked to avoid potential invocation of the side effect if put other signals there.
- Often effects start small and easy to follow. Developers and AI alike often need some new functionality and just keep adding to these effect functions. They grow and grow and i see more if, else conditionals and wondering whats going on.

# What I was thinking

Some sort of descriptive helper functions that take signal and then wrap the side effect callback function in a untracked to automatically guard against unintended reruns

whenTrue(sig, fn) // or truthy
whenFalse(sig, fn) // or falsy

whenValue or whenEquals or whenMatch // in cases where want to invoke the side effect once the signal is a specific value. I don't have real world use cases off the top of my head but am sure there may be cases when need a value besides true or false.

```ts
import { Component, effect, input, signal, untracked } from '@angular/core';
import ComponentLibSidebarComponent from '@component-lib/sidebar';
import cloneDeep from 'lodash-es/cloneDeep';

// Component always is instantiated by default to support animation timing correctly for the component lib we use
@Component({
  selector: 'app-sidebar',
  imports: [ComponentLibSidebarComponent],
  template: ` <component-lib-sidebar [isOpen]="isOpen()"> Inner content </component-lib-sidebar> `,
})
export class EditDashboardSidebarComponent {
  isOpen = input(false);
  dashboard = input(null);
  dashboardCopy = signal<any>(null);

  // Could return either some ref or a cancel function to cancel the side effect early if needed
  onSidebarOpenRef = whenTrue(this.isOpen, () => {
    this.dashboardCopy.set(cloneDeep(this.dashboard());
    this.fetchSomeMetadata();
  });

  onSidebarClosedRef = whenFalse(this.isOpen, () => {
    this.dashboardCopy.set(null);
    // other teardown logic
  })

  updateDashboardProperty(property: string, value: any) {
    // implementation
  }

  revertDashboard() {
    // implementation
  }

  fetchSomeMetadata() {
    // implementation
  }
}
```
