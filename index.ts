import antfu, {
  GLOB_JSX,
  GLOB_MARKDOWN_CODE,
  GLOB_SRC,
  GLOB_TS,
  GLOB_TSX,
  GLOB_VUE,
} from "@antfu/eslint-config";
import type { OptionsConfig, TypedFlatConfigItem } from "@antfu/eslint-config";

import { baseConfig } from "./configs/base";
import { nextjsConfigs } from "./configs/nextjs";
import { prettierConfig, prettierOptions } from "./configs/prettier";
import { reactConfigs } from "./configs/react";
import { tailwindcssConfig } from "./configs/tailwindcss";
import { typeSafetyConfigs } from "./configs/type-safety";
import { vueConfigs } from "./configs/vue";
import { antiSlopPlugin, antiSlopRules } from "./plugin/anti-slop";

export type Framework = "next" | "none" | "react" | "vue";

export interface UserConfig {
  /**
   * UI framework of the project. Use `"none"` for plain TypeScript projects (Node.js, libraries).
   *
   * @default "next" when `enableNextSupport` is set, otherwise "react"
   */
  framework?: Framework;
  /**
   * Enable Next.js support.
   *
   * @deprecated Use `framework: "next"` instead.
   * @default false
   */
  enableNextSupport?: boolean;
  /**
   * Project type. `"lib"` also requires explicit return types on exported functions.
   *
   * @default "app"
   */
  type?: "app" | "lib";
  /**
   * Glob patterns of files to ignore.
   *
   * @default []
   */
  ignoredFiles?: string[];
  /**
   * Path to the `tsconfig.json` used for type-aware rules, or `false` to disable type-aware linting.
   *
   * @default "./tsconfig.json"
   */
  tsconfigPath?: string | false;
  /**
   * Enable the stricter type-safety rules (`no-explicit-any`, `no-non-null-assertion`,
   * `no-unnecessary-condition`, `prefer-nullish-coalescing`, ...).
   *
   * @default true
   */
  strictTypeSafety?: boolean;
  /**
   * Path to the Tailwind CSS entry point, or `false` to disable Tailwind CSS rules.
   *
   * @default "app/globals.css"
   */
  tailwindcssConfigPath?: string | false;
  /**
   * Enable accessibility rules: `eslint-plugin-jsx-a11y` for React and Next.js, or
   * `eslint-plugin-vuejs-accessibility` for Vue. The plugin must be installed in the project.
   *
   * @default false
   */
  a11y?: boolean;
  /**
   * Enable anti-slop rules that reject low-evidence TypeScript and JavaScript patterns.
   *
   * @default false
   */
  antislop?: boolean;
  /**
   * Escape hatch to forward extra options to `@antfu/eslint-config`, merged over this config.
   */
  antfu?: OptionsConfig;
}

export async function totominc(config: UserConfig = {}, ...userConfigs: TypedFlatConfigItem[]) {
  // eslint-disable-next-line ts/no-deprecated -- kept for backward compatibility.
  const framework = config.framework ?? (config.enableNextSupport ? "next" : "react");
  const isReact = framework === "react" || framework === "next";
  const isVue = framework === "vue";
  const tsconfigPath = config.tsconfigPath ?? "./tsconfig.json";
  const typeAware = tsconfigPath !== false;
  const strictTypeSafety = config.strictTypeSafety ?? true;
  const a11y = config.a11y ?? false;
  const tailwindcssEntryPoint = config.tailwindcssConfigPath ?? "app/globals.css";

  const sourceFiles = isVue ? [GLOB_SRC, GLOB_VUE] : [GLOB_SRC];
  const componentFiles = isVue ? [GLOB_VUE] : isReact ? [GLOB_TSX, GLOB_JSX] : [];

  return antfu(
    {
      type: config.type ?? "app",

      stylistic: {
        indent: 2,
        jsx: true,
        quotes: "double",
        semi: true,
      },

      typescript: typeAware ? { tsconfigPath } : true,

      jsx: { a11y: isReact && a11y },
      react: isReact,
      nextjs: framework === "next",
      vue: isVue ? { a11y } : false,

      ...config.antfu,
    },
    prettierConfig(sourceFiles),
    baseConfig(sourceFiles),
    ...(strictTypeSafety
      ? typeSafetyConfigs({ typeAware, componentFiles: isVue ? [GLOB_VUE] : [] })
      : []),
    ...(isReact ? reactConfigs({ typeAware }) : []),
    ...(framework === "next" ? nextjsConfigs({ a11y }) : []),
    ...(isVue ? vueConfigs() : []),
    ...(tailwindcssEntryPoint !== false && componentFiles.length > 0
      ? [tailwindcssConfig({ files: componentFiles, entryPoint: tailwindcssEntryPoint })]
      : []),
    { name: "totominc/ignores", ignores: [...(config.ignoredFiles ?? [])] },
    ...(config.antislop
      ? [
          {
            name: "totominc/anti-slop",
            files: [GLOB_SRC],
            ignores: [GLOB_MARKDOWN_CODE],
            plugins: {
              "anti-slop": antiSlopPlugin,
            },
            rules: { ...antiSlopRules },
          } satisfies TypedFlatConfigItem,
        ]
      : []),
    ...userConfigs,
  );
}

export { antiSlopPlugin, antiSlopRules, prettierOptions };
export { GLOB_JSX, GLOB_SRC, GLOB_TS, GLOB_TSX, GLOB_VUE };
