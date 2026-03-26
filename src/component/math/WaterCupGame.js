import { useEffect, useRef, useState } from 'react';
import BeakerFillStage from './BeakerFillStage';
import BeakerActionPanel from './BeakerActionPanel';
import BeakerFailDialog from './BeakerFailDialog';
import BeakerCompleteDialog from './BeakerCompleteDialog';

const TOTAL_ROUNDS = 5;
const MIN_TARGET = 5;
const MAX_TARGET = 10;
const CUP_CAPACITY = 10;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(items) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function pickRandom(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function createChoices(answer) {
  const selected = [answer];
  const lowerPool = [];
  const upperPool = [];

  for (let value = 1; value <= 9; value += 1) {
    if (value === answer) {
      continue;
    }

    if (value < answer) {
      lowerPool.push(value);
    } else {
      upperPool.push(value);
    }
  }

  if (lowerPool.length > 0) {
    selected.push(pickRandom(lowerPool));
  }

  if (upperPool.length > 0 && selected.length < 3) {
    selected.push(pickRandom(upperPool));
  }

  const remainingPool = [];
  for (let value = 1; value <= 9; value += 1) {
    if (!selected.includes(value)) {
      remainingPool.push(value);
    }
  }

  while (selected.length < 3 && remainingPool.length > 0) {
    const picked = pickRandom(remainingPool);
    selected.push(picked);
    remainingPool.splice(remainingPool.indexOf(picked), 1);
  }

  return shuffle(selected);
}

function createRound() {
  const targetLiters = randomInt(MIN_TARGET, MAX_TARGET);
  const missingLiters = randomInt(1, targetLiters - 1);
  const currentLiters = targetLiters - missingLiters;

  return {
    currentLiters,
    targetLiters,
    correctChoice: missingLiters,
    choices: createChoices(missingLiters)
  };
}

function WaterCupGame({ title, onNavigate, showGuideCells, showCellNumbers = false }) {
  const nextRoundTimerRef = useRef(null);
  const dialogTimerRef = useRef(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState(() => createRound());
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [displayFill, setDisplayFill] = useState(round.currentLiters);
  const [overflowAmount, setOverflowAmount] = useState(0);
  const [showFailMark, setShowFailMark] = useState(false);
  const [showFailDialog, setShowFailDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectionState, setSelectionState] = useState('idle');

  const clearTimers = () => {
    if (nextRoundTimerRef.current) {
      clearTimeout(nextRoundTimerRef.current);
      nextRoundTimerRef.current = null;
    }

    if (dialogTimerRef.current) {
      clearTimeout(dialogTimerRef.current);
      dialogTimerRef.current = null;
    }
  };

  useEffect(() => clearTimers, []);

  const resetStageState = (nextRound) => {
    setSelectedChoice(null);
    setDisplayFill(nextRound.currentLiters);
    setOverflowAmount(0);
    setShowFailMark(false);
    setShowFailDialog(false);
    setIsAnimating(false);
    setSelectionState('idle');
  };

  const startNextRound = (nextIndex) => {
    const nextRound = createRound();
    setRoundIndex(nextIndex);
    setRound(nextRound);
    resetStageState(nextRound);
  };

  const restartGame = () => {
    clearTimers();
    setShowCompleteDialog(false);
    startNextRound(0);
  };

  const handleChoiceSelect = (choice) => {
    if (isAnimating || showFailDialog || showCompleteDialog) {
      return;
    }

    if (selectionState === 'wrong' && selectedChoice === choice) {
      resetStageState(round);
      return;
    }

    clearTimers();

    const nextFill = round.currentLiters + choice;
    const isCorrect = nextFill === round.targetLiters;
    const isOverflow = nextFill > CUP_CAPACITY;

    setSelectedChoice(choice);
    setDisplayFill(Math.min(nextFill, CUP_CAPACITY));
    setOverflowAmount(Math.max(0, nextFill - CUP_CAPACITY));
    setShowFailMark(false);
    setShowFailDialog(false);

    if (isCorrect) {
      setSelectionState('correct');
      setIsAnimating(true);
      const nextIndex = roundIndex + 1;

      nextRoundTimerRef.current = setTimeout(() => {
        if (nextIndex >= TOTAL_ROUNDS) {
          setIsAnimating(false);
          setShowCompleteDialog(true);
          return;
        }

        startNextRound(nextIndex);
      }, 700);
      return;
    }

    if (isOverflow) {
      setSelectionState('overflow');
      setIsAnimating(true);
      dialogTimerRef.current = setTimeout(() => {
        setShowFailMark(true);
        setShowFailDialog(true);
        setIsAnimating(false);
      }, 700);
      return;
    }

    setSelectionState('wrong');
    setIsAnimating(false);
  };

  const handleFailConfirm = () => {
    clearTimers();
    resetStageState(round);
  };

  return (
    <div className="app-shell">
      <main className="app detail-page mint beaker-page">
        <button type="button" className="back-button" onClick={() => onNavigate('/math')}>
          {'뒤로'}
        </button>

        <section className="detail-hero game-hero">
          <div className="detail-badge">ML</div>
          <div>
            <span className="eyebrow">MATH GAME</span>
            <h1>{title}</h1>
          </div>
        </section>

        <section className="detail-extra beaker-layout beaker-play-layout">
          <BeakerFillStage
            currentLiters={round.currentLiters}
            targetLiters={round.targetLiters}
            displayFill={displayFill}
            selectedChoice={selectedChoice}
            overflowAmount={overflowAmount}
            showFailMark={showFailMark}
            selectionState={selectionState}
            roundIndex={roundIndex}
            totalRounds={TOTAL_ROUNDS}
            showGuideCells={showGuideCells}
            showCellNumbers={showCellNumbers}
          />
          <BeakerActionPanel
            choices={round.choices}
            onSelect={handleChoiceSelect}
            disabled={isAnimating || showFailDialog || showCompleteDialog}
            selectedChoice={selectedChoice}
            correctChoice={round.correctChoice}
            selectionState={selectionState}
          />
        </section>

        <BeakerFailDialog open={showFailDialog} onConfirm={handleFailConfirm} />
        <BeakerCompleteDialog open={showCompleteDialog} onConfirm={restartGame} />
      </main>
    </div>
  );
}

export default WaterCupGame;
