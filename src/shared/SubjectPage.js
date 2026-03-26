function SubjectPage({ title, emoji, theme, subtitle, highlights, onNavigate, extraSection }) {
  return (
    <div className="app-shell">
      <main className={`app detail-page ${theme}`}>
        <button type="button" className="back-button" onClick={() => onNavigate('/')}>
          뒤로
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
            <h2>오늘 배울 내용</h2>
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
            <p>한 번에 길게 하기보다 5분씩 나누어 반복하면 아이가 더 편하게 익힐 수 있어요.</p>
            <button type="button" onClick={() => onNavigate('/')}>
              다른 과목 고르기
            </button>
          </div>
        </section>

        {extraSection ? <section className="detail-extra">{extraSection}</section> : null}
      </main>
    </div>
  );
}

export default SubjectPage;
