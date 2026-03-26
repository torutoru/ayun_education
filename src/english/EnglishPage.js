import SubjectPage from '../shared/SubjectPage';

const englishHighlights = [
  '파닉스 소리 듣기',
  '알파벳으로 시작하는 단어 보기',
  '알파벳을 직접 쓰며 모양 익히기'
];

function EnglishPage({ onNavigate }) {
  const submenu = (
    <div className="detail-card submenu-card">
      <div className="submenu-header">
        <div>
          <span className="eyebrow">ENGLISH SUBMENU</span>
          <h2>영어 게임 선택하기</h2>
        </div>
        <p>파닉스와 알파벳 쓰기를 함께 연습할 수 있도록 영어 놀이를 나누어 두었습니다.</p>
      </div>

      <div className="submenu-grid submenu-grid-two">
        <button
          type="button"
          className="submenu-button sky"
          onClick={() => onNavigate('/phonics')}
        >
          <span className="submenu-emoji sky">Ph</span>
          <strong>[파닉스] 알파벳 단어 발음 게임</strong>
          <span>카드를 보고 소리를 들으면서 알파벳과 단어를 연결해요.</span>
        </button>

        <button
          type="button"
          className="submenu-button sky"
          onClick={() => onNavigate('/alphabet_write')}
        >
          <span className="submenu-emoji sky">Aa</span>
          <strong>알파벳 쓰기 게임</strong>
          <span>그리기 판에 알파벳을 쓰고, 판별 결과를 확인해요.</span>
        </button>
      </div>
    </div>
  );

  return (
    <SubjectPage
      title="영어 놀이"
      emoji="A"
      theme="sky"
      subtitle="알파벳과 기본 단어를 밝고 재미있게 익혀요."
      highlights={englishHighlights}
      onNavigate={onNavigate}
      extraSection={submenu}
    />
  );
}

export default EnglishPage;
