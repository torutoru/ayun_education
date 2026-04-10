import ArtGallery from '../component/art/ArtGallery';

function ArtGalleryPage({ onNavigate }) {
  return (
    <div className="app-shell">
      <main className="app detail-page sun art-page">
        <button type="button" className="back-button" onClick={() => onNavigate('/art')}>
          뒤로
        </button>

        <section className="detail-hero game-hero">
          <div className="detail-badge">🖼</div>
          <div>
            <span className="eyebrow">ART GALLERY</span>
            <h1>3D 그림 갤러리</h1>
            <p>기기에 저장된 3D 캐릭터를 골라서 다시 돌려 보고 감상할 수 있어요.</p>
          </div>
        </section>

        <section className="detail-extra">
          <ArtGallery />
        </section>
      </main>
    </div>
  );
}

export default ArtGalleryPage;
