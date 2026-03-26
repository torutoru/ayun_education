import { useEffect, useMemo, useRef, useState } from 'react';
import PhonicsStage from '../component/english/PhonicsStage';
import PhonicsSoundCard from '../component/english/PhonicsSoundCard';
import PhonicsProgressPanel from '../component/english/PhonicsProgressPanel';
import phonixData from '../game_data/english/game_data_utils';

function stopCurrentAudio(audioRef) {
  if (!audioRef.current) {
    return;
  }

  audioRef.current.pause();
  audioRef.current.currentTime = 0;
}

function PhonicsPage({ onNavigate }) {
  const audioRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const phonicsCards = useMemo(
    () =>
      Object.entries(phonixData).map(([letter, value]) => ({
        id: letter,
        letter: letter.toUpperCase(),
        soundsrc: value.soundsrc,
        phonetic: value.phonetic,
        cardImage: value.cardImage
      })),
    []
  );
  const card = phonicsCards[currentIndex];

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePrev = () => {
    stopCurrentAudio(audioRef);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    stopCurrentAudio(audioRef);
    setCurrentIndex((prev) => Math.min(phonicsCards.length - 1, prev + 1));
  };

  const handlePlaySound = () => {
    if (!card?.soundsrc) {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    stopCurrentAudio(audioRef);
    audioRef.current.src = card.soundsrc;
    audioRef.current.play().catch(() => {});
  };

  return (
    <div className="app-shell">
      <main className="app detail-page sky phonics-page">
        <button type="button" className="back-button" onClick={() => onNavigate('/english')}>
          뒤로
        </button>

        <section className="detail-hero game-hero">
          <div className="detail-badge">Ph</div>
          <div>
            <span className="eyebrow">ENGLISH GAME</span>
            <h1>[파닉스] 알파벳 단어 발음 게임</h1>
            <p>파닉스 소리와 카드 이미지를 함께 보면서 알파벳 발음을 익히는 페이지입니다.</p>
          </div>
        </section>

        <section className="detail-extra phonics-layout">
          <PhonicsStage card={card} />
          <div className="phonics-side-column">
            <PhonicsSoundCard card={card} onPlaySound={handlePlaySound} />
            <PhonicsProgressPanel
              currentIndex={currentIndex}
              totalCount={phonicsCards.length}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default PhonicsPage;
