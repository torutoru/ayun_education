function PhonicsSoundCard({ card, onPlaySound }) {
  return (
    <section className="phonics-sound-card">
      <span className="eyebrow">TARGET SOUND</span>
      <div className="phonics-sound-bubble">{card.phonetic}</div>
      <p>{'Press play to hear the phonics guide audio for this alphabet.'}</p>
      <button type="button" className="submenu-button sky phonics-sound-button" onClick={onPlaySound}>
        {'Play Sound'}
      </button>
    </section>
  );
}

export default PhonicsSoundCard;