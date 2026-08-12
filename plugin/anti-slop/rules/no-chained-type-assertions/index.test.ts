import { noChainedTypeAssertionsRule } from ".";
import { ruleTester } from "../../rule-tester";

const error = { messageId: "chained" as const };

ruleTester.run("no-chained-type-assertions", noChainedTypeAssertionsRule, {
  valid: [
    "const user = input as User;",
    "const user = <User>input;",
    "const value = input as const;",
    "const value = (input as const);",
    "const value = input as const as const;",
    "const n = 1;",
  ],
  invalid: [
    { code: "const user = input as object as User;", errors: [error] },
    { code: "const user = <User><object>input;", errors: [error] },
    { code: "const user = (input as object) as User;", errors: [error] },
    { code: "const user = input as const as User;", errors: [error] },
  ],
});
