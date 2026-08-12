import { noRuntimeTypeofRule } from "../../plugin/anti-slop/rules/no-runtime-typeof";
import { ruleTester } from "./rule-tester";

const error = { messageId: "runtimeTypeof" as const };

ruleTester.run("no-runtime-typeof", noRuntimeTypeofRule, {
  valid: [
    'if (input === "string") { useName(input); }',
    "const kind = input.kind;",
    "function parse(input: string) { return input; }",
  ],
  invalid: [
    {
      code: 'if (typeof input === "string") { useName(input); }',
      errors: [error],
    },
    { code: "const kind = typeof input;", errors: [error] },
    { code: 'return typeof value === "function";', errors: [error] },
  ],
});
