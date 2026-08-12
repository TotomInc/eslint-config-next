# `anti-slop/no-object-parameters`

Rejects function, method, and signature parameters typed as `object`, including local aliases that resolve to `object`. Inputs need an owner-provided type, or they should be decoded at their boundary.

Generic parameters, including `extends object`, are allowed.

Enabled as an error by `totominc({ antislop: true })`. Override it like any ESLint rule:

```js
export default totominc(
  { antislop: true },
  { rules: { "anti-slop/no-object-parameters": "off" } },
);
```

## Don't

```ts
function save(value: object) {}
```

```ts
type Alias = object;

function save(value: Alias) {}
```

## Do

```ts
interface Owner {
  readonly id: string;
}

function save(value: Owner) {}
```

```ts
function save<Value>(value: Value) {}
```

```ts
function save<Value extends object>(value: Value) {}
```

## Options

This rule has no options.
