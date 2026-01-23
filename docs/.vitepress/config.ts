import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Angular Reactive Primitives',
  description:
    'A collection of small, reusable reactive building blocks for modern Angular applications',
  base: '/',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/getting-started/introduction' },
      { text: 'API', link: '/composables/browser/use-document-visibility' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/getting-started/introduction' },
          { text: 'Installation', link: '/getting-started/installation' },
        ],
      },
      {
        text: 'Composables',
        collapsed: false,
        items: [
          {
            text: 'Browser',
            collapsed: false,
            items: [
              {
                text: 'useDocumentVisibility',
                link: '/composables/browser/use-document-visibility',
              },
              {
                text: 'useElementBounding',
                link: '/composables/browser/use-element-bounding',
              },
              {
                text: 'useMousePosition',
                link: '/composables/browser/use-mouse-position',
              },
              {
                text: 'useWindowSize',
                link: '/composables/browser/use-window-size',
              },
            ],
          },
          {
            text: 'General',
            collapsed: false,
            items: [
              {
                text: 'useDebouncedSignal',
                link: '/composables/general/use-debounced-signal',
              },
              {
                text: 'usePreviousSignal',
                link: '/composables/general/use-previous-signal',
              },
              {
                text: 'useThrottledSignal',
                link: '/composables/general/use-throttled-signal',
              },
            ],
          },
          {
            text: 'Route',
            collapsed: false,
            items: [
              { text: 'useRouteData', link: '/composables/route/use-route-data' },
              {
                text: 'useRouteFragment',
                link: '/composables/route/use-route-fragment',
              },
              { text: 'useRouteParam', link: '/composables/route/use-route-param' },
              {
                text: 'useRouteParams',
                link: '/composables/route/use-route-params',
              },
              {
                text: 'useRouteQueryParam',
                link: '/composables/route/use-route-query-param',
              },
              {
                text: 'useRouteQueryParams',
                link: '/composables/route/use-route-query-params',
              },
            ],
          },
        ],
      },
      {
        text: 'Effects',
        items: [
          { text: 'syncLocalStorage', link: '/effects/sync-local-storage' },
          { text: 'syncQueryParams', link: '/effects/sync-query-params' },
        ],
      },
      {
        text: 'Utilities',
        items: [
          {
            text: 'createSharedComposable',
            link: '/utils/create-shared-composable',
          },
        ],
      },
    ],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/neb636/angular-reactive-primitives',
      },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern:
        'https://github.com/neb636/angular-reactive-primitives/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
});
