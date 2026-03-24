function PhonicsProgressPanel({ currentIndex, totalCount, onPrev, onNext }) {
  return (
    <section className="phonics-progress-card">
      <span className="eyebrow">GAME FLOW</span>
      <div className="phonics-progress-row">
        <strong>{`${currentIndex + 1} / ${totalCount}`}</strong>
        <div className="phonics-nav-buttons">
          <button
            type="button"
            className="submenu-button sky phonics-nav-button"
            onClick={onPrev}
            disabled={currentIndex === 0}
          >
            {'Prev'}
          </button>
          <button
            type="button"
            className="submenu-button sky phonics-nav-button"
            onClick={onNext}
            disabled={currentIndex === totalCount - 1}
          >
            {'Next'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default PhonicsProgressPanel;