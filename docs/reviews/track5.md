# 트랙 5 검수 기록

[문서 목록](../README.md) · [작성·검수 기준](../STANDARDS.md)

## 초기 문제

트랙 5에는 확장 묶음 이전의 초기 문제가 없다. 묶음 a·b·c의 15문제가 커밋 `937be74`("트랙 5 자료구조·알고리즘 기초 문제 15개 추가", 독립 검수 완료) 하나로 함께 처음 공개되었다.

## 묶음 a

- `t5-impl-dynamic-array-mylist` — 동적 배열 MyList<T> 직접 구현하기: 용량 2배 확장과 삽입·삭제 (실전 구현 · Medium · 실행 검증)
- `t5-impl-ring-buffer-input` — 고정 용량 링 버퍼: 가득 차면 가장 오래된 입력을 덮어쓰기 (실전 구현 · Medium · 실행 검증)
- `t5-impl-hashmap-chaining` — 분리 연결법 해시 테이블 IntHashMap: 충돌, 음수 키, 리사이즈 (실전 구현 · Medium · 실행 검증)
- `t5-debug-undo-redo-two-stacks` — 두 개의 스택으로 만든 Undo/Redo 디버깅 (레벨 에디터 타일 편집) (디버깅 · Easy · 실행 검증)
- `t5-interview-list-linkedlist-dictionary` — List<T> · LinkedList<T> · Dictionary<TKey,TValue>: 내부 구조와 게임 코드에서의 선택 (압박 면접 · Medium · 문서 대조)

**무엇을 만들었는지.** 용량을 두 배로 늘리는 동적 배열 MyList<T>, 가득 차면 가장 오래된 입력을 덮어쓰는 링 버퍼, 분리 연결 해시 테이블 IntHashMap, 두 스택 Undo/Redo 디버깅, List·LinkedList·Dictionary 면접의 5문제다. 작성 단계 check-tests는 8/8·0/8, 6/6·0/6, 8/8·0/8, 7/7·2/7이었다. 작성자는 Microsoft Learn(.NET 8 List.Add·RemoveAt, LinkedList, Dictionary, EqualityComparer.Default, Stack.Pop, CA1815), Wikipedia(Dynamic array, Circular buffer, Hash table), GPP(Command, Data Locality)를 읽었고, 복잡도와 무할당 제약은 채점표에 맡겼다. 커밋 `937be74`로 배포했다.

