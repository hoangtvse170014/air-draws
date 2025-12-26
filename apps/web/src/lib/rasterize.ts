import { VectorPoint } from '../hooks/useDrawBuffer';

export interface RasterizedSketch {
  size: number;
  pixels: Uint8ClampedArray;
}

export const rasterizePath = (path: VectorPoint[], size = 256): RasterizedSketch => {
  const pixels = new Uint8ClampedArray(size * size);

  path.forEach(({ x, y }) => {
    const px = Math.min(size - 1, Math.max(0, Math.floor(x * size)));
    const py = Math.min(size - 1, Math.max(0, Math.floor(y * size)));
    const offset = py * size + px;
    pixels[offset] = 255;
  });

  return { size, pixels };
};

export const pathToSketchBlob = async (
  path: VectorPoint[],
  size = 256
): Promise<Blob> => {
  if (typeof document === 'undefined') {
    throw new Error('Sketch conversion requires a DOM environment');
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#ff5a5f';
  ctx.lineWidth = 12;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  path.forEach((point, index) => {
    const x = point.x * size;
    const y = point.y * size;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to export sketch blob'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
};

