import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../create-rule";

const FORBIDDEN_SYMBOL_NAME = "shape";

function containsForbiddenSymbolName(name: string): boolean {
  return name.toLowerCase().includes(FORBIDDEN_SYMBOL_NAME);
}

/**
 * Ban the case-insensitive substring "shape" in every JavaScript and TypeScript symbol name.
 */
export const noShapeInSymbolNamesRule = createRule({
  name: "no-shape-in-symbol-names",
  meta: {
    type: "problem",
    docs: {
      description:
        'Disallow the case-insensitive substring "shape" in JavaScript, TypeScript, private, and JSX symbol names.',
    },
    schema: [],
    messages: {
      forbiddenSymbolName:
        'Do not use the case-insensitive substring "shape" in symbol names (found "{{name}}").',
    },
  },
  defaultOptions: [],
  create(context) {
    const reportForbiddenSymbolName = (node: TSESTree.Node & { name: string }) => {
      if (!containsForbiddenSymbolName(node.name)) {
        return;
      }

      context.report({
        node,
        messageId: "forbiddenSymbolName",
        data: { name: node.name },
      });
    };

    return {
      Identifier: reportForbiddenSymbolName,
      PrivateIdentifier: reportForbiddenSymbolName,
      JSXIdentifier: reportForbiddenSymbolName,
    };
  },
});
