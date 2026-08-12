import type { TSESTree } from "@typescript-eslint/utils";

/**
 * Return the ESLint-attached parent node, or `null` at the program root.
 *
 * @param node - AST node whose parent should be read
 * @returns The parent node, or `null` when `node` is the program
 */
export function ancestor(node: TSESTree.Node): TSESTree.Node | null {
  if (node.type === "Program") {
    return null;
  }

  return node.parent;
}
