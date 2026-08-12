# `anti-slop/no-unsafe-dictionary-type`

Rejects object-dictionary contracts whose direct value type is `unknown`, `any`, `object`, `{}`, or a union/alias that contains one of those escape hatches. That includes `Record`, index signatures, mapped types, and wrappers such as `Readonly<Record<string, unknown>>`.

A nested field may still be `unknown` when the dictionary value itself is a concrete object (`Record<string, { payload: unknown }>`). Generic dictionaries (`type Index<T> = Record<string, T>`) are allowed until they are instantiated with an unsafe value.

Enabled as an error by `totominc({ antislop: true })`. Override it like any ESLint rule:

```js
export default totominc(
  { antislop: true },
  { rules: { "anti-slop/no-unsafe-dictionary-type": "off" } },
);
```

## Don't

```ts
type Metadata = Record<string, unknown>;
```

```ts
interface OtherMetadata { [key: string]: object }
```

```ts
type Flags = { [K in PropertyKey]: object };
```

```ts
type Mixed = Record<string, string | unknown>;
```

```ts
type Wrapped = Readonly<Record<string, unknown>>;
```

```ts
interface Bag {
  [key: string]: unknown;
}
```

## Do

```ts
type Commands = Record<string, Command>;
```

```ts
type Metadata = Record<PropertyKey, JsonValue>;
```

```ts
type PermissionLevels = Record<Permission, number>;
```

```ts
interface Indexed { [key: string]: Command }
```

```ts
type Allowed = Record<string, { payload: unknown }>;
```

```ts
type Index<T> = Record<string, T>;
```

Replace the value type with a concrete owner or schema-derived type, and parse external data at its boundary.

## Options

This rule has no options.
