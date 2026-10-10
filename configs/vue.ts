import { GLOB_VUE } from "@antfu/eslint-config";
import type { TypedFlatConfigItem } from "@antfu/eslint-config";

import { vueRulesHandledByPrettier } from "./prettier";

/**
 * Vue counterpart of the React preferences: sorted attributes, self-closing tags, typed macros
 * and `<script setup lang="ts">` only.
 */
export function vueConfigs(): TypedFlatConfigItem[] {
  return [
    {
      name: "totominc/vue/rules",
      files: [GLOB_VUE],
      rules: {
        ...vueRulesHandledByPrettier,

        // Same as `style/jsx-self-closing-comp` for React, and what prettier outputs for voids.
        "vue/html-self-closing": [
          "error",
          {
            html: { void: "always", normal: "always", component: "always" },
            svg: "always",
            math: "always",
          },
        ],

        // Same as `perfectionist/sort-jsx-props` for React: directives first, events last.
        "vue/attributes-order": ["error", { alphabetical: true }],

        // Single component style, typed with TypeScript.
        "vue/block-lang": ["error", { script: { lang: "ts" } }],
        "vue/component-api-style": ["error", ["script-setup"]],
        "vue/define-emits-declaration": ["error", "type-based"],
        "vue/define-props-declaration": ["error", "type-based"],
        "vue/require-typed-object-prop": "error",
        "vue/require-typed-ref": "error",
        "vue/require-explicit-slots": "error",
        "vue/require-macro-variable-name": "error",
        "vue/prefer-define-options": "error",
        "vue/prefer-use-template-ref": "error",
        "vue/no-import-compiler-macros": "error",

        // Correctness.
        "vue/no-ref-object-reactivity-loss": "error",
        "vue/no-required-prop-with-default": "error",
        "vue/no-unused-emit-declarations": "error",
        "vue/no-unused-properties": "error",
        "vue/no-unused-refs": "error",
        "vue/no-unused-components": "error",
        "vue/no-undef-properties": "error",
        "vue/no-template-shadow": "error",
        "vue/no-multiple-objects-in-class": "error",
        "vue/no-static-inline-styles": "error",
        "vue/no-useless-v-bind": "error",
        "vue/no-root-v-if": "error",
        "vue/no-template-target-blank": "error",
        "vue/html-button-has-type": "error",

        // Template hygiene.
        "vue/no-useless-mustaches": "error",
        "vue/no-negated-v-if-condition": "error",
        "vue/prefer-true-attribute-shorthand": "error",
        "vue/v-on-handler-style": ["error", ["method", "inline-function"]],
        "vue/no-duplicate-class-names": "error",

        // Same as the script rules, inside template expressions.
        "vue/eqeqeq": ["error", "always", { null: "ignore" }],
        "vue/no-implicit-coercion": "error",
        "vue/object-shorthand": ["error", "always", { avoidQuotes: true }],
        "vue/prefer-template": "error",
        "vue/no-restricted-syntax": [
          "error",
          "DebuggerStatement",
          "LabeledStatement",
          "WithStatement",
        ],
      },
    },
  ];
}
