import { GLOB_JSX, GLOB_MARKDOWN, GLOB_TS, GLOB_TSX } from "@antfu/eslint-config";
import type { TypedFlatConfigItem } from "@antfu/eslint-config";
import pluginReact from "@eslint-react/eslint-plugin";

/**
 * `@eslint-react` recommended rules that are warnings upstream, promoted to errors: a warning that
 * nobody fixes is noise, a real issue deserves to fail CI.
 */
const recommendedRulesAsErrors = Object.fromEntries(
  Object.keys(pluginReact.configs.recommended.rules ?? {}).map((name) => [
    name.replace("@eslint-react/", "react/"),
    "error",
  ]),
) satisfies TypedFlatConfigItem["rules"];

export function reactConfigs(options: { typeAware: boolean }): TypedFlatConfigItem[] {
  return [
    {
      name: "totominc/react/rules",
      files: [GLOB_TSX, GLOB_JSX],
      rules: {
        // Extra styling rules not interacting with prettier.
        "style/jsx-self-closing-comp": ["error", { component: true, html: true }],

        // See: https://perfectionist.dev/rules/sort-jsx-props
        "perfectionist/sort-jsx-props": [
          "error",
          {
            type: "natural",
            order: "asc",
            ignoreCase: true,
            specialCharacters: "keep",
            locales: "en-US",
            groups: ["reserved", "shorthand-prop", "unknown", "callback", "multiline-prop"],
            customGroups: [
              { groupName: "reserved", elementNamePattern: "^(key|ref)$" },
              { groupName: "callback", elementNamePattern: "^on.+" },
            ],
          },
        ],

        ...recommendedRulesAsErrors,

        // React Compiler rules not in the recommended preset.
        "react/globals": "error",
        "react/immutability": "error",
        "react/refs": "error",

        // Rules from `@eslint-react` "strict" preset that antfu leaves out.
        "react/dom-no-missing-button-type": "error",
        "react/dom-no-missing-iframe-sandbox": "error",
        "react/dom-no-unsafe-target-blank": "error",
        "react/jsx-no-useless-fragment": "error",
        "react/no-class-component": "error",
        "react/no-duplicate-key": "error",
        "react/no-misused-capture-owner-stack": "error",
        "react/no-missing-context-display-name": "error",
        "react/no-unstable-context-value": "error",
        "react/no-unstable-default-props": "error",
        "react/no-unused-state": "error",

        // Allow using `process.env` without `require("process")`.
        "node/prefer-global/process": "off",
      },
    },
    ...(options.typeAware
      ? [
          {
            name: "totominc/react/type-aware-rules",
            files: [GLOB_TS, GLOB_TSX],
            ignores: [`${GLOB_MARKDOWN}/**`],
            rules: {
              // Props declared in the component type but never read are dead API surface.
              "react/no-unused-props": "error",
              // `key` passed through a spread object is invisible to React.
              "react/no-implicit-key": "error",
            },
          } satisfies TypedFlatConfigItem,
        ]
      : []),
  ];
}
