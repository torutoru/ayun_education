function StartDialog({ dialogState, countdownText, onStart }) {
  return (
    <div className="game-start-dialog-backdrop">
      <div className={`game-start-dialog ${dialogState}`}>
        {dialogState === 'ready' ? (
          <>
            <span className="eyebrow">READY</span>
            <h3>호랑이 피하기</h3>
            <p>빈칸 단어를 보고 보기 중 정답 단어를 골라보세요.</p>
            <button type="button" className="submenu-button peach dialog-start-button" onClick={onStart}>
              시작
            </button>
          </>
        ) : (
          <div className="countdown-text">{countdownText}</div>
        )}
      </div>
    </div>
  );
}

export default StartDialog;