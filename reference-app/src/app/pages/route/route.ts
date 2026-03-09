import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  useRouteData,
  useRouteFragment,
  useRouteParam,
  useRouteParams,
  useRouteQueryParam,
  useRouteQueryParams,
} from 'ng-reactive-utils';

@Component({
  selector: 'app-route-page',
  imports: [RouterLink, JsonPipe],
  template: `
    <div class="page">
      <h1 class="page-title">Route Composables</h1>

      <!-- Navigation links to test different param combinations -->
      <div class="card" style="margin-bottom: 16px">
        <div class="card-title">Test navigation</div>
        <div class="card-desc">
          Click links to change route params and see signals update reactively.
        </div>
        <div class="btn-row">
          <a routerLink="/route/user-42" [queryParams]="{ q: 'hello', sort: 'asc' }" fragment="intro">
            <button>/route/user-42?q=hello&amp;sort=asc#intro</button>
          </a>
          <a routerLink="/route/post-99" [queryParams]="{ q: 'angular', sort: 'desc' }" fragment="main">
            <button>/route/post-99?q=angular&amp;sort=desc#main</button>
          </a>
          <a routerLink="/route/item-7" [queryParams]="{}">
            <button>/route/item-7 (no query params)</button>
          </a>
        </div>
      </div>

      <div class="demo-grid">

        <!-- useRouteParam -->
        <div class="card">
          <div class="card-title">useRouteParam('id')</div>
          <div class="card-desc">Reactive signal for a single named route parameter.</div>
          <div class="value-row">
            <span class="value-label">id</span>
            <span class="value">{{ id() }}</span>
          </div>
        </div>

        <!-- useRouteParams -->
        <div class="card">
          <div class="card-title">useRouteParams()</div>
          <div class="card-desc">Reactive signal containing all route parameters as an object.</div>
          <div class="value-row">
            <span class="value-label">params</span>
            <span class="value" style="font-size: 11px">{{ params() | json }}</span>
          </div>
        </div>

        <!-- useRouteQueryParam -->
        <div class="card">
          <div class="card-title">useRouteQueryParam('q')</div>
          <div class="card-desc">Reactive signal for a single named query parameter.</div>
          <div class="value-row">
            <span class="value-label">q</span>
            <span class="value">{{ searchQuery() ?? '—' }}</span>
          </div>
          <div class="value-row">
            <span class="value-label">sort</span>
            <span class="value">{{ sort() ?? '—' }}</span>
          </div>
        </div>

        <!-- useRouteQueryParams -->
        <div class="card">
          <div class="card-title">useRouteQueryParams()</div>
          <div class="card-desc">Reactive signal containing all query parameters as an object.</div>
          <div class="value-row">
            <span class="value-label">queryParams</span>
            <span class="value" style="font-size: 11px">{{ queryParams() | json }}</span>
          </div>
        </div>

        <!-- useRouteData -->
        <div class="card">
          <div class="card-title">useRouteData()</div>
          <div class="card-desc">
            Reactive signal for static data defined on the route. Set in
            <code>app.routes.ts</code>:
            <code>data: &#123; title: 'Route Demo Page', env: 'reference-app' &#125;</code>
          </div>
          <div class="value-row">
            <span class="value-label">data</span>
            <span class="value" style="font-size: 11px">{{ routeData() | json }}</span>
          </div>
        </div>

        <!-- useRouteFragment -->
        <div class="card">
          <div class="card-title">useRouteFragment()</div>
          <div class="card-desc">
            Reactive signal for the URL fragment (the part after <code>#</code>).
          </div>
          <div class="value-row">
            <span class="value-label">fragment</span>
            <span class="value">{{ fragment() ?? '—' }}</span>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class RoutePage {
  id = useRouteParam('id');
  params = useRouteParams();
  searchQuery = useRouteQueryParam('q');
  sort = useRouteQueryParam('sort');
  queryParams = useRouteQueryParams();
  routeData = useRouteData();
  fragment = useRouteFragment();
}
