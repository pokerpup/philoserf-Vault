import { describe, expect, it } from 'vitest';
import { integerZoom } from '../src/game/zoom.ts';

describe('§4.1 integer zoom', () => {
  it('floors to the largest integer factor that fits', () => {
    expect(integerZoom(1440, 900)).toBe(3); // 1440/480 = 3, 900/270 = 3.33
    expect(integerZoom(1920, 1080)).toBe(4);
    expect(integerZoom(1000, 600)).toBe(2); // 2.08 × 2.22
  });
  it('never drops below 1× or goes fractional', () => {
    expect(integerZoom(320, 200)).toBe(1);
    for (const [w, h] of [
      [800, 450],
      [1365, 767],
      [2560, 1440],
    ])
      expect(Number.isInteger(integerZoom(w!, h!))).toBe(true);
  });
});
