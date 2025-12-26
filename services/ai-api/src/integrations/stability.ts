import FormData from 'form-data';
import fetch from 'node-fetch';
import { NormalizedSketch } from '../pipelines/preprocess';
import { DiffusionResult } from '../pipelines/diffusion';

interface GenerateOptions {
  prompt: string;
  sketch: NormalizedSketch;
}

const PLACEHOLDER = (prompt: string, sketch: NormalizedSketch): DiffusionResult => {
  const hash = sketch.data.length.toString(16).padStart(4, '0');
  return {
    imageUrl: `https://placehold.co/600x400/EEE/31343C?text=${encodeURIComponent(
      prompt
    )}+${hash}`,
  };
};

const STABILITY_ENDPOINT = 'https://api.stability.ai/v2beta/stable-image/generate/core';

export class StabilityClient {
  constructor(private readonly apiKey = process.env.STABILITY_KEY ?? 'demo') {}

  async generate(options: GenerateOptions): Promise<DiffusionResult> {
    if (!this.apiKey || this.apiKey === 'demo') {
      return PLACEHOLDER(options.prompt, options.sketch);
    }

    try {
      return await this.callStability(options);
    } catch (error) {
      console.error('[StabilityClient] falling back to placeholder', error);
      return PLACEHOLDER(options.prompt, options.sketch);
    }
  }

  private async callStability(options: GenerateOptions): Promise<DiffusionResult> {
    const form = new FormData();
    form.append('prompt', options.prompt);
    form.append('image_strength', '0.35');
    form.append('seed', Math.floor(Math.random() * 1_000_000_000).toString());
    form.append('output_format', 'png');
    form.append('image', options.sketch.data, {
      filename: 'sketch.png',
      contentType: 'image/png',
    });

    const response = await fetch(STABILITY_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'image/png',
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stability API error ${response.status}: ${errorText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return {
      imageUrl: `data:image/png;base64,${buffer.toString('base64')}`,
    };
  }
}

