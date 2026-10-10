import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["plugin/**/*.test.ts", "test/**/*.test.ts"],
    testTimeout: 60_000,
    setupFiles: ["./plugin/anti-slop/setup.ts"],
  },
});
