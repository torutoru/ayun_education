function PhonicsStage({ card }) {
  return (
    <section className="phonics-stage-card">
      <span className="eyebrow">PHONICS STAGE</span>
      <div className="phonics-stage-main">
        <div className="phonics-stage-copy centered">
          <div className="phonics-letter-badge">{card.letter}</div>
          <img className="phonics-card-image" src={card.cardImage} alt={`${card.letter} phonics card`} />
          <p>{`${card.letter} sound card`}</p>
        </div>
      </div>
    </section>
  );
}

export default PhonicsStage;