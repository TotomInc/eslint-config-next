import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

export type ParameterOwner =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.TSCallSignatureDeclaration
  | TSESTree.TSConstructSignatureDeclaration
  | TSESTree.TSConstructorType
  | TSESTree.TSDeclareFunction
  | TSESTree.TSEmptyBodyFunctionExpression
  | TSESTree.TSFunctionType
  | TSESTree.TSMethodSignature;

/**
 * Read the TypeScript type annotation attached to a function parameter.
 *
 * @param parameter - Function or signature parameter
 * @returns The annotation node, or `undefined` when the parameter is untyped
 */
export function parameterAnnotation(
  parameter: TSESTree.Parameter,
): TSESTree.TSTypeAnnotation | undefined {
  if (parameter.type === "TSParameterProperty") {
    return parameterAnnotation(parameter.parameter);
  }

  if (parameter.type === "RestElement") {
    return parameter.typeAnnotation ?? nestedParameterAnnotation(parameter.argument);
  }

  if (parameter.type === "AssignmentPattern") {
    return parameter.typeAnnotation ?? nestedParameterAnnotation(parameter.left);
  }

  return parameter.typeAnnotation;
}

function nestedParameterAnnotation(node: TSESTree.Node): TSESTree.TSTypeAnnotation | undefined {
  if (
    node.type === "Identifier" ||
    node.type === "ArrayPattern" ||
    node.type === "ObjectPattern" ||
    node.type === "AssignmentPattern" ||
    node.type === "RestElement" ||
    node.type === "TSParameterProperty"
  ) {
    return parameterAnnotation(node);
  }

  return undefined;
}

/**
 * Human-readable parameter name, stripping a trailing `object` or `unknown` annotation.
 *
 * @param parameter - Function or signature parameter
 * @param sourceCode - ESLint source code for the current file
 * @param annotationKeyword - Annotation keyword to strip from destructured parameters
 * @returns The parameter name, or a trimmed source snippet for patterns
 */
export function parameterName(
  parameter: TSESTree.Parameter,
  sourceCode: TSESLint.SourceCode,
  annotationKeyword: "object" | "unknown",
): string {
  if (parameter.type === "TSParameterProperty") {
    return parameterName(parameter.parameter, sourceCode, annotationKeyword);
  }

  if (parameter.type === "AssignmentPattern") {
    return nestedParameterName(parameter.left, sourceCode, annotationKeyword);
  }

  if (parameter.type === "RestElement") {
    return nestedParameterName(parameter.argument, sourceCode, annotationKeyword);
  }

  if (parameter.type === "Identifier") {
    return parameter.name;
  }

  return sourceCode
    .getText(parameter)
    .replace(new RegExp(`\\s*:\\s*${annotationKeyword}\\s*$`, "u"), "");
}

function nestedParameterName(
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
  annotationKeyword: "object" | "unknown",
): string {
  if (
    node.type === "Identifier" ||
    node.type === "ArrayPattern" ||
    node.type === "ObjectPattern" ||
    node.type === "AssignmentPattern" ||
    node.type === "RestElement" ||
    node.type === "TSParameterProperty"
  ) {
    return parameterName(node, sourceCode, annotationKeyword);
  }

  return sourceCode.getText(node);
}

/**
 * ESLint selectors for every function-like node that owns a parameter list.
 *
 * @param checkParameters - Visitor invoked for each parameter owner
 * @returns A rule listener covering functions, methods, and TypeScript signatures
 */
export function parameterOwnerListeners(
  checkParameters: (node: ParameterOwner) => void,
): TSESLint.RuleListener {
  return {
    ArrowFunctionExpression: checkParameters,
    FunctionDeclaration: checkParameters,
    FunctionExpression: checkParameters,
    TSCallSignatureDeclaration: checkParameters,
    TSConstructSignatureDeclaration: checkParameters,
    TSConstructorType: checkParameters,
    TSDeclareFunction: checkParameters,
    TSEmptyBodyFunctionExpression: checkParameters,
    TSFunctionType: checkParameters,
    TSMethodSignature: checkParameters,
  };
}
