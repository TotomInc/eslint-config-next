import type { TypedFlatConfigItem } from "@antfu/eslint-config";
import prettier from "eslint-plugin-prettier";

/**
 * Prettier options shared by every framework so React, Next.js and Vue projects format the same.
 */
export const prettierOptions = {
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
} as const;

/**
 * Stylistic rules from antfu that fight with prettier output.
 */
const stylisticRulesHandledByPrettier = {
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
} satisfies TypedFlatConfigItem["rules"];

/**
 * Vue template and script stylistic rules from antfu and `eslint-plugin-vue` that fight with
 * prettier output. Mirrors the Vue section of `eslint-config-prettier`.
 */
export const vueRulesHandledByPrettier = {
  "vue/array-bracket-newline": ["off"],
  "vue/array-bracket-spacing": ["off"],
  "vue/array-element-newline": ["off"],
  "vue/arrow-spacing": ["off"],
  "vue/block-spacing": ["off"],
  "vue/block-tag-newline": ["off"],
  "vue/brace-style": ["off"],
  "vue/comma-dangle": ["off"],
  "vue/comma-spacing": ["off"],
  "vue/comma-style": ["off"],
  "vue/dot-location": ["off"],
  "vue/first-attribute-linebreak": ["off"],
  "vue/func-call-spacing": ["off"],
  "vue/html-closing-bracket-newline": ["off"],
  "vue/html-closing-bracket-spacing": ["off"],
  "vue/html-end-tags": ["off"],
  "vue/html-indent": ["off"],
  "vue/html-quotes": ["off"],
  "vue/key-spacing": ["off"],
  "vue/keyword-spacing": ["off"],
  "vue/max-attributes-per-line": ["off"],
  "vue/max-len": ["off"],
  "vue/multiline-html-element-content-newline": ["off"],
  "vue/multiline-ternary": ["off"],
  "vue/mustache-interpolation-spacing": ["off"],
  "vue/object-curly-newline": ["off"],
  "vue/object-curly-spacing": ["off"],
  "vue/object-property-newline": ["off"],
  "vue/operator-linebreak": ["off"],
  "vue/quote-props": ["off"],
  "vue/script-indent": ["off"],
  "vue/singleline-html-element-content-newline": ["off"],
  "vue/space-in-parens": ["off"],
  "vue/space-infix-ops": ["off"],
  "vue/space-unary-ops": ["off"],
  "vue/template-curly-spacing": ["off"],
} satisfies TypedFlatConfigItem["rules"];

export function prettierConfig(files: string[]): TypedFlatConfigItem {
  return {
    name: "totominc/prettier",
    files,
    plugins: { prettier },
    rules: {
      "prettier/prettier": ["error", prettierOptions],
      ...stylisticRulesHandledByPrettier,
    },
  };
}
