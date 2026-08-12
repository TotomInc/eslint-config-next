import { ESLintUtils } from "@typescript-eslint/utils";

/**
 * Create a typed ESLint rule with a documentation URL derived from the rule name.
 */
export const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/Totominc/eslint-config-next/blob/main/plugin/anti-slop/rules/${name}/README.md`,
);
