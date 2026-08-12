import { noConditionalEmptyObjectSpreadRule } from "../../plugin/anti-slop/rules/no-conditional-empty-object-spread";
import { ruleTester } from "./rule-tester";

const error = { messageId: "avoid" as const };

if (noConditionalEmptyObjectSpreadRule.meta.fixable !== undefined) {
  throw new Error("The rule must not offer an unsafe semantics-changing fix.");
}

ruleTester.run("no-conditional-empty-object-spread", noConditionalEmptyObjectSpreadRule, {
  valid: [
    "const result = { value };",
    "const result = { ...values };",
    "const result = condition ? { value } : {};",
  ],
  invalid: [
    {
      code: "const result = { ...(value !== undefined ? { value } : {}) };",
      errors: [error],
    },
    {
      code: "const result = { ...(condition ? {} : { value }) };",
      errors: [error],
    },
  ],
});
