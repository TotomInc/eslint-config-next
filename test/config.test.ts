import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import type { UserConfig } from "../index";
import { totominc } from "../index";

const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

async function lint(config: UserConfig, file: string) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: await totominc({
      tailwindcssConfigPath: "./playground/tailwind.css",
      ...config,
    }),
  });
  const [result] = await eslint.lintFiles([fixture(file)]);

  return result?.messages ?? [];
}

async function ruleIds(config: UserConfig, file: string) {
  const messages = await lint(config, file);

  return new Set(messages.map((message) => message.ruleId));
}

describe("totominc", () => {
  it("enables strict type-safety and React rules", async () => {
    const rules = await ruleIds({ framework: "react" }, "react-unsafe.tsx");

    expect(rules).toContain("ts/no-explicit-any");
    expect(rules).toContain("ts/no-non-null-assertion");
    expect(rules).toContain("react/dom-no-missing-button-type");
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

  it("enables Next.js rules", async () => {
    const rules = await ruleIds({ framework: "next" }, "next-page.tsx");

    expect(rules).toContain("next/no-img-element");
  });

  it("keeps supporting the deprecated `enableNextSupport` option", async () => {
    const rules = await ruleIds({ enableNextSupport: true }, "next-page.tsx");

    expect(rules).toContain("next/no-img-element");
  });

  it("does not register React rules for plain TypeScript projects", async () => {
    const config = await totominc({ framework: "none" });
    const ruleNames = config.flatMap((item) => Object.keys(item.rules ?? {}));

    expect(ruleNames.some((name) => name.startsWith("react/"))).toBe(false);
    expect(await ruleIds({ framework: "none" }, "plain.ts")).toContain("ts/no-non-null-assertion");
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
