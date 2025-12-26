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
  const prompt = recognition.label
    ? `A clean 2D illustration of a ${recognition.label}`
    : 'A minimal 2D illustration inspired by a motion sketch';

  return stability.generate({
    prompt,
    sketch,
  });
};

