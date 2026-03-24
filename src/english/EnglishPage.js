import SubjectPage from '../shared/SubjectPage';

const phonicsHighlights = [
  '파닉스 소리 듣기',
  '알파벳으로 시작하는 단어 보기',
  '발음 따라 읽기 연습'
];

function EnglishPage({ onNavigate }) {
  const submenu = (
    <div className="detail-card submenu-card">
      <div className="submenu-header">
        <div>
          <span className="eyebrow">ENGLISH SUBMENU</span>
          <h2>영어 게임 선택하기</h2>
        </div>
        <p>파닉스 소리와 기본 단어 발음을 리듬감 있게 연습할 수 있어요.</p>
      </div>

      <div className="submenu-grid">
        <button
          type="button"
          className="submenu-button sky"
          onClick={() => onNavigate('/phonics')}
        >
          <span className="submenu-emoji sky">Ph</span>
          <strong>[파닉스] 알파벳 단어 발음</strong>
          <span>알파벳과 단어를 보고 소리를 연결하는 영어 파닉스이에요.</span>
        </button>
      </div>
    </div>
  );

  return (
    <SubjectPage
      title="영어 터미"
      emoji="A"
      theme="sky"
      subtitle="알파벳과 상황 단어를 리듬감 있게 익혀요."
      highlights={phonicsHighlights}
      onNavigate={onNavigate}
      extraSection={submenu}
    />
  );
}

export default EnglishPage;