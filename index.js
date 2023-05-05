/** @type {import("eslint").Linter.Config} */
module.exports = {
  "extends": [
    "next/core-web-vitals",
    "airbnb",
    "airbnb-typescript",
    "plugin:prettier/recommended",

    "plugin:eslint-comments/recommended",
    "plugin:jsonc/recommended-with-jsonc",
    "plugin:jsonc/prettier",
    "plugin:markdown/recommended",
  ],

  ignorePatterns: [
    "*.d.ts",
    "dist",
    "public",
    "Dockerfile",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
  ],

  "rules": {
    "import/prefer-default-export": "off",
    "react/jsx-props-no-spreading": "off",
    "react/no-array-index-key": "off",
    "react/react-in-jsx-scope": "off",
    "react/require-default-props": "off",
    "react/prop-types": "off"
  },

  "overrides": [
    {
      "files": ["./pages/api/**/*.ts", "./app/**/route.ts"],
      "rules": {
        // Allow `console.log` in serverless functions endpoints.
        "no-console": "off"
      }
    },
    {
      "files": ["*.json"],
      "parser": "jsonc-eslint-parser",
    },
    {
      // Code blocks inside Markdown files.
      "files": ["**/*.md/*.*"],
      "rules": {
        "@typescript-eslint/no-redeclare": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/comma-dangle": "off",
        "@typescript-eslint/consistent-type-imports": "off",
        "import/no-unresolved": "off",
        "unused-imports/no-unused-imports": "off",
        "unused-imports/no-unused-vars": "off",
        "no-alert": "off",
        "no-console": "off",
        "no-restricted-imports": "off",
        "no-undef": "off",
        "no-unused-expressions": "off",
        "no-unused-vars": "off",
      },
    },
  ]
};