import type { Request, Response } from 'express';
import { preprocessSketch } from '../pipelines/preprocess';
import { recognizeGesture } from '../pipelines/recognizer';
import { runDiffusion } from '../pipelines/diffusion';

export const generateFromSketch = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      console.warn('[generateFromSketch] No file received');
      res.status(400).json({ message: 'Sketch file is required' });
      return;
    }

    console.log('[generateFromSketch] Processing sketch, size:', file.size, 'bytes');
    const normalized = await preprocessSketch(file.buffer);
    console.log('[generateFromSketch] Sketch preprocessed, size:', normalized.size);
    
    const guess = await recognizeGesture(normalized);
    console.log('[generateFromSketch] Recognized gesture:', guess.label || 'unknown');
    
    const result = await runDiffusion(normalized, guess);
    console.log('[generateFromSketch] Image generated successfully');

    res.json({
      label: guess.label,
      imageUrl: result.imageUrl,
    });
  } catch (error) {
    console.error('[generateFromSketch] failed', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[generateFromSketch] Error details:', {
      message: errorMessage,
      stack: errorStack,
    });
    res.status(500).json({ 
      message: 'Failed to generate image',
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
    });
  }
};

