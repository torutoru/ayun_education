import SubjectPage from '../shared/SubjectPage';

const koreanHighlights = ['오늘의 글자: ㅁ', '동물 이름 읽기', '받침 없는 낱말 따라 읽기'];

function KoreanPage({ onNavigate }) {
  const submenu = (
    <div className="detail-card submenu-card">
      <div className="submenu-header">
        <div>
          <span className="eyebrow">KOREAN SUBMENU</span>
          <h2>한글 놀이 더 해보기</h2>
        </div>
        <p>작은 게임과 활동으로 글자에 더 친숙해질 수 있어요.</p>
      </div>

      <div className="submenu-grid">
        <button
          type="button"
          className="submenu-button peach"
          onClick={() => onNavigate('/avoid_tiger')}
        >
          <span className="submenu-emoji">호</span>
          <strong>호랑이 피하기</strong>
          <span>게임 페이지로 이동해서 한글 미션과 함께 놀아요.</span>
        </button>
      </div>
    </div>
  );

  return (
    <SubjectPage
      title="한글 놀이터"
      emoji="가"
      theme="peach"
      subtitle="소리를 듣고, 글자를 보고, 입으로 따라 말해요."
      highlights={koreanHighlights}
      onNavigate={onNavigate}
      extraSection={submenu}
    />
  );
}

export default KoreanPage;