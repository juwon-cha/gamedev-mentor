# GameDev Mentor

주니어 게임 프로그래머를 위한 **검증된 문제은행** 학습 웹앱(PWA)입니다. 외부 AI API를 호출하지 않는 100% 정적 사이트이며, 문제·해설·꼬리질문·채점표는 `data/*.json`에 들어 있고, 모든 문제는 `data/sources.json`에 등록한 공식 문서·저장소를 근거로 삼습니다.

**바로 쓰기:** https://juwon-cha.github.io/gamedev-mentor/ (휴대폰·태블릿은 브라우저 메뉴의 "홈 화면에 추가")

## 기능

- 트랙 10개: C#·GC, C++·메모리, 게임 알고리즘, Unity·아키텍처, 자료구조·알고리즘 기초, 게임 수학, CS 기초(OS·동시성), 네트워크·멀티플레이, 그래픽스·렌더링, 디자인 패턴
- 모드 4개: 과외·개념, 압박 면접(꼬리질문 3단계), 디버깅, 실전 구현
- 트랙·모드·난이도·상태·태그 필터, 검색, 랜덤 문제 뽑기
- 단계별 열기: 힌트 1 → 2 → 3 → 정답 해설 & 공식 채점표(확인 후 공개), 꼬리질문은 의도와 모범 답변을 따로 숨김
- 열어 본 힌트·꼬리질문은 제목을 눌러 접고 펼 수 있고, 다른 문제를 봤다가 돌아오면 접힌 채로 보임(몇 단계까지 열었는지는 저장). "힌트 기록 초기화"·"꼬리질문 기록 초기화"로 처음 상태로 되돌림
- 실행 채점: 순수 C#/C++ 문제는 숨은 테스트를 붙여 Compiler Explorer에서 실제로 컴파일·실행하고 테스트별 통과/실패를 표시 (Unity API 문제는 대상 아님)
- 공식 채점표: 100점 만점 자가 채점, 치명적 감점, 등급 자동 산출(Pass 85+ / Borderline 60~84 / Retry ~59)
- 검증 출처 배지와 검증 자료 라이브러리: 문제와 채점 항목마다 근거 문서로 바로 이동
- 코드 에디터: 줄 번호, Tab 4칸, 자동 임시저장, 초기 코드 불러오기, 온라인 컴파일러 바로가기
- AI 브릿지: 문제 명세·공식 채점표·출처·내 답안을 리뷰 프롬프트로 복사 / 검증 자료를 골라 새 문제 JSON 제작 프롬프트 복사
- 오답노트: 자가 평가, 오답 메모, 트랙별 완료율·평균 점수, 취약 태그 집계, Google Docs용 마크다운 복사, 학습 기록 JSON 내보내기·불러오기
- 다크/라이트 전환, 오프라인 지원

화면은 PC(1200px 이상) 3단, 태블릿(768~1199px) 2단 분할 + 목록 서랍, 모바일(767px 이하) 단일 컬럼 + 하단 탭으로 바뀝니다.

## 구조

```
index.html
css/style.css
js/app.js            상태 관리, 필터, 문제 렌더링
js/editor.js         코드 에디터
js/rubric.js         자가 채점표(배점 합산, 치명적 감점, 등급)
js/judge.js          실행 채점(숨은 테스트 실행, 결과 파싱)
js/storage.js        학습 진도·오답노트 저장, JSON 백업/복원
js/promptBuilder.js  AI 리뷰 프롬프트, 새 문제 JSON 프롬프트
data/sources.json    검증 자료 레지스트리
data/tracks.json     트랙 목록
data/track1_csharp.json
data/track2_cpp.json
data/track3_algo.json
data/track4_unity.json … track10_patterns.json
tools/check-tests.js 숨은 테스트 검증 스크립트 (Node 18+)
tools/validate-data.js 스키마·배점·출처 id 검사 (Node 18+)
tools/build-docs.js  docs/SOURCES.md, docs/VERIFICATION.md 생성 (Node 18+)
docs/                작성·검수 기준, 자료 목록, 검증 기록, 검수 요약
manifest.json, sw.js, icons/
```

빌드 과정이 없고 모든 경로가 상대 경로입니다. 마크다운 렌더링과 구문 강조는 `js/app.js`에 내장해 CDN 없이 오프라인에서도 동작합니다.

## 문제 추가하기

1. 앱 상단의 **+ 검증 자료 기반 새 문제 프롬프트**에서 트랙·모드·주제와 근거로 쓸 자료를 고르고 복사합니다.
2. 구독 중인 AI에 공식 문서나 검증된 코드와 함께 붙여넣어 JSON을 받습니다.
3. 해설과 코드를 직접 훑어보고, 코드는 컴파일해 봅니다.
4. 해당 트랙 파일의 `problems` 배열 끝에 붙여넣고 push합니다. 1~2분 뒤 모든 기기에 반영됩니다.

JSON이 깨지면 그 트랙 전체가 안 보이므로, push 전에 확인하세요.

```
node -e "JSON.parse(require('fs').readFileSync('data/track1_csharp.json','utf8'))"
```

### 문제 스키마

