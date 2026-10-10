import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import type { Options } from "../index";
import { detectFramework, detectTailwindcss, detectTurborepo, totominc } from "../index";

const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

async function lint(options: Options, file: string) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: await totominc({
      tailwindcss: { entryPoint: "./playground/tailwind.css" },
      ...options,
    }),
  });
  const [result] = await eslint.lintFiles([fixture(file)]);

  return result?.messages ?? [];
}

async function ruleIds(options: Options, file: string) {
  const messages = await lint(options, file);

  return new Set(messages.map((message) => message.ruleId));
}

function project(dependencies: Record<string, string>, files: string[] = []) {
  const cwd = mkdtempSync(join(tmpdir(), "totominc-"));

  writeFileSync(join(cwd, "package.json"), JSON.stringify({ dependencies }));

  for (const file of files) {
    mkdirSync(join(cwd, file, ".."), { recursive: true });
    writeFileSync(join(cwd, file), "");
  }

  return cwd;
}

describe("detection", () => {
  it("detects the framework from direct dependencies", () => {
    expect(detectFramework(project({ next: "16.4.0", react: "19.3.0" }))).toBe("next");
    expect(detectFramework(project({ nuxt: "4.0.0" }))).toBe("vue");
    expect(detectFramework(project({ vue: "3.5.0" }))).toBe("vue");
    expect(detectFramework(project({ react: "19.3.0" }))).toBe("react");
    expect(detectFramework(project({ zod: "4.0.0" }))).toBe("none");
  });

  it("detects Tailwind CSS and its entry point", () => {
    expect(detectTailwindcss(project({ react: "19.3.0" }))).toBe(false);
    expect(detectTailwindcss(project({ tailwindcss: "4.3.3" }))).toEqual({});
    expect(detectTailwindcss(project({ tailwindcss: "4.3.3" }, ["src/app/globals.css"]))).toEqual({
      entryPoint: "src/app/globals.css",
    });
  });
});

describe("turborepo", () => {
  const root = fixture("turborepo");

  it("detects `turbo.json` from a workspace package, up to the git root", () => {
    expect(detectTurborepo(root)).toBe(true);
    expect(detectTurborepo(join(root, "apps/web"))).toBe(true);

    const repository = project({});

    mkdirSync(join(repository, ".git"));
    mkdirSync(join(repository, "packages/app"), { recursive: true });

    expect(detectTurborepo(join(repository, "packages/app"))).toBe(false);
  });

  it("reports environment variables missing from `turbo.json`", async () => {
    const eslint = new ESLint({
      cwd: root,
      overrideConfigFile: true,
      overrideConfig: await totominc({ framework: "none", tsconfigPath: false, turbo: true }),
    });
    const [result] = await eslint.lintFiles([join(root, "apps/web/env.ts")]);
    const turboMessages = (result?.messages ?? []).filter(
      (message) => message.ruleId === "turbo/no-undeclared-env-vars",
    );

    expect(turboMessages).toHaveLength(1);
    expect(turboMessages[0]?.message).toContain("UNDECLARED_TOKEN");
  });

  it("is not registered outside of a Turborepo", async () => {
    const config = await totominc({ framework: "none" });

    expect(config.some((item) => item.name === "totominc/turbo")).toBe(false);
  });
});

describe("totominc", () => {
  it("enables strict type-safety and React rules", async () => {
    const rules = await ruleIds({ framework: "react" }, "react-unsafe.tsx");

    expect(rules).toContain("ts/no-explicit-any");
    expect(rules).toContain("ts/no-non-null-assertion");
    expect(rules).toContain("react/dom-no-missing-button-type");
  });

  it("enables type-aware and language rules", async () => {
    const rules = await ruleIds({ framework: "none" }, "unsafe.ts");

    expect(rules).toContain("ts/no-unsafe-type-assertion");
    expect(rules).toContain("ts/strict-boolean-expressions");
    expect(rules).toContain("no-restricted-syntax");
    expect(rules).toContain("no-implicit-coercion");
    expect(rules).toContain("unicorn/no-for-loop");
  });

  it("enables accessibility rules by default", async () => {
    expect(await ruleIds({ framework: "react" }, "react-a11y.tsx")).toContain("jsx-a11y/alt-text");
    expect(await ruleIds({ framework: "react", a11y: false }, "react-a11y.tsx")).not.toContain(
      "jsx-a11y/alt-text",
    );
  });

  it("reports no error on a well-formatted React component", async () => {
    expect(await lint({ framework: "react" }, "Clean.tsx")).toEqual([]);
    expect(await lint({ framework: "next" }, "Clean.tsx")).toEqual([]);
  });

  it("allows opting out of strict type-safety", async () => {
    const rules = await ruleIds(
      { framework: "react", strictTypeSafety: false },
      "react-unsafe.tsx",
    );

    expect(rules).not.toContain("ts/no-explicit-any");
    expect(rules).not.toContain("ts/no-non-null-assertion");
  });

  it("enables Next.js rules, and checks `alt` on `next/image`", async () => {
    const rules = await ruleIds({ framework: "next" }, "next-page.tsx");

    expect(rules).toContain("next/no-img-element");
    expect(rules).toContain("jsx-a11y/alt-text");
  });

  it("does not register React rules for plain TypeScript projects", async () => {
    const config = await totominc({ framework: "none" });
    const ruleNames = config.flatMap((item) => Object.keys(item.rules ?? {}));

    expect(ruleNames.some((name) => name.startsWith("react/"))).toBe(false);
    expect(await ruleIds({ framework: "none" }, "plain.ts")).toContain("ts/no-non-null-assertion");
  });

  it("enables anti-slop rules by default", async () => {
    expect(await ruleIds({ framework: "none" }, "unsafe.ts")).toContain(
      "anti-slop/no-runtime-typeof",
    );
    expect(await ruleIds({ framework: "none", antislop: false }, "unsafe.ts")).not.toContain(
      "anti-slop/no-runtime-typeof",
    );
  });

  it("reports no error on a well-formatted Vue SFC", async () => {
    const messages = await lint({ framework: "vue" }, "Clean.vue");

    expect(messages).toEqual([]);
  });

  it("enforces typed `<script setup>` and React-like template preferences on Vue SFCs", async () => {
    const rules = await ruleIds({ framework: "vue" }, "Unsafe.vue");

    expect(rules).toContain("vue/block-lang");
    expect(rules).toContain("vue/component-api-style");
    expect(rules).toContain("vue/html-self-closing");
    expect(rules).toContain("vue/attributes-order");
    expect(rules).toContain("vue/html-button-has-type");
    expect(rules).toContain("better-tailwindcss/enforce-consistent-class-order");
  });

  it('applies syntactic type-safety rules to `<script setup lang="ts">`', async () => {
    expect(await ruleIds({ framework: "vue" }, "UnsafeTyped.vue")).toContain("ts/no-explicit-any");
  });
});
