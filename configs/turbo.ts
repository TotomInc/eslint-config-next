import { ensurePackages, interopDefault } from "@antfu/eslint-config";
import type { TypedFlatConfigItem } from "@antfu/eslint-config";

/**
 * Turborepo rules: environment variables read in code must be declared in `turbo.json`, otherwise
 * the task cache ignores them and serves stale builds.
 *
 * `eslint-plugin-turbo` is an optional peer dependency: it requires the `turbo` binary, which only
 * Turborepo projects install.
 */
export async function turboConfig(files: string[]): Promise<TypedFlatConfigItem> {
  await ensurePackages(["eslint-plugin-turbo"]);

  const pluginTurbo = await interopDefault(import("eslint-plugin-turbo")).catch(
    (cause: unknown) => {
      throw new Error(
        "[@totominc/eslint-config-next] Turborepo detected (turbo.json), install `eslint-plugin-turbo` or set `turbo: false`.",
        { cause },
      );
    },
  );

  return {
    name: "totominc/turbo",
    files,
    plugins: { turbo: pluginTurbo },
    rules: {
      "turbo/no-undeclared-env-vars": "error",
    },
  };
}
