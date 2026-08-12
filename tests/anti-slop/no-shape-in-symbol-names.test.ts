import { noShapeInSymbolNamesRule } from "../../plugin/anti-slop/rules/no-shape-in-symbol-names";
import { ruleTester } from "./rule-tester";

const error = { messageId: "forbiddenSymbolName" as const };

ruleTester.run("no-shape-in-symbol-names", noShapeInSymbolNamesRule, {
  valid: [
    "interface User { id: string }",
    "const user = 1;",
    "function render() {}",
    "class Account {}",
    { code: "const el = <User />;", filename: "file.tsx" },
  ],
  invalid: [
    { code: "interface UserShape { id: string }", errors: [error] },
    { code: "const shape = 1;", errors: [error] },
    { code: "const userShape = 1;", errors: [error] },
    { code: "function toShape() {}", errors: [error] },
    { code: "class Foo { #shape = 1 }", errors: [error] },
    { code: "const el = <Shape />;", filename: "file.tsx", errors: [error] },
  ],
});
