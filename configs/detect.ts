import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

export type Framework = "next" | "none" | "react" | "vue";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

function readProjectDependencies(cwd: string): Set<string> {
  const path = join(cwd, "package.json");

  if (!existsSync(path)) {
    return new Set();
  }

  // eslint-disable-next-line ts/no-unsafe-type-assertion -- package.json is a trusted local file.
  const manifest = JSON.parse(readFileSync(path, "utf8")) as PackageJson;

  return new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ]);
}

/**
 * Detect the framework from the dependencies declared in the `package.json` of the current
 * working directory. Only direct dependencies count, hoisted transitive packages are ignored.
 */
export function detectFramework(cwd = process.cwd()): Framework {
  const dependencies = readProjectDependencies(cwd);

  if (dependencies.has("next")) {
    return "next";
  }

  if (dependencies.has("vue") || dependencies.has("nuxt")) {
    return "vue";
  }

  if (dependencies.has("react")) {
    return "react";
  }

  return "none";
}

const TAILWINDCSS_ENTRY_POINTS = [
  "app/globals.css",
  "src/app/globals.css",
  "app/tailwind.css",
  "src/app/tailwind.css",
  "styles/globals.css",
  "src/styles/globals.css",
  "src/index.css",
  "src/style.css",
  "src/styles.css",
  "src/assets/main.css",
  "assets/css/main.css",
  "app/assets/css/main.css",
];

/**
 * Detect whether the project uses Tailwind CSS, and where its CSS entry point lives.
 */
export function detectTailwindcss(cwd = process.cwd()): { entryPoint?: string } | false {
  if (!readProjectDependencies(cwd).has("tailwindcss")) {
    return false;
  }

  const entryPoint = TAILWINDCSS_ENTRY_POINTS.find((path) => existsSync(join(cwd, path)));

  return entryPoint === undefined ? {} : { entryPoint };
}
