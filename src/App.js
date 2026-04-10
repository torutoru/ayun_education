import { useEffect, useState } from 'react';
import './App.css';
import KoreanPage from './korean/KoreanPage';
import AvoidTigerPage from './korean/AvoidTigerPage';
import MathPage from './math/MathPage';
import BeakerFillPage from './math/BeakerFillPage';
import BeakerFillMediumPage from './math/BeakerFillMediumPage';
import BalanceScalePage from './math/BalanceScalePage';
import EnglishPage from './english/EnglishPage';
import PhonicsPage from './english/PhonicsPage';
import AlphabetWritePage from './english/AlphabetWritePage';
import ArtPage from './art/ArtPage';
import ArtStudioPage from './art/ArtStudioPage';
import ArtGalleryPage from './art/ArtGalleryPage';
import homeImage from './assert/ay_home_1.jpeg';
import homeImageTwo from './assert/ay_home_2.jpeg';
import homeImageThree from './assert/ay_home_3.jpeg';

const homeButtons = [
  {
    label: '한글',
    path: '/korean',
    emoji: '가',
    accent: 'peach',
    description: '자음, 모음, 소리 기본부터 차근차근 시작해요.'
  },
  {
    label: '수학',
    path: '/math',
    emoji: '1 2 3',
    accent: 'mint',
    description: '숫자 세기, 비교하기, 쉬운 계산을 배워요.'
  },
  {
    label: '영어',
    path: '/english',
    emoji: 'A B C',
    accent: 'sky',
    description: '알파벳, 파닉스, 기본 단어를 재미있게 익혀요.'
  },
  {
    label: '미술',
    path: '/art',
    emoji: '🎨',
    accent: 'sun',
    description: '그림을 그리고 색칠하면서 자유롭게 표현해요.'
  }
];

const pageComponents = {
  '/korean': KoreanPage,
  '/avoid_tiger': AvoidTigerPage,
  '/math': MathPage,
  '/beaker_fill': BeakerFillPage,
  '/beaker_fill_medium': BeakerFillMediumPage,
  '/balance_scale': BalanceScalePage,
  '/english': EnglishPage,
  '/phonics': PhonicsPage,
  '/alphabet_write': AlphabetWritePage,
  '/art': ArtPage,
  '/art_studio': ArtStudioPage,
  '/art_gallery': ArtGalleryPage
};

function getCurrentPath() {
  const pathname = window.location.pathname;
  return pageComponents[pathname] ? pathname : '/';
}

function HomePage({ onNavigate }) {
  return (
    <div className="app-shell">
      <div className="floating floating-star">*</div>
      <div className="floating floating-heart">o</div>
      <div className="floating floating-cloud">~</div>
      <main className="app home-page">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">AYUN EDUCATION</span>
            <h1>{'오늘은 어떤 공부를 시작할까?'}</h1>
            <p>{'아이가 밝고 큰 버튼으로 과목을 고르고, 게임처럼 즐겁게 배울 수 있도록 만든 홈 화면이에요.'}</p>
          </div>
          <div className="hero-stage">
            <div className="hero-photo-wrap">
              <img className="hero-photo" src={homeImage} alt="home hero" />
            </div>
            <div className="hero-photo-mini mini-peach">
              <img className="hero-photo" src={homeImageTwo} alt="home side 1" />
            </div>
            <div className="hero-photo-mini mini-yellow">
              <img className="hero-photo" src={homeImageThree} alt="home side 2" />
            </div>
          </div>
        </section>

        <section className="button-section">
          <h2>{'배우고 싶은 과목을 눌러요'}</h2>
          <div className="home-grid">
            {homeButtons.map((button) => (
              <button
                type="button"
                key={button.path}
                className={['home-card', button.accent].join(' ')}
                onClick={() => onNavigate(button.path)}
              >
                <span className="home-card-emoji">{button.emoji}</span>
                <strong>{button.label}</strong>
                <span>{button.description}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  const [path, setPath] = useState(getCurrentPath);

  useEffect(() => {
    const handlePopState = () => {
      setPath(getCurrentPath());
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const moveTo = (nextPath) => {
    if (nextPath === path) {
      return;
    }

    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  };

  if (path === '/') {
    return <HomePage onNavigate={moveTo} />;
  }

  const PageComponent = pageComponents[path];

  return <PageComponent onNavigate={moveTo} />;
}

export default App;
