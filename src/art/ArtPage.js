import SubjectPage from '../shared/SubjectPage';

const artHighlights = [
  '큰 캔버스에 자유롭게 선 그리기',
  '색연필처럼 여러 색을 골라 칠하기',
  '그림을 3D 캐릭터와 애니메이션으로 이어 보기'
];

function ArtPage({ onNavigate }) {
  const submenu = (
    <div className="detail-card submenu-card">
      <div className="submenu-header">
        <div>
          <span className="eyebrow">ART SUBMENU</span>
          <h2>미술 놀이 시작하기</h2>
        </div>
        <p>그림을 그리고 나면 3D 캐릭터 생성과 재생까지 이어서 체험할 수 있어요.</p>
      </div>

      <div className="submenu-grid">
        <button type="button" className="submenu-button sun" onClick={() => onNavigate('/art_studio')}>
          <span className="submenu-emoji sun">미</span>
          <strong>그림판 놀이터</strong>
          <span>그림을 그린 뒤 3D 모델, 리깅, 애니메이션 파이프라인으로 이어 가요.</span>
        </button>
        <button type="button" className="submenu-button sun" onClick={() => onNavigate('/art_gallery')}>
          <span className="submenu-emoji sun">3D</span>
          <strong>3D 그림 갤러리</strong>
          <span>IndexedDB에 저장된 3D 그림을 골라 다시 재생해요.</span>
        </button>
      </div>
    </div>
  );

  return (
    <SubjectPage
      title="미술 놀이터"
      emoji="🎨"
      theme="sun"
      subtitle="자유롭게 캐릭터를 그리고, 움직이는 3D 작품으로 이어 보세요."
      highlights={artHighlights}
      onNavigate={onNavigate}
      extraSection={submenu}
    />
  );
}

export default ArtPage;
