import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["plugin/**/*.test.ts"],
    setupFiles: ["./plugin/anti-slop/setup.ts"],
  },
});
