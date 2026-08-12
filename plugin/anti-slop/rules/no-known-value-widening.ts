import { ASTUtils } from "@typescript-eslint/utils";
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../create-rule";
import { ancestor } from "../shared/ancestors";
import {
  classifyWideningTarget,
  createTypeEnvironment,
  isKnownEvidenceExpression,
} from "../shared/dictionary-types";
import type { TypeEnvironment, WideningTarget } from "../shared/dictionary-types";
import { findVariable, variableDeclarator } from "../shared/scope";

type FunctionExpression =
  TSESTree.ArrowFunctionExpression | TSESTree.FunctionDeclaration | TSESTree.FunctionExpression;

function unwrapExpression(expression: TSESTree.Expression): TSESTree.Expression {
  let current = expression;

  while (
    current.type === "TSAsExpression" ||
    current.type === "TSSatisfiesExpression" ||
    current.type === "TSTypeAssertion" ||
    current.type === "TSNonNullExpression"
  ) {
    current = current.expression;
  }

  return current;
}

function isStableConstVariable(
  variable: TSESLint.Scope.Variable,
  declarator: TSESTree.VariableDeclarator,
): boolean {
  const parent = ancestor(declarator);

  return (
    parent?.type === "VariableDeclaration" &&
    parent.kind === "const" &&
    variable.references.every((reference) => reference.init || !reference.isWrite())
  );
}

function hasKnownEvidence(
  sourceCode: TSESLint.SourceCode,
  expression: TSESTree.Expression,
  visitedVariables = new Set<TSESLint.Scope.Variable>(),
): boolean {
  if (isKnownEvidenceExpression(expression)) {
    return true;
  }

  const unwrapped = unwrapExpression(expression);

  if (unwrapped.type !== "Identifier") {
    return false;
  }

  const variable = findVariable(sourceCode, unwrapped);

  if (variable === null || visitedVariables.has(variable)) {
    return false;
  }

  const declarator = variableDeclarator(variable, true);

  if (
    declarator === null ||
    declarator.init === null ||
    !isStableConstVariable(variable, declarator)
  ) {
    return false;
  }

  visitedVariables.add(variable);

  return hasKnownEvidence(sourceCode, declarator.init, visitedVariables);
}

function annotationTarget(
  annotation: TSESTree.TSTypeAnnotation | undefined,
  environment: TypeEnvironment,
): WideningTarget | null {
  return annotation === undefined
    ? null
    : classifyWideningTarget(annotation.typeAnnotation, environment);
}

function enclosingFunction(node: TSESTree.Node): FunctionExpression | null {
  let current = ancestor(node);

  while (current !== null && current.type !== "Program") {
    if (ASTUtils.isFunction(current)) {
      return current;
    }

    current = ancestor(current);
  }

  return null;
}

function sourceKeyName(sourceCode: TSESLint.SourceCode, key: TSESTree.PropertyName): string {
  if (key.type === "Identifier" || key.type === "PrivateIdentifier") {
    return key.name;
  }

  if (key.type === "Literal") {
    return String(key.value);
  }

  return sourceCode.getText(key);
}

function functionName(sourceCode: TSESLint.SourceCode, owner: FunctionExpression | null): string {
  if (owner === null) {
    return "anonymous function";
  }

  if (owner.id !== null) {
    return owner.id.name;
  }

  const parent = ancestor(owner);

  if (parent?.type === "VariableDeclarator" && parent.id.type === "Identifier") {
    return parent.id.name;
  }

  if (parent?.type === "MethodDefinition") {
    return sourceKeyName(sourceCode, parent.key);
  }

  return "anonymous function";
}

function isEmptyObjectExpression(expression: TSESTree.Expression): boolean {
  const unwrapped = unwrapExpression(expression);

  return unwrapped.type === "ObjectExpression" && unwrapped.properties.length === 0;
}

