function createPlaceholderChoices(letter) {
  const upper = letter.toUpperCase();
  return [upper, `${upper} sound`, `${upper} card`];
}

function PhonicsChoiceGrid({ card }) {
  const choices = card?.choices ?? createPlaceholderChoices(card?.letter ?? 'A');

  return (
    <section className="phonics-choice-card">
      <div className="phonics-choice-header">
        <span className="eyebrow">WORD CHOICES</span>
        <strong>{'Preview Components'}</strong>
      </div>
      <div className="phonics-choice-grid">
        {choices.map((choice) => (
          <button key={choice} type="button" className="phonics-choice-button">
            {choice}
          </button>
        ))}
      </div>
    </section>
  );
}

export default PhonicsChoiceGrid;