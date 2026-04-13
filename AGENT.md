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
- `three` 기반 GLB 재생
- Netlify Functions + Firebase Admin SDK
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
- 갤러리 페이지: `src/art/ArtGalleryPage.js`
- 핵심 컴포넌트: `src/component/art/ArtStudio.js`
- 3D 재생 컴포넌트: `src/component/art/ArtModelViewer.js`
- 갤러리 컴포넌트: `src/component/art/ArtGallery.js`
- 프론트 API 계층: `src/art/artPipelineApi.js`
- 로컬 저장 계층: `src/art/artStorage.js`
- 애니메이션 옵션: `src/art/animationOptions.js`

그림판 기능:
- 자유 그리기
- 지우개
- 색상 팔레트 선택
- 붓 굵기 선택
- 흰 도화지에서 바로 그리기
- 상단 툴바에서 아이콘 중심으로 도구를 선택
- 그림을 JPG로 내보내 Meshy 파이프라인으로 전달
- 최종 animated GLB를 IndexedDB에 저장
- 저장된 GLB를 브라우저에서 다시 재생
- 그림판 놀이터 화면 본문은 `CANVAS` 중심으로만 유지하고, 진행 상태는 작업 다이얼로그로 보여 준다
- 미술 서브메뉴에는 `그림판 놀이터`와 같은 레벨로 `3D 그림 갤러리`가 있다
- 갤러리 화면은 IndexedDB에 저장된 GLB 목록을 보여 주고, 선택한 항목을 3D로 렌더링한다

구현 메모:
- 그림판은 단일 캔버스 구조다
- 밑그림 없이 흰 도화지에 바로 그린다
- 지우개는 `destination-out` 방식으로 구현되어 있다
- 캔버스 크기는 `960 x 600` 기준으로 고정하고, CSS에서 반응형으로 축소 표시한다
- 도구는 텍스트 대신 아이콘 버튼 위주로 제공한다
- 연필/지우개는 툴바 버튼으로, 색상은 작은 네모 스와치로 노출한다
- 작업 메타데이터와 GLB Blob은 IndexedDB에 분리 저장한다
- 새로고침 후에도 진행 중 작업을 이어가기 위해 `jobs` 메타데이터를 읽고 파이프라인을 재개한다
- `3D 캐릭터 만들기`를 누르면 작업 진행 다이얼로그를 띄워 원본 그림 미리보기와 단계별 상태를 크게 보여 준다
- 작업 다이얼로그의 단계 표시는 세로 목록이 아니라 `그림 준비 > 3D 변환 > 리깅 > 애니메이션 > 기기 저장` 한 줄 진행형 UI를 사용한다
- 완료 단계는 회색, 현재 단계는 깜빡이며 굵게, 남은 단계는 검은색 텍스트로 표시한다
- 작업 다이얼로그는 화면보다 약간 작은 고정 높이로 유지하고, 스크롤 없이 이미지 영역을 다이얼로그 높이의 약 50% 안에서 가운데 정렬해 보여 준다
- 상태 텍스트와 단계 진행 표시도 이미지 아래에서 가운데 정렬한다
- 작업 다이얼로그의 이미지 박스는 미리보기 영역 일부가 아니라 다이얼로그 전체 높이 기준 약 50%를 직접 차지하도록 고정한다
- 작업 다이얼로그 레이아웃 순서는 `그림 > state > 결과`다
- `state`는 한 줄 진행형 단계 표시만 담당하고, `결과` 영역은 오류 메시지 또는 성공 후 `3D 보기` 버튼을 보여 준다
- `state` 텍스트 스타일 규칙:
  - 남은 작업: 검은색, 일반 굵기
  - 지난 작업: 옅은 회색, disabled처럼 보이게
  - 현재 진행 작업: 파란색, 볼드, 깜빡임
- 오류가 발생해도 state 줄 전체를 실패색으로 칠하지 않고, 실패 직전 단계만 강조하고 이전/이후 단계는 기존 규칙을 유지한다
- `get-image3d`, `get-remesh`, `get-rigging`, `get-animation` 응답의 `progress` 값을 현재 진행 단계 텍스트 옆에 `(30%)` 형식으로 표시한다

Meshy 연동 구조:
- 백엔드 오케스트레이션은 Netlify Functions로 여러 단계로 분리했다
- 함수 위치: `netlify/functions`
- Netlify 설정 파일: `netlify.toml`
- 공통 helper:
  - `netlify/functions/_lib/meshy.js`
  - `netlify/functions/_lib/http.js`
  - `netlify/functions/_lib/response.js`
  - `netlify/functions/_lib/firebaseAdmin.js`
- 단계별 함수:
  - `create-image3d`
  - `get-image3d`
  - `create-remesh`
  - `get-remesh`
  - `create-rigging`
  - `get-rigging`
  - `create-animation`
  - `get-animation`
  - `download-glb`
  - `store-art-job`
  - `list-art-jobs`
  - `download-stored-glb`
