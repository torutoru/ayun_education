import { useEffect, useState } from 'react';
import './App.css';
import KoreanPage from './korean/KoreanPage';
import AvoidTigerPage from './korean/AvoidTigerPage';
import MathPage from './math/MathPage';
import EnglishPage from './english/EnglishPage';
import homeImage from './assert/ay_home_1.jpeg';
import homeImageTwo from './assert/ay_home_2.jpeg';
import homeImageThree from './assert/ay_home_3.jpeg';

const homeButtons = [
  {
    label: '한글',
    path: '/korean',
    emoji: '가',
    accent: 'peach',
    description: '자음, 모음, 쉬운 낱말을 재미있게 시작해요.'
  },
  {
    label: '수학',
    path: '/math',
    emoji: '1 2 3',
    accent: 'mint',
    description: '숫자 세기, 비교하기, 쉬운 더하기를 배워요.'
  },
  {
    label: '영어',
    path: '/english',
    emoji: 'A B C',
    accent: 'sky',
    description: '알파벳, 색깔, 인사말을 따라 말해요.'
  }
];

const pageComponents = {
  '/korean': KoreanPage,
  '/avoid_tiger': AvoidTigerPage,
  '/math': MathPage,
  '/english': EnglishPage
};

function getCurrentPath() {
  const { pathname } = window.location;
  return pageComponents[pathname] ? pathname : '/';
}

function HomePage({ onNavigate }) {
  return (
    <div className="app-shell">
      <div className="floating floating-star">★</div>
      <div className="floating floating-heart">♥</div>
      <div className="floating floating-cloud">☁</div>
      <main className="app home-page">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">AYUN EDUCATION</span>
            <h1>오늘은 어떤 놀이부터 시작할까?</h1>
          </div>
          <div className="hero-stage">
            <div className="hero-photo-wrap">
              <img className="hero-photo" src={homeImage} alt="아이 학습 홈 화면 장식" />
            </div>
            <div className="hero-photo-mini mini-peach">
              <img className="hero-photo" src={homeImageTwo} alt="홈 화면 보조 사진 1" />
            </div>
            <div className="hero-photo-mini mini-yellow">
              <img className="hero-photo" src={homeImageThree} alt="홈 화면 보조 사진 2" />
            </div>
          </div>
        </section>

        <section className="button-section">
          <h2>배우고 싶은 놀이를 눌러요</h2>
          <div className="home-grid">
            {homeButtons.map((button) => (
              <button
                type="button"
                key={button.path}
                className={`home-card ${button.accent}`}
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