import WorkerAvatar from './WorkerAvatar';
import { HOME_POSITION } from './wordGameUtils';

const TRACK_START_PERCENT = 16;
const TRACK_END_PERCENT = 88;

function toTrackPercent(position) {
  return TRACK_START_PERCENT + (position / HOME_POSITION) * (TRACK_END_PERCENT - TRACK_START_PERCENT);
}

function ChaseScene({ tigerPosition, playerPosition, isSuccess, isCatching, isFail }) {
  const clampedPlayer = Math.min(HOME_POSITION, Math.max(0, playerPosition));
  const clampedTiger = Math.min(HOME_POSITION, Math.max(0, tigerPosition));
  const renderedTiger = isCatching || isFail ? Math.min(HOME_POSITION, clampedPlayer + 0.35) : clampedTiger;
  const tigerScale = isCatching || isFail ? 1.65 : 1 + (clampedTiger / HOME_POSITION) * 0.95;

  return (
    <section className="chase-scene-card">
      <div className="chase-scene">
        <div className="stage-overlay">
          <div className="water-layer water-back" />
          <div className="water-layer water-front" />
          <div className="safe-house">{'\uC9D1'}</div>
        </div>

        <div
          className={`runner dynamic-runner ${isSuccess ? 'safe' : ''} ${isCatching || isFail ? 'caught' : ''}`}
          style={{ '--runner-left': `${toTrackPercent(clampedPlayer)}%` }}
        >
          <WorkerAvatar className="worker-avatar" />
        </div>

        <div
          className={`tiger dynamic-tiger ${isCatching || isFail ? 'attack' : ''}`}
          style={{
            '--tiger-left': `${toTrackPercent(renderedTiger)}%`,
            '--tiger-scale': tigerScale
          }}
        >
          🐯
        </div>
      </div>
    </section>
  );
}

export default ChaseScene;