- 프론트는 각 단계를 순차 호출하면서 상태를 저장하고, `image-to-3d -> remesh -> rigging -> animation` 순서로 진행한 뒤 최종 GLB Blob을 받아 IndexedDB에 보관한다
- 최종 GLB와 미리보기 이미지는 Netlify Function에서 Firebase Storage에도 저장한다
- 갤러리 목록은 Firebase Firestore `artJobs` 컬렉션 기준으로 읽는다

필수 환경변수:
- `MESHY_API_KEY`
- 선택값:
  - `MESHY_IMAGE_MODEL`

Firebase 환경변수:
- 우선순위 1: `FIREBASE_SERVICE_ACCOUNT_JSON`
- 우선순위 2:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`
- 로컬 파일 방식:
  - `FIREBASE_SERVICE_ACCOUNT_PATH`
  - 또는 `GOOGLE_APPLICATION_CREDENTIALS`
- Storage 버킷:
  - `FIREBASE_STORAGE_BUCKET`

로컬 개발:
- 로컬 함수 테스트는 `netlify dev` 기준으로 진행한다
- 프로젝트에는 `netlify-cli`가 dev dependency로 설치되어 있다
- 실행 스크립트: `npm run dev` 또는 `npm run dev:netlify`
- 루트 `.env` 파일에서 다음 값을 읽는다
  - `MESHY_API_KEY`
  - `MESHY_IMAGE_MODEL`
- CRA 개발 서버(`3000`)에서 상대경로 `/.netlify/functions/*` 호출이 가능하도록 `src/setupProxy.js`에서 Netlify dev(`8888`)로 프록시한다
- 로컬 프론트가 `3000`에서 떠 있어도 함수 요청은 `8888`로 전달된다
- 프록시 대상 기본값은 `.env`의 `REACT_APP_FUNCTIONS_PROXY_TARGET=http://localhost:8888`
- `netlify.toml`의 `[dev]` 설정에서 `npm start`를 내부적으로 실행하고 CRA의 `3000` 포트를 Netlify 개발 포트 `8888`로 프록시한다

테스트 스크립트:
- 샘플 이미지 기반 Meshy 파이프라인 테스트 스크립트: `src/test/art/run-meshy-pipeline.js`
- 샘플 이미지: `src/test/art/sample/sample.jpg`
- 결과 GLB/메타데이터 저장 경로: `src/test/art/output`
- 실행 명령: `npm run test:art:meshy`
- 실제 실행 전 `.env`의 `MESHY_API_KEY`를 진짜 값으로 바꿔야 한다
- 샘플 테스트에서 `rigging` 전 `remesh`가 필요함을 확인했고, 테스트 스크립트와 앱 파이프라인 모두 그 단계를 포함한다

운영 주의:
- Meshy API 키는 프론트에 두지 않고 Netlify Functions에서만 사용한다
- Meshy 결과 URL은 만료될 수 있으므로 최종 animated GLB는 즉시 IndexedDB에 저장해야 한다
- 리깅 성공률을 높이려면 사람형 캐릭터를 크게 그리도록 UX를 유지하는 편이 좋다
- Meshy asset URL은 브라우저 직접 `fetch` 시 CORS에 막힐 수 있으므로, 최종 GLB 다운로드는 Netlify Function(`download-glb`) 프록시를 통해 처리한다
- Firebase Admin SDK도 Netlify Functions에서만 사용한다
- 파일형 자산은 Firebase Storage에 저장하고, 갤러리 메타데이터는 Firestore `artJobs`에 저장한다

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

## 2026-04-13 Update
- 브라우저 IndexedDB 저장 로직을 제거했다.
- `src/art/artStorage.js`는 삭제되었고, 미술 파이프라인은 더 이상 로컬 `job/blob` 저장을 사용하지 않는다.
- 미술 그림판의 생성 결과는 Firebase Storage/Firestore 기준으로만 저장하고 다시 불러온다.
- `src/component/art/ArtStudio.js`의 `3D 보기`는 Firebase에 저장된 GLB를 `download-stored-glb` 함수로 받아 렌더링한다.
- `src/component/art/ArtGallery.js`, `src/art/ArtPage.js`의 갤러리 문구와 목록 기준도 IndexedDB에서 Firebase 기준으로 정리했다.
- Firebase Storage 요금제 이슈로 저장 구조를 다시 바꿨다.
- 이제 `store-art-job`은 Firestore 문서에 미리보기 이미지(Data URL)와 Meshy 결과 URL/만료 시각만 저장한다.
- `download-stored-glb`는 Firestore 문서에서 Meshy GLB URL을 읽어 프록시 다운로드한다.
- 따라서 갤러리 썸네일은 Firestore만으로 유지되지만, Meshy GLB URL이 만료되면 예전 3D 결과는 다시 재생되지 않을 수 있다.
- Firestore-only 요구에 맞춰 GLB 바이너리 자체를 Firestore에 저장하도록 다시 변경했다.
- `artJobs/{jobId}` 문서에는 메타데이터와 미리보기 이미지를 저장하고, 실제 GLB 바이너리는 `artJobs/{jobId}/glbChunks` 하위 컬렉션에 chunk 여러 개로 나눠 저장한다.
- `store-art-job`는 Meshy GLB를 다운로드해서 Firestore chunk 문서들로 저장하고, `download-stored-glb`는 chunk들을 다시 합쳐 GLB 바이너리로 응답한다.
- 이미지 저장소는 Firebase 대신 Cloudflare R2로 다시 변경했다.
- 미리보기 이미지는 `art-preview/{jobId}.jpg` 키로 R2 버킷(`3d-image`)에 저장하고, Firestore 문서에는 `previewImageKey`만 기록한다.
- `download-stored-image` 함수가 R2에서 이미지를 읽어 반환하고, 브라우저에서는 `Cache-Control: public, max-age=31536000, immutable`와 버전 쿼리스트링으로 캐시를 사용한다.
- GLB Firestore chunk 저장 로직은 제거했다.
- 이제 Firestore `artJobs` 문서에는 `jobId`, R2 object key, 파일명, 생성일시 같은 메타데이터만 저장한다.
- 실제 미리보기 이미지와 실제 GLB 파일은 모두 Cloudflare R2에 저장한다.
- `download-stored-glb`와 `download-stored-image`는 Firestore 메타데이터로 R2 object key를 찾아 파일을 내려준다.
- 로컬에서는 프론트가 함수 서버를 직접 교차 출처 호출하지 않고, 상대경로 `/.netlify/functions/*`와 CRA 프록시(`src/setupProxy.js`)를 사용한다.
- `src/setupProxy.js`는 Express mount로 잘린 경로를 다시 `/.netlify/functions/...` 형태로 붙여서 Netlify dev(`8888`)에 전달해야 정상 동작한다.
- 로컬 개발은 `dotenv-cli`로 루트 `.env`를 먼저 로드한 뒤 `netlify dev`를 실행한다.
- `package.json`의 `npm run dev`는 `dotenv -e .env -- netlify dev`를 사용한다.

## 다음 작업자가 바로 이해해야 할 핵심
- 이 프로젝트는 "작은 교육용 미니게임 묶음"이다
- 페이지 이동은 라우터가 아니라 수동 path 매핑이다
- 스타일은 단일 대형 CSS 파일 중심이다
- 수학/한글 게임은 랜덤 라운드 기반 상태머신에 가깝다
- 영어 쓰기 게임은 아직 MVP 판별 로직이라 개선 여지가 크다
- 미술 그림판은 캔버스 기반이며, 자유 그리기와 윤곽선 색칠을 둘 다 지원한다
- 미술 그림판은 캔버스 기반이며, 흰 도화지에 자유 그리기와 지우개를 지원한다
- 미술 파이프라인은 `그림 JPG -> image-to-3d -> rigging -> animation -> IndexedDB 저장 -> three.js 재생` 순서다
- 인코딩 안정성이 중요하며, 한글 깨짐은 기능 버그만큼 우선순위가 높다

## 최근 주요 작업
- 미술 과목을 새로 추가했다
- 홈 화면에 미술 카드와 라우트(`/art`, `/art_studio`)를 연결했다
- 미술 메인 페이지와 그림판 놀이터 페이지를 추가했다
- 그림판을 밑그림 없는 흰 도화지 기반으로 단순화했다
- 그림판 툴바를 아이콘 중심 UI로 바꾸고, 도화지 영역을 더 넓게 확장했다
- Netlify Functions 기반 Meshy 다단계 오케스트레이션 계층을 추가했다
- 그림을 JPG로 내보내 3D 생성, 리깅, 애니메이션을 순차 수행하는 프론트 파이프라인을 추가했다
- animated GLB를 IndexedDB에 저장하고 `three`로 재생하는 미리보기 화면을 추가했다
- 3D 변환 중에는 원본 그림과 현재 단계 상태를 보여주는 작업창 다이얼로그를 추가했다
- 그림판 메인 화면에서는 하단 파이프라인/플레이어 패널을 제거하고 캔버스 중심 레이아웃으로 단순화했다
- 로컬 테스트용 `netlify-cli`, `npm run dev:netlify`, `.env` 파일을 추가했다
- 로컬에서 `3000` 프론트와 `8888` 함수 서버를 자연스럽게 연결하기 위해 CRA 프록시(`src/setupProxy.js`)를 추가했다
- 샘플 이미지 기반 Meshy end-to-end 테스트를 성공시켜 `src/test/art/output`에 animated GLB와 메타데이터 JSON을 저장했다
- 미술 과목에 IndexedDB 기반 `3D 그림 갤러리` 화면을 추가했다
- 최종 GLB 다운로드 단계에서 Meshy asset CORS를 피하기 위해 Netlify Function 프록시 다운로드를 추가했다
- Netlify Functions에서 Firebase Storage/Firestore를 사용해 생성된 GLB와 이미지 메타데이터를 영구 저장하도록 확장했다

## 다음 세션 시작 시 확인할 것
- `AGENT.md`
- `src/App.js`
- `src/korean/AvoidTigerPage.js`
- `src/component/korean`
- `src/component/math`
- `src/component/english`
- `src/App.css`
