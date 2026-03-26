function StoneStack({ count, variant, label }) {
  return (
    <div className={['balance-stone-stack', variant].join(' ')} aria-label={label}>
      {Array.from({ length: count }, (_, index) => (
        <div key={[variant, index].join('-')} className={['balance-stone', variant].join(' ')}>
          <span>{index + 1}</span>
        </div>
      ))}
    </div>
  );
}

function BalanceScaleStage({
  targetWeight,
  currentWeight,
  selectedWeight,
  roundIndex,
  totalRounds,
  selectionState,
  tiltDirection,
  showSuccessFlash
}) {
  const beamClassName = ['balance-scale-stage', tiltDirection ? 'tilt-' + tiltDirection : '']
    .filter(Boolean)
    .join(' ');

  return (
    <section className="beaker-stage-card balance-stage-card">
      <div className="beaker-stage-header">
        <span className="eyebrow">BALANCE SCALE STAGE</span>
        <span className="beaker-round-indicator">{roundIndex + 1} / {totalRounds}</span>
      </div>

      <div className={beamClassName}>
        <div className="balance-hanger" />
        <div className="balance-stand" />
        <div className="balance-foot" />

        <div className="balance-real-beam">
          <div className="balance-pan-group left">
            <div className="balance-ropes" />
            <div className="balance-pan selectable">
              <div className="balance-right-stack">
                <StoneStack count={currentWeight} variant="current" label={'?? ? ' + currentWeight + '?'} />
                {selectedWeight !== null ? (
                  <StoneStack count={selectedWeight} variant="added" label={'?? ? ' + selectedWeight + '?'} />
                ) : (
                  <div className="balance-empty-slot">?</div>
                )}
              </div>
            </div>
          </div>

          <div className="balance-pivot" />

          <div className="balance-pan-group right">
            <div className="balance-ropes" />
            <div className="balance-pan">
              <StoneStack count={targetWeight} variant="target" label={'?? ? ' + targetWeight + '?'} />
            </div>
          </div>
        </div>
      </div>

      <div className="balance-formula" aria-label="balance equation">
        <span className="balance-formula-value">{currentWeight}</span>
        <span className="balance-formula-symbol">+</span>
        <span className={['beaker-formula-blank', selectedWeight !== null ? 'filled' : '', selectionState || 'idle'].filter(Boolean).join(' ')}>
          <span className="beaker-formula-blank-value">{selectedWeight ?? ''}</span>
        </span>
        <span className="balance-formula-symbol">=</span>
        <span className="balance-formula-value">{targetWeight}</span>
      </div>

      {showSuccessFlash ? <div className="balance-success-flash">??!</div> : null}
    </section>
  );
}

export default BalanceScaleStage;
