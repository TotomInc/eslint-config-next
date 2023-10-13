/** @type {import("eslint").Linter.Config} */
module.exports = {
  plugins: ["unused-imports"],

  "extends": [
    "next/core-web-vitals",
    "airbnb",
    "airbnb-typescript",
    "plugin:prettier/recommended",

    "plugin:eslint-comments/recommended",
    "plugin:promise/recommended",
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
      "files": ["*.json"],
      "parser": "jsonc-eslint-parser",
    },
    {
      "files": ["package.json"],
      "parser": "jsonc-eslint-parser",
      "rules": {
        "jsonc/sort-keys": [
          "error",
          {
            "pathPattern": "^$",
            "order": [
              "publisher",
              "name",
              "displayName",
              "type",
              "version",
              "private",
              "packageManager",
              "description",
              "author",
              "license",
              "funding",
              "homepage",
              "repository",
              "bugs",
              "keywords",
              "categories",
              "sideEffects",
              "exports",
              "main",
              "module",
              "unpkg",
              "jsdelivr",
              "types",
              "typesVersions",
              "bin",
              "icon",
              "files",
              "engines",
              "activationEvents",
              "contributes",
              "scripts",
              "peerDependencies",
              "peerDependenciesMeta",
              "dependencies",
              "optionalDependencies",
              "devDependencies",
              "pnpm",
              "overrides",
              "resolutions",
              "husky",
              "simple-git-hooks",
              "lint-staged",
              "eslintConfig",
            ],
          },
          {
            "pathPattern": "^(?:dev|peer|optional|bundled)?[Dd]ependencies$",
            "order": { type: "asc" },
          },
          {
            "pathPattern": "^exports.*$",
            "order": ["types", "require", "import"],
          },
        ],
      },
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