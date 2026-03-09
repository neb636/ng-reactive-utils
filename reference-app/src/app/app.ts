import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="nav">
      <span class="nav-brand">ng-reactive-utils reference</span>
      <a routerLink="/browser" routerLinkActive="active">Browser</a>
      <a routerLink="/forms" routerLinkActive="active">Forms</a>
      <a routerLink="/route" routerLinkActive="active">Route</a>
      <a routerLink="/general" routerLinkActive="active">General</a>
    </nav>
    <router-outlet />
  `,
  styles: `
    .nav {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 20px;
      height: 48px;
      background: #111;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .nav-brand {
      font-size: 13px;
      font-weight: 700;
      color: #a78bfa;
      font-family: monospace;
      margin-right: 12px;
    }
    .nav a {
      padding: 6px 12px;
      border-radius: 5px;
      font-size: 13px;
      font-weight: 500;
      color: #999;
      text-decoration: none;
      transition: color 0.1s, background 0.1s;
    }
    .nav a:hover { color: #fff; background: #222; }
    .nav a.active { color: #fff; background: #7c3aed; }
  `,
})
export class App {}
