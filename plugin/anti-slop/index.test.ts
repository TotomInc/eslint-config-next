import { describe, expect, it } from "vitest";

import { antiSlopPlugin, antiSlopRules } from ".";

describe("anti-slop plugin", () => {
  it("exports every documented rule", () => {
    expect(Object.keys(antiSlopPlugin.rules ?? {}).sort()).toEqual(
      Object.keys(antiSlopRules)
        .map((name) => name.replace("anti-slop/", ""))
        .sort(),
    );
  });

  it("enables every rule as an error", () => {
    expect(new Set(Object.values(antiSlopRules))).toEqual(new Set(["error"]));
  });
});
