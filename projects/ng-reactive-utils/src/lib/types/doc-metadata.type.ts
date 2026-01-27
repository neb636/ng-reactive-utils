/**
 * Documentation metadata types for the ng-reactive-utils library.
 * These types are used to define documentation for composables, effects, and utils.
 */

export type DocCategory = 'composables' | 'effects' | 'utils';

export type DocSubcategory = 'general' | 'browser' | 'activated-route' | 'storage' | 'other';

export interface DocParameter {
  name: string;
  type: string;
  description: string;
  optional?: boolean;
  defaultValue?: string;
}

export interface DocMetadata {
  /** Unique identifier for the documentation (e.g., 'useDebouncedSignal') */
  name: string;

  /** Display title for the documentation page */
  title: string;

  /** Brief description of what this function does */
  description: string;

  /** Category this belongs to (composables, effects, utils) */
  category: DocCategory;

  /** Subcategory for organization (general, browser, etc.) */
  subcategory?: DocSubcategory;

  /** List of parameters/config options */
  parameters: DocParameter[];

  /** Return type description (optional) */
  returnType?: string;

  /** Return type description text (optional) */
  returnDescription?: string;
}

export interface DocEntry {
  /** Metadata about the function */
  metadata: DocMetadata;

  /** Source code of the function as a string */
  sourceCode: string;

  /** Example usage code as a string */
  exampleCode: string;
}

export interface DocRegistry {
  [key: string]: DocEntry;
}
