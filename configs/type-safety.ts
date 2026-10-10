import { GLOB_MARKDOWN, GLOB_TS, GLOB_TSX } from "@antfu/eslint-config";
import type { TypedFlatConfigItem } from "@antfu/eslint-config";

/**
 * Syntax-only rules that close the escape hatches antfu leaves open (`any`, `!`, `<T>x`).
 */
const syntacticRules = {
  "ts/no-explicit-any": ["error", { fixToUnknown: false, ignoreRestArgs: false }],
  "ts/no-inferrable-types": "error",
  "ts/no-useless-empty-export": "error",
  "ts/prefer-for-of": "error",
  "ts/prefer-function-type": "error",
  "ts/no-non-null-assertion": "error",
  "ts/consistent-type-assertions": [
    "error",
    { assertionStyle: "as", objectLiteralTypeAssertions: "never" },
  ],
} satisfies TypedFlatConfigItem["rules"];

/**
 * Rules from `typescript-eslint`'s `strict-type-checked` and `stylistic-type-checked` presets that
 * antfu does not enable, plus `no-unsafe-type-assertion` and a stricter `strict-boolean-expressions`:
 * values must be narrowed or parsed, not asserted or coerced.
 */
const typeAwareRules = {
  "ts/consistent-type-exports": "error",
  "ts/no-array-delete": "error",
  "ts/no-base-to-string": "error",
  "ts/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
  "ts/no-deprecated": "warn",
  "ts/no-duplicate-type-constituents": "error",
  "ts/no-meaningless-void-operator": "error",
  "ts/no-misused-spread": "error",
  "ts/no-mixed-enums": "error",
  "ts/no-redundant-type-constituents": "error",
  "ts/no-unnecessary-boolean-literal-compare": "error",
  "ts/no-unnecessary-condition": "error",
  "ts/no-unnecessary-template-expression": "error",
  "ts/no-unnecessary-type-arguments": "error",
  "ts/no-unnecessary-type-conversion": "error",
  "ts/no-unnecessary-type-parameters": "error",
  "ts/no-unsafe-type-assertion": "error",
  "ts/no-unsafe-enum-comparison": "error",
  "ts/no-unsafe-unary-minus": "error",
  "ts/only-throw-error": "error",
  "ts/prefer-find": "error",
  "ts/prefer-includes": "error",
  "ts/prefer-nullish-coalescing": "error",
  "ts/prefer-optional-chain": "error",
  "ts/prefer-promise-reject-errors": "error",
  "ts/prefer-readonly": "error",
  "ts/prefer-reduce-type-parameter": "error",
  "ts/prefer-return-this-type": "error",
  "ts/prefer-string-starts-ends-with": "error",
  "ts/require-array-sort-compare": ["error", { ignoreStringArrays: true }],
  "ts/related-getter-setter-pairs": "error",
  "ts/require-await": "error",
  // `0`, `""` and `NaN` are valid values, not missing ones: compare them explicitly.
  "ts/strict-boolean-expressions": [
    "error",
    {
      allowAny: false,
      allowNullableBoolean: true,
      allowNullableNumber: false,
      allowNullableObject: true,
      allowNullableString: false,
      allowNumber: false,
      allowString: false,
    },
  ],
  "ts/switch-exhaustiveness-check": [
    "error",
    { considerDefaultExhaustiveForUnions: true, requireDefaultForNonUnion: true },
  ],
  "ts/use-unknown-in-catch-callback-variable": "error",
} satisfies TypedFlatConfigItem["rules"];

export function typeSafetyConfigs(options: {
  typeAware: boolean;
  /**
   * Component files (e.g. `.vue`) parsed as TypeScript but not type-checked.
   */
  componentFiles: string[];
}): TypedFlatConfigItem[] {
  return [
    {
      name: "totominc/type-safety/rules",
      files: [GLOB_TS, GLOB_TSX, ...options.componentFiles],
      // Code blocks in Markdown are often counter-examples.
      ignores: [`${GLOB_MARKDOWN}/**`],
      rules: syntacticRules,
    },
    ...(options.typeAware
      ? [
          {
            name: "totominc/type-safety/type-aware-rules",
            files: [GLOB_TS, GLOB_TSX],
            ignores: [`${GLOB_MARKDOWN}/**`],
            rules: typeAwareRules,
          } satisfies TypedFlatConfigItem,
        ]
      : []),
  ];
}
