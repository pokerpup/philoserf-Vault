/** PROMPT.md §4.1: internal resolution scaled by integer factors only, letterboxed. */
export const BASE_WIDTH = 480;
export const BASE_HEIGHT = 270;

export function integerZoom(
  viewportWidth: number,
  viewportHeight: number,
  baseWidth = BASE_WIDTH,
  baseHeight = BASE_HEIGHT,
): number {
  const fit = Math.min(viewportWidth / baseWidth, viewportHeight / baseHeight);
  return Math.max(1, Math.floor(fit));
}
