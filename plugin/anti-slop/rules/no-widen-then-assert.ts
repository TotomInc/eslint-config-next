import { ASTUtils } from "@typescript-eslint/utils";
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../create-rule";
import { ancestor } from "../shared/ancestors";
import { typeReferenceName } from "../shared/dictionary-types";
import { findVariable, variableDeclarator } from "../shared/scope";

type BroadTypeKind = "top" | "object" | "record";

interface KnownValueEvidence {
  readonly type: TSESTree.TypeNode | null;
}

const functionBoundaryTypes = new Set([
  "ArrowFunctionExpression",
  "FunctionDeclaration",
  "FunctionExpression",
  "TSDeclareFunction",
  "TSEmptyBodyFunctionExpression",
]);

function isUnknownOrAnyType(type: TSESTree.TypeNode): boolean {
  return type.type === "TSUnknownKeyword" || type.type === "TSAnyKeyword";
}

function isBroadRecordKeyType(type: TSESTree.TypeNode): boolean {
  if (
    type.type === "TSStringKeyword" ||
    type.type === "TSNumberKeyword" ||
    type.type === "TSSymbolKeyword"
  ) {
    return true;
  }

  if (type.type === "TSUnionType") {
    return type.types.every(isBroadRecordKeyType);
  }

  return type.type === "TSTypeReference" && typeReferenceName(type) === "PropertyKey";
}

function isBroadRecordType(type: TSESTree.TypeNode): boolean {
  if (type.type === "TSTypeReference") {
    if (typeReferenceName(type) === "Readonly") {
      const [inner] = type.typeArguments?.params ?? [];

      return inner !== undefined && isBroadRecordType(inner);
    }

    if (typeReferenceName(type) !== "Record") {
      return false;
    }

    const parameters = type.typeArguments?.params ?? [];

    return (
      parameters.length === 2 &&
      parameters[0] !== undefined &&
      parameters[1] !== undefined &&
      isBroadRecordKeyType(parameters[0]) &&
      isUnknownOrAnyType(parameters[1])
    );
  }

  if (type.type !== "TSTypeLiteral" || type.members.length !== 1) {
    return false;
  }

  const [member] = type.members;
  const [parameter] = member?.type === "TSIndexSignature" ? member.parameters : [];
  const parameterAnnotation =
    parameter !== undefined && parameter.type !== "TSParameterProperty"
      ? parameter.typeAnnotation
      : undefined;

  return (
    member?.type === "TSIndexSignature" &&
    member.parameters.length === 1 &&
    parameterAnnotation !== undefined &&
    member.typeAnnotation !== undefined &&
    isBroadRecordKeyType(parameterAnnotation.typeAnnotation) &&
    isUnknownOrAnyType(member.typeAnnotation.typeAnnotation)
  );
}

function broadTypeKind(type: TSESTree.TypeNode): BroadTypeKind | null {
  if (type.type === "TSUnknownKeyword" || type.type === "TSAnyKeyword") {
    return "top";
  }

  if (type.type === "TSObjectKeyword") {
    return "object";
  }

  return isBroadRecordType(type) ? "record" : null;
}

function assertedExpression(
  node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
): TSESTree.Expression {
  return node.expression;
}

function assertionFromExpression(
  expression: TSESTree.Expression,
): TSESTree.TSAsExpression | TSESTree.TSTypeAssertion | null {
  return ASTUtils.isTypeAssertion(expression) ? expression : null;
}

function normalizedTypeText(sourceText: string, type: TSESTree.TypeNode): string {
  return sourceText.slice(type.range[0], type.range[1]).replaceAll(/\s+/gu, "");
}

function typesHaveSameSyntax(
  sourceText: string,
  left: TSESTree.TypeNode | null,
  right: TSESTree.TypeNode,
): boolean {
  return (
    left !== null && normalizedTypeText(sourceText, left) === normalizedTypeText(sourceText, right)
  );
}

function isDefinitelyObjectType(type: TSESTree.TypeNode): boolean {
  if (
    type.type === "TSArrayType" ||
    type.type === "TSConstructorType" ||
    type.type === "TSFunctionType" ||
    type.type === "TSMappedType" ||
    type.type === "TSObjectKeyword" ||
    type.type === "TSTupleType"
  ) {
    return true;
  }

  if (type.type === "TSTypeLiteral") {
    return type.members.length > 0;
  }

  if (type.type === "TSIntersectionType") {
    return type.types.every(isDefinitelyObjectType);
  }

  if (type.type === "TSTypeOperator") {
    return (
      type.operator === "readonly" &&
      type.typeAnnotation !== undefined &&
      isDefinitelyObjectType(type.typeAnnotation)
    );
  }

  return false;
}

function isDefinitelyNarrowerRecordType(type: TSESTree.TypeNode): boolean {
  if (type.type === "TSTypeLiteral") {
    return type.members.some((member) => member.type !== "TSIndexSignature");
  }

  if (type.type !== "TSTypeReference") {
    return false;
  }

  if (typeReferenceName(type) === "Readonly") {
    const [inner] = type.typeArguments?.params ?? [];

    return inner !== undefined && isDefinitelyNarrowerRecordType(inner);
  }

  if (typeReferenceName(type) !== "Record") {
    return false;
  }

  const parameters = type.typeArguments?.params ?? [];

  return (
    parameters.length === 2 && parameters[1] !== undefined && !isUnknownOrAnyType(parameters[1])
  );
}

function functionBoundary(node: TSESTree.Node): TSESTree.Node | null {
  let current = ancestor(node);

  while (current !== null && current.type !== "Program") {
    if (functionBoundaryTypes.has(current.type)) {
      return current;
    }

    current = ancestor(current);
  }

  return null;
}

