# PROJECT_CONTEXT

## 프로젝트 개요
- 프로젝트명: Ayun Education
- 목적: 5살 아이를 위한 한글, 영어, 수학 학습 웹 프로젝트
- 서버 없이 동작하는 CRA 기반 프론트엔드 프로젝트
- 주요 사용 환경: 스마트 TV 브라우저, 태블릿, 일반 브라우저

## 현재 구조
- 라우팅은 `window.history.pushState` 기반 커스텀 방식 사용
- 주요 경로
  - `/`
  - `/korean`
  - `/avoid_tiger`
  - `/math`
  - `/beaker_fill`
  - `/beaker_fill_medium`
  - `/english`
  - `/phonics`
  - `/alphabet_write`
- 페이지 컨테이너
  - `src/App.js`
  - `src/korean/KoreanPage.js`
  - `src/korean/AvoidTigerPage.js`
  - `src/math/MathPage.js`
  - `src/math/BeakerFillPage.js`
  - `src/math/BeakerFillMediumPage.js`
  - `src/english/EnglishPage.js`
  - `src/english/PhonicsPage.js`
  - `src/english/AlphabetWritePage.js`
- 과목별 컴포넌트 규칙
  - 한글 관련 컴포넌트는 `src/component/korean` 아래에 둔다.
  - 영어 관련 컴포넌트는 `src/component/english` 아래에 둔다.
  - 수학 관련 컴포넌트는 `src/component/math` 아래에 둔다.
  - 앞으로도 기능을 분리할 때는 `src/component/{subject}` 구조를 유지한다.

## 한글 게임 구조
- 데이터 파일
  - `src/game_data/korean/game_data.json`: 카테고리별 단어 목록
  - `src/game_data/korean/example.json`: 보기 글자 샘플
- 주요 컴포넌트
  - `StartDialog`
  - `GuideMessage`
  - `ChaseScene`
  - `WordQuestionCard`
  - `WordChoiceGrid`
  - `FailOverlay`
  - `SuccessOverlay`
  - `wordGameUtils`

## 호랑이 피하기 규칙
- 총 문제 수는 5개
- 전체 제한 시간은 35초
- 거리 모델은 숫자 기반으로 계산
  - 전체 거리: 10
  - 호랑이 시작 위치: 0
  - 사람 시작 위치: 5
  - 집 위치: 10
- 호랑이는 시간 기준으로 계속 이동
  - 속도: 초당 `10 / 35`
- 사람은 정답을 맞힐 때마다 한 칸씩 이동
  - `5 -> 6 -> 7 -> 8 -> 9 -> 10`
- 판정 규칙
  - 호랑이 위치가 사람 위치 이상이면 즉시 실패
  - 사람 위치가 10에 도달하면 성공

## 수학 게임 구조
- 수학 메인에서는 물잔 채우기 쉬움/중간 두 버전 제공
- 쉬움: 컵 안 가이드 칸과 채워진 칸 번호 표시
- 중간: 컵 안 가이드 칸 숨김
- 공통 로직은 `src/component/math/WaterCupGame.js` 사용
- 한 문제당 보기 3개, 정답은 반드시 포함
- 총 5문제 랜덤 진행

## 영어 게임 구조
- 파닉스 게임
  - `src/english/PhonicsPage.js`
  - 카드 이미지와 발음 오디오 사용
- 알파벳 쓰기 게임
  - `src/english/AlphabetWritePage.js`
  - `src/component/english/AlphabetDrawingCanvas.js`
  - `src/component/english/AlphabetWritingGame.js`
  - 현재 판별식은 브라우저 내 단순 비교 MVP 상태
  - 실제 브라우저 내 ML 모델 전환이 필요함

## 디자인 및 반응형 규칙
- 스마트 TV 브라우저 사용을 전제로 반응형 레이아웃을 기본으로 고려한다.
- 전체 화면, 모바일, TV 화면 모두에서 의미가 유지되어야 한다.
- 고정 px 값만으로 배치하지 말고 `clamp`, 상대값, 반응형 기준을 우선 사용한다.
- 버튼과 텍스트는 멀리서도 잘 보여야 한다.

## 인코딩 및 문서 규칙
- 모든 텍스트 파일은 UTF-8 기준으로 저장한다.
- 가능하면 UTF-8 without BOM을 유지한다.
- 소스 코드와 문서에는 사람이 읽을 수 있는 실제 한글을 적는다.
- `\uXXXX` 형태의 유니코드 이스케이프 한글은 사용하지 않는다.
- PowerShell로 파일을 통째로 다시 쓸 때 한글이 깨질 수 있으므로 주의한다.
- 한글이 깨진 파일을 발견하면 다음 작업 전에 먼저 정상 한글로 복구한다.
- `PROJECT_CONTEXT.md`도 같은 규칙을 따른다.

## 주의 사항
- 정적 호스팅에서는 direct URL 접근 시 SPA rewrite 설정이 필요하다.
- Netlify용 SPA redirect는 `public/_redirects`로 관리한다.
- 스마트 TV 브라우저에서는 이미지 원본이 크면 느리므로 압축과 해상도 최적화가 중요하다.

## 다음 세션 시작 시 확인할 것
- `PROJECT_CONTEXT.md`
- `src/App.js`
- `src/korean/AvoidTigerPage.js`
- `src/component/korean`
- `src/component/math`
- `src/component/english`
- `src/App.css`
