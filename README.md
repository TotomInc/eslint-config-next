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

Pick the framework of your project with `framework` (defaults to `"react"`):

```js
// Next.js (App Router or Pages Router).
export default totominc({ framework: "next" });
```

```js
// Vue 3 (`<script setup lang="ts">` SFCs).
export default totominc({ framework: "vue" });
```

```js
// Plain TypeScript (Node.js, libraries, CLIs): no React/Vue/Tailwind rules.
export default totominc({ framework: "none", type: "lib" });
```

Extra flat config items can be passed after the options, and win over everything else:

```js
export default totominc(
  { framework: "next" },
  {
    files: ["scripts/**"],
    rules: { "no-console": "off" },
  },
);
```

### Options

| Option                  | Default             | Description                                                                                                                                                          |
| ----------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `framework`             | `"react"`           | `"react"`, `"next"`, `"vue"` or `"none"`.                                                                                                                            |
| `type`                  | `"app"`             | `"lib"` also requires explicit return types on functions.                                                                                                            |
| `tsconfigPath`          | `"./tsconfig.json"` | `tsconfig.json` used for type-aware rules, or `false` to disable type-aware linting.                                                                                 |
| `strictTypeSafety`      | `true`              | Stricter type-safety rules, see [Type safety](#type-safety).                                                                                                         |
| `tailwindcssConfigPath` | `"app/globals.css"` | Tailwind CSS entry point, or `false` to disable Tailwind CSS rules.                                                                                                  |
| `a11y`                  | `false`             | Accessibility rules. Requires `eslint-plugin-jsx-a11y` (React, Next.js) or `eslint-plugin-vuejs-accessibility` (Vue). With Next.js, `<Image>` is checked for `alt`. |
| `antislop`              | `false`             | [Anti-slop rules](#anti-slop-rules).                                                                                                                                 |
| `ignoredFiles`          | `[]`                | Glob patterns of files to ignore.                                                                                                                                    |
| `antfu`                 | `{}`                | Escape hatch forwarded to [`@antfu/eslint-config`](https://github.com/antfu/eslint-config) (e.g. `{ unocss: true }`).                                                |
| `enableNextSupport`     | `false`             | **Deprecated**, use `framework: "next"`.                                                                                                                             |

> `eslint-plugin-jsx-a11y` does not declare ESLint 10 in its peer range yet, install it with `npm i -D eslint-plugin-jsx-a11y --legacy-peer-deps` (it works fine with ESLint 10).

### Next.js

`framework: "next"` enables `@next/eslint-plugin-next` with the `recommended` and `core-web-vitals` rules through antfu's preset, plus what `eslint-config-next` 16.4 adds on top:

- ignores `out/`, `build/` and `next-env.d.ts` (`.next/` is already ignored by antfu),
- `process.env` without `import process from "node:process"`,
- with `a11y: true`, `jsx-a11y/alt-text` also checks `next/image`'s `<Image>`.

There is no need to install `eslint-config-next`: it would register a second React plugin (`eslint-plugin-react`), a second import plugin and a Babel parser on top of antfu's `@eslint-react`, `import-lite` and `typescript-eslint` setup. React Hooks and React Compiler rules (`rules-of-hooks`, `exhaustive-deps`, `purity`, `set-state-in-render`, ...) come from `@eslint-react`.

### Vue

`framework: "vue"` enables antfu's Vue preset with the same personal preferences as React:

- Prettier formats `.vue` files, conflicting `vue/*` stylistic rules are disabled,
- attributes are sorted alphabetically, events last (`vue/attributes-order`), like `perfectionist/sort-jsx-props`,
- every element without content self-closes (`vue/html-self-closing`), like `style/jsx-self-closing-comp`,
- only typed `<script setup lang="ts">`: `vue/block-lang`, `vue/component-api-style`, type-based `defineProps`/`defineEmits`, typed `ref()`, explicit slots,
- dead code: unused props, emits and template refs are reported,
- Tailwind CSS class order and validation in templates.

### Type safety

With `strictTypeSafety` (default), on top of antfu's type-aware rules:

- `any`, non-null assertions (`!`) and `<T>value` / `{} as T` assertions are errors,
- unnecessary conditions, `||` instead of `??`, missing optional chaining, unnecessary type arguments/parameters/conversions,
- throwing or rejecting non-`Error` values, `async` functions without `await`, `switch` over unions that are not exhaustive,
- deprecated APIs are warnings,
- React: props declared but never used (`react/no-unused-props`), unstable context values and default props, `<button>` without `type`, `target="_blank"` without `rel`.

Type-aware rules are much more effective with a strict `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true
  }
}
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
