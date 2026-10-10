import type { TypedFlatConfigItem } from "@antfu/eslint-config";

/**
 * Personal preferences shared by every framework: braces, import and export sorting.
 */
export function baseConfig(files: string[]): TypedFlatConfigItem {
  return {
    name: "totominc/base",
    files,
    rules: {
      // Get the same brace-style behaviour as Airbnb config.
      curly: ["error", "all"],
      "style/brace-style": ["error", "1tbs", { allowSingleLine: false }],

      // Perfectionist import rules.
      "perfectionist/sort-exports": "error",
      "perfectionist/sort-imports": [
        "error",
        {
          type: "natural",
          newlinesBetween: 1,
          internalPattern: ["^@/.*", "^~/.*"],
          groups: [
            "unknown",
            ["value-style", "value-side-effect-style", "value-side-effect"],
            ["named-type-builtin", "value-builtin"],
            ["type-external", "value-external"],
            ["named-type-internal", "value-internal"],
            [
              "named-type-parent",
              "named-type-sibling",
              "named-type-index",
              "value-parent",
              "value-sibling",
              "value-index",
            ],
            ["value-ts-equals-import"],
          ],
        },
      ],
      "perfectionist/sort-named-exports": "error",
      "perfectionist/sort-named-imports": "error",

      // Conflicting with "perfectionist/sort-imports".
      "import/order": "off",
    },
  };
}
