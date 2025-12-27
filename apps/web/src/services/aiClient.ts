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

  console.log('[aiClient] Sending request to:', endpoint);
  console.log('[aiClient] Sketch size:', payload.sketch.size, 'bytes');

  const res = await fetch(endpoint, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    let errorMessage = `Generation failed: ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.error) {
        errorMessage += ` - ${errorData.error}`;
      } else if (errorData.message) {
        errorMessage += ` - ${errorData.message}`;
      }
      console.error('[aiClient] Request failed:', res.status, errorData);
    } catch {
      const errorText = await res.text();
      errorMessage += ` - ${errorText}`;
      console.error('[aiClient] Request failed:', res.status, errorText);
    }
    throw new Error(errorMessage);
  }

  const result = await res.json() as GenerateResponse;
  console.log('[aiClient] Response received:', {
    imageUrl: result.imageUrl?.substring(0, 100) + '...',
    label: result.label,
  });

  // Check if it's a placeholder URL
  if (result.imageUrl?.includes('placehold.co')) {
    console.warn('[aiClient] Received placeholder URL - API key may not be configured correctly');
  }

  return result;
};

