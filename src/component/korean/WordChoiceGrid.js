function WordChoiceGrid({ choices, selectedChoice, disabled, onChoose }) {
  return (
    <section className="word-choice-grid">
      {choices.map((choice) => (
        <button
          key={choice}
          type="button"
          className={`word-choice-button syllable-choice ${selectedChoice === choice ? 'selected' : ''}`}
          onClick={() => onChoose(choice)}
          disabled={disabled}
        >
          {choice}
        </button>
      ))}
    </section>
  );
}

export default WordChoiceGrid;