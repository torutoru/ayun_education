const TEXT = {
  eyebrow: '보기 메뉴',
  title: '알맞은 숫자를 골라요',
  solved: '정답을 맞혔어요!'
};

function BeakerActionPanel({ choices, onSelect, disabled, selectedChoice, correctChoice, selectionState }) {
  return (
    <aside className="beaker-info-card beaker-choice-card">
      <span className="eyebrow">{TEXT.eyebrow}</span>
      <strong className="beaker-choice-title">{TEXT.title}</strong>
      {selectionState === 'correct' ? <p className="beaker-choice-description">{TEXT.solved}</p> : null}

      <div className="beaker-choice-grid">
        {choices.map((choice) => {
          const isSelected = selectedChoice === choice;
          const isCorrectSelected = selectionState === 'correct' && choice === correctChoice;
          const className = [
            'submenu-button',
            'mint',
            'beaker-choice-button',
            isSelected ? 'selected' : '',
            isCorrectSelected ? 'correct' : ''
          ].filter(Boolean).join(' ');

          return (
            <button
              key={choice}
              type="button"
              className={className}
              onClick={() => onSelect(choice)}
              disabled={disabled}
            >
              <strong>{choice}</strong>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default BeakerActionPanel;
