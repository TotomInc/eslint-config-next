import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../create-rule";
import { ancestor } from "../shared/ancestors";

function isEmptyObjectExpression(node: TSESTree.Expression): boolean {
  return node.type === "ObjectExpression" && node.properties.length === 0;
}

function isConditionalEmptyObjectSpread(node: TSESTree.Expression): boolean {
  return (
    node.type === "ConditionalExpression" &&
    (isEmptyObjectExpression(node.consequent) || isEmptyObjectExpression(node.alternate))
  );
}

/**
 * Ban conditional empty-object spreads without changing their omission semantics.
 */
export const noConditionalEmptyObjectSpreadRule = createRule({
  name: "no-conditional-empty-object-spread",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow object spreads that conditionally spread an empty object to omit fields.",
    },
    schema: [],
    messages: {
      avoid:
        "Do not use conditional empty-object spreads. Prefer a direct property or build the object in separate statements.",
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      SpreadElement(node) {
        if (ancestor(node)?.type !== "ObjectExpression") {
          return;
        }

        if (isConditionalEmptyObjectSpread(node.argument)) {
          context.report({ node, messageId: "avoid" });
        }
      },
    };
  },
});
