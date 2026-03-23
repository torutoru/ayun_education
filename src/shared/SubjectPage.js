function SubjectPage({ title, emoji, theme, subtitle, highlights, onNavigate, extraSection }) {
  return (
    <div className="app-shell">
      <main className={`app detail-page ${theme}`}>
        <button type="button" className="back-button" onClick={() => onNavigate('/')}>
          홈으로
        </button>

        <section className="detail-hero">
          <div className="detail-badge">{emoji}</div>
          <div>
            <span className="eyebrow">LEARNING PAGE</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </section>

        <section className="detail-body">
          <div className="detail-card">
            <h2>오늘 해볼 활동</h2>
            <div className="highlight-list">
              {highlights.map((item) => (
                <div className="highlight-item" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="detail-card note-card">
            <h2>부모 가이드</h2>
            <p>
              한 번에 길게 하기보다 5분 안팎으로 짧게 반복하면 집중하기 좋습니다.
            </p>
            <button type="button" onClick={() => onNavigate('/')}>
              다른 놀이 고르기
            </button>
          </div>
        </section>

        {extraSection ? <section className="detail-extra">{extraSection}</section> : null}
      </main>
    </div>
  );
}

export default SubjectPage;