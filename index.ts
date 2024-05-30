import antfu, { GLOB_JSX, GLOB_SRC, GLOB_TSX } from "@antfu/eslint-config";
import { FlatCompat } from "@eslint/eslintrc";
import tailwind from "eslint-plugin-tailwindcss";

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
        "curly": ["error", "all"],
        "style/brace-style": ["error", "stroustrup"],
      },
    },
    {
      files: [GLOB_TSX, GLOB_JSX],
      rules: {
        "react-hooks-extra/ensure-custom-hooks-using-other-hooks": "error",
        "react-hooks-extra/ensure-use-callback-has-non-empty-deps": "error",
        "react-hooks-extra/ensure-use-memo-has-non-empty-deps": "error",
        "react-hooks-extra/prefer-use-state-lazy-initialization": "error",
        "react-naming-convention/component-name": "error",
        "react-naming-convention/use-state": "error",

        // Allow floating promise when `onClick={doSomethingAsync}` with an async function
        // passed to an event handler.
        // See: https://github.com/typescript-eslint/typescript-eslint/issues/4619
        "@typescript-eslint/no-misused-promises": ["error", { "checksVoidReturn": false }],

        // Allow using `process.env` without `require("process")`.
        "node/prefer-global/process": "off",
      },
    },
    {
      files: [GLOB_SRC],
      rules: {
        "perfectionist/sort-exports": "error",
        "perfectionist/sort-imports": ["error", {
          type: "line-length",
          "newlines-between": "always",
          "internal-pattern": ['@/**', '~/**'],
          groups: [
            ['side-effect', 'side-effect-style'],
            ['builtin-type', 'external-type', 'builtin', 'external'],
            ['internal-type', 'internal'],
            ['parent-type', 'sibling-type', 'index-type', 'parent', 'sibling', 'index'],
            'object',
            'unknown',
          ]
        }],
        "perfectionist/sort-named-exports": "error",
        "perfectionist/sort-named-imports": "error",
      },
    },
    ...tailwind.configs["flat/recommended"],
    ...compat.config({ extends: ["plugin:promise/recommended"] }),
    ...compat.config({
      extends: ["plugin:@next/next/recommended", "plugin:react-hook-form/recommended", "plugin:jsx-a11y/recommended"],
    }),
    ...compat.config({
      plugins: ["write-good-comments"],
      rules: { "write-good-comments/write-good-comments": "error" },
    }),
  )
}
