import { ASTUtils } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../../create-rule";
import { ancestor } from "../../shared/ancestors";

function isConstAssertion(node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion): boolean {
  const { typeAnnotation } = node;

  return (
    typeAnnotation.type === "TSTypeReference" &&
    typeAnnotation.typeName.type === "Identifier" &&
    typeAnnotation.typeName.name === "const"
  );
}

function isOutermostAssertionInChain(
  node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
): boolean {
  const parent = ancestor(node);

  return parent === null || !ASTUtils.isTypeAssertion(parent) || parent.expression !== node;
}

function isForbiddenAssertionChain(
  node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
): boolean {
  let assertionCount = 0;
  let hasNonConstAssertion = false;
  let current: TSESTree.Expression = node;

  while (ASTUtils.isTypeAssertion(current)) {
    assertionCount += 1;
    hasNonConstAssertion ||= !isConstAssertion(current);
    current = current.expression;
  }

  return assertionCount > 1 && hasNonConstAssertion;
}

/**
 * Disallow nested TypeScript type assertions, while permitting chains made only of const assertions.
 */
export const noChainedTypeAssertionsRule = createRule({
  name: "no-chained-type-assertions",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow chained TypeScript as and angle-bracket assertions, including parenthesized chains.",
    },
    schema: [],
    messages: {
      chained:
        "Chained type assertions discard existing type evidence and fabricate the target type without parsing. Preserve the value's original precise type, or parse genuinely unknown input at its boundary before using it.",
    },
  },
  defaultOptions: [],
  create(context) {
    const checkTypeAssertion = (node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion) => {
      if (!isOutermostAssertionInChain(node) || !isForbiddenAssertionChain(node)) {
        return;
      }

      context.report({ node, messageId: "chained" });
    };

    return {
      TSAsExpression: checkTypeAssertion,
      TSTypeAssertion: checkTypeAssertion,
    };
  },
});
