import { useCallback, useEffect, useRef, useState } from 'react';
import CanvasSurface from './components/CanvasSurface';
import FingerTracker from './components/FingerTracker';
import PromptPanel from './components/PromptPanel';
import useHandPose from './hooks/useHandPose';
import useDrawBuffer from './hooks/useDrawBuffer';
import { pathToSketchBlob } from './lib/rasterize';
import { generateFromSketch } from './services/aiClient';

const App = () => {
  const handTracking = useHandPose();
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');
  const isLocked = status === 'generating';
  const { path, clear } = useDrawBuffer(handTracking.sample, isLocked);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastGestureRef = useRef(handTracking.sample?.gesture ?? null);

  const handleGenerate = useCallback(async () => {
    console.log('[App] Generate clicked, path length:', path.length, 'status:', status);
    if (!path.length) {
      console.warn('[App] Cannot generate: path is empty');
      setError('Please draw something first before generating.');
      return;
    }
    if (status === 'generating') {
      console.warn('[App] Already generating, ignoring click');
      return;
    }

    try {
      setStatus('generating');
      setError(null);
      console.log('[App] Starting generation, path length:', path.length);
      const sketch = await pathToSketchBlob(path);
      console.log('[App] Sketch created, size:', sketch.size, 'bytes');
      const response = await generateFromSketch({ sketch });
      console.log('[App] Generation complete, imageUrl:', response.imageUrl?.substring(0, 100));
      
      // Check if we got a placeholder
      if (response.imageUrl?.includes('placehold.co')) {
        setError('API returned placeholder. Check if API key is configured correctly in the server.');
      }
      
      setResultImage(response.imageUrl);
      setStatus('done');
      clear();
    } catch (err) {
      console.error('[App] generation failed', err);
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMessage);
      setStatus('idle');
    }
  }, [path, status, clear]);

  useEffect(() => {
    const currentGesture = handTracking.sample?.gesture ?? null;
    // When fist gesture is detected and we have a path, generate image
    if (
      currentGesture === 'fist' &&
      lastGestureRef.current !== 'fist' &&
      path.length > 0 &&
      status !== 'generating'
    ) {
      console.log('[App] Fist gesture detected, generating image...');
      void handleGenerate();
    }
    lastGestureRef.current = currentGesture;
  }, [handTracking.sample, path, status, handleGenerate]);

  return (
    <div className="app-shell">
      <header>
        <h1>Air Draw</h1>
        <p>Prototype playground for sketching with your fingertip.</p>
      </header>

      <main className="workspace">
        <section className="canvas-panel">
          <CanvasSurface path={path} />
        </section>

        <aside className="control-panel">
          <section className="card camera-card">
            <h2>Camera Feed</h2>
            <video
              ref={handTracking.videoRef}
              className="camera-preview"
              autoPlay
              playsInline
              muted
              width={320}
              height={240}
            />
            <p className="tag">
              Status: <strong>{handTracking.status}</strong>
            </p>
            {handTracking.error && (
              <p className="error-text">{handTracking.error}</p>
            )}
          </section>

          <FingerTracker pose={handTracking.sample} status={handTracking.status} />
          <PromptPanel
            status={status}
            onGenerate={handleGenerate}
            onClear={() => {
              clear();
              setResultImage(null);
              setError(null);
              setStatus('idle');
            }}
            resultImage={resultImage}
            error={error}
            hasPath={path.length > 0}
          />
        </aside>
      </main>
    </div>
  );
};

export default App;

