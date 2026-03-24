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
  - `/english`
- 페이지 컨테이너
  - `src/App.js`
  - `src/korean/KoreanPage.js`
  - `src/korean/AvoidTigerPage.js`
  - `src/math/MathPage.js`
  - `src/english/EnglishPage.js`
- 과목별 컴포넌트 규칙
  - 한글 관련 분리 컴포넌트는 `src/component/korean` 아래에 둔다.
  - 앞으로도 기능 분리 시 과목별 컴포넌트는 `src/component/{subject}` 구조를 유지한다.

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
- 총 문제 수는 5개다.
- 총 제한시간은 35초다.
- 거리 모델은 숫자 기반으로 계산한다.
  - 전체 거리: 10
  - 호랑이 시작 위치: 0
  - 사람 시작 위치: 5
  - 집 위치: 10
- 호랑이는 시간 기준으로 계속 이동한다.
  - 속도: 초당 `10 / 35`
- 사람은 정답을 맞출 때마다 한 칸씩 이동한다.
  - `5 -> 6 -> 7 -> 8 -> 9 -> 10`
- 판정 규칙
  - 호랑이 위치가 사람 위치 이상이 되면 즉시 잡힌다.
  - 사람이 위치 10에 도달하면 성공이다.
- 즉, 실패 판정은 더 이상 "문제 하나를 7초 안에 못 맞춤"이 아니라, 전체 시간 흐름 속에서 호랑이와 사람의 실제 위치 비교로 계산한다.
- 예시
  - 사람이 한 문제도 못 맞춘 상태면 위치는 5다.
  - 호랑이는 18초쯤 지나면 `18 * (10 / 35) = 5.14...` 위치가 되므로 사람을 잡는다.

## 현재 UI 동작
- 선택한 글자는 빈칸 네모칸 안에 표시된다.
- 오답은 빨간색, 정답은 파란색으로 표시된다.
- 정답일 때는 게임 화면 전체에 큰 `O` 피드백이 잠깐 표시된다.
- 사람은 정답 수에 따라 집 방향으로 점진적으로 이동한다.
- 호랑이는 남은 시간이 아니라 실제 누적 경과시간 기준 위치로 이동한다.

## 작업 방식 규칙
- 가능한 한 바로 구현까지 진행한다. 설명만 하고 끝내지 않는다.
- 컴포넌트가 커지면 분리한다.
- 한글 관련 컴포넌트는 반드시 `src/component/korean` 아래에 둔다.
- 스마트 TV 브라우저 사용을 전제로 반응형 레이아웃을 기본으로 고려한다.
- 큰 화면, 모바일 화면, TV 화면 모두에서 의미가 유지되어야 한다.
- 디자인 수정 시 고정 px만 쓰지 말고 `clamp`, 상대 배치, 반응형 기준을 우선 고려한다.

## 인코딩 규칙
- 모든 텍스트 파일은 UTF-8 기준으로 유지한다.
- 가능하면 UTF-8 without BOM으로 저장한다.
- PowerShell로 파일을 통째로 다시 쓸 때는 한글이 깨질 수 있으므로 주의한다.
- PowerShell에서 파일을 쓸 경우
  - 가능하면 기존 파일 일부만 수정한다.
  - 통째로 다시 쓸 필요가 있으면 UTF-8 without BOM으로 저장한다.
  - 한글 문자열이 깨질 가능성이 있으면 유니코드 이스케이프 또는 안전한 저장 방식을 사용한다.
- 인코딩이 깨진 파일이 보이면 다음 작업 전에 먼저 파일을 정상화한다.
- `PROJECT_CONTEXT.md`를 포함한 문서 파일도 같은 규칙을 따른다.

## 주의 사항
- 정적 호스팅에서 direct URL 접근 시 SPA rewrite 설정이 필요할 수 있다.
- 스마트 TV 브라우저에서는 큰 원본 이미지가 느릴 수 있으므로 이미지 최적화가 중요하다.
- 이미지 위치보다 파일 크기, 해상도, 포맷(WebP/AVIF), 디코딩 비용이 더 중요하다.

## 다음 세션 시작 시 확인할 것
- `PROJECT_CONTEXT.md`
- `src/App.js`
- `src/korean/AvoidTigerPage.js`
- `src/component/korean`
- `src/component/korean/wordGameUtils.js`
- `src/App.css`