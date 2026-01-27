import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";

export default [
  // Ignore test files
  {
    ignores: ["**/*.spec.ts", "**/*.test.ts", "**/*.e2e.ts"],
  },
  // Apply to all JavaScript/TypeScript files
  { 
    files: ["src/**/*.{js,mjs,cjs,ts,mts,cts}"], 
    plugins: { js }, 
    languageOptions: { globals: globals.browser },
    rules: js.configs.recommended.rules
  },
  // TypeScript rules for .ts files
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@angular-eslint/ts": angular.tsPlugin,
    },
    rules: {
      // Enforce modern Angular patterns
      "@angular-eslint/ts/prefer-on-push-component-change-detection": "error",
      "@angular-eslint/ts/no-inputs-metadata-property": "error", // Prefer @Input() or input()
      "@angular-eslint/ts/no-outputs-metadata-property": "error", // Prefer @Output() or output()
      "no-unused-vars": "off",
    }
  },
  // Template rules for .html files
  {
    files: ["src/**/*.html"],
    languageOptions: {
      parser: angular.templateParser,
    },
    plugins: {
      "@angular-eslint/template": angular.templatePlugin,
    },
    processor: angular.processInlineTemplates,
  },
];
