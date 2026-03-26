import { useEffect, useRef, useState } from 'react';
import BalanceScaleStage from './BalanceScaleStage';
import BalanceChoicePanel from './BalanceChoicePanel';
import BalanceFailDialog from './BalanceFailDialog';
import BalanceCompleteDialog from './BalanceCompleteDialog';

const TOTAL_ROUNDS = 5;
const MIN_TARGET = 5;
const MAX_TARGET = 10;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(items) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temp = next[index];
    next[index] = next[swapIndex];
    next[swapIndex] = temp;
  }

  return next;
}

function createChoices(answer) {
  const choices = [answer];
  const pool = [];

  for (let value = 1; value <= 9; value += 1) {
    if (value !== answer) {
      pool.push(value);
    }
  }

  while (choices.length < 3 && pool.length > 0) {
    const pickedIndex = Math.floor(Math.random() * pool.length);
    choices.push(pool[pickedIndex]);
    pool.splice(pickedIndex, 1);
  }

  return shuffle(choices);
}

function createRound() {
  const targetWeight = randomInt(MIN_TARGET, MAX_TARGET);
  const currentWeight = randomInt(1, targetWeight - 1);
  const correctWeight = targetWeight - currentWeight;

  return {
    targetWeight,
    currentWeight,
    correctWeight,
    choices: createChoices(correctWeight)
  };
}

function getTiltDirection(targetWeight, currentWeight, selectedWeight) {
  const leftWeight = currentWeight + (selectedWeight ?? 0);

  if (leftWeight === targetWeight) {
    return 'balanced';
  }

  return leftWeight > targetWeight ? 'left' : 'right';
}

function BalanceScaleGame({ title, onNavigate }) {
  const nextRoundTimerRef = useRef(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState(createRound);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectionState, setSelectionState] = useState('idle');
  const [showFailDialog, setShowFailDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    return () => {
      if (nextRoundTimerRef.current) {
        clearTimeout(nextRoundTimerRef.current);
      }
    };
  }, []);

  const resetCurrentRound = () => {
    setSelectedWeight(null);
    setSelectionState('idle');
    setShowFailDialog(false);
    setShowSuccessFlash(false);
    setIsAnimating(false);
  };

  const startNextRound = (nextIndex) => {
    const nextRound = createRound();
    setRoundIndex(nextIndex);
    setRound(nextRound);
    setSelectedWeight(null);
    setSelectionState('idle');
    setShowFailDialog(false);
    setShowSuccessFlash(false);
    setIsAnimating(false);
  };

  const restartGame = () => {
    setShowCompleteDialog(false);
    startNextRound(0);
  };

  const handleSelect = (weight) => {
    if (isAnimating || showFailDialog || showCompleteDialog) {
      return;
    }

    if (selectionState === 'wrong' && selectedWeight === weight) {
      resetCurrentRound();
      return;
    }

    setSelectedWeight(weight);

    if (weight === round.correctWeight) {
      setSelectionState('correct');
      setShowSuccessFlash(true);
      setIsAnimating(true);
      const nextIndex = roundIndex + 1;

      nextRoundTimerRef.current = setTimeout(() => {
        if (nextIndex >= TOTAL_ROUNDS) {
          setShowSuccessFlash(false);
          setIsAnimating(false);
          setShowCompleteDialog(true);
          return;
        }

        startNextRound(nextIndex);
      }, 850);
      return;
    }

    setSelectionState('wrong');
    setShowFailDialog(true);
  };

  const tiltDirection = getTiltDirection(round.targetWeight, round.currentWeight, selectedWeight);

  return (
    <div className="app-shell">
      <main className="app detail-page mint balance-page">
        <button type="button" className="back-button" onClick={() => onNavigate('/math')}>
          뒤로
        </button>

        <section className="detail-hero game-hero">
          <div className="detail-badge">저울</div>
          <div>
            <span className="eyebrow">MATH GAME</span>
            <h1>{title}</h1>
            <p>목표 무게에 맞도록 현재 돌에 추가할 돌을 골라보세요.</p>
          </div>
        </section>

        <section className="detail-extra beaker-layout beaker-play-layout">
          <BalanceScaleStage
            targetWeight={round.targetWeight}
            currentWeight={round.currentWeight}
            selectedWeight={selectedWeight}
            roundIndex={roundIndex}
            totalRounds={TOTAL_ROUNDS}
            selectionState={selectionState}
            tiltDirection={tiltDirection}
            showSuccessFlash={showSuccessFlash}
          />
          <BalanceChoicePanel
            choices={round.choices}
            onSelect={handleSelect}
            disabled={isAnimating || showFailDialog || showCompleteDialog}
            selectedWeight={selectedWeight}
            selectionState={selectionState}
          />
        </section>

        <BalanceFailDialog open={showFailDialog} onConfirm={resetCurrentRound} />
        <BalanceCompleteDialog open={showCompleteDialog} onConfirm={restartGame} />
      </main>
    </div>
  );
}

export default BalanceScaleGame;
