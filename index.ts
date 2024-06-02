import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-plugin-prettier";
import antfu, { GLOB_JSX, GLOB_SRC, GLOB_TSX } from "@antfu/eslint-config";

const compat = new FlatCompat();

export function totominc() {
  return antfu(
    {
      react: true,
      toml: false,
      yaml: false,

      stylistic: {
        jsx: true,
        quotes: "double",
        semi: true,
      },

      typescript: {
        tsconfigPath: "./tsconfig.json",
      },

      rules: {
        // Get the same brace-style behaviour as Airbnb config.
        "curly": ["error", "all"],
        "style/brace-style": ["error", "1tbs", { allowSingleLine: false }],
      },
    },
    {
      files: [GLOB_TSX, GLOB_JSX],
      plugins: { prettier },
      rules: {
        "prettier/prettier": [
          "error",
          {
            printWidth: 80,
            tabWidth: 2,
            tabs: false,
            singleQuote: false,
            quoteProps: "as-needed",
            jsxSingleQuote: false,
            trailingComma: "all",
            bracketSpacing: true,
            bracketSameLine: false,
            arrowParens: "always",
            proseWrap: "preserve",
            htmlWhitespaceSensitivity: "css",
            endOfLine: "lf",
            singleAttributePerLine: false,
            plugins: ["prettier-plugin-tailwindcss"],
          },
        ],

        // Disable rules that are handled by prettier.
        "style/max-len": ["off"],
        "style/max-statements-per-line": ["off"],
        "style/arrow-parens": ["off"],
        "style/comma-dangle": ["off"],
        "style/quotes": ["off"],
        "style/jsx-quotes": ["off"],
        "style/jsx-max-props-per-line": ["off"],
        "style/jsx-one-expression-per-line": ["off"],

        // Extra styling rules not interacting with prettier.
        "style/jsx-self-closing-comp": ["error", { component: true, html: true }],
        "style/jsx-sort-props": ["error", {
          ignoreCase: false,
          callbacksLast: true,
          shorthandFirst: true,
          multiline: "last",
          noSortAlphabetically: true,
          reservedFirst: true,
        }],

        "react-hooks-extra/ensure-custom-hooks-using-other-hooks": "error",
        "react-hooks-extra/ensure-use-callback-has-non-empty-deps": "error",
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
      },
    },
    {
      files: [GLOB_SRC],
      rules: {
        "perfectionist/sort-exports": "error",
        "perfectionist/sort-imports": ["error", {
          "type": "line-length",
          "newlines-between": "always",
          "internal-pattern": ["@/**", "~/**"],
          "groups": [
            ["side-effect", "side-effect-style"],
            ["builtin-type", "external-type", "builtin", "external"],
            ["internal-type", "internal"],
            ["parent-type", "sibling-type", "index-type", "parent", "sibling", "index"],
            "object",
            "unknown",
          ],
        }],
        "perfectionist/sort-named-exports": "error",
        "perfectionist/sort-named-imports": "error",
      },
    },
    ...compat.config({
      extends: ["plugin:@next/next/recommended", "plugin:jsx-a11y/recommended"],
    }),
  );
}
