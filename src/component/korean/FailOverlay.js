import WorkerAvatar from './WorkerAvatar';

function FailOverlay({ onRetry }) {
  return (
    <div className="fail-overlay">
      <div className="fail-overlay-card">
        <div className="fail-scene">
          <div className="fail-tiger">🐯</div>
          <div className="fail-runner">
            <WorkerAvatar className="worker-avatar fail-worker-avatar" />
          </div>
        </div>
        <h3>호랑이가 잡았어요</h3>
        <p>정답 단어를 더 빨리 골라서 도망쳐야 해요.</p>
        <button type="button" className="submenu-button peach dialog-start-button" onClick={onRetry}>
          다시 도전
        </button>
      </div>
    </div>
  );
}

export default FailOverlay;