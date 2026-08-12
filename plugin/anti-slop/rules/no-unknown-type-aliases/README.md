# `anti-slop/no-unknown-type-aliases`

Rejects type aliases whose resolved type is `unknown`, including aliases that only rename another unknown alias. Hiding `unknown` behind a name makes the escape hatch look like a domain type.

Generic aliases such as `type Wrapper<T> = T` are allowed.

Enabled as an error by `totominc({ antislop: true })`. Override it like any ESLint rule:

```js
export default totominc(
  { antislop: true },
  { rules: { "anti-slop/no-unknown-type-aliases": "off" } },
);
```

## Don't

```ts
type ExternalValue = unknown;
```

```ts
export type ExternalValue = unknown;
```

```ts
type Hidden = unknown;
type Nested = Hidden;
```

## Do

```ts
interface User { id: string }
```

```ts
type Result = string | number;
```

```ts
type Wrapper<T> = T;
```

```ts
type JsonValue = string | number | boolean | null;
```

```ts
export interface Owner { readonly id: string }
```

Keep `unknown` explicit on an allowed `cause` field, or replace it with the parsed owner type.

## Options

This rule has no options.
