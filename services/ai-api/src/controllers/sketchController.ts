import type { Request, Response } from 'express';
import { preprocessSketch } from '../pipelines/preprocess';
import { recognizeGesture } from '../pipelines/recognizer';
import { runDiffusion } from '../pipelines/diffusion';

export const generateFromSketch = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'Sketch file is required' });
      return;
    }

    const normalized = await preprocessSketch(file.buffer);
    const guess = await recognizeGesture(normalized);
    const result = await runDiffusion(normalized, guess);

    res.json({
      label: guess.label,
      imageUrl: result.imageUrl,
    });
  } catch (error) {
    console.error('[generateFromSketch] failed', error);
    res.status(500).json({ message: 'Failed to generate image' });
  }
};

