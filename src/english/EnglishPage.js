import SubjectPage from '../shared/SubjectPage';

const englishHighlights = ['오늘의 단어: Apple', 'ABC 소리 내기', 'Hello, Bye 따라 말하기'];

function EnglishPage({ onNavigate }) {
  return (
    <SubjectPage
      title="영어 타임"
      emoji="A"
      theme="sky"
      subtitle="알파벳과 쉬운 단어를 리듬감 있게 익혀요."
      highlights={englishHighlights}
      onNavigate={onNavigate}
    />
  );
}

export default EnglishPage;