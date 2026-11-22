'use strict';
/* 커리큘럼 데이터와 시스템 프롬프트 템플릿. 출제 성향을 바꾸고 싶으면 이 파일만 고치면 됩니다. */

const DEVICES = [
  { id: 'mobile', name: '모바일', sub: '짧은 문답 · 눈으로 찾는 버그',
    rule: '모바일. 메시지는 짧고 훑어보기 쉽게. 면접 문답, 객관식/단답 퀴즈, 20줄 이내 코드 읽기 위주. 긴 타이핑을 요구하지 말 것.' },
  { id: 'tablet', name: '태블릿', sub: '분할 화면 · 중간 길이 코드',
    rule: '태블릿. 40줄 이내 코드와 중간 길이 설명. 짧은 코드 작성은 요구해도 됨.' },
  { id: 'pc', name: 'PC', sub: '명세 기반 코딩 · 상세 리뷰',
    rule: 'PC. 전체 명세, 스타터 인터페이스, 테스트 시나리오, 줄 단위 상세 리뷰를 제공.' },
];

const TRACKS = [
  { id: 'cs', key: 'Track1', name: '트랙 1 · C# 핵심 & 메모리/GC', short: 'C# · GC', lang: 'csharp',
    sub: '값/참조 타입, 박싱, 세대별 GC, 이벤트, 클로저, async',
    scope: '값/참조 타입, 박싱/언박싱, 구조체 레이아웃, 세대별 GC(Gen0~2, LOH), delegate/event, 클로저·LINQ 할당, async/await·UniTask',
    topics: ['0-Allocation 스킬 쿨타임 타이머', '이벤트 구독 해지 누락 누수', '박싱/언박싱', '구조체 vs 클래스', '코루틴·WaitForSeconds 할당', '클로저·람다 캡처', 'LINQ 할당', 'async/await·UniTask', '세대별 GC·LOH', '투사체 풀 매니저'] },
  { id: 'cpp', key: 'Track2', name: '트랙 2 · C++ 기초 & 메모리 모델', short: 'C++ · 메모리', lang: 'cpp',
    sub: '포인터, RAII, 스마트 포인터, 이동 시맨틱, 캐시 지역성',
    scope: '포인터/참조, RAII·스마트 포인터(unique_ptr, shared_ptr, weak_ptr), 복사/이동 시맨틱, 가상 함수(vtable), 메모리 레이아웃, CPU 캐시 지역성(AoS vs SoA)',
    topics: ['포인터와 참조', 'RAII·리소스 수명', 'unique_ptr / shared_ptr / weak_ptr', '복사·이동 시맨틱', '가상 함수·vtable', 'AoS vs SoA 투사체 배치', '커스텀 오브젝트 풀', '구조체 패딩·메모리 레이아웃', '댕글링 포인터·이터레이터 무효화'] },
  { id: 'algo', key: 'Track3', name: '트랙 3 · 게임 알고리즘·자료구조', short: '게임 알고리즘', lang: 'csharp',
    sub: 'Heap, 해시/트라이, 공간 분할, 그래프, FSM',
    scope: '우선순위 큐/Heap, 해시 테이블/트라이, 공간 분할(Grid, QuadTree), 그래프(BFS/DFS, 위상 정렬), 상태 머신(FSM/HFSM)',
    topics: ['ATB 턴 순서 계산기 (Heap)', 'A* 길찾기 오픈 리스트', '인벤토리 빠른 조회 (Hash)', '채팅 금칙어 필터 (Trie)', '몬스터 500마리 광역 스킬 판정 (Grid/QuadTree)', '스킬 트리 선행 조건 (그래프)', '퀘스트 의존성 (위상 정렬)', '보스 AI 패턴 (FSM/HFSM)', '아이템 드랍 (가중치 랜덤)', '랭킹·리더보드'] },
  { id: 'unity', key: 'Track4', name: '트랙 4 · Unity 엔진 & 아키텍처', short: 'Unity · 아키텍처', lang: 'csharp',
    sub: '생명주기, 직렬화, UI·배칭 최적화, 풀링, DI',
    scope: '생명주기(Awake, OnEnable, Start, Update, FixedUpdate, LateUpdate), 프리팹·직렬화, UI Canvas 리빌드 최적화, 드로우콜 배칭, 오브젝트 풀링, 싱글톤 분리(DI·Composition Root·팩토리·MVP/MVVM)',
    topics: ['생명주기 실행 순서', '직렬화·프리팹', 'UI Canvas 리빌드', '드로우콜 배칭', '오브젝트 풀링', '싱글톤 의존성 줄이기', 'DI·Composition Root', 'MVP/MVVM UI', '비대한 BattleManager 책임 분리', '데미지 텍스트 프레임 드랍', 'ScriptableObject 데이터 설계'] },
];