function isDictionaryAccumulatorTarget(destination: WideningTarget): boolean {
  return destination.kind === "open dictionary" || destination.kind === "generic container";
}

function hasParentAssertion(node: TSESTree.Node): boolean {
  return ASTUtils.isTypeAssertion(ancestor(node));
}

/**
 * Detect sound syntactic cases where a known value is explicitly widened and loses evidence.
 */
export const noKnownValueWideningRule = createRule({
  name: "no-known-value-widening",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow syntactically established values from flowing into explicitly broad or anonymous target types that discard useful evidence.",
    },
    schema: [],
    messages: {
      widening:
        "The known initializer supplying {{subject}} carries established type evidence, but the explicit {{target}} target type discards it. Preserve inference, use `satisfies`, or introduce/use a named owner contract; parse genuinely external data once at its boundary.",
    },
  },
  defaultOptions: [],
  create(context) {
    const environment = createTypeEnvironment(context.sourceCode.ast);

    const reportFlow = (
      expression: TSESTree.Expression,
      destination: WideningTarget | null,
      subject: string,
    ) => {
      if (destination === null) {
        return;
      }

      if (isDictionaryAccumulatorTarget(destination) && isEmptyObjectExpression(expression)) {
        return;
      }

      if (!hasKnownEvidence(context.sourceCode, expression)) {
        return;
      }

      context.report({
        node: expression,
        messageId: "widening",
        data: { subject, target: destination.kind },
      });
    };

    const targetFromAnnotation = (annotation: TSESTree.TSTypeAnnotation | undefined) =>
      annotationTarget(annotation, environment);

    return {
      VariableDeclarator(node) {
        if (node.init === null || node.id.type !== "Identifier") {
          return;
        }

        reportFlow(
          node.init,
          targetFromAnnotation(node.id.typeAnnotation),
          `binding \`${node.id.name}\``,
        );
      },
      PropertyDefinition(node) {
        if (node.value === null) {
          return;
        }

        reportFlow(
          node.value,
          targetFromAnnotation(node.typeAnnotation),
          `property \`${sourceKeyName(context.sourceCode, node.key)}\``,
        );
      },
      AccessorProperty(node) {
        if (node.value === null) {
          return;
        }

        reportFlow(
          node.value,
          targetFromAnnotation(node.typeAnnotation),
          `property \`${sourceKeyName(context.sourceCode, node.key)}\``,
        );
      },
      AssignmentExpression(node) {
        if (node.operator !== "=" || node.left.type !== "Identifier") {
          return;
        }

        const variable = findVariable(context.sourceCode, node.left);

        if (variable === null) {
          return;
        }

        const declarator = variableDeclarator(variable);

        if (declarator === null || declarator.id.type !== "Identifier") {
          return;
        }

        reportFlow(
          node.right,
          targetFromAnnotation(declarator.id.typeAnnotation),
          `binding \`${declarator.id.name}\``,
        );
      },
      ReturnStatement(node) {
        if (node.argument === null) {
          return;
        }

        const owner = enclosingFunction(node);

        reportFlow(
          node.argument,
          targetFromAnnotation(owner?.returnType),
          `return value of \`${functionName(context.sourceCode, owner)}\``,
        );
      },
      ArrowFunctionExpression(node) {
        if (node.body.type === "BlockStatement") {
          return;
        }

        reportFlow(
          node.body,
          targetFromAnnotation(node.returnType),
          `return value of \`${functionName(context.sourceCode, node)}\``,
        );
      },
      TSAsExpression(node) {
        if (hasParentAssertion(node)) {
          return;
        }

        reportFlow(
          node.expression,
          classifyWideningTarget(node.typeAnnotation, environment),
          "assertion",
        );
      },
      TSTypeAssertion(node) {
        if (hasParentAssertion(node)) {
          return;
        }

        reportFlow(
          node.expression,
          classifyWideningTarget(node.typeAnnotation, environment),
          "assertion",
        );
      },
    };
  },
});