| 필드 | 설명 |
|---|---|
| `id` | 고유 ID. 학습 기록의 키이므로 한 번 정하면 바꾸지 않습니다 |
| `track` | `data/tracks.json`에 등록된 트랙 id |
| `mode` | `tutoring` / `interview` / `debugging` / `implementation` |
| `difficulty` | `Easy` / `Medium` / `Hard` (화면에는 쉬움 / 보통 / 어려움) |
| `title`, `tags` | 제목, 취약 태그 배열 (트랙별 접두사는 `data/tracks.json`의 `tagPrefix`) |
| `language` | `csharp` / `cpp` / `none` |
| `scenario` | 게임 실무 배경 (마크다운). 면접 모드는 메인 질문 포함 |
| `constraints`, `edgeCases` | 제약 조건, 엣지 케이스 체크리스트 |
| `starterCode` | 버그 코드 또는 스타터 인터페이스 |
| `hints` | 3단계 힌트 (디버깅·실전 구현) |
| `followUps` | `{question, intent, keyAnswer}` 3단계 (면접) |
| `concept`, `quiz` | 개념 카드, `{question, answer}` 셀프 체크 (과외) |
| `solutionCode`, `explanation` | 모범 코드, 시니어 해설 |
| `sourceRefs` | 출처 ID 배열. `data/sources.json`의 `id`나 같은 파일 `extraSources`의 `id` |
| `rubric.criteria` | `{id, category, description, points, sourceId 또는 basis}` 배열. 배점 합계 100 (정확성 35 / 메모리·성능 30 / 엔진·언어 규약 20 / 아키텍처·가독성 15) |
| `rubric.criticalDeductions` | `{id, description, penalty, sourceId 또는 basis}` 배열. 실무에서 바로 반려되는 실수, 음수 점수 |
| `basis` | 채점 항목·감점의 근거 종류. 근거 문서(`sourceId`) 대신 `"principle"`(항목 설명에 밝힌 일반 공학 원칙, 화면에 "일반 원칙") 또는 `"tests"`(숨은 테스트가 그 동작을 직접 확인, 화면에 "테스트로 확인")를 씁니다. 모든 항목은 `sourceId`나 `basis` 중 하나를 가집니다 |
| `tests` | 실행 채점용 숨은 테스트 또는 `null`. 아래 참고 |
| `verified` | `{level, date, note}`. 독립 검수를 통과한 문제에 붙음. `executed`(실행 검증) / `reviewed`(문서 대조) |
| `nextMission` | 다음 복습 미션 |

### 실행 채점용 테스트 (`tests`)

```json
"tests": {
  "template": "…{{USER_CODE}}… 뒤에 판정 코드를 붙인 단일 소스 파일",
  "cases": ["case-id-1", "case-id-2"],
  "note": "무엇을 검사하는지, 학습자가 바꾸면 안 되는 시그니처"
}
```

- 앱은 `{{USER_CODE}}`를 에디터의 코드로 바꿔 Compiler Explorer(godbolt.org)에 보내 실행합니다. C#은 .NET 8, C++은 GCC 13.2 `-std=c++17 -O1`입니다.
- 판정 코드는 케이스마다 표준 출력에 `[PASS] case-id` 또는 `[FAIL] case-id :: 사유`를 한 줄씩 출력합니다. 케이스 하나가 실패하거나 예외를 던져도 나머지가 계속 돌아야 합니다.
- C#은 학습자 코드가 `using`으로 시작하므로 판정 클래스를 그 뒤에 두고 정규화된 이름(`System.Console`)을 씁니다. C++에서 학습자 코드에 `main`이 있으면 `#define main __user_main`으로 감쌉니다.
- 테스트를 추가하거나 고친 뒤에는 반드시 검증합니다. 모범 답안은 전부 통과하고 초기 코드는 하나 이상 실패해야 합니다.

```
node tools/check-tests.js data/track3_algo.json
```

실행 채점은 외부 무료 서비스에 의존하므로 온라인에서만 되고, 서비스 사정에 따라 느리거나 실패할 수 있습니다. 메모리 할당 판정은 .NET 8 기준이며 Unity 런타임과 다를 수 있습니다.

새 출처는 `data/sources.json`에 추가하거나, 트랙 파일 최상위의 `extraSources` 배열에 `{id, title, url, summary}`로 선언합니다.

새 트랙은 문제 파일을 `data/`에 두고 `data/tracks.json`에 한 줄 추가합니다. 문제 파일은 처음 열 때 자동으로 오프라인 캐시에 들어갑니다.

## 문서

문제를 어떻게 만들고 검증했는지는 [`docs/`](docs/README.md)에 있습니다.

- [작성·검수 기준](docs/STANDARDS.md): 출처 우선순위, 문제 형식과 난이도, 채점표, "흔한 오해", 실행 채점 규칙, 검수 절차
- [검증 자료 목록](docs/SOURCES.md): 공통 자료와 트랙별 추가 자료, 자료마다 인용한 문제 (자동 생성)
- [문제별 검증 기록](docs/VERIFICATION.md): 요약 통계와 문제마다의 검증 수준·날짜·메모 (자동 생성)
- [트랙별 검수 기록](docs/README.md#트랙별-검수-기록): 묶음마다 무엇을 확인하고 무엇을 고쳤는지

자동 생성 문서는 데이터를 바꾼 뒤 `node tools/build-docs.js`로 다시 만듭니다.

## 데이터 보관

학습 진도, 오답 메모, 작성 중인 답안은 각 기기의 브라우저(localStorage)에만 저장됩니다. 기기를 옮길 때는 오답노트 탭에서 JSON으로 내보내고 불러옵니다.

## 로컬 실행

```
python -m http.server 5173
```
