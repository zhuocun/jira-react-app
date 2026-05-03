/**
 * Active palette switch. Change ONE import line below and the entire app
 * picks up the new palette on next reload — `tokens.ts`, AntD theme, CSS
 * vars, AI surfaces, and avatar gradients all flip automatically.
 *
 * To switch palettes:
 *   1. (Optional) Add a new `palettes/<name>.ts` modeled on `orange.ts`.
 *   2. Change the `from "./orange"` line below to the new palette file.
 *   3. Run the app — that's it. No other edits required.
 */
export { orangePalette as palette } from "./orange";

export { paletteToCss } from "./cssVars";
export type { Palette } from "./types";
