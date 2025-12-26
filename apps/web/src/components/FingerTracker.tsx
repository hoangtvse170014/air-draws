import { HandPoseSample, HandPoseStatus } from '../hooks/useHandPose';
import HandSkeleton from './HandSkeleton';

interface FingerTrackerProps {
  pose: HandPoseSample | null;
  status: HandPoseStatus;
}

const FingerTracker = ({ pose, status }: FingerTrackerProps) => {
  if (!pose) {
    return (
      <section className="card">
        <h2>Finger Tracker</h2>
        <p className="tag">Camera status: {status}</p>
        <p>Waiting for camera input…</p>
      </section>
    );
  }

  const finger = pose.indexFingerTip;

  return (
    <section className="card">
      <h2>Finger Tracker</h2>
      <p className="tag">Camera status: {status}</p>
      {finger ? (
        <ul className="finger-stats">
          <li>
            X: <strong>{finger.x.toFixed(3)}</strong>
          </li>
          <li>
            Y: <strong>{finger.y.toFixed(3)}</strong>
          </li>
          <li>
            Z: <strong>{finger.z?.toFixed(3) ?? 'n/a'}</strong>
          </li>
        </ul>
      ) : (
        <p>Index fingertip not detected.</p>
      )}
      <p className="tag">
        Gesture: <strong>{pose.gesture}</strong>
      </p>
      <div className="pinch-meter" aria-label="Pinch strength meter">
        <div
          className="pinch-meter__fill"
          style={{ width: `${Math.round(pose.pinchStrength * 100)}%` }}
        />
      </div>
      <p className="tag">
        Drawing status: <strong>{pose.isDrawing ? 'drawing' : 'idle'}</strong>
      </p>
      <HandSkeleton landmarks={pose.landmarks} />
    </section>
  );
};

export default FingerTracker;

