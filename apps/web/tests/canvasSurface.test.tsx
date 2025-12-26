import { describe, expect, it } from 'vitest';
import { smoothPath } from '../src/lib/smoothing';

describe('smoothPath', () => {
  it('returns the same list when below window size', () => {
    const input = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    expect(smoothPath(input, 10)).toEqual(input);
  });
});

