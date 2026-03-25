import { useEffect, useState } from 'react';
import './App.css';
import KoreanPage from './korean/KoreanPage';
import AvoidTigerPage from './korean/AvoidTigerPage';
import MathPage from './math/MathPage';
import BeakerFillPage from './math/BeakerFillPage';
import BeakerFillMediumPage from './math/BeakerFillMediumPage';
import EnglishPage from './english/EnglishPage';
import PhonicsPage from './english/PhonicsPage';
import homeImage from './assert/ay_home_1.jpeg';
import homeImageTwo from './assert/ay_home_2.jpeg';
import homeImageThree from './assert/ay_home_3.jpeg';

const homeButtons = [
  {
    label: '\uD55C\uAE00',
    path: '/korean',
    emoji: '\uAC00',
    accent: 'peach',
    description: '\uC790\uC74C, \uBAA8\uC74C, \uC18C\uB9AC \uAE30\uBCF8\uBD80\uD130 \uCC28\uADFC\uCC28\uADFC \uC2DC\uC791\uD574\uC694.'
  },
  {
    label: '\uC218\uD559',
    path: '/math',
    emoji: '1 2 3',
    accent: 'mint',
    description: '\uC22B\uC790 \uC138\uAE30, \uBE44\uAD50\uD558\uAE30, \uC26C\uC6B4 \uACC4\uC0B0\uC744 \uBC30\uC6CC\uC694.'
  },
  {
    label: '\uC601\uC5B4',
    path: '/english',
    emoji: 'A B C',
    accent: 'sky',
    description: '\uC54C\uD30C\uBCB3, \uD30C\uB2C9\uC2A4, \uAE30\uBCF8 \uB2E8\uC5B4\uB97C \uC7AC\uBBF8\uC788\uAC8C \uC775\uD600\uC694.'
  }
];

const pageComponents = {
  '/korean': KoreanPage,
  '/avoid_tiger': AvoidTigerPage,
  '/math': MathPage,
  '/beaker_fill': BeakerFillPage,
  '/beaker_fill_medium': BeakerFillMediumPage,
  '/english': EnglishPage,
  '/phonics': PhonicsPage
};

function getCurrentPath() {
  const { pathname } = window.location;
  return pageComponents[pathname] ? pathname : '/';
}

function HomePage({ onNavigate }) {
  return (
    <div className="app-shell">
      <div className="floating floating-star">{'\u2605'}</div>
      <div className="floating floating-heart">{'\u2665'}</div>
      <div className="floating floating-cloud">{'\u2601'}</div>
      <main className="app home-page">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">AYUN EDUCATION</span>
            <h1>{'\uC624\uB298\uC740 \uC5B4\uB5A4 \uACF5\uBD80\uB97C \uC2DC\uC791\uD560\uAE4C?'}</h1>
            <p>{'\uC544\uC774\uAC00 \uBC1D\uACE0 \uD070 \uBC84\uD2BC\uC73C\uB85C \uACFC\uBAA9\uC744 \uACE0\uB974\uACE0, \uAC8C\uC784\uCC98\uB7FC \uC990\uAC81\uAC8C \uBC30\uC6B8 \uC218 \uC788\uB3C4\uB85D \uB9CC\uB4E0 \uD648 \uD654\uBA74\uC774\uC5D0\uC694.'}</p>
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
          <h2>{'\uBC30\uC6B0\uACE0 \uC2F6\uC740 \uACFC\uBAA9\uC744 \uB20C\uB7EC\uC694'}</h2>
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
