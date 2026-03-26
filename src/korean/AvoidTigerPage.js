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
  const [message, setMessage] = useState('시작 버튼을 누르면 카운트다운 뒤에 바로 게임이 시작돼요.');
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
    setMessage('호랑이가 사람을 잡으러 달려오고 있어요.');
    failTimeoutRef.current = window.setTimeout(() => {
      setStatus('fail');
      setMessage('호랑이가 사람을 잡았어요. 다시 도전해요.');
    }, CATCH_ANIMATION_MS);
  };

  const beginRunningQuestion = () => {
    setStatus('running');
    setSelectedChoice('');
    setMessage('보기에서 빈칸에 들어갈 한 글자를 골라요.');
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
    setMessage('시작 버튼을 누르면 카운트다운 뒤에 바로 게임이 시작돼요.');
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
      setMessage('아직 아니에요. 빈칸에 들어갈 글자를 다시 골라보세요.');
      return;
    }

    clearGameTimers();

    const nextSolvedCount = solvedCountRef.current + 1;
    solvedCountRef.current = nextSolvedCount;
    setSolvedCount(nextSolvedCount);

    if (nextSolvedCount >= QUESTION_COUNT) {
      setStatus('success');
      setMessage('성공! 사람이 집에 무사히 도착했어요.');
      return;
    }

    setStatus('feedback');
    setMessage(`정답! ${currentQuestion.answerWord} 완성했어요.`);
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
          {'뒤로'}
        </button>

        <section className="detail-hero game-hero">
          <div className="detail-badge">{'호'}</div>
          <div>
            <span className="eyebrow">GAME PAGE</span>
            <h1>{'호랑이 피하기'}</h1>
            <p>{'카테고리를 보고 보기 중 한 글자를 골라 빈칸을 채워보세요.'}</p>
          </div>
        </section>

        <section className="detail-extra">
          <div className="detail-card game-card tiger-card">
            <div className="game-topbar compact">
              <div className="game-timer-box compact">
                <strong>{`${(timeLeft / 1000).toFixed(1)}초`}</strong>
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
