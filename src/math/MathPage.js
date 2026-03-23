import SubjectPage from '../shared/SubjectPage';

const mathHighlights = ['오늘의 숫자: 5', '사과 2개 + 1개', '크고 작음 비교하기'];

function MathPage({ onNavigate }) {
  return (
    <SubjectPage
      title="수학 놀이"
      emoji="3"
      theme="mint"
      subtitle="숫자를 세고, 모양을 보고, 간단한 규칙을 찾아봐요."
      highlights={mathHighlights}
      onNavigate={onNavigate}
    />
  );
}

export default MathPage;