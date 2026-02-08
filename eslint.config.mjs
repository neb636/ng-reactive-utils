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
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@angular-eslint/ts": angular.tsPlugin,
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Enforce modern Angular patterns
      "@angular-eslint/ts/prefer-on-push-component-change-detection": "error",
      "@angular-eslint/ts/no-inputs-metadata-property": "error", // Prefer @Input() or input()
      "@angular-eslint/ts/no-outputs-metadata-property": "error", // Prefer @Output() or output()
      
      // TypeScript-specific rules
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_" 
      }],
      "no-redeclare": "off", // Disable base rule
      "@typescript-eslint/no-redeclare": "error", // Use TS version that understands overloads
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
