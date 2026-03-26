function BalanceChoicePanel({
  choices,
  onSelect,
  disabled,
  selectedWeight,
  selectionState
}) {
  return (
    <section className="beaker-info-card balance-choice-card">
      <div className="submenu-header balance-choice-header">
        <div>
          <span className="eyebrow">BALANCE CHOICES</span>
          <h2>추가할 돌 고르기</h2>
        </div>
        <p>오른쪽 접시에 더할 돌을 골라서 맟은 무게를 맞춰보세요.</p>
      </div>

      <div className="balance-choice-grid">
        {choices.map((weight) => {
          const isSelected = selectedWeight === weight;
          const className = [
            'submenu-button',
            'mint',
            'balance-choice-button',
            isSelected ? 'selected' : '',
            isSelected && selectionState === 'wrong' ? 'wrong' : '',
            isSelected && selectionState === 'correct' ? 'correct' : ''
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={weight}
              type="button"
              className={className}
              onClick={() => onSelect(weight)}
              disabled={disabled}
            >
              <span className="submenu-emoji mint">돌</span>
              <strong>{weight}</strong>
              <span>{weight}개 무게 돌 추가하기</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default BalanceChoicePanel;
