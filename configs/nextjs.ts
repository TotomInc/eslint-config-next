import { GLOB_JSX, GLOB_SRC, GLOB_TSX } from "@antfu/eslint-config";
import type { TypedFlatConfigItem } from "@antfu/eslint-config";

/**
 * Next.js additions on top of antfu's `nextjs` preset, aligned with what `eslint-config-next`
 * 16.4 ships (ignores, `next/image` aware a11y) without pulling its duplicate React and import
 * plugins.
 */
export function nextjsConfigs(options: { a11y: boolean }): TypedFlatConfigItem[] {
  return [
    {
      name: "totominc/nextjs/ignores",
      ignores: ["**/out/**", "**/build/**", "**/next-env.d.ts"],
    },
    {
      name: "totominc/nextjs/rules",
      files: [GLOB_SRC],
      rules: {
        // `process.env` is the way to read env vars in Next.js, on the server and the client.
        "node/prefer-global/process": "off",
      },
    },
    ...(options.a11y
      ? [
          {
            name: "totominc/nextjs/a11y",
            files: [GLOB_JSX, GLOB_TSX],
            rules: {
              "jsx-a11y/alt-text": ["error", { elements: ["img"], img: ["Image"] }],
            },
          } satisfies TypedFlatConfigItem,
        ]
      : []),
  ];
}
