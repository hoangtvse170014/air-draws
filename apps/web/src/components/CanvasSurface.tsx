import { memo, useEffect, useRef } from 'react';
import { VectorPoint } from '../hooks/useDrawBuffer';

interface CanvasSurfaceProps {
  path: VectorPoint[];
}

const CanvasSurface = ({ path }: CanvasSurfaceProps) => {
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
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ff5a5f';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    path.forEach((point, index) => {
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }, [path]);

  return (
    <canvas
      ref={canvasRef}
      width={512}
      height={512}
      className="canvas-surface"
      aria-label="Drawing output"
    />
  );
};

export default memo(CanvasSurface);

