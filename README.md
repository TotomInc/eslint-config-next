# eslint-config-next

## Installation

```bash
npm i -D @totominc/eslint-config-next eslint
```

Create `eslint.config.js` in the root of your project:

```js
import { totominc } from "@totominc/eslint-config-next";

export default totominc();
```

Enable [anti-slop](https://github.com/dmmulroy/anti-slop) rules with `antislop: true`:

```js
import { totominc } from "@totominc/eslint-config-next";

export default totominc({ antislop: true });
```

Add scripts to your `package.json`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

Add VSCode settings to your `.vscode/settings.json`:

```json
{
  // Disable the default formatter, use eslint instead
  "prettier.enable": false,
  "editor.formatOnSave": false,

  // Auto fix
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },

  // Silent the stylistic rules in you IDE, but still auto fix them
  "eslint.rules.customizations": [
    { "rule": "prettier/prettier", "severity": "off", "fixable": true },
    { "rule": "style/*", "severity": "off", "fixable": true },
    { "rule": "format/*", "severity": "off", "fixable": true },
    { "rule": "*-indent", "severity": "off", "fixable": true },
    { "rule": "*-spacing", "severity": "off", "fixable": true },
    { "rule": "*-spaces", "severity": "off", "fixable": true },
    { "rule": "*-order", "severity": "off", "fixable": true },
    { "rule": "*-dangle", "severity": "off", "fixable": true },
    { "rule": "*-newline", "severity": "off", "fixable": true },
    { "rule": "*quotes", "severity": "off", "fixable": true },
    { "rule": "*semi", "severity": "off", "fixable": true }
  ],

  // Enable eslint for all supported languages
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html",
    "markdown",
    "json",
    "jsonc",
    "yaml",
    "toml",
    "xml",
    "gql",
    "graphql",
    "astro",
    "svelte",
    "css",
    "less",
    "scss",
    "pcss",
    "postcss"
  ]
}
```

## Anti-slop rules

When `antislop: true`, every rule below is enabled as an error. They are an ESLint port of [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop). Each rule folder has usage notes, do/don't examples, and room for future options.

- [`anti-slop/no-chained-type-assertions`](./plugin/anti-slop/rules/no-chained-type-assertions/README.md) — rejects nested type assertions that fabricate evidence.
- [`anti-slop/no-conditional-empty-object-spread`](./plugin/anti-slop/rules/no-conditional-empty-object-spread/README.md) — rejects conditional spreads that use `{}` to omit fields.
- [`anti-slop/no-known-value-widening`](./plugin/anti-slop/rules/no-known-value-widening/README.md) — rejects explicit broad target types that discard known value evidence.
- [`anti-slop/no-object-parameters`](./plugin/anti-slop/rules/no-object-parameters/README.md) — rejects the broad `object` type on function inputs.
- [`anti-slop/no-runtime-typeof`](./plugin/anti-slop/rules/no-runtime-typeof/README.md) — requires boundary parsing instead of ad hoc `typeof` narrowing.
- [`anti-slop/no-shape-in-symbol-names`](./plugin/anti-slop/rules/no-shape-in-symbol-names/README.md) — rejects `shape` in symbol names.
- [`anti-slop/no-unknown-parameters`](./plugin/anti-slop/rules/no-unknown-parameters/README.md) — rejects `unknown` inputs except the explicit `cause` convention.
- [`anti-slop/no-unknown-type-aliases`](./plugin/anti-slop/rules/no-unknown-type-aliases/README.md) — rejects aliases that merely conceal `unknown`.
- [`anti-slop/no-unsafe-dictionary-type`](./plugin/anti-slop/rules/no-unsafe-dictionary-type/README.md) — rejects dictionary value contracts based on `unknown`, `any`, `object`, `{}`, and semantic equivalents.
- [`anti-slop/no-widen-then-assert`](./plugin/anti-slop/rules/no-widen-then-assert/README.md) — rejects local flows that widen known values and later assert them back.
