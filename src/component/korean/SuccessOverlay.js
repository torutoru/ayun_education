function SuccessOverlay({ onRetry }) {
  return (
    <div className="fail-overlay success-overlay">
      <div className="fail-overlay-card success-overlay-card">
        <div className="success-badge">성공</div>
        <h3>모든 단어를 맞혔어요</h3>
        <p>카테고리 단어를 모두 찾아서 호랑이를 피했어요.</p>
        <button type="button" className="submenu-button peach dialog-start-button" onClick={onRetry}>
          다시 하기
        </button>
      </div>
    </div>
  );
}

export default SuccessOverlay;