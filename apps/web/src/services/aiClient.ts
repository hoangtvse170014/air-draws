export interface GeneratePayload {
  prompt?: string;
  sketch: Blob;
}

export interface GenerateResponse {
  imageUrl: string;
  label?: string;
}

export const generateFromSketch = async (
  payload: GeneratePayload,
  endpoint = '/api/generate'
): Promise<GenerateResponse> => {
  const form = new FormData();
  form.append('sketch', payload.sketch, 'sketch.png');
  if (payload.prompt) {
    form.append('prompt', payload.prompt);
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Generation failed: ${res.status}`);
  }

  return res.json() as Promise<GenerateResponse>;
};

