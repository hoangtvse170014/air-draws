import 'dotenv/config';
import { NormalizedSketch } from './preprocess';
import { RecognitionResult } from './recognizer';
import { StabilityClient } from '../integrations/stability';

export interface DiffusionResult {
  imageUrl: string;
}

const stability = new StabilityClient();

export const runDiffusion = async (
  sketch: NormalizedSketch,
  recognition: RecognitionResult
): Promise<DiffusionResult> => {
  // More specific prompt to avoid face detection
  const prompt = recognition.label
    ? `Simple 2D line drawing of a ${recognition.label}, black outline on white background, cartoon style, no faces, no people, just the object`
    : 'Simple 2D line drawing, black outline on white background, cartoon style, abstract shape, no faces, no people';

  return stability.generate({
    prompt,
    sketch,
  });
};

