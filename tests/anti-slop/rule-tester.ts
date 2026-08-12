import { RuleTester } from "@typescript-eslint/rule-tester";

/**
 * Shared RuleTester for anti-slop rules.
 *
 * TypeScript-specific syntax is parsed with `@typescript-eslint/parser` (the
 * tester default). JSX cases should set `filename` to a `.tsx` file.
 */
export const ruleTester = new RuleTester();
