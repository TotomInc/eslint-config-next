# `anti-slop/no-known-value-widening`

Rejects assignments, returns, and assertions that take a value with known evidence (object literals, arrays, numbers, stable `const` bindings) and force it into a broad or anonymous target such as `unknown`, `object`, `Record<string, T>`, or an inline `{ start: Command }`.

Empty `{}` used as a dictionary accumulator is allowed. Named owner types and `satisfies` are allowed.

Enabled as an error by `totominc({ antislop: true })`. Override it like any ESLint rule:

```js
export default totominc(
  { antislop: true },
  { rules: { "anti-slop/no-known-value-widening": "off" } },
);
```

## Don't

```ts
type Command = () => void;
function startCommand() {}

const commands: Record<string, Command> = { start: startCommand };
```

```ts
type Command = () => void;
function startCommand() {}

const commands = { start: startCommand } as Record<string, Command>;
```

```ts
const value: unknown = {};
```

```ts
type Command = () => void;
function startCommand() {}

function create(): Record<string, Command> {
  return { start: startCommand };
}
```

The known `start` key is discarded by the broad target type.

## Do

```ts
type Command = () => void;
function startCommand() {}

const commands = { start: startCommand };
```

```ts
type Command = () => void;
function startCommand() {}

const commands = { start: startCommand } as const;
```

```ts
type Command = () => void;
function startCommand() {}

const commands = { start: startCommand } satisfies Record<string, Command>;
```

```ts
type Command = () => void;
function startCommand() {}

interface Commands {
  readonly start: Command;
}

const commands: Commands = { start: startCommand };
```

```ts
type Command = () => void;

const commands: Record<string, Command> = {};
```

Preserve inference, use `satisfies`, or name the owner contract. Parse genuinely external data once at its boundary.

## Options

This rule has no options.
