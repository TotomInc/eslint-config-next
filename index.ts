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
import type { Framework } from "./configs/detect";
import { detectFramework, detectTailwindcss } from "./configs/detect";
import { javascriptConfig } from "./configs/javascript";
import { nextjsConfigs } from "./configs/nextjs";
import { prettierConfig, prettierOptions } from "./configs/prettier";
import { reactConfigs } from "./configs/react";
import { tailwindcssConfig } from "./configs/tailwindcss";
import { typeSafetyConfigs } from "./configs/type-safety";
import { vueConfigs } from "./configs/vue";
import { antiSlopPlugin, antiSlopRules } from "./plugin/anti-slop";

export interface Options {
  /**
   * UI framework of the project. Use `"none"` for plain TypeScript projects (Node.js, libraries).
   *
   * @default detected from the `package.json` dependencies: `next`, then `vue`/`nuxt`, then `react`
   */
  framework?: Framework;
  /**
   * Project type. `"lib"` also requires explicit return types on exported functions.
   *
   * @default "app"
   */
  type?: "app" | "lib";
  /**
   * Glob patterns of files to ignore, on top of `.gitignore` and antfu's defaults.
   *
   * @default []
   */
  ignores?: string[];
  /**
   * Path to the `tsconfig.json` used for type-aware rules, or `false` to disable type-aware linting.
   *
   * @default "./tsconfig.json"
   */
  tsconfigPath?: string | false;
  /**
   * Enable the stricter type-safety rules (`no-explicit-any`, `no-unsafe-type-assertion`,
   * `strict-boolean-expressions`, `no-unnecessary-condition`, ...).
   *
   * @default true
   */
  strictTypeSafety?: boolean;
  /**
   * Tailwind CSS rules. `entryPoint` is the CSS file importing `tailwindcss`.
   *
   * @default enabled when `tailwindcss` is a dependency, with a detected entry point
   */
  tailwindcss?: boolean | { entryPoint?: string };
  /**
   * Accessibility rules: `eslint-plugin-jsx-a11y` for React and Next.js,
   * `eslint-plugin-vuejs-accessibility` for Vue.
   *
   * @default true
   */
  a11y?: boolean;
  /**
   * Anti-slop rules that reject low-evidence TypeScript and JavaScript patterns.
   *
   * @default true
   */
  antislop?: boolean;
  /**
   * Escape hatch to forward extra options to `@antfu/eslint-config`, merged over this config.
   */
  antfu?: OptionsConfig;
}

function resolveTailwindcss(option: Options["tailwindcss"]): { entryPoint?: string } | false {
  if (option === undefined) {
    return detectTailwindcss();
  }

  if (option === true) {
    const detected = detectTailwindcss();

    return detected === false ? {} : detected;
  }

  return option;
}

export async function totominc(options: Options = {}, ...userConfigs: TypedFlatConfigItem[]) {
  const framework = options.framework ?? detectFramework();
  const isReact = framework === "react" || framework === "next";
  const isVue = framework === "vue";
  const tsconfigPath = options.tsconfigPath ?? "./tsconfig.json";
  const typeAware = tsconfigPath !== false;
  const a11y = options.a11y ?? true;
  const tailwindcss = resolveTailwindcss(options.tailwindcss);

  const sourceFiles = isVue ? [GLOB_SRC, GLOB_VUE] : [GLOB_SRC];
  const componentFiles = isVue ? [GLOB_VUE] : isReact ? [GLOB_TSX, GLOB_JSX] : [];

  return antfu(
    {
      type: options.type ?? "app",

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

      ...options.antfu,
    },
    prettierConfig(sourceFiles),
    baseConfig(sourceFiles),
    javascriptConfig(sourceFiles),
    ...(options.strictTypeSafety === false
      ? []
      : typeSafetyConfigs({ typeAware, componentFiles: isVue ? [GLOB_VUE] : [] })),
    ...(isReact ? reactConfigs({ typeAware }) : []),
    ...(framework === "next" ? nextjsConfigs({ a11y }) : []),
    ...(isVue ? vueConfigs() : []),
    ...(tailwindcss !== false && componentFiles.length > 0
      ? [tailwindcssConfig({ files: componentFiles, entryPoint: tailwindcss.entryPoint })]
      : []),
    { name: "totominc/ignores", ignores: [...(options.ignores ?? [])] },
    ...(options.antislop === false
      ? []
      : [
          {
            name: "totominc/anti-slop",
            files: [GLOB_SRC],
            ignores: [GLOB_MARKDOWN_CODE],
            plugins: {
              "anti-slop": antiSlopPlugin,
            },
            rules: { ...antiSlopRules },
          } satisfies TypedFlatConfigItem,
        ]),
    ...userConfigs,
  );
}

export { detectFramework, detectTailwindcss };
export { antiSlopPlugin, antiSlopRules, prettierOptions };
export type { Framework };
export { GLOB_JSX, GLOB_SRC, GLOB_TS, GLOB_TSX, GLOB_VUE };
