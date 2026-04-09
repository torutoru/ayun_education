# AGENT

## 목적
- 이 문서는 Codex 같은 작업 에이전트가 `ayun_education` 프로젝트를 빠르게 이해하고 안전하게 수정할 수 있도록 만든 작업용 컨텍스트 문서다.
- `PROJECT_CONTEXT.md`의 방향성을 유지하되, 실제 코드 구조와 수정 포인트 중심으로 정리한다.

## 프로젝트 한줄 요약
- 프로젝트명: Ayun Education
- 5살 아이를 위한 한글, 영어, 수학 학습용 React 웹앱이다.
- CRA(`react-scripts`) 기반이며 서버 없이 정적 호스팅 가능한 SPA 구조다.
- 주요 사용 환경은 스마트 TV 브라우저, 태블릿, 일반 브라우저다.

## 실행 방법
```bash
npm start
npm test
npm run build
```

## 기술 스택
- React 18
- Create React App (`react-scripts@5`)
- Testing Library
- CSS 파일 기반 스타일링
- 별도 라우터 없음. `window.history.pushState` 기반 커스텀 라우팅 사용

## 최상위 구조
- 진입점: `src/index.js`
- 라우팅/홈: `src/App.js`
- 공통 스타일: `src/App.css`, `src/index.css`
- 과목 메인 페이지
  - `src/korean/KoreanPage.js`
  - `src/math/MathPage.js`
  - `src/english/EnglishPage.js`
- 공통 과목 템플릿: `src/shared/SubjectPage.js`

## 라우팅 구조
`src/App.js`에서 현재 경로를 읽고, 컴포넌트를 직접 매핑한다.

- `/`: 홈
- `/korean`: 한글 메인
- `/avoid_tiger`: 한글 게임
- `/math`: 수학 메인
- `/beaker_fill`: 물잔 채우기 쉬움
- `/beaker_fill_medium`: 물잔 채우기 중간
- `/balance_scale`: 양팔 저울 맞추기
- `/english`: 영어 메인
- `/phonics`: 파닉스
- `/alphabet_write`: 알파벳 쓰기
- `/art`: 미술 메인
- `/art_studio`: 그림판 놀이터

중요:
- React Router가 없으므로 새 페이지를 추가할 때 `src/App.js`의 `pageComponents`와 홈/서브메뉴 진입 버튼을 함께 수정해야 한다.
- 정적 호스팅 direct URL 대응은 `public/_redirects`에서 처리한다.

## 디렉터리 규칙
- 한글 관련 컴포넌트: `src/component/korean`
- 영어 관련 컴포넌트: `src/component/english`
- 수학 관련 컴포넌트: `src/component/math`
- 게임 데이터: `src/game_data/{subject}`
- 페이지 컨테이너는 `src/{subject}` 아래에 둔다.

새 기능을 추가할 때도 위 구조를 유지하는 편이 안전하다.

## 과목별 구조

### 한글
- 메인 페이지: `src/korean/KoreanPage.js`
- 게임 페이지: `src/korean/AvoidTigerPage.js`
- 핵심 로직: `src/component/korean/wordGameUtils.js`
- 데이터:
  - `src/game_data/korean/game_data.json`
  - `src/game_data/korean/example.json`

호랑이 피하기 규칙:
- 총 5문제
- 총 제한 시간 35초
- 거리 모델은 숫자 기반으로 계산한다
  - 전체 거리: 10
  - 호랑이 시작 위치: 0
  - 사람 시작 위치: 5
  - 집 위치: 10
- 호랑이는 시간에 따라 전진
- 호랑이 속도는 초당 `10 / 35`다
- 플레이어는 정답을 맞힐 때마다 1칸 전진
- 사람 이동 경로는 `5 -> 6 -> 7 -> 8 -> 9 -> 10`이다
- 호랑이가 플레이어를 따라잡으면 실패
- 집에 도달하면 성공

