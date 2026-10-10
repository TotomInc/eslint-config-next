import { GLOB_MARKDOWN } from "@antfu/eslint-config";
import type { TypedFlatConfigItem } from "@antfu/eslint-config";

/**
 * Language-level rules on top of antfu: fewer implicit coercions, flatter control flow and
 * modern built-ins over hand-written loops.
 */
export function javascriptConfig(files: string[]): TypedFlatConfigItem {
  return {
    name: "totominc/javascript",
    files,
    // Code blocks in Markdown are often counter-examples, declaration files describe foreign code.
    ignores: [`${GLOB_MARKDOWN}/**`, "**/*.d.ts"],
    rules: {
      "default-case-last": "error",
      "no-else-return": ["error", { allowElseIf: false }],
      "no-implicit-coercion": ["error", { allow: [] }],
      "no-lonely-if": "error",
      "no-param-reassign": "error",
      "no-useless-concat": "error",
      "no-useless-return": "error",
      "object-shorthand": ["error", "always", { avoidQuotes: true }],
      "prefer-object-has-own": "error",
      "prefer-object-spread": "error",

      // Ban TypeScript-only runtime syntax: enums, namespaces and parameter properties cannot be
      // erased by Node.js type stripping and widen the gap between types and emitted code.
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message: "Use a union of literals or an `as const` object instead of an enum.",
        },
        {
          selector: "TSModuleDeclaration[kind='namespace']",
          message: "Use ES modules instead of namespaces.",
        },
        {
          selector: "TSParameterProperty",
          message: "Declare the class field explicitly instead of using a parameter property.",
        },
        "TSExportAssignment",
        "LabeledStatement",
        "WithStatement",
      ],

      "unicorn/consistent-existence-index-check": "error",
      "unicorn/no-array-method-this-argument": "error",
      "unicorn/no-array-push-push": "error",
      "unicorn/no-await-in-promise-methods": "error",
      "unicorn/no-for-loop": "error",
      "unicorn/no-lonely-if": "error",
      "unicorn/no-negation-in-equality-check": "error",
      "unicorn/no-single-promise-in-promise-methods": "error",
      "unicorn/no-thenable": "error",
      "unicorn/no-typeof-undefined": "error",
      "unicorn/no-unnecessary-await": "error",
      "unicorn/no-unreadable-array-destructuring": "error",
      "unicorn/no-useless-fallback-in-spread": "error",
      "unicorn/no-useless-length-check": "error",
      "unicorn/no-useless-promise-resolve-reject": "error",
      "unicorn/no-useless-spread": "error",
      "unicorn/no-useless-undefined": ["error", { checkArguments: false }],
      "unicorn/prefer-array-find": "error",
      "unicorn/prefer-array-flat-map": "error",
      "unicorn/prefer-array-index-of": "error",
      "unicorn/prefer-array-some": "error",
      "unicorn/prefer-at": "error",
      "unicorn/prefer-default-parameters": "error",
      "unicorn/prefer-logical-operator-over-ternary": "error",
      "unicorn/prefer-math-min-max": "error",
      "unicorn/prefer-modern-math-apis": "error",
      "unicorn/prefer-native-coercion-functions": "error",
      "unicorn/prefer-object-from-entries": "error",
      "unicorn/prefer-optional-catch-binding": "error",
      "unicorn/prefer-regexp-test": "error",
      "unicorn/prefer-set-has": "error",
      "unicorn/prefer-spread": "error",
      "unicorn/prefer-string-replace-all": "error",
      "unicorn/prefer-string-slice": "error",
      "unicorn/prefer-structured-clone": "error",
    },
  };
}
