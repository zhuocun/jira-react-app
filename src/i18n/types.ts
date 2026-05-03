/**
 * Shared dictionary shape derived from the English source.
 *
 * The English bundle (re-exported from `src/constants/microcopy.ts`) is the
 * single source of truth for the dictionary structure. Every other locale
 * must satisfy `Dictionary` so a missing key in a translation is a compile
 * error, not a runtime "undefined" leak.
 *
 * Strings in the English source are typed as their literal value via
 * `as const`, which is too narrow for translations ("Cancel" vs "取消").
 * `Mutable<T>` widens the literal types to plain primitives so each locale
 * can supply its own copy.
 */
import type { enSource } from "./locales/en";

type Mutable<T> = T extends readonly (infer U)[]
    ? Mutable<U>[]
    : T extends string
      ? string
      : T extends number
        ? number
        : T extends boolean
          ? boolean
          : T extends object
            ? { -readonly [K in keyof T]: Mutable<T[K]> }
            : T;

export type Dictionary = Mutable<typeof enSource>;
