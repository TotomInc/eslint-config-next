import { createRule } from "../../create-rule";
import {
  parameterAnnotation,
  parameterName,
  parameterOwnerListeners,
} from "../../shared/parameters";

/**
 * Disallow unknown inputs except explicitly named error-cause enrichment.
 */
export const noUnknownParametersRule = createRule({
  name: "no-unknown-parameters",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow explicitly unknown function parameters except `cause`; decode unknown input at its I/O boundary instead.",
    },
    schema: [],
    messages: {
      unknownParameter:
        "Parameter `{{parameter}}` accepts `unknown` without establishing its contract. Define the expected schema or parser so the value becomes a strongly typed domain type at the earliest possible point, as close as possible to the I/O boundary where the data originated.",
    },
  },
  defaultOptions: [],
  create(context) {
    return parameterOwnerListeners((node) => {
      for (const parameter of node.params) {
        const annotation = parameterAnnotation(parameter);

        if (annotation?.typeAnnotation.type !== "TSUnknownKeyword") {
          continue;
        }

        const name = parameterName(parameter, context.sourceCode, "unknown");

        if (name === "cause") {
          continue;
        }

        context.report({
          node: annotation.typeAnnotation,
          messageId: "unknownParameter",
          data: { parameter: name },
        });
      }
    });
  },
});
