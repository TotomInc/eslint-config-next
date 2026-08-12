import { ASTUtils } from "@typescript-eslint/utils";
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

/**
 * Resolve the variable referenced by an identifier, walking enclosing scopes.
 *
 * @param sourceCode - ESLint source code for the current file
 * @param identifier - Identifier whose binding should be resolved
 * @returns The resolved variable, or `null` when it is unbound
 */
export function findVariable(
  sourceCode: TSESLint.SourceCode,
  identifier: TSESTree.Identifier,
): TSESLint.Scope.Variable | null {
  return ASTUtils.findVariable(sourceCode.getScope(identifier), identifier);
}

/**
 * Return the variable declarator that defines a binding, if it has one.
 *
 * @param variable - Scope variable to inspect
 * @param uniqueDefinition - When `true`, require exactly one definition
 * @returns The declarator, or `null` when the binding is not a simple variable
 */
export function variableDeclarator(
  variable: TSESLint.Scope.Variable,
  uniqueDefinition = false,
): TSESTree.VariableDeclarator | null {
  if (uniqueDefinition && variable.defs.length !== 1) {
    return null;
  }

  for (const definition of variable.defs) {
    if (definition.type === "Variable" && definition.node.type === "VariableDeclarator") {
      return definition.node;
    }
  }

  return null;
}
