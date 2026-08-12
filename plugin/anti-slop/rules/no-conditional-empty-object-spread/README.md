# `anti-slop/no-conditional-empty-object-spread`

Rejects object spreads that use a ternary with `{}` to omit fields. That pattern hides control flow inside a copy and is easy to get wrong. The rule does not offer an autofix, because rewriting it can change omission semantics.

Enabled as an error by `totominc({ antislop: true })`. Override it like any ESLint rule:

```js
export default totominc(
  { antislop: true },
  { rules: { "anti-slop/no-conditional-empty-object-spread": "off" } },
);
```

## Don't

```ts
const options = {
  ...(timeout !== undefined ? { timeout } : {}),
};
```

```ts
const result = {
  ...(condition ? {} : { value }),
};
```

## Do

```ts
const result = { value };
```

```ts
const result = { ...values };
```

```ts
const result = condition ? { value } : {};
```

```ts
const options = timeout === undefined ? { value } : { value, timeout };
```

## Options

This rule has no options.
