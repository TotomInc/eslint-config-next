import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../create-rule";

function referencedAliasName(type: TSESTree.TypeNode): string | null {
  if (type.type !== "TSTypeReference" || type.typeName.type !== "Identifier") {
    return null;
  }

  return type.typeArguments === undefined || type.typeArguments.params.length === 0
    ? type.typeName.name
    : null;
}

/**
 * Ban named aliases that merely conceal TypeScript's unknown top type.
 */
export const noUnknownTypeAliasesRule = createRule({
  name: "no-unknown-type-aliases",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow type aliases whose resolved type is unknown; unknown must remain visible at an allowed boundary.",
    },
    schema: [],
    messages: {
      unknownAlias:
        "Type alias `{{alias}}` only renames `unknown`. Keep `unknown` explicit on an allowed `cause` field or replace it with the parsed owner type.",
    },
  },
  defaultOptions: [],
  create(context) {
    const aliases = new Map<string, TSESTree.TSTypeAliasDeclaration>();

    const resolvesToUnknown = (type: TSESTree.TypeNode, visited = new Set<string>()): boolean => {
      if (type.type === "TSUnknownKeyword") {
        return true;
      }

      const name = referencedAliasName(type);

      if (name === null || visited.has(name)) {
        return false;
      }

      const alias = aliases.get(name);

      if (alias === undefined || alias.typeParameters !== undefined) {
        return false;
      }

      const nextVisited = new Set(visited);

      nextVisited.add(name);

      return resolvesToUnknown(alias.typeAnnotation, nextVisited);
    };

    return {
      Program(node) {
        for (const statement of node.body) {
          const declaration =
            statement.type === "ExportNamedDeclaration" ? statement.declaration : statement;

          if (declaration?.type === "TSTypeAliasDeclaration") {
            aliases.set(declaration.id.name, declaration);
          }
        }

        for (const alias of aliases.values()) {
          if (!resolvesToUnknown(alias.typeAnnotation, new Set([alias.id.name]))) {
            continue;
          }

          context.report({
            node: alias.id,
            messageId: "unknownAlias",
            data: { alias: alias.id.name },
          });
        }
      },
    };
  },
});
