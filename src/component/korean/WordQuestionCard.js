function WordQuestionCard({ question, currentIndex, totalCount, selectedChoice }) {
  const isCorrectChoice = selectedChoice && selectedChoice === question.missingSyllable;
  const blankStateClass = isCorrectChoice
    ? 'correct'
    : selectedChoice
      ? 'incorrect'
      : 'idle';

  return (
    <section className="word-question-card compact">
      <div className="word-question-meta">
        <div className="word-category-group">
          <span className="eyebrow">CATEGORY</span>
          <strong className="word-category-value">{question.categoryLabel}</strong>
        </div>
        <span className="question-progress">
          {currentIndex + 1} / {totalCount}
        </span>
      </div>
      <div className="word-mask-wrap compact">
        <div className="word-mask" aria-label={question.maskedWord}>
          {question.maskedWord.split('').map((letter, index) =>
            letter === 'O' ? (
              <span
                key={`${question.id}-blank-${index}`}
                className={`word-mask-blank ${selectedChoice ? 'filled' : ''} ${blankStateClass}`}
                aria-hidden="true"
              >
                {selectedChoice ? <span className="word-mask-choice-text">{selectedChoice}</span> : null}
              </span>
            ) : (
              <span key={`${question.id}-letter-${index}`} className="word-mask-letter">
                {letter}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}

export default WordQuestionCard;