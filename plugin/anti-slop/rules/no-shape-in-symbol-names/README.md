# `anti-slop/no-shape-in-symbol-names`

Rejects the case-insensitive substring `shape` in identifiers, private identifiers, and JSX names. The word is a low-signal stand-in for a real domain name.

Enabled as an error by `totominc({ antislop: true })`. Override it like any ESLint rule:

```js
export default totominc(
  { antislop: true },
  { rules: { "anti-slop/no-shape-in-symbol-names": "off" } },
);
```

## Don't

```ts
interface UserShape {
  id: string;
}
```

```ts
const shape = 1;
```

```ts
const userShape = 1;
```

```ts
function toShape() {}
```

```ts
class Account {
  #shape = 1;
}
```

```tsx
const el = <Shape />;
```

## Do

```ts
interface User {
  id: string;
}
```

```ts
const user = 1;
```

```ts
function render() {}
```

```ts
class Account {}
```

```tsx
const el = <User />;
```

Name the owner (`User`, `Command`, `Invoice`) instead of describing the TypeScript structure.

## Options

This rule has no options.
