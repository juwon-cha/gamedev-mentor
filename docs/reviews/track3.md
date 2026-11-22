# 트랙 3 검수 기록

[문서 목록](../README.md) · [작성·검수 기준](../STANDARDS.md)

## 초기 문제

- `t3-impl-aoe-uniform-grid` — 광역 스킬 판정: Uniform Grid로 원 범위 안의 몬스터 찾기 (실전 구현 · Hard · 실행 검증)
- `t3-debug-minheap-atb-astar` — ATB 턴 큐와 A* open list 가 함께 쓰는 Min-Heap 디버깅 (디버깅 · Medium · 실행 검증)
- `t3-interview-skilltree-dag-boss-ai` — 스킬 트리 선행 조건 검증(DAG)과 보스 AI 구조 선택(FSM · HFSM · Behaviour Tree) (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** 정적 문제은행으로 전환한 커밋 `dc1905f`에서 트랙 3에 세 문제가 처음 실렸다. 작성자는 세 문제를 새 스키마(`sourceRefs`·`extraSources`·채점표·`tests`)로 옮기고 격자·힙 문제에 숨은 테스트를 붙였다. 힙 문제의 버그는 왼쪽 자식만 보는 sift-down, 동점 처리 없음, 위로만 올리는 `Update` 셋이다. `i/2` 부모 버그는 9개 원소까지 전부 넣고 빼는 전수 시험에서 잘못된 순서를 한 번도 내지 않아 뺐다. 작성 단계(.NET 8 로컬)에서 격자 해답을 무작위 질의 70,000개(음수·범위 밖·경계 포함)로 전수 비교와 맞추고 질의 20,000번에 0 바이트 할당을 확인했으며, 힙 해답은 무작위 Push/Update/Pop 200,000회를 정렬 참조와 맞췄다(시작 코드는 400회 중 400회 달랐다). 인용한 실패 입력은 각각 자기 버그 하나로만 실패했다. 독립 검수 결과는 커밋 `45b6f0f`로 반영했고 이때 난이도를 Easy/Medium/Hard로 바꿨다.

**검수에서 확인한 것.** GPP Spatial Partition·State·목차, Wikipedia Binary heap·Topological sorting·Behavior tree, Microsoft Learn PriorityQueue, Red Blob의 A* 소개를 열었다. 격자 문제의 복잡도와 `ceil(2r/s)+1` 칸 수는 맞았다. 다르게 쓴 정답(`List<int>` 칸, swap-remove, `foreach`, double `Math.Floor`)이 8/8로 통과해 정확히 0 바이트를 요구하는 케이스를 그대로 두었다. 힙 문제의 버그 셋과 재현 입력은 모두 실제로 그렇게 동작했다.

**틀려서 고친 것.** 격자 문제의 채점 항목 c7은 모든 `(int)` 캐스트를 깎았지만 `minX`를 뺀 뒤의 캐스트는 맞고, 인용한 GPP 장도 `(int)(x / CELL_SIZE)`를 쓴다. 그래서 c7과 해설이 이를 허용하게 했다. 클램프하기 전에 int로 캐스트하는 답이 모든 테스트를 통과해서 `out-of-bounds`에 아주 큰 반지름 질의를 넣었다. 힙 문제 해설은 Red Blob 의사 코드가 pop할 때 낡은 항목을 건너뛴다고 했지만 실제로는 다시 넣기만 하므로 고쳤고, 근거 없는 "덜 탐색한다"를 지웠으며, sift 방향에 대한 c3 인용을 `wiki-binary-heap`으로 바꿨다. 같은 값으로 `Update`하면서 위로 올리는 경우가 무작위 테스트로만 잡혀 결정적 케이스를 더했다. 면접 문제의 Behaviour Tree 주장에는 출처가 없어서(GPP State는 이름만 언급한다) `wiki-behavior-tree`를 c5와 `sourceRefs`에 넣었고, 모범 설명이 c5·c7을 받지 못해 빠진 문장을 보탰으며, 재분배 꼬리질문의 "유일한 연산"을 누그러뜨렸다.

**끝까지 확인하지 못한 것.** 이벤트 기반 중단과 블랙보드 캐시 대책은 가져온 출처가 아니라 일반 지식에 기댄다. 클램프와 함께 쓴 절삭 캐스트는 결과가 맞아 테스트를 통과하며 채점표만 다룬다. 격자 경계 포함은 float 반올림 범위 안에서만 정확하다(해설에 명시).

## 묶음 a

- `t3-impl-astar-tile-grid` — 타일 맵 A* 길찾기: 이진 힙 open list, 맨해튼 휴리스틱, 동률 처리와 경로 복원 (실전 구현 · Hard · 실행 검증)
- `t3-debug-astar-eight-way` — 8방향 A* 디버깅: 엉뚱한 칸으로 튀고, 겹치면 멈추고, 가끔 돌아가는 몬스터 (디버깅 · Medium · 실행 검증)
- `t3-interview-pathfinding-choices` — 길찾기 알고리즘 선택: BFS · 다익스트라 · A* · 플로 필드 · 내비메시와 휴리스틱의 조건 (압박 면접 · Hard · 문서 대조)
- `t3-impl-inventory-stacking` — 스택형 인벤토리: 슬롯에 겹쳐 담기와 O(1) 보유량 조회 (실전 구현 · Easy · 실행 검증)
- `t3-tutor-weighted-random-loot` — 가중치 랜덤 뽑기: 누적 가중치와 이분 탐색으로 만드는 전리품 테이블 (과외·개념 · Easy · 문서 대조)
- `t3-debug-loot-table-weighted-pick` — 전리품 테이블 디버깅: 안 나오는 아이템, 막아 둔 아이템의 드롭, 미세한 확률 쏠림, 재현되지 않는 시드 (디버깅 · Medium · 실행 검증)

**무엇을 만들었는지.** 이진 힙 open list를 쓰는 타일 A*, 8방향 A* 디버깅, 길찾기 알고리즘 선택 면접, 스택형 인벤토리, 가중치 랜덤 과외, 전리품 테이블 디버깅의 6문제다(2/2/2). 전리품 디버깅은 커리큘럼 주제가 넷이라 버그가 4개다. 과외는 `tests: null`이라 로컬에서만 돌렸다. 인벤토리의 O(1) `CountOf`와 A*의 "직접 만든 힙" 규칙은 채점표로만 확인한다. 커밋 `beb4905`로 배포했다.

**검수에서 확인한 것.** Red Blob 소개·구현·타워 디펜스·distance-to-any, Amit의 Heuristics·MapRepresentations·ImplementationNotes, Wikipedia A*·Binary heap·Binary search·Fitness proportionate selection·LCG·Fisher–Yates·Xorshift, Microsoft Learn PriorityQueue·Dictionary·Random·Array.BinarySearch를 열었다. A* 구현은 동점 처리·이웃 순서·closed set 방식이 다른 정답 32개가 모두 통과했다. 8방향 디버깅은 버그·순서·동점 조합 320가지에서 부분 수정은 모두 실패하고 완전한 수정만 통과했다. 인벤토리는 틀린 변형 5개를 모두 잡았고, 가중치 랜덤 과외는 문제가 없어 문서 대조로 표시했다. 전리품 디버깅은 버그 4개가 각각 따로 실패했고, 모듈로 편향과 경계 주장은 전수 열거로 맞았다.

**틀려서 고친 것.** A* 구현 해설은 목표를 큐에 넣는 순간 멈추면 더 싼 경로를 놓칠 수 있다고 했지만, 이 비용 모델에서는 그렇지 않다(넣을 때 멈추는 변형이 모든 맵에서 참조 비용과 같았다). 그래서 문구를 고쳤다. 낡은 항목을 건너뛰지 않는 답도 통과해서 `expanded-counts-each-tile-once` 케이스를 넣었고, 이 케이스는 넣을 때 멈추는 답도 걸러 낸다. 8방향 디버깅은 제목이 버그 원인 셋을 그대로 밝히고 있어 증상으로 바꿨다. "발견 시 방문 처리" 버그가 시작 코드의 이웃 순서에서는 고정 맵 두 개로만 잡혀, 순서와 무관한 맵 셋을 넣고 무작위 테스트를 12×12 이하 맵 3000개로 넓혔다. "h = 0이면 다익스트라가 된다"는 Amit Patel의 말로 다시 귀속하고, octile 일관성 논증은 유도로 보여 주고 열거로 확인했다. 면접의 시간 분할과 다중 출발 필드는 Amit의 구현 노트와 Red Blob "multiple start points" 페이지로 인용했고(둘 다 `extraSources`에 추가), 타워 디펜스 페이지는 BFS를 쓰므로 귀속 범위를 좁혔다. 전리품 디버깅은 제목을 증상으로 바꾸고 66/65 문장을 명확히 했다. 시험이 있는 세 문제의 노트에는 채점표만 확인하는 제약(직접 쓴 힙, h = 0, O(log n))을 적었다.

**끝까지 확인하지 못한 것.** 남은 항목은 없다. 트랙 5의 `t5-debug-binary-search-level-table`과 누적 표 위 upper-bound 기전이 겹치지만 핵심 과제가 다르다고 판단했다. 플로 필드 재계산 시점이나 지형이 바뀔 때 내비메시 재구축처럼 정의에서 따라 나오는 진술은 추론으로 표시했다.

## 묶음 b

- `t3-impl-chat-profanity-trie` — 채팅 금칙어 필터: 트라이로 가장 긴 금칙어 가리기 (실전 구현 · Easy · 실행 검증)
- `t3-impl-skilltree-validator-learn-order` — 스킬 트리 기획 데이터 검증기: 없는 id, 순환을 이루는 스킬, 배울 수 있는 순서 (실전 구현 · Medium · 실행 검증)
- `t3-debug-quest-unlock-order` — 퀘스트 해금 순서 툴 디버깅: 오타 하나에 툴이 죽고, 물려 있는 퀘스트가 경고 없이 사라지고, 줄 하나 추가에 순서가 뒤집힌다 (디버깅 · Medium · 실행 검증)
- `t3-interview-spatial-partition-choices` — 공간 분할 구조 선택: Uniform Grid · Quadtree · BVH · Spatial Hash (압박 면접 · Hard · 문서 대조)
- `t3-impl-quadtree-static-obstacles` — 정적 장애물 쿼드트리: 삽입과 사각형 범위 질의, 분할 기준과 최대 깊이 (실전 구현 · Hard · 실행 검증)
- `t3-tutor-enemy-fsm-transition-table` — 적 AI 상태 기계: switch 문 대신 전이 표(데이터)로 만들기 (과외·개념 · Easy · 문서 대조)

**무엇을 만들었는지.** 트라이로 가장 긴 금칙어를 가리는 채팅 필터, 스킬 트리 기획 데이터 검증기, 퀘스트 해금 순서 디버깅, 공간 분할 구조 선택 면접, 정적 장애물 쿼드트리, 적 FSM 전이 표 과외의 6문제다(2/2/2). 작성 단계의 틀린 변형(트라이 6, 스킬 트리 6, 퀘스트 디버깅의 단일 버그·부분 수정 9(Stack→Queue 포함), 쿼드트리 9)은 로컬 .NET 8에서만 돌려 모두 실패했고, 대안 정답(Kahn 방식과 재귀 스킬 트리, 지연 분할 쿼드트리)은 통과했다. 커밋 `e898a4d`로 배포했다.

**검수에서 확인한 것.** GPP Spatial Partition·State·Data Locality, Wikipedia Topological sorting·Trie·Scunthorpe problem·Quadtree·BVH·State-transition table·Aho–Corasick·Hangul Syllables, MS Learn Dictionary·PriorityQueue·Char.ToLowerInvariant·C# enum, Teschner 외 논문 PDF를 원문으로 열었다. 로컬 변형 36개 중 8개를 실제 채점 서버(Compiler Explorer)에서 다시 돌려 같은 결과를 얻었다. 스킬 트리 검증기는 어떤 유효 순서와 어떤 순환 시작점도 인정하고 순환·없는 id 형식이 명시되어 있어 문제가 없었다. 퀘스트 디버깅도 버그마다 따로 실패하고 부분 수정(Stack→Queue, `remaining`을 고치지 않고 건너뛰기 포함)도 실패해 문제가 없었다.

**틀려서 고친 것.** 트라이 문제의 "한글 완성형 11,172자"는 잘못된 용어여서(완성형은 KS의 2,350자 집합) 유니코드 Hangul Syllables 블록을 인용했다. 근거 없는 "26칸 배열이 더 빠르다"와 단어 경계·정규화 대책은 지우고 Wikipedia가 뒷받침하는 화이트리스트만 남겼으며, Aho–Corasick에 출처를 달았다. 부분 문자열 매칭은 규칙 4의 명시적 정책(`badge` → `***ge`)으로 적고 테스트 검사를 더했다. 공간 분할 면접은 GPP를 "쿼드트리의 비용은 이동"의 근거로 들었지만 GPP는 쿼드트리 이동이 "꽤 빠르다"고 하므로 세 곳을 고쳤고, 공간 해시는 Teschner 외(2003)로, 캐시 항목은 GPP Data Locality로 인용했으며, c6의 "공간 해시는 점유된 칸만 쓴다"를 지웠다. 쿼드트리 문제도 "정적 전용" 문단과 c11의 같은 GPP 오귀속을 고쳤고, 저장 규칙을 요구 사항으로 적었다(모든 잎에 저장하는 설계도 8/8 통과해 테스트는 그대로 두었다). FSM 과외의 "switch는 모든 case를 고쳐야 한다"는 과장이라 조건부로 바꿨고, enum 값이 밀리는 문제는 MS Learn으로 인용했으며, c10의 GPP 인용을 뺐다.

**끝까지 확인하지 못한 것.** 근거 없이 남은 주장은 없고, 추론은 추론으로 표시했다. 트랙 10의 상태 패턴 FSM이나 기존 면접과는 다른 문제로 판단했다.

## 묶음 c

- `t3-impl-leaderboard-topk-minheap` — 아케이드 랭킹 보드: 최소 힙으로 상위 K 개 기록만 유지하기 (실전 구현 · Easy · 실행 검증)
- `t3-debug-buff-expiry-scheduler` — 버프 만료 스케줄러 디버깅: 갱신한 버프가 원래 시각에 꺼지고, 같은 틱에 끝나는 버프가 건 순서대로 나오지 않고, 해제했다 다시 건 버프가 끝나지 않는다 (디버깅 · Medium · 실행 검증)
- `t3-impl-grid-line-of-sight-supercover` — 잠입 게임의 경비병 시야: 격자 위 시선이 지나는 모든 칸 검사하기 (실전 구현 · Medium · 실행 검증)
- `t3-interview-ai-decision-architectures` — NPC 의사결정 구조 선택: FSM · HFSM · Behaviour Tree · Utility AI · GOAP (압박 면접 · Hard · 문서 대조)
- `t3-impl-tactics-move-range` — 전술 RPG 이동 범위 표시: 지형 비용과 이동력으로 제한한 탐색, 그리고 이동 경로 미리보기 (실전 구현 · Hard · 실행 검증)

**무엇을 만들었는지.** 최소 힙으로 상위 K개만 유지하는 리더보드, 버프 만료 스케줄러 디버깅, 격자 위 시선이 지나는 모든 칸을 검사하는 시야 판정, NPC 의사결정 구조 면접, 지형 비용이 있는 전술 이동 범위의 5문제다(Easy 1 / Medium 2 / Hard 2). 작성자는 Wikipedia·MS Learn·Red Blob·GPP와 Game AI Pro 4장 PDF를 curl로 받아 읽었다. 스케줄러의 동점 순서 버그는 .NET 8 PriorityQueue의 결정적이지만 FIFO가 아닌 디큐에 기대고 있었다. 커밋 `32b5163`으로 배포했다.

**검수에서 확인한 것.** MS Learn PriorityQueue·List.Sort·.NET 9 라이브러리, Wikipedia Partial sorting·Bresenham·Dijkstra·Behavior tree·Utility system, Red Blob 선 그리기·A* 소개·구현·육각형, Game AI Pro 4장 PDF, GPP State를 열었다(모두 HTTP 200). 채점 서버에서 스케줄러 시작 코드는 독립 실행 네 번 모두 같은 6케이스에서 실패했고, 부분 수정·고전적 실수 변형 5개는 실패, 다르게 쓴 정답 2개는 통과했다. 시야 판정은 규칙이 Red Blob 원문과 맞고 대칭을 양방향으로 시험했으며 틀린 변형 5개 실패·정답 1개 통과였다. 이동 범위는 틀린 변형 6개 실패·정답 1개 통과였다. 리더보드는 문제가 없어 "불안정 정렬" 근거로 기존 `ms-learn-list-sort`만 더했다.

**틀려서 고친 것.** 버프 스케줄러는 시작 코드의 동점 키를 `(at, unit, buff)`로 바꿔, PriorityQueue가 같은 우선순위를 어떤 순서로 내든 동점이 항상 유닛 순서로 나오게(그래도 명세상 틀리게) 했고 ".NET 8은 1,3,2를 낸다"는 주장을 없앴다. 호출 규약은 매 틱 Advance한다고 했지만 테스트는 틱을 건너뛰어 모순이었으므로 문구를 고치고 무작위 테스트가 단계마다 새 틱을 쓰게 했다. AI 면접은 "pioneered"를 "처음 썼다"로 옮긴 것을 "개척한"으로, Utility 튜닝이 "어렵다"를 "까다로울 수 있다"로 고쳤고, 근거 없는 "Utility에 정확히 맞는다"는 4장 내용으로 좁혔으며, 출처 없는 핵심 답 둘을 추론으로 표시하고 해설을 2,198자로 줄였다. 이동 범위의 힌트 1은 예시 2에서 BFS가 실패한다고 했지만 요구된 컷오프를 쓰면 실패하지 않아서, 힌트를 이동력 6으로 바꾸고 맞는 테스트 케이스를 더했다.

**끝까지 확인하지 못한 것.** 남은 항목은 없다. 스케줄러 시작 코드에 직접 만든 힙을 넣지 않은 것은, 이미 배포된 `t3-debug-minheap-atb-astar`가 직접 만든 힙에서 빠진 동점 처리를 가르치기 때문이다. 복잡도·할당·정수 전용 제약은 채점표만 다룬다.

## 묶음 d

- `t3-impl-match3-clear-and-gravity` — 매치-3 퍼즐 보드: 가로·세로로 3개 이상 이어진 보석을 지우고 떨어뜨리기 (실전 구현 · Easy · 실행 검증)
- `t3-debug-match3-cascade-resolver` — 매치-3 연쇄 디버깅: L·T자 매치 점수가 한 칸 더 나오고, 맨 아래 세로 줄을 지우면 위 보석이 바닥까지 내려오지 않고, 특정 시드에서 게임이 멈춘다 (디버깅 · Medium · 실행 검증)
- `t3-tutor-seeded-rng-replay-roguelike` — 시드와 결정적 난수: 리플레이와 로그라이크 층 생성을 같은 결과로 재현하기 (과외·개념 · Easy · 문서 대조)
- `t3-impl-console-autocomplete-topn` — 개발자 콘솔 명령 자동 완성: 정렬된 이름에서 접두사 구간을 찾고 많이 쓴 순서로 상위 N 개 고르기 (실전 구현 · Medium · 실행 검증)
- `t3-interview-big-o-frame-budget` — Big-O 를 실제 프레임 예산에 적용하기: n = 100 의 O(n²), 캐시, 분할 상환과 한 프레임의 최악 (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** 매치-3 보드 지우기와 떨어뜨리기, 매치-3 연쇄 디버깅(버그 3, 케이스마다 스레드 타임아웃), 시드와 결정적 난수 과외(층별 시드를 SplitMix64로 만듦, `tests: null`), 개발자 콘솔 자동 완성(이분 탐색 두 번으로 접두사 구간, 크기 n 힙으로 상위 N, 서수 비교), 프레임 예산에 적용하는 Big-O 면접의 5문제다(Easy 2 / Medium 2 / Hard 1). 작성 단계에서 모든 해답이 통과하고 시작 코드는 0/7·1/6·0/8이었다. 검수를 마친 뒤 같은 검수자가 다섯 해설 끝에 "흔한 오해" 두 항목씩을 넣었다. 커밋 `070755e`로 배포했다.

**검수에서 확인한 것.** 파일의 모든 URL과 `Random.cs`·`List.cs`, globalization-invariant 문서, 벤치마크 지침 원문을 열었다. 매치-3 지우기는 전형적인 틀린 답 7개가 각각 실패했다. 연쇄 디버깅은 세 버그 중 하나나 둘을 남기면 실패하고, 무한 루프 답은 채점 서버에서 "[FAIL] cascade-ends (1.5초)" 줄을 따로 받았다. 시드 과외의 수치는 별도 Python 구현으로 모두 재현했다. 채점 서버의 기본 문화권은 ICU 기반 invariant여서 자동 완성 템플릿을 en-US(실패하면 invariant)로 고정했고, 문화권 정렬 변형은 en-US·sv-SE·tr-TR·ja-JP·ko-KR·invariant·NLS에서 실패했다. 흔한 오해 항목도 실행으로 확인했다. `int[,]`를 넘길 때 호출자에게 안 보이는 것은 매개변수 재대입뿐이고, 3×4 보드의 `board.Length`는 12이며, xorshift 상태 0은 0에 머물고, 층 시드 16,913과 110,021은 같은 상위 32비트를 내며(Python과 .NET 8 일치), 채점 서버에서 `tp_home`이 `tp2`보다 앞에 정렬되고, .NET 8 PriorityQueue는 같은 우선순위를 a, g, f, e, d, c, b 순으로 냈다. 흔한 오해를 넣은 뒤에도 check-tests와 validate-data를 다시 돌렸다.

**틀려서 고친 것.** 매치-3 문제는 `ClearMatches`가 떨어뜨리거나 채우지 않고 위 칸은 0으로 남는다는 점이 시나리오에 없어 넣었다. 연쇄 디버깅의 c6은 어디에도 적히지 않은 "단계마다 할당 없음"을 요구하면서 해설이 인정하는 수정을 깎았으므로 제약을 더하고 c6을 좁혔다. 시드 과외는 SplitMix64를 citation needed 표시가 달린 Wikipedia 코드로만 인용하고 있어 Vigna의 `splitmix64.c`를 더했고(상수와 시프트가 일치), "검사를 켠 빌드에서도 확인했습니다"를 Learn의 checked/unchecked와 산술 연산 문서 인용으로 바꿨으며, 해답과 모순되던 c5를 고쳤다. 자동 완성은 서수 비교를 시나리오 요구로 넣고 문자열 비교 모범 사례를 인용했으며, 문제가 묻지 않은 것을 묻던 c11을 다시 썼다. Big-O 면접에는 Big-O(Wikipedia), `Dictionary.Add`, 분할 상환 성장, .NET 8 `List.cs`의 두 배 성장(구현 사항으로)을 인용했고 지어낸 수치는 남기지 않았다. 흔한 오해를 넣으면서 새 출처 id `ms-learn-array-length`와 `ms-gh-bdn-engineresolver-v0158`(BenchmarkDotNet v0.15.8의 EngineResolver.cs)을 더했다.

**끝까지 확인하지 못한 것.** Steele·Lea·Flood 논문은 열지 않았다(문제는 Vigna의 코드를 인용한다). invariant-globalization 모드에서는 문화권 비교가 서수 비교가 되어 문화권 정렬 변형도 통과하며, 테스트 노트에 dotnet/runtime 문서를 인용해 그렇게 적었다.

## 묶음 e

- `t3-impl-crafting-recipe-resolver` — 제작 창의 '제작 가능' 표시: 재귀 레시피의 기초 재료 총량을 메모이제이션으로 구하고 순환 데이터 막기 (실전 구현 · Medium · 실행 검증)
- `t3-debug-initiative-speed-ties-death` — 턴 순서 디버깅: 속도가 같으면 적이 먼저 움직이고, 헤이스트가 다음 라운드에야 듣고, 반격으로 죽은 유닛 다음 차례가 사라진다 (디버깅 · Easy · 실행 검증)
- `t3-impl-sliding-window-dps-meter` — 전투 HUD 의 최근 5초 DPS 미터: 큐와 누적 합으로 만드는 시간 창 (실전 구현 · Easy · 실행 검증)
- `t3-interview-procgen-connectivity` — 절차적 맵 생성 기법 비교: 랜덤 워크 · BSP 방 · 셀룰러 오토마타 동굴 · 노이즈 지형, 그리고 입구에서 출구까지 가는 길의 보장 (압박 면접 · Medium · 문서 대조)
- `t3-impl-cellular-automata-cave-connectivity` — 동굴 층 생성기: 셀룰러 오토마타 4-5 규칙으로 다듬고, 상하좌우로 이어진 가장 큰 동굴만 남기기 (실전 구현 · Hard · 실행 검증)

**무엇을 만들었는지.** 재귀 레시피의 기초 재료 총량을 메모이제이션으로 구하고 순환 데이터를 막는 제작 해석기, 행동 순서 디버깅, 큐와 누적 합으로 만드는 최근 5초 DPS 미터, 절차적 맵 생성 기법과 연결성 보장 면접, 셀룰러 오토마타 4-5 규칙 동굴과 가장 큰 영역만 남기기의 5문제다(Easy 2 / Medium 2 / Hard 1). 작성자는 변이 답 약 40개를 돌려 모두 실패하고, 행동 순서 버그가 각각 따로 실패하며, 대안 정답이 통과하는 것을 확인했다. 커밋 `21be22b`로 배포했고 해설마다 "흔한 오해"가 들어 있다.

**검수에서 확인한 것.** 인용된 Microsoft Learn 페이지 전부, release/8.0의 `List.cs`·`Queue.cs`·`ArraySortHelper.cs`·`Array.cs`, RogueBasin 세 페이지, Red Blob, Wikipedia 아홉 문서를 열었다. 문제마다 틀린 학습자 답 1~9개를 로컬에서 돌려 모두 잡혔고 대안 정답 둘은 통과했다. 레시피 문제에서 학습자 답이 스택 오버플로로 죽으면 어떻게 보이는지 채점 서버에서 실행해 확인했다(앞의 6개 결과는 남고 뒤 2개는 "결과가 출력되지 않았습니다"가 되며, 0이 아닌 종료 코드와 "Stack overflow."가 찍힌다). 절차 생성 면접의 흔한 오해에는 64×64 맵 100개 중 5·20·100단계 뒤에도 영역이 여럿인 맵이 87·62·62개라는 실행 결과를 붙였다. 추론으로 표시한 항목(다중 워커, BSP 귀납, k단계 의존)은 맞았다.

**틀려서 고친 것.** 레시피 문제는 두 순환 케이스를 일부러 마지막에 둔다는 것과 충돌하면 학습자에게 보이는 모습을 테스트 노트에, 충돌하면 실행이 끝난다는 경고를 제약에 넣었고, c9가 `TryGetValue`를 이름으로 요구하지 않게 했다. 행동 순서 디버깅의 흔한 오해는 16개 이하를 정렬하면 같은 속도의 순서가 지켜진다고 암시했지만, .NET 8은 2~3개 구간에 `SwapIfGreater`를 써서 `A0:5 A1:5 A2:6`이 A2, A1, A0으로 정렬된다. 이를 고치고 ArraySortHelper 출처(`ms-gh-runtime8-arraysorthelper`, 트랙 5와 같은 URL)를 더했다. DPS 미터의 int 합은 4번째가 아니라 2번째 `int.MaxValue` 타격에서 넘치므로 고쳤고, c8이 `TryPeek`을 요구해 c7이 허용하는 링 버퍼를 깎던 것을 바로잡았으며, Queue 문서는 `TrimExcess`가 용량을 줄일 "수 있다"고만 하므로 그렇게 쓰고 .NET 8 `Dequeue` 소스로 뒷받침했다. Enqueue/Dequeue O(1)은 각자의 페이지로 인용하고 코드 주석 "수십억"을 "약 42억"으로 고쳤다. 절차 생성 면접은 Wikipedia대로 CA 갱신이 "대개" 동시라고(예외가 있다) 고쳤고, R2는 두 칸 "이내"의 벽을 센다는 것, BSP 분할 범위는 방이 아니라 하위 영역의 크기를 바꾼다는 것을 바로잡았다. 동굴 문제도 같은 "대개 동시" 수정과 충돌 노트를 넣고, 마지막 케이스 타임아웃 메시지의 작은 경쟁 상태를 고쳤다.

**끝까지 확인하지 못한 것.** 검수 보고에 남은 미확인 항목은 없다. 재귀 플러드 필이나 끝없는 제작 재귀는 프로세스를 죽이며, 그 뒤 케이스는 출력이 없어 실패로 센다.

## 최종 점검 (2026-11-22)

배포된 30문제 전체를 점검 에이전트 3개(10문제씩)가 차례로 다시 확인하고, 점검에 참여하지 않은 검증 에이전트 2개(15문제씩)가 그 변경을 다시 확인했다. 두 검증 모두 통과 판정을 냈다.

**한 일.** 흔한 오해가 없던 20문제에 "### 흔한 오해" 절을 넣고(출처나 실행으로 뒷받침), 모든 채점 항목·감점에 `sourceId`나 `basis`(`principle`/`tests`)를 붙이고, `sourceRefs`가 4개를 넘던 문제(최대 9개)를 4개로 줄였다(나머지는 본문 인용으로 유지). 새 근거로 Microsoft Learn(CA1854, Math.Round, ValueTuple 등), dotnet/runtime release/8.0 `ValueTuple.cs`, Game AI Pro 4·6장, CMU 15-362 8강, CMU 17-214 3·4강 슬라이드를 더했다. 모범 답안과 숨은 테스트는 바꾸지 않았다.

**확인한 것.** 인용한 페이지를 모두 다시 받아 문장을 대조했다(Microsoft Learn, Wikipedia, Red Blob Games, Amit Patel, Game Programming Patterns, Game AI Pro, Teschner 논문, CMU 슬라이드). 테스트가 있는 문제는 로컬 .NET 8에서 모범 답안 통과·초기 코드 실패와 틀린 변형을 다시 돌렸고, 본문의 수치(캐스트 결과, LCG 하위 비트, 확률 분포, 터키어 대소문자, `PriorityQueue` 동점 순서 등)를 다시 실행했다. 커밋 전 `check-tests.js`를 판정 서버에서 전부 다시 돌려 통과했다.

**틀려서 고친 것.**
- `t3-impl-aoe-uniform-grid`: "minX를 빼면 Floor와 같은 셀"은 minX가 셀 크기의 배수가 아니면 틀려 범위를 좁혔고, `(int)`와 `Floor`가 "양수에서만 같다"도 0과 음의 정수에서도 같으므로 고쳤다.
- `t3-impl-astar-tile-grid`: 재현할 수 없던 "지도 1,823개 중 103개" 수치를, 누구나 재현할 수 있는 실행(맨해튼 휴리스틱을 두 배로 하면 숨은 테스트 9개 중 4개 실패, 100×100 지도에서 비용 405 대신 407)으로 바꿨다.
- `t3-impl-tactics-move-range`: 재현할 수 없던 큐 항목 수치를 검증자의 실행(지도 11,000개, 낡은 항목 0개)으로 바꿨다.
- `t3-interview-ai-decision-architectures`: Game AI Pro 4장이 말하지 않은 "음식이 얼마나 가까운지"를 빼고 장의 표현(배고픔·부상)으로 좁혔고, 가중 무작위 선택의 효과를 과장한 문장을 고쳤다.
- `t3-debug-initiative-ties`: "17개면 항상 안정성이 깨진다"는 속도가 많이 겹칠 때만 맞아 속도 범위와 측정값을 밝혔다.
- 그 밖에 출처를 잘못 연결한 채점 항목(Random 문서, Wikipedia가 말하지 않는 규칙 등)을 `basis: "tests"`로 바꾸고, Red Blob 페이지 귀속 오류와 "이진 힙은 안정 정렬이 아니다" 표현을 고쳤으며, 내비메시 재구축 문장을 "추론"으로 표시했다.

**끝까지 확인하지 못한 것.** Unity Mono/IL2CPP에서의 동작은 실행하지 않았다(해당 문장은 문서 근거만 쓴다).
