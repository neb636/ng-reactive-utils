import { defineConfig } from 'vitepress';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import llmstxt from 'vitepress-plugin-llms';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'NG Reactive Utils',
  description:
    'A collection of small, reusable reactive building blocks for modern Angular applications',
  base: '/ng-reactive-utils/',
  head: [['link', { rel: 'icon', href: '/ng-reactive-utils/favicon.ico' }]],

  vite: {
    plugins: [llmstxt()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../..'),
      },
    },
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/getting-started/introduction' },
      { text: 'API', link: '/composables/browser/use-document-visibility' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/getting-started/introduction' },
          { text: 'Installation', link: '/getting-started/installation' },
          { text: 'Core Concepts', link: '/getting-started/core-concepts' },
          { text: 'Working with Forms & Routes', link: '/getting-started/working-with-forms-and-routes' },
          { text: 'AI Integration', link: '/getting-started/ai-integration' },
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
              { text: 'useRouteParameter', link: '/composables/route/use-route-param' },
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
          {
            text: 'Forms',
            collapsed: false,
            items: [
              { text: 'useFormState', link: '/composables/form/use-form-state' },
              { text: 'useFormValue', link: '/composables/form/use-form-value' },
              { text: 'useFormValid', link: '/composables/form/use-form-valid' },
              { text: 'useFormPending', link: '/composables/form/use-form-pending' },
              { text: 'useFormDisabled', link: '/composables/form/use-form-disabled' },
              { text: 'useFormDirty', link: '/composables/form/use-form-dirty' },
              { text: 'useFormPristine', link: '/composables/form/use-form-pristine' },
              { text: 'useFormTouched', link: '/composables/form/use-form-touched' },
              { text: 'useFormUntouched', link: '/composables/form/use-form-untouched' },
              { text: 'useFormErrors', link: '/composables/form/use-form-errors' },
              { text: 'useFormStatus', link: '/composables/form/use-form-status' },
              { text: 'useControlState', link: '/composables/control/use-control-state' },
              { text: 'useControlValue', link: '/composables/control/use-control-value' },
              { text: 'useControlValid', link: '/composables/control/use-control-valid' },
              { text: 'useControlPending', link: '/composables/control/use-control-pending' },
              { text: 'useControlErrors', link: '/composables/control/use-control-errors' },
              { text: 'useControlTouched', link: '/composables/control/use-control-touched' },
              { text: 'useControlUntouched', link: '/composables/control/use-control-untouched' },
              { text: 'useControlDirty', link: '/composables/control/use-control-dirty' },
              { text: 'useControlPristine', link: '/composables/control/use-control-pristine' },
              { text: 'useControlDisabled', link: '/composables/control/use-control-disabled' },
              { text: 'useControlStatus', link: '/composables/control/use-control-status' },
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
        link: 'https://github.com/neb636/ng-reactive-utils',
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
      pattern: 'https://github.com/neb636/ng-reactive-utils/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
});
