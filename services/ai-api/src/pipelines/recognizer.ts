import { NormalizedSketch } from './preprocess';

export interface RecognitionResult {
  label: string;
  confidence: number;
}

export const recognizeGesture = async (
  sketch: NormalizedSketch
): Promise<RecognitionResult> => {
  const fallback: RecognitionResult = {
    label: sketch.size % 2 === 0 ? 'star' : 'unknown',
    confidence: 0.42,
  };

  return fallback;
};

