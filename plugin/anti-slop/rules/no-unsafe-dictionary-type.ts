import type { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../create-rule";
import { ancestor } from "../shared/ancestors";
import {
  classifyUnsafeDictionary,
  classifyUnsafeDictionaryValue,
  createTypeEnvironment,
  typeReferenceName,
} from "../shared/dictionary-types";
import type { TypeEnvironment } from "../shared/dictionary-types";

function isTypeNode(node: TSESTree.Node): node is TSESTree.TypeNode {
  return node.type.startsWith("TS") && node.type !== "TSTypeAnnotation";
}

function isInsideTypeAliasDeclaration(node: TSESTree.Node): boolean {
  let current = ancestor(node);

  while (current !== null && current.type !== "Program") {
    if (current.type === "TSTypeAliasDeclaration") {
      return true;
    }

    current = ancestor(current);
  }

  return false;
}

function isPlainAliasConsumerUse(node: TSESTree.TypeNode, environment: TypeEnvironment): boolean {
  if (node.type !== "TSTypeReference" || (node.typeArguments?.params.length ?? 0) > 0) {
    return false;
  }

  const name = typeReferenceName(node);

  return name !== null && environment.aliases.has(name) && !isInsideTypeAliasDeclaration(node);
}

function shouldReportType(node: TSESTree.TypeNode, environment: TypeEnvironment): boolean {
  if (isPlainAliasConsumerUse(node, environment)) {
    return false;
  }

  if (classifyUnsafeDictionary(node, environment) === null) {
    return false;
  }

  let current = ancestor(node);

  while (current !== null && current.type !== "Program") {
    if (isTypeNode(current) && classifyUnsafeDictionary(current, environment) !== null) {
      return false;
    }

    current = ancestor(current);
  }

  return true;
}

/**
 * Disallow object-dictionary contracts whose direct value type is an unsafe escape hatch.
 */
export const noUnsafeDictionaryTypeRule = createRule({
  name: "no-unsafe-dictionary-type",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow object-dictionary contracts whose direct value type is unknown, any, object, {}, or a union/alias containing one of those escape hatches.",
    },
    schema: [],
    messages: {
      unsafeDictionary:
        "This object dictionary's direct value type is an unsafe {{value}} escape hatch. Replace it with a concrete owner/schema-derived value type and parse external data at its boundary.",
    },
  },
  defaultOptions: [],
  create(context) {
    const environment = createTypeEnvironment(context.sourceCode.ast);

    const report = (node: TSESTree.Node, value: string) => {
      context.report({ node, messageId: "unsafeDictionary", data: { value } });
    };

    const reportIfUnsafe = (node: TSESTree.TypeNode) => {
      if (!shouldReportType(node, environment)) {
        return;
      }

      const unsafe = classifyUnsafeDictionary(node, environment);

      if (unsafe === null) {
        return;
      }

      report(node, unsafe.unsafeValue);
    };

    return {
      TSTypeReference: reportIfUnsafe,
      TSTypeLiteral: reportIfUnsafe,
      TSMappedType: reportIfUnsafe,
      TSIndexSignature(node) {
        if (node.typeAnnotation === undefined || ancestor(node)?.type === "TSTypeLiteral") {
          return;
        }

        const unsafe = classifyUnsafeDictionaryValue(
          node.typeAnnotation.typeAnnotation,
          environment,
        );

        if (unsafe !== null) {
          report(node, unsafe.unsafeValue);
        }
      },
    };
  },
});