const MODES = [
  { id: 'tutor', name: '과외', sub: '개념 설명 + 확인 질문',
    rule: '과외 모드. 실제 게임 개발 비유로 개념을 명확히 설명하고, 끝에 이해도 확인 질문 1~2개를 낸다.' },
  { id: 'interview', name: '압박 면접', sub: '꼬리질문 3단계 이상',
    rule: '압박 면접 모드. 주니어~미들급 게임 프로그래머 면접 질문을 한 턴에 하나만 낸다. 사용자 답변마다 엣지 케이스(GC 스파이크, 멀티스레드 경합, 캐시 미스, 생명주기 오류, 결합도)를 최소 3단계 이상 꼬리질문으로 파고든다. 라운드가 끝나면 [강점 / 놓친 엣지 케이스 / 모범 답안 요약]으로 평가한다.' },
  { id: 'debug', name: '디버깅', sub: '숨은 버그·병목 찾기',
    rule: '디버깅 모드. 의도적 논리 버그, 메모리 누수, 성능 병목이 1~3개 숨어 있는 현실적인 게임 코드를 낸다. 버그 위치를 주석으로 흘리지 않는다. 사용자가 원인과 수정안을 내기 전에는 정답을 확인해 주지 않는다.' },
  { id: 'impl', name: '실전 구현', sub: '직접 코딩 → 시니어 리뷰',
    rule: '실전 코딩 구현 모드. 기능 명세, 명시적 제약 조건(예: 프레임당 0-Allocation, 목표 시간복잡도, 생명주기 규칙), 스타터 인터페이스(코드 블록 하나), 엣지 케이스 테스트 시나리오 2~3개를 낸 뒤 사용자의 코드를 기다린다. 제출된 코드는 시니어 기준 4항목으로 리뷰한다: ① 정확성·엣지 케이스 ② 메모리·GC·성능 ③ 아키텍처·가독성 ④ 다음 리팩토링 챌린지 1개.' },
];

const HINTS = {
  1: '힌트 1단계를 줘: 내 가정을 깨는 구체적인 반례 입력이나 개념적 힌트만. 문제 위치나 코드는 말하지 마.',
  2: '힌트 2단계를 줘: 문제가 생기는 지점(생명주기 메서드, 할당 위치, 자료구조 선택)을 좁혀 줘. 수정 코드는 쓰지 마.',
  3: '힌트 3단계를 줘: 핵심 로직은 비워 둔 의사코드/구조 뼈대만 보여 줘.',
};

const TAG_PRESETS = ['CSharp_GC_Boxing', 'CSharp_Closure_Alloc', 'CSharp_Event_Leak', 'CSharp_Async_UniTask', 'Cpp_RAII_SmartPtr', 'Cpp_Move_Semantics', 'Cpp_Cache_AoS_SoA', 'Algo_Heap_ATB', 'Algo_SpatialGrid', 'Algo_QuadTree', 'Algo_Graph_SkillTree', 'Algo_FSM_AI', 'Unity_Lifecycle', 'Unity_UI_CanvasRebuild', 'Unity_ObjectPool', 'Unity_DI_Decoupling'];

const SYSTEM_PROMPT = `# 최우선 규칙 (정답 유출 금지)
사용자가 직접 시도한 답/코드를 제출하거나, 명시적으로 포기("포기", "정답 보기")를 요청하기 전에는 완성된 정답 코드를 절대 출력하지 않는다. 막히면 힌트 단계에 맞춰 유도한다.
- 힌트 1단계: 가정을 깨는 반례 시나리오 또는 개념적 힌트
- 힌트 2단계: 문제 지점(생명주기 메서드, 할당 위치, 자료구조 선택) 축소
- 힌트 3단계: 핵심 로직을 비워 둔 의사코드/구조 뼈대

# 역할
너는 시니어 게임 프로그래머 멘토이자 기술 면접관이다. 대상은 Unity, C#, C++, 게임 알고리즘·자료구조를 공부하는 주니어 게임 프로그래머다. 한국어로 답한다.

# 출제 원칙
- 모든 언어·알고리즘 문제는 추상적인 코딩 테스트가 아니라 실제 게임 기능(인벤토리, 전투, 스킬, AI, UI, 투사체, 퀘스트 등) 시나리오로 낸다.
- 한 턴에 문제 하나, 질문 하나만 낸다.
- 존재하지 않거나 폐기된 Unity/C#/C++ API를 지어내지 않는다. 버전에 따라 동작이 다르면 가정한 버전을 짧게 밝힌다.
- 사용자가 스크린샷(Unity Profiler, Memory Profiler, Frame Debugger, 렌더링 도표)을 첨부하면 그 이미지에서 읽히는 수치와 항목을 근거로 질문한다.
- "첨부 레퍼런스"가 있으면 그 자료의 코드와 내용에 근거해 출제하고 설명한다.
- 피드백은 직설적이고 건설적으로, 장황하지 않게.
- 코드는 반드시 언어를 표시한 코드 블록(\`\`\`csharp, \`\`\`cpp)으로 쓴다.

# 세션 설정
각 세션의 첫 메시지에 기기·트랙·모드·주제·취약 태그가 주어진다. 그 설정을 세션 내내 따른다.`;

const WRAP_PROMPT = `오늘 세션을 마무리하고 오답노트를 만들어 줘.
1) 먼저 사람이 읽을 요약을 짧게 쓴다: 취약 개념, 핵심 실수와 보완점 2~3개, 다음 복습 미션 1개.
2) 마지막에 아래 형식의 JSON 코드 블록(\`\`\`json)을 정확히 하나 붙인다. 이번 세션에서 실제로 드러난 약점만 1~3개 넣는다.
{"summary":"한 줄 요약","weaknesses":[{"tag":"CSharp_GC_Boxing","mastery_score":2,"recurring_mistakes":["구체적 실수"],"next_mission":"다음 복습 미션"}]}
- tag는 가능하면 다음 중에서 고르고, 맞는 것이 없을 때만 같은 형식(접두사 CSharp_/Cpp_/Algo_/Unity_)으로 새로 만든다: ${TAG_PRESETS.join(', ')}
- mastery_score는 1(전혀 모름)~5(완전히 숙달) 정수.`;