수정 포인트:
- 문제 수/시간/속도/애니메이션 지연은 `wordGameUtils.js`의 상수부터 확인
- 문제 생성 로직도 `wordGameUtils.js`에 집중되어 있다
- 화면 구성은 `StartDialog`, `GuideMessage`, `ChaseScene`, `WordQuestionCard`, `WordChoiceGrid`, `FailOverlay`, `SuccessOverlay`로 분리되어 있다

### 수학
- 메인 페이지: `src/math/MathPage.js`
- 쉬움: `src/math/BeakerFillPage.js`
- 중간: `src/math/BeakerFillMediumPage.js`
- 저울: `src/math/BalanceScalePage.js`

공통 게임 로직:
- 물잔 채우기: `src/component/math/WaterCupGame.js`
- 양팔 저울: `src/component/math/BalanceScaleGame.js`

물잔 채우기 특징:
- 총 5라운드
- 정답 포함 3지선다
- 쉬움/중간 차이는 주로 `showGuideCells`, `showCellNumbers` prop 조합
- 쉬움은 컵 안 가이드 칸과 채워진 칸 번호를 보여준다
- 중간은 컵 안 가이드 칸을 숨긴다

양팔 저울 특징:
- 총 5라운드
- 목표 무게와 현재 무게 차이를 맞추는 구조
- 저울 기울기 방향은 `getTiltDirection`으로 계산

수정 포인트:
- 문제 생성 규칙을 바꾸려면 각 게임 파일의 `createRound`, `createChoices`를 먼저 본다
- 수학 UI는 `src/component/math` 내부의 stage/panel/dialog 컴포넌트 조합으로 구성된다

### 영어
- 메인 페이지: `src/english/EnglishPage.js`
- 파닉스: `src/english/PhonicsPage.js`
- 알파벳 쓰기: `src/english/AlphabetWritePage.js`

파닉스:
- 카드/발음 데이터는 `src/game_data/english/game_data_utils.js`
- UI는 `PhonicsStage`, `PhonicsSoundCard`, `PhonicsProgressPanel`
- 브라우저 `Audio` 객체를 직접 사용한다

알파벳 쓰기:
- 메인 로직: `src/component/english/AlphabetWritingGame.js`
- 캔버스: `src/component/english/AlphabetDrawingCanvas.js`
- 판별 로직: `src/component/english/alphabetWritingUtils.js`

현재 판별 방식:
- ML 모델이 아니라 캔버스 그림을 정규화한 뒤 기준 글자와 IoU 방식으로 비교하는 MVP다
- 정확도/민감도 조정은 `alphabetWritingUtils.js`의 상수(`GRID_SIZE`, `MIN_DRAWN_PIXELS`, `MIN_CONFIDENCE`)부터 보는 것이 좋다

### 미술
- 메인 페이지: `src/art/ArtPage.js`
- 그림판 페이지: `src/art/ArtStudioPage.js`
- 핵심 컴포넌트: `src/component/art/ArtStudio.js`

그림판 기능:
- 자유 그리기
- 지우개
- 색상 팔레트 선택
- 붓 굵기 선택
- 흰 도화지에서 바로 그리기
- 상단 툴바에서 아이콘 중심으로 도구를 선택

구현 메모:
- 그림판은 단일 캔버스 구조다
- 밑그림 없이 흰 도화지에 바로 그린다
- 지우개는 `destination-out` 방식으로 구현되어 있다
- 캔버스 크기는 `960 x 600` 기준으로 고정하고, CSS에서 반응형으로 축소 표시한다
- 도구는 텍스트 대신 아이콘 버튼 위주로 제공한다
- 연필/지우개는 툴바 버튼으로, 색상은 작은 네모 스와치로 노출한다

## 스타일링 규칙
- 대부분의 스타일은 `src/App.css`에 몰려 있다
- 과목 테마 색상은 CSS 변수와 `peach`, `mint`, `sky` 클래스 조합으로 처리한다
- TV 환경을 고려해 `clamp`, 큰 타이포, 큰 버튼, 넓은 여백을 많이 사용한다

