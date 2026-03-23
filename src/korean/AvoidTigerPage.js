function AvoidTigerPage({ onNavigate }) {
  return (
    <div className="app-shell">
      <main className="app detail-page peach game-page">
        <button type="button" className="back-button" onClick={() => onNavigate('/korean')}>
          한글로
        </button>

        <section className="detail-hero game-hero">
          <div className="detail-badge">호</div>
          <div>
            <span className="eyebrow">GAME PAGE</span>
            <h1>호랑이 피하기</h1>
            <p>여기에 한글 게임 화면을 만들어 나갈 수 있도록 기본 페이지를 준비했습니다.</p>
          </div>
        </section>

        <section className="detail-extra">
          <div className="detail-card game-card">
            <h2>게임 준비 영역</h2>
            <p>
              캐릭터, 장애물, 점수판, 시작 버튼 같은 요소를 이 페이지에 추가하면 됩니다.
            </p>
            <div className="game-placeholder">
              <div className="game-lane">플레이 영역</div>
              <div className="game-panel">
                <div className="highlight-item">점수: 0</div>
                <div className="highlight-item">미션 글자: ㅁ</div>
                <button type="button" className="submenu-button peach" onClick={() => onNavigate('/korean')}>
                  한글 메뉴로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AvoidTigerPage;