**검수에서 확인한 것.** 원래 `extraSources` 12개와 새로 넣은 9개(List.Item·Clear·TrimExcess·GetEnumerator, Dictionary.Clear, Struct Design, ValueType.GetHashCode, C# struct 참조, cppreference 산술 연산자)를 열었다. 채점 서버(Compiler Explorer)에서 변형 20개를 돌려 틀린 15개는 모두 실패하고 맞는 대안 5개(`Array.Copy`, if로 감기, 곱셈 해시, double 비교를 곁들인 `& 0x7FFFFFFF`)는 통과했다. Undo/Redo 디버깅은 문제가 없었다. 링 버퍼의 덮어쓰기·오류 정책과 가득 참·빔 판정 방법은 Wikipedia가 실제로 뒷받침했다.

**틀려서 고친 것.** MyList의 분할 상환 경계 "마지막 용량 < 2n"은 n ≥ 3에서만 성립해서 단서를 달았고, 1씩 늘리는 답이 빨리 실패하도록 `large-append`에 이른 Capacity 검사를 넣었다. 링 버퍼의 음수 나머지 주장에는 출처가 없어 cppreference를 인용했다. 해시 테이블은 0.75가 이 문제의 명세일 뿐이라고(Wikipedia는 분리 연결에 1~3, 개방 주소에 0.6~0.75를 든다) 해설에 밝혔고, 모든 `Math.Abs` 사용을 틀린 것처럼 말하던 c4를 고쳤으며, c7을 Wikipedia로 다시 인용하고 `large-rehash`에 이른 BucketCount 검사를 넣었다. 실제 오류는 면접 문제에 있었다. `EqualityComparer<T>.Default` 문서는 박싱을 말하지 않아 그 주장을 Struct Design 지침으로 옮겼다. CA1815의 리플렉션 문장은 blittable이 아닌 struct에만 해당해 `GridPos`에는 맞지 않는다고 밝히고 `ValueType.GetHashCode`의 "해시 키로 쓰기에 부적합" 경고를 더했다. "변경된 struct 키는 찾을 수 없다"는 함정은 딕셔너리가 복사본을 저장하므로 오해를 부르는 설명이어서 클래스 키 중심으로 다시 썼다. 인덱서 O(1), Clear, TrimExcess(O(n), 90% 이상이면 아무것도 하지 않음), foreach 중 수정 시 `InvalidOperationException`에 출처를 달았다.

**끝까지 확인하지 못한 것.** 용량 생성자와 `List.RemoveAt`의 "블록 복사" 설명은 문서로 확인하지 못했다.

## 묶음 b

- `t5-impl-bst-score-tree` — 이진 탐색 트리: 점수 삽입·탐색·삭제와 중위 순회 (실전 구현 · Medium · 실행 검증)
- `t5-impl-bfs-tile-shortest-steps` — BFS: 타일 맵에서 최소 이동 횟수 구하기 (실전 구현 · Easy · 실행 검증)
- `t5-impl-flood-fill-regions` — 플러드 필: 타일 맵의 구역 수와 가장 큰 구역의 크기 (실전 구현 · Medium · 실행 검증)
- `t5-impl-dijkstra-priorityqueue` — 다익스트라: PriorityQueue 로 단일 출발점 최단 거리 구하기 (실전 구현 · Medium · 실행 검증)
- `t5-interview-cpp-standard-containers` — C++ 표준 컨테이너 선택: vector · list · map · unordered_map (압박 면접 · Medium · 문서 대조)

**무엇을 만들었는지.** 이진 탐색 트리 점수 관리, 타일 맵 BFS 최소 이동, 플러드 필 구역 수와 최대 구역, PriorityQueue 다익스트라, C++ 표준 컨테이너 선택 면접의 5문제다. 난이도는 Easy 1 / Medium 4이고 Hard는 없다. 작성 단계에서 재귀 플러드 필이 마지막 케이스에서 스택 오버플로로 죽고(출력 없음 → FAIL), O(V²) 다익스트라가 20만 노드 케이스에서 시간 초과되는 것을 채점 서버에서 확인했다. 커밋 `937be74`로 배포했다.

**검수에서 확인한 것.** Microsoft Learn(.NET 8 PriorityQueue, Enqueue, Remove, .NET 9 라이브러리 새 기능, StackOverflowException), cppreference(vector, vector::reserve, vector::erase, list, map, unordered_map, unordered_map::find·reserve, 컨테이너 라이브러리, remove), Wikipedia(BST, BFS, Flood fill, Dijkstra, d-ary heap)를 열었다. 플러드 필은 재귀 답이 두 번 모두 약 131k 프레임(100만 필요)에서 스택 오버플로로 마지막 케이스만 실패하고, 모범 답안은 20초 제한에 약 0.15초, 느리지만 맞는 HashSet/Queue 답은 1.5~4.2초로 통과해, 테스트가 믿을 만하고 공정하다고 판단했다. BFS는 문제가 없었다(DFS 틀린 답의 실패는 로컬에서만 확인). 채점 서버 요청 제한에 걸린 뒤로는 간격을 두고 실행을 마쳤다.

**틀려서 고친 것.** BST는 `a - b`로 비교하는 틀린 답이 7/7을 통과했다(`extreme-values`가 극값끼리 비교하지 않았다). int.MinValue와 int.MaxValue를 루트로 하는 삽입 순서를 넣어 이제 그 답은 실패한다. 다익스트라는 .NET 8에 우선순위 갱신 메서드가 없음을 확인하고 `Remove`는 .NET 9 이후의 선형 탐색이라고 적었다. Learn은 Enqueue/Dequeue 복잡도를 밝히지 않으므로 그렇게 쓰고, 문서화된 4진 힙에서 O(log n)을 유도하며 d-ary heap을 인용했다. O(V²)가 20만 노드에서 로컬로 35초밖에 안 걸려 20초 제한에 너무 가까웠으므로 40만 노드로 늘렸다(모범 답안 0.20~0.33초, SortedSet 0.25~0.28초, 직접 만든 List 힙 0.22~0.23초, O(V²)는 시간 초과). C++ 컨테이너 면접은 캐시 진술을 일반적인 구현에 대한 추론으로 표시하고 c4의 cppreference 인용을 뺐으며, `unordered_map::reserve` 주장을 페이지 문구에 맞추고 출처를 더했고, erase가 다음 반복자를 돌려준다는 주장에 "C++11부터"를 붙였다. BFS의 "단조 증가"는 "감소하지 않는 순서"로 고쳤다.

**끝까지 확인하지 못한 것.** 남은 항목은 없다. 매 단계 리스트를 정렬하는 다익스트라 답은 여전히 테스트를 통과하며, 채점표에 맡긴다고 노트에 적었다.

## 묶음 c

- `t5-impl-stable-merge-sort-ranking` — 랭킹 보드를 위한 안정 병합 정렬 직접 구현 (실전 구현 · Medium · 실행 검증)
- `t5-debug-binary-search-level-table` — 누적 경험치 표에서 레벨 찾기: 이분 탐색 경계 디버깅 (디버깅 · Medium · 실행 검증)
- `t5-impl-sliding-window-min-hits` — 슬라이딩 윈도우: 데미지 합이 목표에 닿는 가장 짧은 연속 타격 (실전 구현 · Medium · 실행 검증)
- `t5-impl-knapsack-01-inventory` — 0/1 배낭 DP: 무게 한도 안에서 인벤토리 가치 최대화 (실전 구현 · Medium · 실행 검증)
- `t5-interview-sorting-bigo-stability` — 정렬 알고리즘과 Big-O: 퀵·병합·힙 정렬 비교와 .NET Sort 의 불안정성 (압박 면접 · Medium · 문서 대조)

**무엇을 만들었는지.** 랭킹 보드용 안정 병합 정렬, 누적 경험치 표의 이분 탐색 경계 디버깅, 목표 피해에 닿는 가장 짧은 연속 타격(슬라이딩 윈도), 0/1 배낭 DP, 정렬 알고리즘과 .NET Sort의 불안정성 면접의 5문제다. 작성자는 각 판정을 2.5초 감시 타이머가 있는 작업 스레드에서 돌려 끝나지 않은 케이스에 `[FAIL]`을 찍고 끝내게 했고, 채점 서버에서 무한 루프 수정·O(n²) 정렬·O(n²) 윈도·지수 시간 배낭이 실패하는 것을 확인했다. 검수에서 다섯 문제 모두 Medium으로 정했다. 커밋 `937be74`로 배포했다.

**검수에서 확인한 것.** Microsoft Learn(`Array.Sort`, `List<T>.Sort`, `OrderBy`, `OrderByDescending`, 람다 오류, C# 명세 Expressions, Boxing, `Comparer<T>.Default`, `ToList`), Wikipedia(Sorting algorithm, Quicksort, Merge sort, Binary search, Knapsack, Continuous knapsack), USACO Guide를 열었다. 채점 서버 시간은 모범 답안 45~115 ms, 호출마다 할당하는 병합 정렬 약 75 ms, List 기반 109~154 ms, 2차원 배낭 78~96 ms였고, 삽입 정렬·선형 탐색·O(n²) 윈도·메모 없는 재귀는 시간 초과였다. 병합 정렬(`>=`와 뺄셈 비교 답을 잡는다)과 슬라이딩 윈도는 문제가 없었다.

**틀려서 고친 것.** 이분 탐색 디버깅은 버그마다 자기 입력에서 실패하고 닫힌 구간 수정도 9/9로 통과했지만, 해설이 `<` 비교를 구간 불일치라고 잘못 불렀고 과제가 요구한 가장 작은 실패 입력(`[100]`/150, `[100]`/100, `[100,300]`/150)을 주지 않았다. 둘 다 고치고 닫힌 구간 수정을 보탰으며, c10이 버그를 정확히 셋 찾으라고 요구하지 않게 했다. 배낭은 "탐욕은 나눌 수 있을 때만 최적"에 출처가 없어 Wikipedia 연속 배낭 페이지에 맞게 고쳤고, 큰 케이스의 용량을 10,000에서 5,000으로 낮춰 여유를 두었다(Dictionary 메모 배낭은 672~887 ms에서 269~383 ms가 되었다). 면접은 클로저 할당·박싱·`ToList` 주장을 Learn 문구로 좁혔고, 델리게이트 호출 비용은 Learn 근거가 없어 "측정하라"로 바꿨으며, 비교 정렬 하한을 최악·평균으로 밝혔다. "모든 O(n log n) 정렬"은 `Array.Sort`로 좁혔고(정렬된 int 10,000개에 약 110k 비교, 로컬 측정), 인트로소트 설명과 c4가 문서의 무조건적 O(n log n) 이상을 주장하지 않게 했다.

**끝까지 확인하지 못한 것.** 라이브러리 정렬을 썼는지, 윈도가 O(n log n)인지 O(n)인지, O(W) 공간을 지켰는지는 테스트로 잡을 수 없어 채점표에 맡겼다. 검수 보고에 따로 남은 미확인 항목은 없다.

## 묶음 d

- `t5-impl-singly-linked-list-patrol-route` — 단일 연결 리스트: 순찰 경로 삽입·삭제·제자리 뒤집기와 순환 감지(플로이드) (실전 구현 · Medium · 실행 검증)
- `t5-impl-stack-damage-formula-evaluator` — 스택 두 개로 데미지 공식 계산기 만들기: 우선순위·괄호·단항 마이너스 (실전 구현 · Hard · 실행 검증)
- `t5-debug-circular-queue-spawn-wraparound` — 스폰 대기열 디버깅: 원형 배열 큐가 한 바퀴 돌 때 터지는 버그 (디버깅 · Easy · 실행 검증)
- `t5-interview-hash-table-collisions-load-factor` — 해시 테이블 깊이 보기: 충돌 처리, 적재율, 순회 순서, 해시 플러딩 (압박 면접 · Medium · 문서 대조)
- `t5-tutor-big-o-loops-logs-amortized` — Big-O 표기법 입문: 루프·중첩 루프·로그·분할 상환을 코드에서 읽어 내기 (과외·개념 · Easy · 문서 대조)

**무엇을 만들었는지.** 순찰 경로 단일 연결 리스트(삽입·삭제·제자리 뒤집기·플로이드 순환 감지), 스택 두 개로 만드는 데미지 공식 계산기, 원형 배열 스폰 큐 디버깅, 해시 테이블 충돌·적재율·해시 플러딩 면접, 루프·로그·분할 상환을 읽는 Big-O 과외의 5문제다(Easy 2 / Medium 2 / Hard 1). 작성 단계 check-tests는 8/8·0/8, 8/8·0/8, 7/7·3/7이었다. 재귀 해답은 마지막 케이스에서 프로세스가 죽는데, 플러드 필 문제의 선례를 따랐다. 면접과 과외는 `tests: null`이다. 커밋 `ab494de`로 배포했다.

**검수에서 확인한 것.** 기존 URL 17개가 모두 열리고 인용 내용을 뒷받침하는 것을 확인했고, Wikipedia Lazy deletion과 Microsoft Learn 문자열 비교 모범 사례를 더했다. 채점 서버에서 충돌 뒤에도 앞선 PASS 줄이 남는 것을 확인했다(종료 코드 134). 원형 큐 디버깅은 세 버그와 재현 순서가 모두 맞아 문제가 없었다. Big-O 과외의 모든 분류와 분할 상환 주장은 다시 유도해 맞았다.

**틀려서 고친 것.** 연결 리스트는 재귀 답이 마지막 케이스를 맨 "출력 없음"으로 남겨서, 템플릿이 이유를 담은 임시 FAIL을 먼저 찍고 실제 결과가 덮어쓰게 했다. 수식 계산기는 테스트가 시나리오에 없는 규칙(단항 마이너스 결합 `12/-3*2 = -8`, 맨 앞의 이항 연산자, `(-)`, 공백만 있는 입력, 공백 문자로는 스페이스만 인정)을 검사하고 있어 모두 시나리오에 넣었다. "0을 넣고 이항 마이너스"와 우선순위가 낮은 단항 마이너스는 무작위 케이스로만 잡혀서 고정 케이스 2개를 더했고, 같은 충돌 보고 방식을 적용했다. 해시 테이블 면접은 근거 없던 "원소 + 툼스톤 기준 리사이즈" 관행을 고쳐 출처로 뒷받침하고, FNV-1a 언급을 지우고, "삭제하면 무조건 순서가 깨진다"를 누그러뜨렸다. 문자열 키 Dictionary의 해시 플러딩은 런타임에 따라 다르며 String.GetHashCode 페이지는 프로세스별 무작위화를 말하지 않는다고 덧붙였다. Big-O 과외는 c8이 과제가 묻지 않은 200 대 2,000 계산을 요구해 과제에 넣었고, 확인할 수 없던 c9를 다시 썼다.

**끝까지 확인하지 못한 것.** 남은 항목은 없다. HashSet 순환 감지와 할당 검사는 채점표만 다룬다.

## 묶음 e

- `t5-impl-binary-heap-heapify-heapsort` — 이진 힙 직접 만들기: O(n) 힙 구성(heapify)·Push·Pop 과 힙 정렬 (실전 구현 · Medium · 실행 검증)
- `t5-impl-quicksort-pivot-duplicates` — 퀵 정렬 직접 구현: 피벗 선택, 중복 값에 강한 분할, 재귀 깊이 제한 (실전 구현 · Hard · 실행 검증)
- `t5-debug-recursion-base-case-memo-depth` — 재귀 디버깅: 빠진 기저 조건, 지수 시간 재귀, 스택 깊이 (콤보 도감과 스킬 트리) (디버깅 · Easy · 실행 검증)
- `t5-impl-union-find-guild-alliance` — 유니온 파인드: 길드 연합 합치기와 "같은 연합인가?" 질의 (실전 구현 · Easy · 실행 검증)
- `t5-interview-trees-bst-balanced-btree-heap-trie` — 트리 자료구조 고르기: BST · 균형 트리(AVL·레드-블랙) · B-트리 · 힙 · 트라이 (압박 면접 · Medium · 문서 대조)

**무엇을 만들었는지.** O(n) heapify·Push·Pop과 힙 정렬, 피벗 선택·중복에 강한 분할·재귀 깊이 제한이 있는 퀵 정렬, 빠진 기저 조건·지수 시간·스택 깊이 재귀 디버깅, 길드 연합 유니온 파인드, BST·균형 트리·B-트리·힙·트라이 선택 면접의 5문제다(Easy 2 / Medium 2 / Hard 1). 퀵 정렬 모범 답안은 3중앙값 + Hoare 분할이다. 스택 오버플로가 나도 충돌한 케이스와 이후 케이스에 이유가 남도록 임시 FAIL 줄을 처음과 케이스마다 찍고, 케이스당 1초 제한으로 멈춘 케이스에 구체적 이유를 남긴다. 작성 단계에서 채점 서버로 틀린 변형(퀵 정렬: 마지막 피벗 Lomuto, 같은 값만 있을 때의 3중앙값 Lomuto, 첫 피벗 Hoare, Hoare 무한 루프; 힙: push 기반 구성, 할당하는 힙 정렬; 유니온 파인드: 압축·크기 없음; 재귀: 지수 시간, 깊은 재귀)이 실패하는 것을 확인했다. 커밋 `31e1301`로 배포했다.

**검수에서 확인한 것.** 인용된 17쪽을 모두 열어 모든 주장이 맞는 것을 확인했다. 힙의 4n 기준은 노드 높이 합이 n보다 작아 타당했고, 측정값은 맞는 변형 149,988~299,966, push 기반 1,468,946, 한도 400,000이었다. 퀵 정렬 비교 횟수(3,737,855 대 48,287,258)를 재현했고, 실제 채점 서버 세 번에서 큰 케이스당 8~40 ms(제한 1초)였으며, 무작위 + 3분할·3중앙값 + 3분할·가운데 피벗 Hoare는 통과(최대 약 170 ms)하고 순진한 변형 12개는 이유와 함께 실패했다. 충돌과 루프가 실패 케이스에 이유를 남기는 것도 채점 서버에서 확인했다. 유니온 파인드는 약 30줄짜리 첫 면접 수준 템플릿이라 Easy로 두었고 문제가 없었다.

**틀려서 고친 것.** 힙과 퀵 정렬은 12개가 넘는 배열의 실패 메시지가 `System.Int32[],0,12`로 찍히고 있었다(잘못된 `string.Join` 오버로드). 이를 고쳤고, 힙의 제약과 c5 문구를 다듬었으며, 퀵 정렬 제약에 시험하는 것은 큰 입력 여섯 개뿐이라고 적었다. 재귀 디버깅의 "50은 끝나지 않는다"는 틀려서(약 100초) 고쳤다. 트리 면접은 `sourceRefs`를 넷(자가 균형 BST, 레드-블랙 트리, SortedDictionary, PriorityQueue)으로 줄이고 나머지는 채점 항목에 그대로 남겼으며, `SortedSet`이 균형 트리라는 문서화되지 않은 주장을 지우고, 순위 계산 절차·지연 삭제·색인 힙을 일반 지식으로 표시했다.

**끝까지 확인하지 못한 것.** 남은 항목은 없다. 경로 압축, 피벗 규칙, 작은 쪽 먼저 재귀, 라이브러리 정렬이나 힙 정렬로 바꿔치기는 채점기가 감지할 수 없어 채점표만 다룬다. 오르간 파이프·톱니 입력은 과제가 허용하는 3분할 + 3중앙값에서 이차 시간이 되므로 일부러 시험하지 않는다. 트랙 3에 최소 힙 디버깅 문제가 있지만 핵심 과제가 다르다.

## 묶음 f

- `t5-impl-topological-sort-kahn-build-order` — 위상 정렬(칸 알고리즘): 건설 순서, 순환 감지, 최소 건설 턴 수 (실전 구현 · Medium · 실행 검증)
- `t5-impl-lis-nlogn-combo-chain` — 최장 증가 부분 수열(LIS)을 O(n log n) 으로: 콤보 등급과 하이라이트 체인 복원 (실전 구현 · Hard · 실행 검증)
- `t5-impl-prefix-sum-difference-array-lane` — 차분 배열과 누적 합: 레인 위 장판 피해의 칸별 합계와 구간 합 (실전 구현 · Medium · 실행 검증)
- `t5-debug-grid-path-dp-rolling-buffer` — 격자 경로 DP 디버깅: 한 줄 버퍼의 갱신 방향, 한 칸 모자란 버퍼, 넘치는 경로 수 (디버깅 · Hard · 실행 검증)
- `t5-tutor-recursion-backtracking-loadouts` — 재귀에서 백트래킹으로: 예산 안에 드는 장비 조합 모두 구하기 (과외·개념 · Easy · 문서 대조)

**무엇을 만들었는지.** 칸 알고리즘 위상 정렬(건설 순서·순환 감지·최소 건설 턴 수), O(n log n) LIS와 체인 복원, 차분 배열과 누적 합, 한 줄 버퍼 격자 경로 DP 디버깅, 예산 안의 장비 조합 백트래킹 과외의 5문제다. 트랙 5의 마지막 묶음이라 Easy 1 / Medium 2 / Hard 2로 짰고, 이 커밋으로 트랙 5가 30문제가 되었다. 새로 생긴 Microsoft 자료 지침에 따라 DP 문제는 오버플로 문맥 규칙을 C# 표준 §12.8.20(dotnet/csharpstandard draft-v8)으로 인용했다. 포화 덧셈 증명, Fenwick 언급, 턴 수 = 최장 경로라는 주장은 작성자 자신의 추론이었다. 커밋 `f9d5f44`로 배포했다.

**검수에서 확인한 것.** 인용된 URL 전부와 C# 표준 draft-v8 §12.8.20 원문(인용 목적에 맞다), dotnet/runtime release/8.0의 `ArraySortHelper.cs`·`Array.cs`를 열었다. LIS의 큰 입력 기대 길이(884, 690, 400, 1, 200000)는 별도의 O(n²) 참조와 같았고, 채점기의 Fenwick 참조는 작은 입력 20,000개에서 일치했다. 격자 DP 디버깅은 버그마다 따로 실패하고 모든 부분 수정이 실패했다. 백트래킹 과외의 나머지 개수는 해답을 돌려 확인했다.

**틀려서 고친 것.** 위상 정렬의 "턴 수 = 최장 경로"는 쓰인 대로는 하나가 어긋나서, 증명한 뒤 "최소 턴 = 최장 사슬의 건물 수 = 간선 기준 최장 경로 + 1"로 정확히 쓰고 Wikipedia의 층 나누기 문장으로 뒷받침했다. "처음 도달할 때 턴을 고정하면 BFS 거리와 같다"는 일반적으로 틀려 고쳤고, "예 2"라고 적힌 경계 사례가 다른 그래프를 가리키던 것도 바로잡았다. 채점 서버에서 느리지만 맞는 `Dictionary` O(V+E) 답이 2초·총 2.6초 제한에 걸려 큰 케이스당 5초·총 8초로 넓혔고(가장 느린 정답 1.875초, O(V²)와 `RemoveAt(0)` 답은 여전히 시간 초과), 채점표의 `Enqueue`를 분할 상환 O(1)로 고쳤다. LIS에서 범위 오버로드의 `Array.BinarySearch`가 "검색 범위 바로 뒤 칸"을 돌려주는 동작은 문서에 없어 .NET 8 `ArraySortHelper.cs`로 인용하고 보장이 아닌 구현 사항으로 표시했다. 누적 합의 Fenwick 언급은 부정확해서 "구간 갱신과 구간 합을 함께 하려면 Fenwick 트리 둘이나 지연 세그먼트 트리가 필요하다"로 고치고 문제 자체의 설명으로 표시했다. 격자 DP는 "(`12.8.20)" 안의 떠도는 백틱이 마크다운을 깨뜨릴 뻔해 고쳤고, 포화 증명의 귀납을 드러내 문제 자체의 추론으로 표시했으며, 모호한 과제 문장과 c10을 정리하고 근거가 안 되던 c9 인용을 바꿨다. 백트래킹 과외는 모든 칸을 채울 수 없는 호출 목록에서 `[3]`이 빠져 있었고(5개가 아니라 6개), "되돌리기를 하지 않으면"의 실제 결과는 `[0,1,3]`만 나온다는 것으로 고쳤다.

**끝까지 확인하지 못한 것.** 남은 항목은 없다. 채점 서버 실행 시간은 실행마다 달라진다. 트랙 3의 위상 순서 문제들과는 핵심(턴 수 대 id 검증)이 다르다.

## 최종 점검 (2026-11-22)

배포된 30문제 전체를 점검 에이전트 3개(10문제씩)가 차례로 다시 확인하고, 점검에 참여하지 않은 검증 에이전트 2개(15문제씩)가 그 변경을 다시 확인했다. 두 검증 모두 통과 판정을 냈다.

**한 일.** 트랙 5의 30문제 모두에 "### 흔한 오해" 절을 새로 넣고(출처나 실행으로 뒷받침), 모든 채점 항목·감점에 `sourceId`나 `basis`를 붙이고, `sourceRefs`가 4개를 넘던 문제(최대 15개)를 4개로 줄였다. 새 근거로 dotnet/runtime release/8.0 컬렉션 소스(`List.cs`, `Dictionary.cs`, `PriorityQueue.cs`, `ArraySortHelper.cs`), microsoft/STL(`xtree`, 고정 커밋), libstdc++ 13.2, C# 표준 §12.4.7.3, Microsoft Learn 컬렉션 API 페이지, CMU 17-214 4강 슬라이드를 더했다. 모범 답안과 숨은 테스트는 바꾸지 않았다.

**확인한 것.** 인용한 페이지를 모두 다시 받아 대조했다(Wikipedia, Microsoft Learn, .NET 8 소스, microsoft/STL, cppreference, USACO Guide, Game Programming Patterns 등). 새로 넣은 흔한 오해마다 로컬 .NET 8 또는 MSVC로 실험을 돌렸고(꼬리 재귀, 메모이제이션 재귀, SortedSet 변경, int×int를 long에 저장, break 가지치기 등), 테스트가 있는 문제는 모범 답안 통과·초기 코드 실패를 다시 확인했다. 커밋 전 `check-tests.js`를 판정 서버에서 전부 다시 돌려 통과했다.

**틀려서 고친 것.**
- 해시 면접: 꼬리질문 3이 `string.GetHashCode`로 해시 플러딩 위험을 판단하게 했지만, .NET 8의 `Dictionary<string>`은 무작위화하지 않은 해시로 시작하고 한 체인에서 충돌이 100번을 넘으면 무작위 해시(`OrdinalComparer` 계열)로 바꾼다. .NET 8 소스와 실행으로 다시 썼고, 흔한 오해의 결론도 이 대체 동작에 맞게 고쳤다.
- 실행 취소/다시 실행: "세 연산 모두 O(1)"은 과장이다. 문서상 `Stack.Push`는 늘어날 때 O(n), `Clear`는 O(n)이므로 분할 상환 O(1)로 고쳤다.
- 링 버퍼: "`(tail-1) % capacity`는 배열 밖을 가리킨다"는 int일 때만 맞고, `size_t`면 범위 안이지만 틀린 칸이라고 고쳤다(MSVC로 확인).
- 병합 정렬: "입력과 상관없이 O(n log n)"은 이미 정렬된 입력에서 n−1번 비교로 끝나므로 최악의 경우로 좁혔다.
- BFS: "DFS의 첫 경로는 최단이 아니다"를 "최단이 보장되지 않는다"로 고쳤다. Dijkstra 해설은 모범 답안이 거리가 줄어들 때만 다시 넣는다는 점에 맞췄다.
- 재현할 수 없거나 조건이 빠진 수치(약 10 MB → 측정값 8.6 MB, 슬라이딩 윈도 개수, 정렬 비교 횟수, 냅색 표 크기, 재귀 예열 조건)를 재현할 수 있는 실행으로 바꿨다. `ArraySortHelper` 요약의 "작은 구간은 삽입 정렬"을 "2~3개는 비교 후 교환"으로 고쳤다.
- 근거가 되지 않는 문서를 인용하던 채점 항목(스택 평가기 c8, 백트래킹 c2·d3)을 `basis`나 맞는 문서로 바꿨다.

**끝까지 확인하지 못한 것.** 판정 서버에서 flood fill 재귀가 약 13만 단계에서 멈춘다는 수치와 제약 조건의 예전 판정 서버 시간은 이전 검수 기록에서 옮긴 값이다(이번에 다시 재지 않음). 꼬리 재귀 변형이 살아남는지는 앞선 호출에 따라 달라져 관찰 결과로만 적었다.
