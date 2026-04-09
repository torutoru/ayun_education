import SubjectPage from '../shared/SubjectPage';

const artHighlights = [
  '큰 캔버스에 자유롭게 선 그리기',
  '색연필처럼 여러 색을 골라 칠하기',
  '하얀 도화지에서 마음껏 그림 그리기'
];

function ArtPage({ onNavigate }) {
  const submenu = (
    <div className="detail-card submenu-card">
      <div className="submenu-header">
        <div>
          <span className="eyebrow">ART SUBMENU</span>
          <h2>미술 놀이 시작하기</h2>
        </div>
        <p>아무 그림도 없는 하얀 도화지에서 자유롭게 표현할 수 있어요.</p>
      </div>

      <div className="submenu-grid">
        <button type="button" className="submenu-button sun" onClick={() => onNavigate('/art_studio')}>
          <span className="submenu-emoji sun">미</span>
          <strong>그림판 놀이터</strong>
          <span>붓과 지우개로 하얀 도화지에 원하는 그림을 그려요.</span>
        </button>
      </div>
    </div>
  );

  return (
    <SubjectPage
      title="미술 놀이터"
      emoji="🎨"
      theme="sun"
      subtitle="하얀 도화지 위에서 자유롭게 그리고 지우며 창의력을 펼쳐요."
      highlights={artHighlights}
      onNavigate={onNavigate}
      extraSection={submenu}
    />
  );
}

export default ArtPage;
