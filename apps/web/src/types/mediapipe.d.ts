declare module '@mediapipe/camera_utils' {
  export class Camera {
    constructor(
      videoElement: HTMLVideoElement,
      options: {
        onFrame: () => Promise<void> | void;
        width?: number;
        height?: number;
      }
    );
    start(): Promise<void>;
    stop(): void;
  }
}

declare module '@mediapipe/hands' {
  export interface NormalizedLandmark {
    x: number;
    y: number;
    z: number;
  }

  export interface Results {
    multiHandLandmarks?: NormalizedLandmark[][];
    multiHandedness?: Array<{
      label: string;
      score: number;
    }>;
  }

  export class Hands {
    constructor(config?: { locateFile?: (filename: string) => string });
    close(): void;
    setOptions(options: {
      selfieMode?: boolean;
      maxNumHands?: number;
      modelComplexity?: number;
      minDetectionConfidence?: number;
      minTrackingConfidence?: number;
    }): void;
    onResults(callback: (results: Results) => void): void;
    send(inputs: { image: HTMLVideoElement | HTMLCanvasElement }): Promise<void>;
  }
}

