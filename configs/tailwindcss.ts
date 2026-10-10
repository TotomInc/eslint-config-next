import type { TypedFlatConfigItem } from "@antfu/eslint-config";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";

export function tailwindcssConfig(options: {
  files: string[];
  entryPoint: string;
}): TypedFlatConfigItem {
  return {
    ...eslintPluginBetterTailwindcss.configs.recommended,
    name: "totominc/tailwindcss",
    files: options.files,
    settings: {
      "better-tailwindcss": {
        entryPoint: options.entryPoint,
      },
    },
    rules: {
      ...eslintPluginBetterTailwindcss.configs.recommended.rules,
      "better-tailwindcss/enforce-consistent-class-order": [
        "error",
        { order: "official", unknownClassOrder: "asc", unknownClassPosition: "start" },
      ],
      "better-tailwindcss/enforce-consistent-line-wrapping": ["off"],
      "better-tailwindcss/enforce-canonical-classes": ["error"],
      "better-tailwindcss/no-deprecated-classes": ["error"],
      "better-tailwindcss/no-duplicate-classes": ["error"],
      "better-tailwindcss/no-unnecessary-whitespace": ["error"],
    },
  };
}
