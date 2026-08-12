import type { TSESLint } from "@typescript-eslint/utils";

import { noChainedTypeAssertionsRule } from "./rules/no-chained-type-assertions";
import { noConditionalEmptyObjectSpreadRule } from "./rules/no-conditional-empty-object-spread";
import { noKnownValueWideningRule } from "./rules/no-known-value-widening";
import { noObjectParametersRule } from "./rules/no-object-parameters";
import { noRuntimeTypeofRule } from "./rules/no-runtime-typeof";
// eslint-disable-next-line anti-slop/no-shape-in-symbol-names
import { noShapeInSymbolNamesRule } from "./rules/no-shape-in-symbol-names";
import { noUnknownParametersRule } from "./rules/no-unknown-parameters";
import { noUnknownTypeAliasesRule } from "./rules/no-unknown-type-aliases";
import { noUnsafeDictionaryTypeRule } from "./rules/no-unsafe-dictionary-type";
import { noWidenThenAssertRule } from "./rules/no-widen-then-assert";

/**
 * ESLint plugin that rejects low-evidence and low-signal TypeScript and JavaScript patterns.
 *
 * Ported from [anti-slop](https://github.com/dmmulroy/anti-slop) Oxlint rules.
 */
export const antiSlopPlugin = {
  meta: {
    name: "anti-slop",
  },
  rules: {
    "no-chained-type-assertions": noChainedTypeAssertionsRule,
    "no-conditional-empty-object-spread": noConditionalEmptyObjectSpreadRule,
    "no-known-value-widening": noKnownValueWideningRule,
    "no-object-parameters": noObjectParametersRule,
    "no-runtime-typeof": noRuntimeTypeofRule,
    // eslint-disable-next-line anti-slop/no-shape-in-symbol-names
    "no-shape-in-symbol-names": noShapeInSymbolNamesRule,
    "no-unknown-parameters": noUnknownParametersRule,
    "no-unknown-type-aliases": noUnknownTypeAliasesRule,
    "no-unsafe-dictionary-type": noUnsafeDictionaryTypeRule,
    "no-widen-then-assert": noWidenThenAssertRule,
  },
} satisfies TSESLint.FlatConfig.Plugin;

/**
 * Enable every anti-slop rule as an error.
 */
export const antiSlopRules = {
  "anti-slop/no-chained-type-assertions": "error",
  "anti-slop/no-conditional-empty-object-spread": "error",
  "anti-slop/no-known-value-widening": "error",
  "anti-slop/no-object-parameters": "error",
  "anti-slop/no-runtime-typeof": "error",
  "anti-slop/no-shape-in-symbol-names": "error",
  "anti-slop/no-unknown-parameters": "error",
  "anti-slop/no-unknown-type-aliases": "error",
  "anti-slop/no-unsafe-dictionary-type": "error",
  "anti-slop/no-widen-then-assert": "error",
} as const;
