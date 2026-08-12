import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../create-rule";
import { parameterAnnotation, parameterName, parameterOwnerListeners } from "../shared/parameters";

/**
 * Ban the broad object type on function inputs, including local aliases to object.
 */
export const noObjectParametersRule = createRule({
  name: "no-object-parameters",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow object function parameters; inputs must use an owner-provided type and be parsed at their boundary.",
    },
    schema: [],
    messages: {
      objectParameter:
        "Parameter `{{parameter}}` accepts the broad `object` type. Use the expected owner type or decode the external input at its boundary.",
    },
  },
  defaultOptions: [],
  create(context) {
    const aliases = new Map<string, TSESTree.TypeNode>();

    const resolvesToObject = (type: TSESTree.TypeNode, visited = new Set<string>()): boolean => {
      if (type.type === "TSObjectKeyword") {
        return true;
      }

      if (type.type === "TSUnionType") {
        return type.types.some((member) => resolvesToObject(member, visited));
      }

      if (
        type.type !== "TSTypeReference" ||
        type.typeName.type !== "Identifier" ||
        (type.typeArguments !== undefined && type.typeArguments.params.length > 0) ||
        visited.has(type.typeName.name)
      ) {
        return false;
      }

      const alias = aliases.get(type.typeName.name);

      if (alias === undefined) {
        return false;
      }

      const nextVisited = new Set(visited);

      nextVisited.add(type.typeName.name);

      return resolvesToObject(alias, nextVisited);
    };

    return {
      Program(node) {
        for (const statement of node.body) {
          const declaration =
            statement.type === "ExportNamedDeclaration" ? statement.declaration : statement;

          if (
            declaration?.type === "TSTypeAliasDeclaration" &&
            declaration.typeParameters === undefined
          ) {
            aliases.set(declaration.id.name, declaration.typeAnnotation);
          }
        }
      },
      ...parameterOwnerListeners((node) => {
        for (const parameter of node.params) {
          const annotation = parameterAnnotation(parameter);

          if (annotation === undefined || !resolvesToObject(annotation.typeAnnotation)) {
            continue;
          }

          context.report({
            node: annotation.typeAnnotation,
            messageId: "objectParameter",
            data: { parameter: parameterName(parameter, context.sourceCode, "object") },
          });
        }
      }),
    };
  },
});
