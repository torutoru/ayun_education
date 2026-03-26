import SubjectPage from '../shared/SubjectPage';

const TEXT = {
  highlight1: '오늘의 숫자: 5',
  highlight2: '2개와 1개를 비교해 보기',
  highlight3: '크고 작음을 비교하기',
  heading: '수학 게임 선택하기',
  description: '숫자와 양을 눈으로 비교하고 직접 채워 보는 체험형 수학 게임을 준비했어요.',
  easyTitle: '물잔 채우기(쉬움)',
  easyDescription: '컵 안에 가이드 칸과 숫자가 보여서 시작하기 쉬운 버전이에요.',
  mediumTitle: '물잔 채우기(중간)',
  mediumDescription: '가이드 없이 물의 높이를 보고 계산하는 버전이에요.',
  balanceTitle: '양팔 저울 맞추기',
  balanceDescription: '왼쪽 돌과 같은 무게가 되도록 오른쪽 돌을 골라 저울을 수평으로 맞춰요.',
  title: '수학 여행',
  subtitle: '숫자를 세고, 크기를 보고, 간단한 규칙을 찾아봐요.'
};

const mathHighlights = [TEXT.highlight1, TEXT.highlight2, TEXT.highlight3];

function MathPage({ onNavigate }) {
  const submenu = (
    <div className="detail-card submenu-card">
      <div className="submenu-header">
        <div>
          <span className="eyebrow">MATH SUBMENU</span>
          <h2>{TEXT.heading}</h2>
        </div>
        <p>{TEXT.description}</p>
      </div>

      <div className="submenu-grid">
        <button type="button" className="submenu-button mint" onClick={() => onNavigate('/beaker_fill')}>
          <span className="submenu-emoji mint">ML</span>
          <strong>{TEXT.easyTitle}</strong>
          <span>{TEXT.easyDescription}</span>
        </button>
        <button type="button" className="submenu-button mint" onClick={() => onNavigate('/beaker_fill_medium')}>
          <span className="submenu-emoji mint">ML</span>
          <strong>{TEXT.mediumTitle}</strong>
          <span>{TEXT.mediumDescription}</span>
        </button>
        <button type="button" className="submenu-button mint" onClick={() => onNavigate('/balance_scale')}>
          <span className="submenu-emoji mint">저울</span>
          <strong>{TEXT.balanceTitle}</strong>
          <span>{TEXT.balanceDescription}</span>
        </button>
      </div>
    </div>
  );

  return (
    <SubjectPage
      title={TEXT.title}
      emoji="3"
      theme="mint"
      subtitle={TEXT.subtitle}
      highlights={mathHighlights}
      onNavigate={onNavigate}
      extraSection={submenu}
    />
  );
}

export default MathPage;
