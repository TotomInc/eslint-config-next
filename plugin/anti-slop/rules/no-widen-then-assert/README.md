# `anti-slop/no-widen-then-assert`

Rejects a local `const` that widens a known value to `unknown`, `any`, `object`, or a broad `Record`, then later asserts that binding back to a narrower type. The two steps erase evidence and reconstruct it without parsing.

Widening a value that was already unknown (for example a function return you have not parsed) is allowed. Asserting a call result directly is allowed.

Enabled as an error by `totominc({ antislop: true })`. Override it like any ESLint rule:

```js
export default totominc(
  { antislop: true },
  { rules: { "anti-slop/no-widen-then-assert": "off" } },
);
```

## Don't

```ts
interface User { id: string }

const loaded: User = { id: "1" };
const stored: unknown = loaded;
const user = stored as User;
```

```ts
interface User { id: string }

const loaded = { id: "1" };
const stored: unknown = loaded;
const user = stored as User;
```

```ts
interface User { id: string }

const loaded: User = { id: "1" };
const stored = loaded as unknown;
const user = stored as User;
```

## Do

```ts
interface User { id: string }

const user: User = { id: "1" };
```

```ts
const user = loadUser() as User;
```

```ts
interface User { id: string }

declare function loadUser(): User;

const stored: unknown = loadUser();
const user = stored as User;
```

Keep the precise type end-to-end. If the input is genuinely unknown, parse it once at the boundary instead of widening a known value.

## Options

This rule has no options.
