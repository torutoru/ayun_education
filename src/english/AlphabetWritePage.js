import AlphabetWritingGame from '../component/english/AlphabetWritingGame';

function AlphabetWritePage({ onNavigate }) {
  return (
    <div className="app-shell">
      <main className="app detail-page sky alphabet-write-page">
        <button type="button" className="back-button" onClick={() => onNavigate('/english')}>
          뒤로
        </button>

        <section className="detail-hero game-hero">
          <div className="detail-badge">Aa</div>
          <div>
            <span className="eyebrow">ENGLISH GAME</span>
            <h1>알파벳 쓰기 게임</h1>
            <p>아이패드에서 알파벳을 크게 써 보고, 판별 결과를 확인하는 영어 쓰기 연습 화면입니다.</p>
          </div>
        </section>

        <section className="detail-extra">
          <AlphabetWritingGame />
        </section>
      </main>
    </div>
  );
}

export default AlphabetWritePage;
