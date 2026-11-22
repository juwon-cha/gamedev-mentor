# GameDev Mentor

주니어 게임 프로그래머를 위한 **검증된 문제은행** 학습 웹앱(PWA)입니다. 외부 AI API를 호출하지 않는 100% 정적 사이트이며, 문제·해설·꼬리질문·채점표는 `data/*.json`에 들어 있고, 모든 문제는 `data/sources.json`에 등록한 공식 문서·저장소를 근거로 삼습니다.

**바로 쓰기:** https://juwon-cha.github.io/gamedev-mentor/ (휴대폰·태블릿은 브라우저 메뉴의 "홈 화면에 추가")

## 기능

- 트랙 4개: C# 핵심 & 메모리/GC, C++ 기초 & 메모리 모델, 게임 알고리즘·자료구조, Unity 엔진 & 아키텍처
- 모드 4개: 과외·개념, 압박 면접(꼬리질문 3단계), 디버깅, 실전 구현
- 트랙·모드·상태·태그 필터, 검색, 랜덤 문제 뽑기
- 단계별 열기: 힌트 1 → 2 → 3 → 정답 해설 & 공식 채점표(확인 후 공개), 꼬리질문은 의도와 모범 답변을 따로 숨김
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
data/track1_csharp.json
data/track2_cpp.json
data/track3_algo.json
data/track4_unity.json
tools/check-tests.js 숨은 테스트 검증 스크립트 (Node 18+)
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
| `track` | `track1` ~ `track4` |
| `mode` | `tutoring` / `interview` / `debugging` / `implementation` |
| `difficulty` | `Junior` / `Mid` |
| `title`, `tags` | 제목, 취약 태그 배열 (`CSharp_`, `Cpp_`, `Algo_`, `Unity_` 접두사) |
| `language` | `csharp` / `cpp` / `none` |
| `scenario` | 게임 실무 배경 (마크다운). 면접 모드는 메인 질문 포함 |
| `constraints`, `edgeCases` | 제약 조건, 엣지 케이스 체크리스트 |
| `starterCode` | 버그 코드 또는 스타터 인터페이스 |
| `hints` | 3단계 힌트 (디버깅·실전 구현) |
| `followUps` | `{question, intent, keyAnswer}` 3단계 (면접) |
| `concept`, `quiz` | 개념 카드, `{question, answer}` 셀프 체크 (과외) |
| `solutionCode`, `explanation` | 모범 코드, 시니어 해설 |
| `sourceRefs` | 출처 ID 배열. `data/sources.json`의 `id`나 같은 파일 `extraSources`의 `id` |
| `rubric.criteria` | `{id, category, description, points, sourceId}` 배열. 배점 합계 100 (정확성 35 / 메모리·성능 30 / 엔진·언어 규약 20 / 아키텍처·가독성 15) |
| `rubric.criticalDeductions` | `{id, description, penalty, sourceId}` 배열. 실무에서 바로 반려되는 실수, 음수 점수 |
| `tests` | 실행 채점용 숨은 테스트 또는 `null`. 아래 참고 |
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

새 트랙 파일을 만들면 `js/app.js`의 `TRACKS`와 `sw.js`의 `SHELL`에 한 줄씩 추가합니다.

## 데이터 보관

학습 진도, 오답 메모, 작성 중인 답안은 각 기기의 브라우저(localStorage)에만 저장됩니다. 기기를 옮길 때는 오답노트 탭에서 JSON으로 내보내고 불러옵니다.

## 로컬 실행

```
python -m http.server 5173
```
