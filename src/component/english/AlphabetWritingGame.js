import { useMemo, useRef, useState } from 'react';
import AlphabetDrawingCanvas from './AlphabetDrawingCanvas';
import { ALPHABET_LETTERS, evaluateAlphabetDrawing } from './alphabetWritingUtils';

function getFeedbackMessage(result, targetLetter) {
  if (result.isEmpty) {
    return {
      tone: 'idle',
      title: 'Draw first',
      description: 'Write the target letter on the board and then press Check.'
    };
  }

  if (result.isCorrect) {
    return {
      tone: 'success',
      title: 'Correct',
      description: 'Great job. The drawing matches ' + targetLetter + '.'
    };
  }

  return {
    tone: 'error',
    title: 'Try again',
    description:
      result.guessedLetter
        ? 'It looks more like ' + result.guessedLetter + '. Please try writing ' + targetLetter + ' again.'
        : 'The shape is still hard to read. Please try writing ' + targetLetter + ' again.'
  };
}

function AlphabetWritingGame() {
  const canvasApiRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState({
    tone: 'idle',
    title: 'Ready',
    description: 'Listen to the teacher, draw the letter, and check the answer.'
  });
  const [lastResult, setLastResult] = useState(null);
  const [hasInk, setHasInk] = useState(false);

  const targetLetter = ALPHABET_LETTERS[currentIndex];
  const progressText = useMemo(() => currentIndex + 1 + ' / ' + ALPHABET_LETTERS.length, [currentIndex]);

  const moveToLetter = (nextIndex) => {
    setCurrentIndex(nextIndex);
    setFeedback({
      tone: 'idle',
      title: 'Ready',
      description: 'Write the letter ' + ALPHABET_LETTERS[nextIndex] + ' on the board.'
    });
    setLastResult(null);
    setHasInk(false);
  };

  const handleClear = () => {
    canvasApiRef.current?.clear();
    setLastResult(null);
    setFeedback({
      tone: 'idle',
      title: 'Cleared',
      description: 'The board is empty again. Try writing ' + targetLetter + '.'
    });
  };

  const handleCheck = () => {
    const canvas = canvasApiRef.current?.getCanvas();

    if (!canvas) {
      return;
    }

    const result = evaluateAlphabetDrawing(canvas, targetLetter);
    setLastResult(result);
    setFeedback(getFeedbackMessage(result, targetLetter));
  };

  const handlePrev = () => {
    if (currentIndex === 0) {
      return;
    }

    moveToLetter(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex === ALPHABET_LETTERS.length - 1) {
      return;
    }

    moveToLetter(currentIndex + 1);
  };

  const confidenceText = lastResult && !lastResult.isEmpty ? Math.round(lastResult.confidence * 100) + '%' : '--';

  return (
    <section className="alphabet-writing-layout">
      <div className="detail-card alphabet-target-card">
        <div className="alphabet-target-header">
          <div>
            <span className="eyebrow">TARGET LETTER</span>
            <h2>{targetLetter}</h2>
          </div>
          <span className="alphabet-progress-chip">{progressText}</span>
        </div>
        <p className="alphabet-target-copy">Trace the shape in your mind, then write the same letter on the drawing board.</p>
        <div className="alphabet-target-preview" aria-hidden="true">
          {targetLetter}
        </div>
      </div>

      <div className="detail-card alphabet-draw-card">
        <div className="alphabet-card-header">
          <div>
            <span className="eyebrow">DRAW BOARD</span>
            <h2>Write {targetLetter}</h2>
          </div>
          <span className={hasInk ? 'alphabet-ink-chip filled' : 'alphabet-ink-chip'}>
            {hasInk ? 'Ink ready' : 'Start drawing'}
          </span>
        </div>

        <AlphabetDrawingCanvas
          ref={canvasApiRef}
          targetLetter={targetLetter}
          onInkChange={setHasInk}
        />

        <div className="alphabet-action-row">
          <button type="button" className="submenu-button sky alphabet-action-button" onClick={handleClear}>
            Clear
          </button>
          <button type="button" className="submenu-button sky alphabet-action-button primary" onClick={handleCheck}>
            Check
          </button>
        </div>
      </div>

      <div className="detail-card alphabet-result-card">
        <span className="eyebrow">MVP ANALYSIS</span>
        <div className={'alphabet-result-tone ' + feedback.tone}>{feedback.title}</div>
        <p className="alphabet-result-copy">{feedback.description}</p>

        <div className="alphabet-result-stats">
          <div className="alphabet-stat-box">
            <span>Detected</span>
            <strong>{lastResult?.guessedLetter || '--'}</strong>
          </div>
          <div className="alphabet-stat-box">
            <span>Confidence</span>
            <strong>{confidenceText}</strong>
          </div>
        </div>

        <div className="alphabet-nav-row">
          <button
            type="button"
            className="submenu-button sky alphabet-nav-button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            Prev Letter
          </button>
          <button
            type="button"
            className="submenu-button sky alphabet-nav-button"
            onClick={handleNext}
            disabled={currentIndex === ALPHABET_LETTERS.length - 1}
          >
            Next Letter
          </button>
        </div>
      </div>
    </section>
  );
}

export default AlphabetWritingGame;
