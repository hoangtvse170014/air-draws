export interface NormalizedSketch {
  data: Buffer;
  size: number;
}

export const preprocessSketch = async (payload: Buffer): Promise<NormalizedSketch> => {
  // Placeholder ensures a deterministic interface for downstream steps.
  const size = Math.round(Math.sqrt(payload.length || 1));
  return {
    data: payload,
    size: size || 256,
  };
};

