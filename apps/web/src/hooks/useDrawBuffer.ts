import { useCallback, useEffect, useMemo, useState } from 'react';
import { HandPoseSample } from './useHandPose';
import { smoothPath } from '../lib/smoothing';

export interface VectorPoint {
  x: number;
  y: number;
}

export interface DrawState {
  path: VectorPoint[];
  clear: () => void;
}

const useDrawBuffer = (
  pose: HandPoseSample | null,
  lock: boolean
): DrawState => {
  const [rawPath, setRawPath] = useState<VectorPoint[]>([]);

  useEffect(() => {
    if (!pose || !pose.indexFingerTip || !pose.isDrawing || lock) {
      return;
    }

    setRawPath((prev) => {
      const nextPoint = {
        x: pose.indexFingerTip!.x,
        y: pose.indexFingerTip!.y,
      };

      const nextPath = prev.length > 2048 ? prev.slice(-2048) : prev;
      return [...nextPath, nextPoint];
    });
  }, [pose, lock]);

  const path = useMemo(() => smoothPath(rawPath), [rawPath]);

  const clear = useCallback(() => setRawPath([]), []);

  return { path, clear };
};

export default useDrawBuffer;

