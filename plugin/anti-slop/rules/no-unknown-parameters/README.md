# `anti-slop/no-unknown-parameters`

Rejects parameters explicitly typed as `unknown` on functions, methods, and signatures. The exception is a parameter named `cause`, the usual error-enrichment convention.

Enabled as an error by `totominc({ antislop: true })`. Override it like any ESLint rule:

```js
export default totominc(
  { antislop: true },
  { rules: { "anti-slop/no-unknown-parameters": "off" } },
);
```

## Don't

```ts
function handle(input: unknown) {}
```

```ts
const handle = (input: unknown) => input;
```

```ts
type Handler = (input: unknown) => void;
```

```ts
function handle(input: unknown, cause: unknown) {}
```

`cause` is allowed; `input` is not.

## Do

```ts
function handle(input: User) {}
```

```ts
function wrap(cause: unknown) {}
```

```ts
const wrap = (cause: unknown) => cause;
```

```ts
type Handler = (cause: unknown) => void;
```

```ts
function parse(value: string) {}
```

Define the expected schema or parser so the value becomes a domain type at the I/O boundary.

## Options

This rule has no options.
