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
  constructor() {
    // Don't store API key in constructor, read it fresh each time
  }

  private getApiKey(): string {
    return process.env.STABILITY_KEY ?? 'demo';
  }

  async generate(options: GenerateOptions): Promise<DiffusionResult> {
    const apiKey = this.getApiKey();
    
    if (!apiKey || apiKey === 'demo') {
      console.warn('[StabilityClient] Using placeholder - no valid API key');
      console.warn('[StabilityClient] STABILITY_KEY env var:', apiKey || 'NOT SET');
      return PLACEHOLDER(options.prompt, options.sketch);
    }

    console.log('[StabilityClient] API key found:', apiKey.substring(0, 10) + '...');

    try {
      console.log('[StabilityClient] Calling Stability AI API...');
      const result = await this.callStability(options);
      if (result.imageUrl.includes('placehold.co')) {
        console.warn('[StabilityClient] Received placeholder from API - this should not happen');
      }
      return result;
    } catch (error) {
      const errorDetails = error instanceof Error ? {
        message: error.message,
        stack: error.stack,
      } : { message: String(error) };
      console.error('[StabilityClient] API call failed:', errorDetails);
      console.error('[StabilityClient] Error type:', error?.constructor?.name);
      console.error('[StabilityClient] Falling back to placeholder');
      return PLACEHOLDER(options.prompt, options.sketch);
    }
  }

  private async callStability(options: GenerateOptions): Promise<DiffusionResult> {
    const form = new FormData();
    form.append('prompt', options.prompt);
    // Note: negative_prompt may not be supported in this endpoint
    form.append('image_strength', '0.7'); // Higher value = sketch has more influence
    form.append('seed', Math.floor(Math.random() * 1_000_000_000).toString());
    form.append('output_format', 'png');
    form.append('image', options.sketch.data, {
      filename: 'sketch.png',
      contentType: 'image/png',
    });

    const apiKey = this.getApiKey();
    
    console.log('[StabilityClient] Sending request to:', STABILITY_ENDPOINT);
    console.log('[StabilityClient] Prompt:', options.prompt);
    console.log('[StabilityClient] Sketch size:', options.sketch.data.length, 'bytes');
    console.log('[StabilityClient] API key prefix:', apiKey.substring(0, 10) + '...');

    const response = await fetch(STABILITY_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'image/*',
        ...form.getHeaders(),
      },
      body: form,
    });

    console.log('[StabilityClient] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[StabilityClient] API error response:', errorText);
      throw new Error(`Stability API error ${response.status}: ${errorText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    console.log('[StabilityClient] Success! Image size:', buffer.length, 'bytes');
    return {
      imageUrl: `data:image/png;base64,${buffer.toString('base64')}`,
    };
  }
}

