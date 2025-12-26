import { RefObject, useEffect, useRef, useState } from 'react';

export interface FingerPoint {
  x: number;
  y: number;
  z?: number;
}

export type HandGesture = 'open' | 'pinch' | 'fist';

export interface HandPoseSample {
  timestamp: number;
  indexFingerTip: FingerPoint | null;
  landmarks: FingerPoint[];
  isDrawing: boolean;
  gesture: HandGesture;
  pinchStrength: number;
}

export type HandPoseStatus = 'idle' | 'initializing' | 'streaming' | 'error';

export interface UseHandPoseResult {
  sample: HandPoseSample | null;
  videoRef: RefObject<HTMLVideoElement>;
  status: HandPoseStatus;
  error: string | null;
}

const PINCH_ACTIVATION_THRESHOLD = 0.07;
const FIST_DISTANCE_THRESHOLD = 0.13;
const FINGER_TIP_IDS = [8, 12, 16, 20];

const locateHandsAsset = (file: string) =>
  `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;

const distance2D = (a: FingerPoint, b: FingerPoint) =>
  Math.hypot(a.x - b.x, a.y - b.y);

const useHandPose = (): UseHandPoseResult => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [sample, setSample] = useState<HandPoseSample | null>(null);
  const [status, setStatus] = useState<HandPoseStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let disposed = false;
    let rafId: number | null = null;
    let camera: import('@mediapipe/camera_utils').Camera | null = null;
    let hands: import('@mediapipe/hands').Hands | null = null;

    const waitForVideoElement = () =>
      new Promise<HTMLVideoElement>((resolve) => {
        const check = () => {
          if (disposed) {
            return;
          }
          if (videoRef.current) {
            rafId = null;
            resolve(videoRef.current);
            return;
          }
          rafId = requestAnimationFrame(check);
        };
        check();
      });

    const initialize = async () => {
      setStatus('initializing');
      setError(null);

      try {
        const videoElement = await waitForVideoElement();
        const [{ Hands }, { Camera }] = await Promise.all([
          import('@mediapipe/hands'),
          import('@mediapipe/camera_utils'),
        ]);

        if (disposed) {
          return;
        }

        hands = new Hands({ locateFile: locateHandsAsset });
        hands.setOptions({
          selfieMode: true,
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results) => {
          if (disposed) {
            return;
          }

          const rawLandmarks = results.multiHandLandmarks?.[0];
          const normalizedLandmarks: FingerPoint[] =
            rawLandmarks?.map((point) => ({
              x: point.x,
              y: point.y,
              z: point.z,
            })) ?? [];

          if (!normalizedLandmarks.length) {
            setSample(null);
            return;
          }

          const indexTip = normalizedLandmarks[8] ?? null;
          const thumbTip = normalizedLandmarks[4] ?? null;
          const wrist = normalizedLandmarks[0] ?? null;

          let gesture: HandGesture = 'open';
          let isDrawing = false;
          let pinchStrength = 0;

          if (indexTip && thumbTip) {
            const pinchDistance = distance2D(indexTip, thumbTip);
            pinchStrength = Math.max(
              0,
              1 - pinchDistance / PINCH_ACTIVATION_THRESHOLD
            );
            if (pinchDistance < PINCH_ACTIVATION_THRESHOLD) {
              gesture = 'pinch';
              isDrawing = true;
            }
          }

          if (wrist) {
            const fingerDistances = FINGER_TIP_IDS.flatMap((id) => {
              const point = normalizedLandmarks[id];
              return point ? [distance2D(point, wrist)] : [];
            });

            if (
              fingerDistances.length &&
              fingerDistances.reduce((sum, value) => sum + value, 0) /
                fingerDistances.length <
                FIST_DISTANCE_THRESHOLD
            ) {
              gesture = 'fist';
              isDrawing = false;
            }
          }

          setSample({
            timestamp: performance.now(),
            indexFingerTip: indexTip,
            landmarks: normalizedLandmarks,
            isDrawing,
            gesture,
            pinchStrength,
          });
        });

        camera = new Camera(videoElement, {
          onFrame: async () => {
            if (!hands || !videoRef.current) {
              return;
            }
            await hands.send({ image: videoRef.current });
          },
          width: 640,
          height: 480,
        });

        await camera.start();

        if (disposed) {
          return;
        }

        setStatus('streaming');
      } catch (err) {
        if (disposed) {
          return;
        }
        console.error('[useHandPose] failed to initialize', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Camera failed to start');
      }
    };

    void initialize();

    return () => {
      disposed = true;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      camera?.stop();
      hands?.close();
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return { sample, videoRef, status, error };
};

export default useHandPose;

