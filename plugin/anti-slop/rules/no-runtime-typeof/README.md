# `anti-slop/no-runtime-typeof`

Rejects every runtime `typeof` check. `typeof` only inspects an unparsed JavaScript representation; it does not establish a domain contract. Decode external values into named types at the I/O boundary instead.

Enabled as an error by `totominc({ antislop: true })`. Override it like any ESLint rule:

```js
export default totominc(
  { antislop: true },
  { rules: { "anti-slop/no-runtime-typeof": "off" } },
);
```

## Don't

```ts
if (typeof input === "string") {
  printName(input);
}
```

```ts
const kind = typeof input;
```

```ts
return typeof value === "function";
```

## Do

```ts
function parseName(input: string) {
  return input;
}
```

```ts
if (input.kind === "user") {
  printName(input);
}
```

Parse at the boundary (schema, branded type, or owner decoder) so later code never needs `typeof`.

## Options

This rule has no options.
