// eslint-disable-next-line antfu/no-import-dist
import { totominc } from "./dist/index.js";

export default totominc(
  {
    tailwindcssConfigPath: "./playground/tailwind.css",
    antislop: true,
  },
  {
    files: ["plugin/anti-slop/rules/no-shape-in-symbol-names/**"],
    rules: {
      "anti-slop/no-shape-in-symbol-names": "off",
    },
  },
);
