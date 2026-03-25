const CUP_CAPACITY = 10;

function renderCells(total, filled, showGuideCells, showCellNumbers) {
  return Array.from({ length: total }, (_, index) => {
    const level = total - index;
    const isFilled = level <= filled;
    const className = [
      'beaker-unit-cell',
      isFilled ? 'filled' : 'empty',
      !isFilled && !showGuideCells ? 'guide-hidden' : ''
    ].filter(Boolean).join(' ');

    return (
      <div
        key={`${total}-${filled}-${level}`}
        className={className}
        aria-label={`${level} ${isFilled ? 'filled' : 'empty'}`}
      >
        {isFilled && showCellNumbers ? <span className="beaker-cell-number">{level}</span> : null}
      </div>
    );
  });
}

function BeakerColumn({ filled, overflowing = false, showGuideCells, showCellNumbers = false }) {
  const shellClassName = ['beaker-shell', 'units', overflowing ? 'overflowing' : ''].filter(Boolean).join(' ');

  return (
    <div className="beaker-shell-wrap">
      <div className={shellClassName}>{renderCells(CUP_CAPACITY, filled, showGuideCells, showCellNumbers)}</div>
      {overflowing ? <div className="beaker-overflow-water" aria-hidden="true" /> : null}
    </div>
  );
}

function FormulaBlank({ selectedChoice, selectionState }) {
  const className = ['beaker-formula-blank', selectedChoice !== null ? 'filled' : '', selectionState || '']
    .filter(Boolean)
    .join(' ');

  return (
    <span className={className} aria-label="unknown number">
      <span className="beaker-formula-blank-value">{selectedChoice ?? ''}</span>
    </span>
  );
}

function BeakerFillStage({
  currentLiters,
  targetLiters,
  displayFill,
  selectedChoice,
  overflowAmount,
  showFailMark,
  selectionState,
  roundIndex,
  totalRounds,
  showGuideCells,
  showCellNumbers
}) {
  return (
    <section className="beaker-stage-card beaker-stage-shell">
      <div className="beaker-stage-header">
        <span className="eyebrow">WATER CUP STAGE</span>
        <span className="beaker-round-indicator">{roundIndex + 1} / {totalRounds}</span>
      </div>

      <div className="beaker-stage-board">
        <div className="beaker-stage-slot cup">
          <BeakerColumn filled={displayFill} overflowing={overflowAmount > 0} showGuideCells={showGuideCells} showCellNumbers={showCellNumbers} />
        </div>
        <div className="beaker-stage-slot arrow" aria-hidden="true">=</div>
        <div className="beaker-stage-slot cup">
          <BeakerColumn filled={targetLiters} showGuideCells={showGuideCells} showCellNumbers={showCellNumbers} />
        </div>
      </div>

      <div className="beaker-stage-board beaker-stage-board-formula" aria-label="water cup equation">
        <div className="beaker-stage-slot formula-value">
          <span className="beaker-formula-value">{currentLiters}</span>
        </div>
        <div className="beaker-stage-slot formula-symbol" aria-hidden="true">
          <span className="beaker-formula-symbol">+</span>
        </div>
        <div className="beaker-stage-slot formula-value">
          <FormulaBlank selectedChoice={selectedChoice} selectionState={selectionState} />
        </div>
        <div className="beaker-stage-slot formula-symbol" aria-hidden="true">
          <span className="beaker-formula-symbol">=</span>
        </div>
        <div className="beaker-stage-slot formula-value">
          <span className="beaker-formula-value">{targetLiters}</span>
        </div>
      </div>

      {showFailMark ? <div className="beaker-stage-fail-mark" aria-hidden="true">X</div> : null}
    </section>
  );
}

export default BeakerFillStage;
