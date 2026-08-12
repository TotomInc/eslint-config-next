import antfu, {
  GLOB_JSX,
  GLOB_MARKDOWN_CODE,
  GLOB_SRC,
  GLOB_TS,
  GLOB_TSX,
} from "@antfu/eslint-config";
import type { TypedFlatConfigItem } from "@antfu/eslint-config";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import prettier from "eslint-plugin-prettier";

import { antiSlopPlugin, antiSlopRules } from "./plugin/anti-slop";

interface UserConfig {
  /**
   * Glob patterns of files to ignore.
   *
   * @default []
   */
  ignoredFiles?: string[];
  /**
   * Enable Next.js support.
   *
   * @default false
   */
  enableNextSupport?: boolean;
  /**
   * Path to the Tailwind CSS configuration file.
   *
   * @default "app/tailwind.css"
   */
  tailwindcssConfigPath?: string;
  /**
   * Enable anti-slop rules that reject low-evidence TypeScript and JavaScript patterns.
   *
   * @default false
   */
  antislop?: boolean;
}

export async function totominc(config: UserConfig, ...userConfigs: TypedFlatConfigItem[]) {
  return antfu(
    {
      type: "app",
      react: true,

      stylistic: {
        indent: 2,
        jsx: true,
        quotes: "double",
        semi: true,
      },

      nextjs: config?.enableNextSupport ?? false,

      typescript: {
        tsconfigPath: "./tsconfig.json",
      },
    },
    {
      // Apply to Node & React environments.
      files: [GLOB_SRC],
      plugins: { prettier },
      rules: {
        "prettier/prettier": [
          "error",
          {
            arrowParens: "always",
            bracketSameLine: false,
            endOfLine: "lf",
            bracketSpacing: true,
            htmlWhitespaceSensitivity: "ignore",
            printWidth: 100,
            proseWrap: "preserve",
            quoteProps: "as-needed",
            semi: true,
            singleAttributePerLine: false,
            singleQuote: false,
            trailingComma: "all",
            useTabs: false,
            vueIndentScriptAndStyle: false,
          },
        ],

        // Disable rules that are handled by prettier.
        "sort-imports": ["off"],
        "style/quote-props": ["off"],
        "style/no-multiple-empty-lines": ["off"],
        "style/indent-binary-ops": ["off"],
        "style/max-len": ["off"],
        "style/max-statements-per-line": ["off"],
        "style/arrow-parens": ["off"],
        "style/comma-dangle": ["off"],
        "style/quotes": ["off"],
        "style/operator-linebreak": ["off"],
        "style/multiline-ternary": ["off"],
        "style/indent": ["off"],
        "style/jsx-quotes": ["off"],
        "style/jsx-max-props-per-line": ["off"],
        "style/jsx-one-expression-per-line": ["off"],
        "style/jsx-wrap-multilines": ["off"],
        "style/jsx-indent": ["off"],
        "style/jsx-curly-newline": ["off"],
        "unicorn/number-literal-case": ["off"],
        "antfu/consistent-list-newline": ["off"],

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
            internalPattern: ["^@/.*"],
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
    },
    {
      // Apply only to React environment.
      files: [GLOB_TSX, GLOB_JSX],
      rules: {
        // Extra styling rules not interacting with prettier.
        "style/jsx-self-closing-comp": ["error", { component: true, html: true }],

        // See: https://perfectionist.dev/rules/sort-jsx-props
        "perfectionist/sort-jsx-props": [
          "error",
          {
            type: "natural",
            order: "asc",
            ignoreCase: true,
            specialCharacters: "keep",
            locales: "en-US",
            groups: ["reserved", "shorthand-prop", "unknown", "callback", "multiline-prop"],
            customGroups: [
              { groupName: "reserved", elementNamePattern: "^(key|ref)$" },
              { groupName: "callback", elementNamePattern: "^on.+" },
            ],
          },
        ],

        // Allow using `process.env` without `require("process")`.
        "node/prefer-global/process": "off",
      },
    },
    {
      files: [GLOB_TSX, GLOB_JSX],
      ...eslintPluginBetterTailwindcss.configs.recommended,
      settings: {
        "better-tailwindcss": {
          entryPoint: config.tailwindcssConfigPath ?? "app/globals.css",
        },
      },
      rules: {
        "better-tailwindcss/enforce-consistent-class-order": [
          "error",
          { order: "official", unknownClassOrder: "asc", unknownClassPosition: "start" },
        ],
        "better-tailwindcss/enforce-consistent-line-wrapping": ["off"],
        "better-tailwindcss/enforce-canonical-classes": ["error"],
      },
    },
    { ignores: [...(config?.ignoredFiles || [])] },
    ...(config?.antislop
      ? [
          {
            name: "totominc/anti-slop",
            files: [GLOB_SRC],
            ignores: [GLOB_MARKDOWN_CODE],
            plugins: {
              "anti-slop": antiSlopPlugin,
            },
            rules: { ...antiSlopRules },
          } satisfies TypedFlatConfigItem,
        ]
      : []),
    ...userConfigs,
  );
}

export { antiSlopPlugin, antiSlopRules };
export { GLOB_JSX, GLOB_SRC, GLOB_TS, GLOB_TSX };
