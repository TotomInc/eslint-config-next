# Migration guide

## From v3 to v4

v4 detects your setup automatically, removes legacy options and turns the strict rules on by default. Expect new errors on the first run. Most of them can be auto-fixed with `eslint . --fix`.

### 1. Update the package

```bash
npm i -D @totominc/eslint-config-next@4 eslint@10
```

`eslint-plugin-jsx-a11y` and `eslint-plugin-vuejs-accessibility` are now bundled. If you installed them yourself, you can uninstall them.

In a Turborepo (a `turbo.json` in the current or a parent directory), Turborepo rules are enabled automatically and require `eslint-plugin-turbo`:

```bash
npm i -D eslint-plugin-turbo
```

### 2. Update the options

| v3                                     | v4                                                            |
| -------------------------------------- | ------------------------------------------------------------- |
| `enableNextSupport: true`              | `framework: "next"`, or nothing: `next` is detected           |
| _(React always on)_                    | `framework: "react"`, or nothing: `react` is detected         |
| —                                      | `framework: "vue"` / `"none"`, or nothing: they are detected  |
| `ignoredFiles: [...]`                  | `ignores: [...]`                                              |
| `tailwindcssConfigPath: "app/app.css"` | `tailwindcss: { entryPoint: "app/app.css" }`                  |
| _(Tailwind CSS always on)_             | `tailwindcss: false` to disable, detected from `tailwindcss`  |
| `antislop: true`                       | Remove it: on by default. Use `antislop: false` to opt out    |
| —                                      | `a11y: false` to opt out of the accessibility rules           |
| —                                      | `turbo: false` to opt out of the Turborepo rules              |
| —                                      | `strictTypeSafety: false` to opt out of the type-safety rules |
| `UserConfig` type                      | `Options` type                                                |

Before:

```js
import { totominc } from "@totominc/eslint-config-next";

export default totominc({
  enableNextSupport: true,
  tailwindcssConfigPath: "src/app/globals.css",
  ignoredFiles: ["generated/**"],
  antislop: true,
});
```

After:

```js
import { totominc } from "@totominc/eslint-config-next";

export default totominc({
  ignores: ["generated/**"],
});
```

Here `framework` and `tailwindcss` are detected (`src/app/globals.css` is one of the known entry points). Detection only reads the `package.json` in the directory ESLint runs from. In a monorepo where ESLint runs from the root, set `framework` and `tailwindcss` explicitly.

### 3. Fix the new errors

Run `npx eslint . --fix` first. The remaining errors usually fall into these groups:

**Type assertions and `any`** (`ts/no-explicit-any`, `ts/no-unsafe-type-assertion`, `ts/no-non-null-assertion`)

```ts
// ❌ v4
const user = (await response.json()) as User;
const first = items[0]!;

// ✅ parse at the boundary, narrow everywhere else
const user = UserSchema.parse(await response.json());
const first = items.at(0);
if (first === undefined) {
  throw new Error("Expected at least one item");
}
```

**Conditions** (`ts/strict-boolean-expressions`, `no-implicit-coercion`)

```ts
// ❌ v4: an empty string, `0` or `NaN` are values, not missing ones
const label = name || "Anonymous";
const hasItems = !!count;

// ✅
const label = name !== "" ? name : "Anonymous";
const hasItems = count > 0;
```

Nullable objects and nullable booleans are still allowed: `if (user)` and `if (user?.isAdmin)` are fine.

**Enums, namespaces and parameter properties** (`no-restricted-syntax`)

```ts
// ❌ v4
enum Status {
  Active = "active",
  Archived = "archived",
}

// ✅
const Status = { Active: "active", Archived: "archived" } as const;
type Status = (typeof Status)[keyof typeof Status];
```

**React** (`react/*`). Every `@eslint-react` recommended rule is now an error, including `exhaustive-deps`, `no-array-index-key` and `set-state-in-effect`. `<button>` needs an explicit `type`, `<img>` and `next/image` need `alt`.

**Anti-slop** (`anti-slop/*`). These rules are now on by default, see the [README](./README.md#anti-slop-rules). To adopt them gradually, turn individual rules off:

```js
export default totominc(
  {},
  {
    rules: {
      "anti-slop/no-runtime-typeof": "off",
    },
  },
);
```

### 4. Optional: tighten `tsconfig.json`

The type-aware rules are most useful with these compiler options:

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
