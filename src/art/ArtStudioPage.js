import ArtStudio from '../component/art/ArtStudio';

function ArtStudioPage({ onNavigate }) {
  return (
    <div className="app-shell">
      <main className="app detail-page sun art-page">
        <button type="button" className="back-button" onClick={() => onNavigate('/art')}>
          뒤로
        </button>

        <section className="detail-hero game-hero">
          <div className="detail-badge">🎨</div>
          <div>
            <span className="eyebrow">ART PLAY</span>
            <h1>그림판 놀이터</h1>
            <p>사람 모양 캐릭터를 그리면 3D 모델, 리깅, 애니메이션 생성 파이프라인으로 이어서 볼 수 있어요.</p>
          </div>
        </section>

        <section className="detail-extra">
          <ArtStudio />
        </section>
      </main>
    </div>
  );
}

export default ArtStudioPage;
