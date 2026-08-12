import { noUnknownTypeAliasesRule } from ".";
import { ruleTester } from "../../rule-tester";

const error = { messageId: "unknownAlias" as const };

ruleTester.run("no-unknown-type-aliases", noUnknownTypeAliasesRule, {
  valid: [
    "type User = { id: string };",
    "type Result = string | number;",
    "type Wrapper<T> = T;",
    "type JsonValue = string | number | boolean | null;",
    "export type Owner = { readonly id: string };",
  ],
  invalid: [
    { code: "type ExternalValue = unknown;", errors: [error] },
    { code: "export type ExternalValue = unknown;", errors: [error] },
    { code: "type Hidden = unknown; type Nested = Hidden;", errors: [error, error] },
  ],
});