function knownValueEvidence(
  sourceCode: TSESLint.SourceCode,
  expression: TSESTree.Expression,
  boundary: TSESTree.Node | null,
  visitedVariables: ReadonlySet<TSESLint.Scope.Variable>,
): KnownValueEvidence | null {
  if (ASTUtils.isTypeAssertion(expression)) {
    if (broadTypeKind(expression.typeAnnotation) !== null) {
      return null;
    }

    return { type: expression.typeAnnotation };
  }

  if (expression.type === "Literal" || expression.type === "TemplateLiteral") {
    return { type: null };
  }

  if (
    expression.type === "ArrayExpression" ||
    expression.type === "ArrowFunctionExpression" ||
    expression.type === "ClassExpression" ||
    expression.type === "FunctionExpression" ||
    expression.type === "NewExpression" ||
    expression.type === "ObjectExpression"
  ) {
    return { type: null };
  }

  if (expression.type !== "Identifier") {
    return null;
  }

  const variable = findVariable(sourceCode, expression);

  if (variable === null || visitedVariables.has(variable)) {
    return null;
  }

  const annotatedIdentifier = variable.identifiers.find(
    (identifier) => identifier.typeAnnotation !== undefined,
  );
  const annotation = annotatedIdentifier?.typeAnnotation?.typeAnnotation;

  if (annotation !== undefined && annotatedIdentifier !== undefined) {
    if (functionBoundary(annotatedIdentifier) !== boundary || broadTypeKind(annotation) !== null) {
      return null;
    }

    return { type: annotation };
  }

  const declarator = variableDeclarator(variable);
  const parent = declarator === null ? null : ancestor(declarator);

  if (
    declarator === null ||
    parent?.type !== "VariableDeclaration" ||
    parent.kind !== "const" ||
    declarator.init === null ||
    variable.references.some((reference) => reference.isWrite() && !reference.init) ||
    functionBoundary(declarator) !== boundary
  ) {
    return null;
  }

  return knownValueEvidence(
    sourceCode,
    declarator.init,
    boundary,
    new Set([...visitedVariables, variable]),
  );
}

function widenedBinding(
  sourceCode: TSESLint.SourceCode,
  variable: TSESLint.Scope.Variable,
): {
  readonly broadKind: BroadTypeKind;
  readonly evidence: KnownValueEvidence;
  readonly declaredAt: number;
  readonly boundary: TSESTree.Node | null;
} | null {
  const declarator = variableDeclarator(variable);
  const parent = declarator === null ? null : ancestor(declarator);

  if (
    declarator === null ||
    parent?.type !== "VariableDeclaration" ||
    parent.kind !== "const" ||
    declarator.id.type !== "Identifier" ||
    declarator.init === null ||
    variable.references.some((reference) => reference.isWrite() && !reference.init)
  ) {
    return null;
  }

  const boundary = functionBoundary(declarator);
  const declaredType = declarator.id.typeAnnotation?.typeAnnotation;
  const initializerAssertion = assertionFromExpression(declarator.init);
  const initializerBroadKind =
    initializerAssertion === null ? null : broadTypeKind(initializerAssertion.typeAnnotation);
  const declaredBroadKind = declaredType === undefined ? null : broadTypeKind(declaredType);
  const broadKind = declaredBroadKind ?? initializerBroadKind;

  if (broadKind === null) {
    return null;
  }

  const originalExpression =
    initializerAssertion !== null && initializerBroadKind !== null
      ? assertedExpression(initializerAssertion)
      : declarator.init;
  const evidence = knownValueEvidence(
    sourceCode,
    originalExpression,
    boundary,
    new Set([variable]),
  );

  return evidence === null
    ? null
    : { broadKind, evidence, declaredAt: declarator.range[1], boundary };
}

function assertionIsNarrower(
  sourceText: string,
  broadKind: BroadTypeKind,
  evidence: KnownValueEvidence,
  assertedType: TSESTree.TypeNode,
): boolean {
  if (broadTypeKind(assertedType) !== null) {
    return false;
  }

  if (broadKind === "top") {
    return true;
  }

  if (typesHaveSameSyntax(sourceText, evidence.type, assertedType)) {
    return true;
  }

  if (broadKind === "object") {
    return isDefinitelyObjectType(assertedType);
  }

  return isDefinitelyNarrowerRecordType(assertedType);
}

/**
 * Detect immutable local bindings that erase a known type and are later asserted back to a narrower type.
 */
export const noWidenThenAssertRule = createRule({
  name: "no-widen-then-assert",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow local const flows that explicitly widen a known value before asserting the widened binding to a narrower type.",
    },
    schema: [],
    messages: {
      widenThenAssert:
        'Binding "{{name}}" erases established type evidence by widening the value, then reconstructs that evidence with a type assertion. Preserve the precise type end-to-end; if the input is genuinely unknown, parse it once at the boundary instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    const checkAssertion = (node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion) => {
      const expression = assertedExpression(node);

      if (expression.type !== "Identifier") {
        return;
      }

      const variable = findVariable(context.sourceCode, expression);

      if (variable === null) {
        return;
      }

      const widened = widenedBinding(context.sourceCode, variable);

      if (
        widened === null ||
        node.range[0] <= widened.declaredAt ||
        functionBoundary(node) !== widened.boundary ||
        !assertionIsNarrower(
          context.sourceCode.text,
          widened.broadKind,
          widened.evidence,
          node.typeAnnotation,
        )
      ) {
        return;
      }

      context.report({
        node,
        messageId: "widenThenAssert",
        data: { name: expression.name },
      });
    };

    return {
      TSAsExpression: checkAssertion,
      TSTypeAssertion: checkAssertion,
    };
  },
});
