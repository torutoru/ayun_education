import SubjectPage from '../shared/SubjectPage';

const TEXT = {
  highlight1: '\uC624\uB298\uC758 \uC22B\uC790: 5',
  highlight2: '2\uAC1C\uC640 1\uAC1C\uB97C \uBE44\uAD50\uD574 \uBCF4\uAE30',
  highlight3: '\uD06C\uACE0 \uC791\uC74C\uC744 \uBE44\uAD50\uD558\uAE30',
  heading: '\uC218\uD559 \uAC8C\uC784 \uC120\uD0DD\uD558\uAE30',
  description: '\uC22B\uC790\uC640 \uC591\uC744 \uB208\uC73C\uB85C \uBE44\uAD50\uD558\uACE0 \uC9C1\uC811 \uCC44\uC6CC\uBCF4\uB294 \uCCB4\uD5D8\uD615 \uC218\uD559 \uAC8C\uC784\uC744 \uC900\uBE44\uD588\uC5B4\uC694.',
  easyTitle: '\uBB3C\uC794 \uCC44\uC6B0\uAE30(\uC26C\uC6C0)',
  easyDescription: '\uCEF5 \uC548\uC5D0 \uBE48\uCE78 \uAC00\uC774\uB4DC\uAC00 \uBCF4\uC774\uB294 \uBC84\uC804\uC73C\uB85C \uC2DC\uC791\uD574\uC694.',
  mediumTitle: '\uBB3C\uC794 \uCC44\uC6B0\uAE30(\uC911\uAC04)',
  mediumDescription: '\uCEF5 \uC548\uC758 \uAC00\uC774\uB4DC \uC5C6\uC774 \uBB3C\uC758 \uB192\uC774\uB97C \uBCF4\uACE0 \uACC4\uC0B0\uD574\uC694.',
  title: '\uC218\uD559 \uC5EC\uD589',
  subtitle: '\uC22B\uC790\uB97C \uC138\uACE0, \uD06C\uAE30\uB97C \uBCF4\uACE0, \uAC04\uB2E8\uD55C \uADDC\uCE59\uC744 \uCC3E\uC544\uBD10\uC694.'
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
        <button
          type="button"
          className="submenu-button mint"
          onClick={() => onNavigate('/beaker_fill')}
        >
          <span className="submenu-emoji mint">ML</span>
          <strong>{TEXT.easyTitle}</strong>
          <span>{TEXT.easyDescription}</span>
        </button>
        <button
          type="button"
          className="submenu-button mint"
          onClick={() => onNavigate('/beaker_fill_medium')}
        >
          <span className="submenu-emoji mint">ML</span>
          <strong>{TEXT.mediumTitle}</strong>
          <span>{TEXT.mediumDescription}</span>
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
