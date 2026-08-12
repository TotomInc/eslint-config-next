import { noWidenThenAssertRule } from ".";
import { ruleTester } from "../../rule-tester";

const error = { messageId: "widenThenAssert" as const };

ruleTester.run("no-widen-then-assert", noWidenThenAssertRule, {
  valid: [
    "type User = { id: string }; const user: User = { id: '1' };",
    "type User = { id: string }; declare function loadUser(): User; const stored: unknown = loadUser(); const user = stored as User;",
    "type User = { id: string }; const user = loadUser() as User;",
    "const value = 1; const copy = value;",
  ],
  invalid: [
    {
      code: "type User = { id: string }; const loaded: User = { id: '1' }; const stored: unknown = loaded; const user = stored as User;",
      errors: [error],
    },
    {
      code: "type User = { id: string }; const loaded = { id: '1' }; const stored: unknown = loaded; const user = stored as User;",
      errors: [error],
    },
    {
      code: "type User = { id: string }; const loaded: User = { id: '1' }; const stored = loaded as unknown; const user = stored as User;",
      errors: [error],
    },
    {
      code: "type User = { id: string }; const loaded: User = { id: '1' }; const stored: object = loaded; const user = stored as User;",
      errors: [error],
    },
  ],
});
