import { noUnknownParametersRule } from "../../plugin/anti-slop/rules/no-unknown-parameters";
import { ruleTester } from "./rule-tester";

const error = { messageId: "unknownParameter" as const };

ruleTester.run("no-unknown-parameters", noUnknownParametersRule, {
  valid: [
    "function handle(input: User) {}",
    "function wrap(cause: unknown) {}",
    "const wrap = (cause: unknown) => cause;",
    "function f(value: string) {}",
    "type Handler = (cause: unknown) => void;",
  ],
  invalid: [
    { code: "function handle(input: unknown) {}", errors: [error] },
    { code: "const handle = (input: unknown) => input;", errors: [error] },
    { code: "type Handler = (input: unknown) => void;", errors: [error] },
    { code: "function handle(input: unknown, cause: unknown) {}", errors: [error] },
  ],
});
