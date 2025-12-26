import { describe, expect, it } from 'vitest';
import { recognizeGesture } from '../src/pipelines/recognizer';
import { preprocessSketch } from '../src/pipelines/preprocess';

describe('pipeline stubs', () => {
  it('assigns a deterministic fallback label', async () => {
    const normalized = await preprocessSketch(Buffer.alloc(10));
    const result = await recognizeGesture(normalized);
    expect(result.label).toBe('star');
  });
});

