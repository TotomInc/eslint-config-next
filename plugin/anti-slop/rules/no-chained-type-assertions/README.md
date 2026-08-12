# `anti-slop/no-chained-type-assertions`

Rejects nested `as` and angle-bracket assertions that discard the current type and invent a new one. A single assertion is allowed. Chains made only of `as const` are allowed.

Enabled as an error by `totominc({ antislop: true })`. Override it like any ESLint rule:

```js
export default totominc(
  { antislop: true },
  { rules: { "anti-slop/no-chained-type-assertions": "off" } },
);
```

## Don't

```ts
const user = input as object as User;
```

```ts
const user = <User><object>input;
```

```ts
const user = (input as object) as User;
```

```ts
const user = input as const as User;
```

## Do

```ts
const user = input as User;
```

```ts
const user = <User>input;
```

```ts
const value = input as const;
```

```ts
const value = input as const as const;
```

Parse genuinely unknown input at its boundary instead of stacking assertions.

## Options

This rule has no options.
