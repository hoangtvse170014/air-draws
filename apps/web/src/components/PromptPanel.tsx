interface PromptPanelProps {
  status: 'idle' | 'generating' | 'done';
  onGenerate: () => void;
  onClear: () => void;
  resultImage?: string | null;
  error?: string | null;
  hasPath?: boolean;
}

const statusMessage: Record<PromptPanelProps['status'], string> = {
  idle: 'Pinch to draw, make a fist to generate (or use the button).',
  generating: 'Generating…',
  done: 'Result ready! Pinch again to iterate.',
};

const PromptPanel = ({
  status,
  onGenerate,
  onClear,
  resultImage,
  error,
  hasPath = false,
}: PromptPanelProps) => {
  const canGenerate = hasPath && status !== 'generating';
  
  return (
    <section className="card">
      <h2>Prompt Panel</h2>
      <p>{statusMessage[status]}</p>
      {!hasPath && status === 'idle' && (
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          💡 Draw something on the canvas first
        </p>
      )}
      <div className="prompt-actions">
        <button type="button" className="secondary" onClick={onClear}>
          Clear
        </button>
        <button
          type="button"
          className="primary"
          onClick={onGenerate}
          disabled={!canGenerate}
          style={{
            opacity: canGenerate ? 1 : 0.5,
            cursor: canGenerate ? 'pointer' : 'not-allowed',
          }}
        >
          {status === 'generating' ? 'Working…' : 'Generate'}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
      {resultImage && (
        <figure className="result-preview">
          <img src={resultImage} alt="AI generated result" />
          <figcaption>AI result</figcaption>
        </figure>
      )}
    </section>
  );
};

export default PromptPanel;

