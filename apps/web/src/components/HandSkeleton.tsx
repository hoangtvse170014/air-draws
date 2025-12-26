import { memo, useEffect, useRef } from 'react';
import { FingerPoint } from '../hooks/useHandPose';

const HAND_CONNECTIONS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
];

interface HandSkeletonProps {
  landmarks: FingerPoint[];
}

const HandSkeleton = ({ landmarks }: HandSkeletonProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks.length) {
      return;
    }

    ctx.strokeStyle = '#6c5ce7';
    ctx.lineWidth = 2;

    HAND_CONNECTIONS.forEach(([start, end]) => {
      const a = landmarks[start];
      const b = landmarks[end];
      if (!a || !b) {
        return;
      }
      ctx.beginPath();
      ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
      ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
      ctx.stroke();
    });

    ctx.fillStyle = '#ff7675';

    landmarks.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [landmarks]);

  return (
    <canvas
      ref={canvasRef}
      className="skeleton-canvas"
      width={220}
      height={220}
      aria-label="Hand landmark preview"
    />
  );
};

export default memo(HandSkeleton);

