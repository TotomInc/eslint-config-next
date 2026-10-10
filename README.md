# eslint-config-next

Strict, type-safe ESLint flat config for React, Next.js, Vue and plain TypeScript projects, built on [`@antfu/eslint-config`](https://github.com/antfu/eslint-config) with Prettier formatting.

> Upgrading from v3? Read the [migration guide](./MIGRATION.md).

## Installation

```bash
npm i -D @totominc/eslint-config-next eslint
```

Create `eslint.config.js` in the root of your project:

```js
import { totominc } from "@totominc/eslint-config-next";

export default totominc();
```

That's it: the framework (Next.js, Vue/Nuxt, React or none) and Tailwind CSS are detected from the dependencies of your `package.json`, and Turborepo from a `turbo.json` in the current or a parent directory. Set them explicitly when detection is not enough, e.g. in a monorepo:

```js
export default totominc({
  framework: "next",
  tailwindcss: { entryPoint: "src/app/globals.css" },
});
```

Extra flat config items can be passed after the options, and win over everything else:

```js
export default totominc(
  { framework: "vue" },
  {
    files: ["scripts/**"],
    rules: { "no-console": "off" },
  },
);
```

### Options

| Option             | Default             | Description                                                                                                                       |
| ------------------ | ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `framework`        | detected            | `"next"`, `"vue"`, `"react"` or `"none"`. Detected from `next`, then `vue`/`nuxt`, then `react` in `package.json`.                |
| `type`             | `"app"`             | `"lib"` also requires explicit return types on functions.                                                                         |
| `tsconfigPath`     | `"./tsconfig.json"` | `tsconfig.json` used for type-aware rules, or `false` to disable type-aware linting.                                              |
| `strictTypeSafety` | `true`              | Stricter type-safety rules, see [Type safety](#type-safety).                                                                      |
| `tailwindcss`      | detected            | `true`, `false` or `{ entryPoint }`. Enabled when `tailwindcss` is a dependency, entry point detected among common CSS locations. |
| `turbo`            | detected            | `turbo/no-undeclared-env-vars`, enabled when a `turbo.json` exists in the current directory or a parent one (up to the git root). |
| `a11y`             | `true`              | `eslint-plugin-jsx-a11y` (React, Next.js) or `eslint-plugin-vuejs-accessibility` (Vue). Both are bundled.                         |
| `antislop`         | `true`              | [Anti-slop rules](#anti-slop-rules).                                                                                              |
| `ignores`          | `[]`                | Glob patterns of files to ignore, on top of `.gitignore` and antfu's defaults.                                                    |
| `antfu`            | `{}`                | Escape hatch forwarded to [`@antfu/eslint-config`](https://github.com/antfu/eslint-config) (e.g. `{ unocss: true }`).             |

### Next.js

`framework: "next"` enables `@next/eslint-plugin-next` with the `recommended` and `core-web-vitals` rules through antfu's preset, plus what `eslint-config-next` 16.4 adds on top:

- ignores `out/`, `build/` and `next-env.d.ts` (`.next/` is already ignored by antfu),
- `process.env` without `import process from "node:process"`,
- `jsx-a11y/alt-text` also checks `next/image`'s `<Image>`.

There is no need to install `eslint-config-next`: it would register a second React plugin (`eslint-plugin-react`), a second import plugin and a Babel parser on top of antfu's `@eslint-react`, `import-lite` and `typescript-eslint` setup. React Hooks and React Compiler rules (`rules-of-hooks`, `exhaustive-deps`, `purity`, `immutability`, `refs`, `set-state-in-render`, ...) come from `@eslint-react`.

### Turborepo

In a Turborepo, `turbo/no-undeclared-env-vars` reports environment variables read in code but missing from `turbo.json`: Turborepo does not include them in the task hash, so a change in their value would serve a stale cached build.

The rule comes from `eslint-plugin-turbo`, an optional peer dependency (it requires the `turbo` binary, which only Turborepo projects install). Install it once at the root of the monorepo:

```bash
npm i -D eslint-plugin-turbo
```

It is enabled automatically, in the root and in every workspace package, as soon as a `turbo.json` is found. Use `turbo: false` to opt out.

### React

- every `@eslint-react` recommended rule is an error (upstream ships many as warnings),
- React Compiler rules (`globals`, `immutability`, `refs`) and the `strict` preset rules antfu leaves out: unused props and state, unstable context values and default props, `<button>` without `type`, `<iframe>` without `sandbox`, `target="_blank"` without `rel`, class components,
- props sorted with `perfectionist/sort-jsx-props` (`key`/`ref` first, callbacks last), self-closing components.

### Vue

`framework: "vue"` enables antfu's Vue preset with the same personal preferences as React:

- Prettier formats `.vue` files, conflicting `vue/*` stylistic rules are disabled,
- attributes are sorted alphabetically, events last (`vue/attributes-order`), like `perfectionist/sort-jsx-props`,
- every element without content self-closes (`vue/html-self-closing`), like `style/jsx-self-closing-comp`,
- only typed `<script setup lang="ts">`: `vue/block-lang`, `vue/component-api-style`, type-based `defineProps`/`defineEmits`, typed `ref()`, explicit slots,
- dead code: unused props, emits, components and template refs, undefined properties in templates,
- template expressions follow the script rules (`eqeqeq`, no implicit coercion, template literals),
- Tailwind CSS class order and validation in templates.

### Type safety

With `strictTypeSafety` (default), on top of antfu's type-aware rules:

- **no escape hatches**: `any`, non-null assertions (`!`), unsafe `as` assertions (`ts/no-unsafe-type-assertion`) and `<T>value` / `{} as T` are errors: parse or narrow values instead of asserting them,
- **explicit conditions**: `ts/strict-boolean-expressions` rejects strings and numbers in conditions (`""`, `0` and `NaN` are values, not missing ones), `no-implicit-coercion` rejects `!!value` and `+value`,
- **no TypeScript-only runtime syntax**: enums, namespaces and parameter properties are rejected, so code runs with Node.js type stripping (`erasableSyntaxOnly`),
- unnecessary conditions, `||` instead of `??`, missing optional chaining, unnecessary type arguments/parameters/conversions, mutable private members that are never reassigned,
- throwing or rejecting non-`Error` values, `async` functions without `await`, `switch` over unions that are not exhaustive,
- deprecated APIs are warnings.

Language rules also prefer modern built-ins (`Array#at`, `Array#flatMap`, `structuredClone`, `Object.hasOwn`, `for…of`, ...) over hand-written equivalents.

Type-aware rules are much more effective with a strict `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "erasableSyntaxOnly": true
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

Every rule below is enabled as an error (disable them all with `antislop: false`). They are an ESLint port of [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop). Each rule folder has usage notes, do/don't examples, and room for future options.

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