작업 팁:
- 스타일 수정 시 `App.css`가 매우 크므로, 먼저 클래스명을 검색해서 영향 범위를 좁히는 것이 좋다
- 홈/과목/게임 스타일이 한 파일에 섞여 있으니 실수로 다른 페이지를 깨지 않게 주의한다

## 에이전트 작업 규칙
- 새 페이지를 추가하면 다음을 같이 점검한다
  - `src/App.js` 라우트 등록
  - 진입 버튼 추가
  - 뒤로 가기 동선
  - 정적 호스팅 direct URL 대응 필요 여부
- 새 과목/기능은 가능하면 `src/component/{subject}` 아래에 분리한다
- 랜덤 문제형 게임은 라운드 수, 정답 포함 여부, 실패/성공 후 상태 초기화가 유지되는지 확인한다
- 타이머가 있는 화면은 `useEffect` cleanup과 `setTimeout`/`setInterval` 정리를 꼭 확인한다

## 알려진 주의사항
- `PROJECT_CONTEXT.md`에서 강조하듯 모든 텍스트 파일은 UTF-8로 다뤄야 한다
- 가능하면 UTF-8 without BOM을 유지한다
- 소스 코드와 문서에는 사람이 읽을 수 있는 실제 한글을 사용한다
- `\uXXXX` 형태의 유니코드 이스케이프 한글은 사용하지 않는다
- PowerShell로 파일을 잘못 다시 쓰면 한글이 깨질 수 있다
- 실제로 현재 코드베이스 일부 파일에는 문자열 깨짐 흔적이 보인다
  - 특히 `src/App.js`
  - `README.md`

의미:
- 이 파일들을 수정할 때는 기존 문자열이 이미 깨져 있을 가능성을 전제로 조심해야 한다
- 한글이 깨진 파일을 건드릴 때는 먼저 인코딩 상태를 확인하고, 가능하면 정상 한글로 복구한 뒤 작업하는 편이 안전하다
- 한글이 깨진 파일을 발견하면 다음 작업 전에 먼저 정상 한글로 복구한다

## 우선 확인 파일
다음 파일을 읽으면 대부분의 작업 맥락을 빠르게 잡을 수 있다.

- `AGENT.md`
- `src/App.js`
- `src/shared/SubjectPage.js`
- `src/korean/AvoidTigerPage.js`
- `src/component/korean/wordGameUtils.js`
- `src/component/math/WaterCupGame.js`
- `src/component/math/BalanceScaleGame.js`
- `src/english/PhonicsPage.js`
- `src/component/english/AlphabetWritingGame.js`
- `src/component/english/alphabetWritingUtils.js`
- `src/App.css`

## 다음 작업자가 바로 이해해야 할 핵심
- 이 프로젝트는 "작은 교육용 미니게임 묶음"이다
- 페이지 이동은 라우터가 아니라 수동 path 매핑이다
- 스타일은 단일 대형 CSS 파일 중심이다
- 수학/한글 게임은 랜덤 라운드 기반 상태머신에 가깝다
- 영어 쓰기 게임은 아직 MVP 판별 로직이라 개선 여지가 크다
- 미술 그림판은 캔버스 기반이며, 자유 그리기와 윤곽선 색칠을 둘 다 지원한다
- 미술 그림판은 캔버스 기반이며, 흰 도화지에 자유 그리기와 지우개를 지원한다
- 인코딩 안정성이 중요하며, 한글 깨짐은 기능 버그만큼 우선순위가 높다

## 최근 주요 작업
- 미술 과목을 새로 추가했다
- 홈 화면에 미술 카드와 라우트(`/art`, `/art_studio`)를 연결했다
- 미술 메인 페이지와 그림판 놀이터 페이지를 추가했다
- 그림판을 밑그림 없는 흰 도화지 기반으로 단순화했다
- 그림판 툴바를 아이콘 중심 UI로 바꾸고, 도화지 영역을 더 넓게 확장했다

## 다음 세션 시작 시 확인할 것
- `AGENT.md`
- `src/App.js`
- `src/korean/AvoidTigerPage.js`
- `src/component/korean`
- `src/component/math`
- `src/component/english`
- `src/App.css`
