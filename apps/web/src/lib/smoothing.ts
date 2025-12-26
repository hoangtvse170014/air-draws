import { VectorPoint } from '../hooks/useDrawBuffer';

/**
 * Simple moving-average smoother to keep the stub deterministic.
 */
export const smoothPath = (points: VectorPoint[], windowSize = 4): VectorPoint[] => {
  if (points.length <= windowSize) {
    return points;
  }

  const smoothed: VectorPoint[] = [];
  for (let i = 0; i < points.length; i += 1) {
    const slice = points.slice(Math.max(0, i - windowSize), i + 1);
    const avgX = slice.reduce((sum, p) => sum + p.x, 0) / slice.length;
    const avgY = slice.reduce((sum, p) => sum + p.y, 0) / slice.length;
    smoothed.push({ x: avgX, y: avgY });
  }

  return smoothed;
};

