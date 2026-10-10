// eslint-disable-next-line antfu/no-import-dist
import { totominc } from "./dist/index.js";

export default totominc(
  {
    framework: "react",
    tailwindcssConfigPath: "./playground/tailwind.css",
    antislop: true,
    // Fixtures intentionally contain violations.
    ignoredFiles: ["test/fixtures/**"],
  },
  {
    files: ["plugin/anti-slop/rules/no-shape-in-symbol-names/**"],
    rules: {
      "anti-slop/no-shape-in-symbol-names": "off",
    },
  },
  {
    // ESLint rules compare `node.type` (a string enum) with string literals, the idiomatic
    // typescript-eslint AST style.
    files: ["plugin/**/*.ts"],
    rules: {
      "ts/no-unsafe-enum-comparison": "off",
    },
  },
);
