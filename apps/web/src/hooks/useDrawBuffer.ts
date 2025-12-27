import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const lastPointRef = useRef<VectorPoint | null>(null);

  useEffect(() => {
    // Stop drawing immediately when fist gesture is detected
    if (pose?.gesture === 'fist') {
      return;
    }

    if (!pose || !pose.indexFingerTip || !pose.isDrawing || lock) {
      return;
    }

    setRawPath((prev) => {
      const nextPoint = {
        x: pose.indexFingerTip!.x,
        y: pose.indexFingerTip!.y,
      };

      // Minimum distance threshold to avoid adding points too close together
      const MIN_DISTANCE = 0.01; // 1% of canvas
      if (lastPointRef.current) {
        const distance = Math.hypot(
          nextPoint.x - lastPointRef.current.x,
          nextPoint.y - lastPointRef.current.y
        );
        if (distance < MIN_DISTANCE) {
          return prev; // Skip this point if too close
        }
      }

      lastPointRef.current = nextPoint;
      const nextPath = prev.length > 2048 ? prev.slice(-2048) : prev;
      return [...nextPath, nextPoint];
    });
  }, [pose, lock]);

  const path = useMemo(() => smoothPath(rawPath), [rawPath]);

  const clear = useCallback(() => {
    setRawPath([]);
    lastPointRef.current = null;
  }, []);

  return { path, clear };
};

export default useDrawBuffer;

