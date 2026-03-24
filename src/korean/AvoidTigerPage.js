import { useEffect, useMemo, useRef, useState } from 'react';
import StartDialog from '../component/korean/StartDialog';
import GuideMessage from '../component/korean/GuideMessage';
import ChaseScene from '../component/korean/ChaseScene';
import WordQuestionCard from '../component/korean/WordQuestionCard';
import WordChoiceGrid from '../component/korean/WordChoiceGrid';
import FailOverlay from '../component/korean/FailOverlay';
import SuccessOverlay from '../component/korean/SuccessOverlay';
import {
  TOTAL_GAME_DURATION,
  QUESTION_COUNT,
  PLAYER_START_POSITION,
  TIGER_START_POSITION,
  TIGER_SPEED_PER_SECOND,
  COUNTDOWN_STEPS,
  FEEDBACK_DELAY_MS,
  CATCH_ANIMATION_MS,
  createQuestionSet
} from '../component/korean/wordGameUtils';

function AvoidTigerPage({ onNavigate }) {
  const timerRef = useRef(null);
  const failTimeoutRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);
  const countdownTimeoutsRef = useRef([]);
  const solvedCountRef = useRef(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_GAME_DURATION);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('\uC2DC\uC791 \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uCE74\uC6B4\uD2B8\uB2E4\uC6B4 \uB4A4\uC5D0 \uBC14\uB85C \uAC8C\uC784\uC774 \uC2DC\uC791\uB3FC\uC694.');
  const [selectedChoice, setSelectedChoice] = useState('');
  const [dialogState, setDialogState] = useState('ready');
  const [countdownText, setCountdownText] = useState('3');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [questions, setQuestions] = useState(() => createQuestionSet());

  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);
  const isRunning = status === 'running';
  const isCatching = status === 'catching';
  const isFail = status === 'fail';
  const isSuccess = status === 'success';
  const isDialogOpen = dialogState !== 'hidden';
  const elapsedSeconds = (TOTAL_GAME_DURATION - timeLeft) / 1000;
  const tigerPosition = TIGER_START_POSITION + elapsedSeconds * TIGER_SPEED_PER_SECOND;
  const playerPosition = PLAYER_START_POSITION + solvedCount;
  const timeRatio = timeLeft / TOTAL_GAME_DURATION;

  useEffect(() => {
    solvedCountRef.current = solvedCount;
  }, [solvedCount]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (failTimeoutRef.current) {
        window.clearTimeout(failTimeoutRef.current);
      }
      if (feedbackTimeoutRef.current) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
      countdownTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  const clearCountdowns = () => {
    countdownTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    countdownTimeoutsRef.current = [];
  };

  const clearGameTimers = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (failTimeoutRef.current) {
      window.clearTimeout(failTimeoutRef.current);
      failTimeoutRef.current = null;
    }
    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
  };

  const triggerFailSequence = () => {
    clearGameTimers();
    setStatus('catching');
    setMessage('\uD638\uB791\uC774\uAC00 \uC0AC\uB78C\uC744 \uC7A1\uC73C\uB7EC \uB2EC\uB824\uC624\uACE0 \uC788\uC5B4\uC694.');
    failTimeoutRef.current = window.setTimeout(() => {
      setStatus('fail');
      setMessage('\uD638\uB791\uC774\uAC00 \uC0AC\uB78C\uC744 \uC7A1\uC558\uC5B4\uC694. \uB2E4\uC2DC \uB3C4\uC804\uD574\uC694.');
    }, CATCH_ANIMATION_MS);
  };

  const beginRunningQuestion = () => {
    setStatus('running');
    setSelectedChoice('');
    setMessage('\uBCF4\uAE30\uC5D0\uC11C \uBE48\uCE78\uC5D0 \uB4E4\uC5B4\uAC08 \uD55C \uAE00\uC790\uB97C \uACE8\uB77C\uC694.');
  };

  const startGlobalTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 100;
        const boundedNext = Math.max(0, next);
        const elapsed = (TOTAL_GAME_DURATION - boundedNext) / 1000;
        const nextTigerPosition = TIGER_START_POSITION + elapsed * TIGER_SPEED_PER_SECOND;
        const nextPlayerPosition = PLAYER_START_POSITION + solvedCountRef.current;

        if (nextTigerPosition >= nextPlayerPosition) {
          triggerFailSequence();
          return boundedNext;
        }

        return boundedNext;
      });
    }, 100);
  };

  const resetGameState = () => {
    clearGameTimers();
    setQuestions(createQuestionSet());
    setCurrentIndex(0);
    setSolvedCount(0);
    solvedCountRef.current = 0;
    setSelectedChoice('');
    setStatus('idle');
    setTimeLeft(TOTAL_GAME_DURATION);
  };

  const openStartDialog = () => {
    clearCountdowns();
    resetGameState();
    setMessage('\uC2DC\uC791 \uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uCE74\uC6B4\uD2B8\uB2E4\uC6B4 \uB4A4\uC5D0 \uBC14\uB85C \uAC8C\uC784\uC774 \uC2DC\uC791\uB3FC\uC694.');
    setDialogState('ready');
    setCountdownText('3');
  };

  const handleDialogStart = () => {
    clearCountdowns();
    setDialogState('countdown');
    setCountdownText(COUNTDOWN_STEPS[0]);

    COUNTDOWN_STEPS.forEach((text, index) => {
      const timeoutId = window.setTimeout(() => {
        setCountdownText(text);
      }, index * 1000);
      countdownTimeoutsRef.current.push(timeoutId);
    });

    const startTimeoutId = window.setTimeout(() => {
      setDialogState('hidden');
      beginRunningQuestion();
      startGlobalTimer();
    }, COUNTDOWN_STEPS.length * 1000);

    countdownTimeoutsRef.current.push(startTimeoutId);
  };

  const handleChoice = (choice) => {
    if (!isRunning || isDialogOpen || isFail || isCatching || isSuccess) {
      return;
    }

    setSelectedChoice(choice);

    if (choice !== currentQuestion.missingSyllable) {
      setMessage('\uC544\uC9C1 \uC544\uB2C8\uC5D0\uC694. \uBE48\uCE78\uC5D0 \uB4E4\uC5B4\uAC08 \uAE00\uC790\uB97C \uB2E4\uC2DC \uACE8\uB77C\uBCF4\uC138\uC694.');
      return;
    }

    clearGameTimers();

    const nextSolvedCount = solvedCountRef.current + 1;
    solvedCountRef.current = nextSolvedCount;
    setSolvedCount(nextSolvedCount);

    if (nextSolvedCount >= QUESTION_COUNT) {
      setStatus('success');
      setMessage('\uC131\uACF5! \uC0AC\uB78C\uC774 \uC9D1\uC5D0 \uBB34\uC0AC\uD788 \uB3C4\uCC29\uD588\uC5B4\uC694.');
      return;
    }

    setStatus('feedback');
    setMessage(`\uC815\uB2F5! ${currentQuestion.answerWord} \uC644\uC131\uD588\uC5B4\uC694.`);
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      beginRunningQuestion();
      startGlobalTimer();
    }, FEEDBACK_DELAY_MS);
  };

  return (
    <div className="app-shell">
      <main className="app detail-page peach game-page">
        <button type="button" className="back-button" onClick={() => onNavigate('/korean')}>
          {'\uB4A4\uB85C'}
        </button>

        <section className="detail-hero game-hero">
          <div className="detail-badge">{'\uD638'}</div>
          <div>
            <span className="eyebrow">GAME PAGE</span>
            <h1>{'\uD638\uB791\uC774 \uD53C\uD558\uAE30'}</h1>
            <p>{'\uCE74\uD14C\uACE0\uB9AC\uB97C \uBCF4\uACE0 \uBCF4\uAE30 \uC911 \uD55C \uAE00\uC790\uB97C \uACE8\uB77C \uBE48\uCE78\uC744 \uCC44\uC6CC\uBCF4\uC138\uC694.'}</p>
          </div>
        </section>

        <section className="detail-extra">
          <div className="detail-card game-card tiger-card">
            <div className="game-topbar compact">
              <div className="game-timer-box compact">
                <strong>{`${(timeLeft / 1000).toFixed(1)}\uCD08`}</strong>
                <div className="game-timer-track">
                  <div className="game-timer-fill" style={{ transform: `scaleX(${timeRatio})` }} />
                </div>
              </div>
            </div>

            <div className="tiger-game-shell compact-layout">
              <GuideMessage message={message} status={status} />
              <ChaseScene
                tigerPosition={tigerPosition}
                playerPosition={playerPosition}
                isSuccess={isSuccess}
                isCatching={isCatching}
                isFail={isFail}
              />
              <WordQuestionCard
                question={currentQuestion}
                currentIndex={currentIndex}
                totalCount={questions.length}
                selectedChoice={selectedChoice}
              />
              <WordChoiceGrid
                choices={currentQuestion.choices}
                selectedChoice={selectedChoice}
                disabled={!isRunning || isDialogOpen || isFail || isCatching || isSuccess}
                onChoose={handleChoice}
              />
              {status === 'feedback' ? <div className="game-correct-flash">O</div> : null}

              {isDialogOpen ? (
                <StartDialog
                  dialogState={dialogState}
                  countdownText={countdownText}
                  onStart={handleDialogStart}
                />
              ) : null}
              {isFail ? <FailOverlay onRetry={openStartDialog} /> : null}
              {isSuccess ? <SuccessOverlay onRetry={openStartDialog} /> : null}
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}

export default AvoidTigerPage;
