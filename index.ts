import antfu, { GLOB_JSX, GLOB_SRC, GLOB_TS, GLOB_TSX } from "@antfu/eslint-config";
import type { TypedFlatConfigItem } from "@antfu/eslint-config";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-plugin-prettier";

interface UserConfig {
  ignoredFiles?: string[];
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
            plugins: ["prettier-plugin-tailwindcss"],
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
            newlinesBetween: "always",
            internalPattern: ["^@/.*"],
            groups: [
              "unknown",
              ["style"],
              ["side-effect", "side-effect-style"],
              ["builtin-type", "external-type", "builtin", "external"],
              ["internal-type", "internal"],
              ["parent-type", "sibling-type", "index-type", "parent", "sibling", "index"],
              "object",
            ],
          },
        ],
        "perfectionist/sort-named-exports": "error",
        "perfectionist/sort-named-imports": "error",

        // Conflicting with "perfectionist/sort-imports".
        "import/order": "off",

        // Don't force to use `require()` for the following globals.
        "node/prefer-global/process": "off",
        "node/prefer-global/buffer": "off",
        "node/prefer-global/console": "off",
      },
    },
    {
      // Apply only to React environment.
      files: [GLOB_TSX, GLOB_JSX],
      plugins: { ...jsxA11y.flatConfigs.recommended.plugins },
      rules: {
        // Extra styling rules not interacting with prettier.
        "style/jsx-self-closing-comp": ["error", { component: true, html: true }],
        "style/jsx-sort-props": [
          "error",
          {
            ignoreCase: false,
            callbacksLast: true,
            shorthandFirst: true,
            multiline: "last",
            noSortAlphabetically: true,
            reservedFirst: true,
          },
        ],

        // Destructuring with Next.js and `await props.params / props.searchParams` isn't possible.
        // Or we get a non-Thenable type error with TypeScript.
        "react/prefer-destructuring-assignment": "off",

        "react-hooks-extra/ensure-custom-hooks-using-other-hooks": "error",
        "react-hooks-extra/ensure-use-memo-has-non-empty-deps": "error",
        "react-hooks-extra/prefer-use-state-lazy-initialization": "error",
        "react-naming-convention/component-name": "error",
        "react-naming-convention/use-state": "error",

        // Allow floating promise when `onClick={doSomethingAsync}` with an async function
        // passed to an event handler.
        // See: https://github.com/typescript-eslint/typescript-eslint/issues/4619
        "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],

        // Allow using `process.env` without `require("process")`.
        "node/prefer-global/process": "off",

        // Enable recommended a11y rules.
        ...jsxA11y.flatConfigs.recommended.rules,
      },
    },
    {
      // Apply only on Typescript Node + React environments.
      files: [GLOB_TS, GLOB_TSX],
      rules: {
        // Doing more harm than good, need to look deeper into this.
        "ts/strict-boolean-expressions": "off",
      },
    },
    { ignores: [...(config?.ignoredFiles || [])] },
    ...userConfigs,
  );
}

export { GLOB_JSX, GLOB_SRC, GLOB_TS, GLOB_TSX };
