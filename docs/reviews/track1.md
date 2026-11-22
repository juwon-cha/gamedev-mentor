# 트랙 1 검수 기록

[문서 목록](../README.md) · [작성·검수 기준](../STANDARDS.md)

## 초기 문제

- `t1-debug-skill-targeting-gc-spike` — SkillTargetingManager.Update의 프레임당 GC 할당 찾아 없애기 (디버깅 · Medium · 실행 검증)
- `t1-impl-zero-alloc-cooldown-unitask-cast` — 할당 0의 쿨다운 타이머와 파괴 시 멈추는 UniTask 스킬 시전 (실전 구현 · Medium · 실행 검증)
- `t1-interview-dotnet-gc-vs-unity-boehm` — .NET 세대별 GC와 Unity Boehm GC는 무엇이 다른가 (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** 정적 문제은행으로 전환한 커밋 `dc1905f`에서 트랙 1~4에 세 문제씩 처음 실렸다. 작성자는 세 문제를 새 스키마(`sourceRefs`, 정확성 35·메모리·성능 30·엔진·언어 규약 20·아키텍처·가독성 15의 100점 채점표, 파일 단위 `extraSources`)로 다시 쓰고, 디버깅 문제에 6케이스, 구현 문제의 Part A에 8케이스 숨은 테스트를 붙였다. 면접 문제는 `tests: null`이다. 구현 문제는 Part A와 Part B를 컴파일 가능한 한 파일로 합치고, 템플릿에 UnityEngine·UniTask 스텁을 넣어 Part B는 컴파일만 되고 실행되지 않게 했다. 작성 단계에서 .NET 8로 디버깅 문제의 버그 코드와 고친 코드를 Unity 스텁 위에서 돌려 같은 대상을 고르면서 프레임당 368 B가 0 B로 줄어드는 것을, Part A 해답이 경계 검사 19개를 0 B 할당으로 통과하는 것을 확인했다. 독립 검수 결과는 커밋 `45b6f0f`로 반영했고, 이때 난이도를 Junior/Mid에서 Easy/Medium/Hard 3단계로 바꿨다.

**검수에서 확인한 것.** 검수자는 Unity 6.0의 참조 형식·관리 메모리 소개·GC 개요·Profiler 창·딥 프로파일링 페이지, Unity 6.1의 GC 모드 페이지, Microsoft Learn의 GC 기초·LOH·박싱·class vs struct·`GetAllocatedBytesForCurrentThread`, UniTask README와 `UniTask.Delay.cs`·`AsyncTriggerExtensions.cs` 소스, hboehm.info/gc를 열어 대조했다. 채점 서버(Compiler Explorer)에서 최종적으로 디버깅 문제는 모범 답안 7/7·시작 코드 6/7, 구현 문제는 8/8·0/8이었고 `tools/check-tests.js`와 `tools/validate-data.js`가 모두 통과했다.

**틀려서 고친 것.** 디버깅 문제의 해설과 채점 항목 c1은 `OrderBy`가 "정렬 버퍼"를 할당한다고 했지만, .NET 8 채점 서버에서 `OrderBy`+`FirstOrDefault`는 버퍼를 할당하지 않았다(168 B, 전체 정렬은 728 B). 그래서 런타임에 따라 다르다고 고쳤다. "호출마다 델리게이트 두 개"도 부정확해서, 클로저는 메서드에 들어가는 순간 생기고(모든 적이 비활성이어도 72 B) 델리게이트는 LINQ 줄이 실행될 때만 생긴다고 바로잡았다. 사거리 제곱으로 최소 거리를 시작하고 `<`로 비교하며 필터를 건너뛰는 틀린 답이 모든 테스트를 통과해서 `range-boundary-inclusive` 케이스를 넣고 경계 포함을 제약과 노트에 적었다. 구현 문제는 테스트가 NaN 지속 시간을 거부하는데 `TryStart` 계약에 없어서 문서 주석과 노트에 넣었고, "NaN은 어떤 비교도 참이 아니다"는 틀린 말(`!=`는 참)이라 `<=` 검사로 좁혔다. c6이 `GetCancellationTokenOnDestroy`와 `UniTask.Delay`만 인정하던 것을 UniTask README에 있는 `destroyCancellationToken`과 다른 대기 호출도 받도록 넓혔다. 면접 문제의 "보수적 수집기" 주장에는 출처가 없어 `boehm-gc`를 추가했고, "수집 비용은 살아 있는 힙 크기에 달렸다"는 Unity 매뉴얼에 없는 내용이라 꼬리질문 1에서 일반적인 mark-sweep 성질로 표시했다. 채점표와 꼬리질문이 기대는 출처 id를 `sourceRefs`에 보탰다.

**끝까지 확인하지 못한 것.** Unity의 Mono/IL2CPP에서 LINQ가 어떤 임시 객체를 만드는지는 확인하지 못해 설명을 유보적으로 썼다. Part B(UniTask `SkillCaster`)는 스텁에 대고 컴파일만 했고 Unity에서 실제로 돌려 보지 않았다. 0 B 판정은 Unity가 아니라 .NET 8 결과이며 시나리오에 그렇게 적었다. 스텁에 없는 Unity·UniTask API를 쓰면 맞는 답도 빌드에 실패할 수 있어 노트에 경고했다. 면접의 채점 항목 c4와 해설은 여전히 느슨한 표현을 쓴다.

## 묶음 a

- `t1-tutor-value-vs-reference-types` — 값 형식과 참조 형식: 광역 피해가 아무에게도 들어가지 않는 이유 (과외·개념 · Easy · 문서 대조)
- `t1-debug-mutable-struct-damage-lost` — 가변 struct의 함정: 맞았는데 HP가 줄지 않는 보스전 (디버깅 · Medium · 실행 검증)
- `t1-impl-generic-object-pool-zero-alloc` — 할당 0으로 도는 제네릭 오브젝트 풀 (Rent/Return, 최대 크기, 리셋 콜백) (실전 구현 · Medium · 실행 검증)
- `t1-interview-struct-vs-class-game-data` — 게임 데이터는 struct인가 class인가: 크기, 공유, 방어적 복사 (압박 면접 · Hard · 문서 대조)
- `t1-impl-hud-timer-char-buffer` — 문자열을 만들지 않는 HUD 타이머: char 버퍼에 MM:SS 쓰기 (실전 구현 · Easy · 실행 검증)
- `t1-debug-event-subscription-leak` — 재시작할수록 보상이 불어난다: 해지되지 않는 이벤트 구독 찾기 (디버깅 · Hard · 실행 검증)

**무엇을 만들었는지.** 값/참조 형식 과외, 가변 struct 디버깅, 할당 0 제네릭 풀, struct vs class 면접, char 버퍼 HUD 타이머, 이벤트 구독 누수 디버깅의 6문제다(Easy 2 / Medium 2 / Hard 2). 과외는 `tests: null`이라 로컬에서만 돌렸고, 이벤트 누수 디버깅은 버그 셋에 "디스패치 중 Dispose" 보호 요구가 더해졌다. 작성 단계에서 채점 서버로 할당하는 변형(LinkedList·LINQ 풀, 보간·ToString 타이머)이 할당 0 케이스에서만 실패하고 Stack·TryFormat·StringBuilder 변형은 통과하는 것을 확인했다. 커밋 `d671844`로 배포했다.

**검수에서 확인한 것.** 파일에 인용된 URL을 모두 열었고(Int32.TryFormat과 GC 기초 페이지는 열리는 것까지만 확인), C# 명세 §12.8.7·§12.6.6.1과 Delegate 클래스 페이지를 더 봤다. CS1612 페이지가 "속성·인덱서는 복사본을 돌려준다"는 설명을 뒷받침하고, `transform.position.x` 식 코드가 실제로 CS1612를 내는 것을 확인했다. 채점 서버에서 할당 0 테스트를 시험해 문자열 보간·`ToString`·`LinkedList`·LINQ 람다 답은 실패하고 `TryFormat`·`TryWrite`·`StringBuilder`·`stackalloc`·`Stack<T>`·`Queue`+`HashSet` 답은 통과했으며, 캐시를 피한 재실행에서도 같았다. struct vs class 면접의 24,000 B 수치는 재현되었다. 가변 struct 디버깅은 문제가 없어 readonly 필드 복사 규칙(§12.6.6.1)만 해설에 보탰다.

**틀려서 고친 것.** 값/참조 과외의 채점 항목 c5·c7이 `ref units[i]`만 인정해 해설이 받아들이는 "반환 후 대입" 방식과 모순되었으므로 둘 다 인정하게 했다. 오브젝트 풀은 `Equals`/`Contains`로 이중 반납을 막는 답이 모든 테스트를 통과해서 `double-return-is-by-reference` 케이스를 넣고(9케이스) c10의 근거 없는 인용을 뺐다. struct vs class 면접은 `in`의 방어적 복사를 §12.6.6.1로 인용하고, 24,000 B를 64비트 .NET 8 측정값으로, 박스 크기를 런타임마다 다른 값으로 표기했으며, 배열을 바꾸면 ref가 "다른 적"을 가리킨다는 틀린 설명을 고쳤다. HUD 타이머는 .NET 8이 0–299에 대해 `ToString()`으로 할당하지 않는데 테스트가 246분까지만 넣어 `ToString()` 답이 통과했으므로 입력을 33,269분까지 늘렸고, c5가 `TryFormat` 대안을 깎지 않게 했다. 이벤트 누수는 디스패치 스냅숏 동작을 "측정으로만 확인"이 아니라 Delegate 클래스 문서로 인용했다.

**끝까지 확인하지 못한 것.** 초 단위(0–59)만 쓰는 `ToString()` 답은 .NET 8에서 여전히 통과하며 해설에 그렇게 적었다. 세대(generation) 핸들 언급은 일반 관행으로 표시해 두었다. 트랙 10의 `t10-debug-object-pool-bullets`도 풀을 다루지만 디버깅 문제라 겹치지 않는다고 판단했다.

## 묶음 b

- `t1-impl-struct-enumerator-zero-alloc-foreach` — 할당 없는 foreach: 활성 투사체 목록에 struct 열거자 달기 (실전 구현 · Medium · 실행 검증)
- `t1-debug-boxing-traps-damage-tracker` — 박싱 함정 세 군데: 피해 한 번 기록에 힙 객체가 여덟 개 (디버깅 · Medium · 실행 검증)
- `t1-interview-delegates-events-closures` — 델리게이트, 이벤트, 클로저: 람다 한 줄 뒤에서 만들어지는 것들 (압박 면접 · Hard · 문서 대조)
- `t1-tutor-span-stackalloc-save-parsing` — Span<T>과 stackalloc: 세이브 문자열 "x,y,z"를 쓰레기 없이 읽기 (과외·개념 · Easy · 문서 대조)
- `t1-impl-soa-buff-table-generation-handles` — 버프 테이블: 구조체 배열(SoA), 스왑 제거, 세대 검사 핸들 (실전 구현 · Hard · 실행 검증)
- `t1-debug-idisposable-save-writer` — 닫히지 않는 세이브 스트림: using 누락, 이중 Dispose, 종료자 오용 (디버깅 · Easy · 실행 검증)

**무엇을 만들었는지.** struct 열거자, 박싱 함정 디버깅, 델리게이트·클로저 면접, Span/stackalloc 과외, SoA 버프 테이블(세대 검사 핸들), IDisposable 디버깅의 6문제다(2/2/2). 작성 단계 check-tests는 모범 답안 8/8·8/8·8/8·7/7, 시작 코드 0/8·5/8·0/8·3/7이었고, 시험 대상 네 문제 모두 할당하는 변형은 실패하고 다른 정답은 통과하는 것을 채점 서버에서 확인했다. 과외는 숨은 테스트가 없어 로컬과 채점 서버에서 손으로 돌렸다. 커밋 `826b1b7`로 배포했다.

**검수에서 확인한 것.** 인용된 URL 27개를 모두 열고 `extraSources`에 넷(명세 §10.7.2, §10.8, 델리게이트 연산자 참조, `Object.Finalize`)을 더했다. 작성자가 직접 눌러 보지 못한 앵커(박싱 §10.2.9, 매개변수 컬렉션 §15.6.2.4)가 실제로 있고, GPP Object Pool 장에 O(1) 생성의 free list 절이 있음을 확인했다. 박싱 디버깅은 함정마다 자기 테스트에서 실패했다(쌍마다 72 B, 호출마다 48 B와 120 B). 코드와 테스트 로직은 바꿀 필요가 없었다.

**틀려서 고친 것.** 델리게이트 면접의 "람다를 다시 쓰면 새 클로저 객체가 생긴다"는 틀렸다. 같은 범위의 람다는 클로저를 공유하므로 §10.7.2를 근거로 고쳤다. "C# 11 이전에는 매번 할당한다"는 현재 문서에 없는 말이라 .NET 8 SDK(C# 12)에서 잰 사실과 §10.8의 "허용되지만 요구되지 않는다"로 바꿨다. Span 과외는 "12,800회 호출에 약 200만 B"를 측정값 10,000회당 1,440,000 B로, "입력 14개"를 실제로 돌린 22개 입력과 20만 개 퍼즈 문자열로 고쳤고, C# 13 완화와 "stackalloc은 0으로 초기화되지 않는다"를 참조 문서 표현으로 좁혔으며, de-DE에서는 `TryParse`가 다른 값을 내는 것이 아니라 실패한다고 바로잡았다. 박싱 디버깅의 c7은 enum에서 `System.Enum`으로의 박싱을 다루지 않는 `ms-boxing`을 인용하고 있어 `ms-csharp-spec-boxing`으로 바꿨다. SoA 테이블은 테스트가 `Slot`을 [0, Capacity) 안으로 요구하는데 시나리오가 학습자에게 맡겨 두었으므로 시나리오와 노트에 적었고, c3이 세대만으로 생존을 판정하는 답을 깎지 않게 했다. IDisposable의 종료자 예외 주장은 `Object.Finalize`로 인용하고 로컬에서 재현했다. struct 열거자는 원래 코드가 `yield return`이었다는 시나리오와 스텁 시작 코드 사이를 잇는 문장을 넣었다.

**끝까지 확인하지 못한 것.** 남은 항목은 없다. 박싱 문제의 함정 하나(struct → 인터페이스)는 초기 문제 `t1-debug-skill-targeting-gc-spike`와 겹치지만 핵심 과제가 달라 그대로 두었다. "What's new in C# 11" 페이지는 지금 버전 기록 페이지로 넘어간다.

## 묶음 c

- `t1-interview-async-await-fundamentals` — async/await의 정체: 상태 기계, Task와 ValueTask, async void의 예외, 취소, 그리고 UniTask (압박 면접 · Medium · 문서 대조)
- `t1-debug-async-shop-screen` — 멈추는 상점, 사라지는 오류, 뒤바뀌는 설명: 메인 스레드의 동기 대기, 버려진 Task, 빠진 취소 (디버깅 · Medium · 실행 검증)
- `t1-impl-cancellable-dungeon-loader` — 취소와 제한 시간이 있는 던전 입장 로딩: 연결 토큰, 주입한 게임 시계, 역순 롤백, 토큰을 무시하는 단계 (실전 구현 · Hard · 실행 검증)
- `t1-tutor-generic-constraints-iequatable` — 제네릭 제약 조건: where T : struct, IEquatable<T> 한 줄이 비교마다 생기던 박싱을 없애는 이유 (과외·개념 · Easy · 문서 대조)
- `t1-impl-gridpos-equality-dictionary-key` — GridPos를 Dictionary 키로: IEquatable<T>, 고르게 퍼지는 GetHashCode, 동서로 이어진 지도의 IEqualityComparer (실전 구현 · Easy · 실행 검증)

**무엇을 만들었는지.** async/await 면접, 메인 스레드 동기 대기·버려진 Task·빠진 취소가 섞인 상점 화면 디버깅(버그 3), 취소와 제한 시간이 있는 던전 로더, 제네릭 제약 과외, GridPos 동등성·해시·비교자의 5문제다(Easy 2 / Medium 2 / Hard 1). 작성자는 Learn(C# 명세, async·ValueTask·TAP·취소, 동등성·해시 API, record), Cleary의 MSDN 글, Toub의 .NET 블로그 글 세 편, dotnet/runtime release/8.0 소스, UniTask README, Unity 6 Awaitable 페이지를 읽었다. "Unity에서 `.Result`가 교착을 일으킨다"는 작성자의 추론이었고, 채점 서버는 자체 단일 스레드 동기화 컨텍스트로 이를 흉내 낸다. 커밋 `e010d81`로 배포했다.

**검수에서 확인한 것.** 채점 서버(.NET 8.0.24 x64, Release, 계층형 컴파일 끔)에서 모든 모범 답안이 7/7, 모든 시작 코드가 0/7이었다. 검수자가 쓴 틀린 답은 상점 문제에서 버그 하나만 고친 답까지 모두 실패했고, 다른 정답(상점의 버전 번호·async void 핸들러, WaitAsync 로더, record struct·ValueTuple·비트 패킹 GridPos)은 통과했다. 테스트는 정확한 바이트 수가 아니라 "0 바이트 할당"만 본다. Release 측정값은 로컬 .NET 8.0.8과 모두 같았다. 연 자료는 Unity 6 매뉴얼, Cleary 글, Toub의 ConfigureAwait FAQ·ValueTask·"How Async/Await Really Works", C# 명세 §15.14·§12.9.9.4·§10.2.9·§12.15.7, 인용된 Learn API 페이지, UniTask README, runtime release/8.0의 TaskCache.cs·ComparerHelpers.cs·PoolingAsyncValueTaskMethodBuilderT.cs·comutilnative.cpp다.

**틀려서 고친 것.** Unity 6 매뉴얼은 `.Result`·교착·ConfigureAwait를 말하지 않고, 메인 스레드에서 부른 Task의 연속이 UnitySynchronizationContext로 넘어가 메인 스레드에서 돈다고만 한다. 그래서 async 면접과 상점 디버깅을 "기다리는 연속이 막힌 메인 스레드를 필요로 하면 교착이 생길 수 있고, 어느 쪽이든 프레임은 멈춘다"로 고치고 기전은 Cleary를 인용했다(채점 항목 c4 포함). 재현되지 않은 바이트 수 셋(일시 중단 경로 96/104 B → 실제 104/112 B, Debug 56/48 B → 40/32 B)은 측정값과 메서드 모양, 측정 위치로 바꿨다. "풀링 빌더는 0 B"는 호출이 하나씩 돌 때만 맞아서(2,000개가 동시에 멈추면 각각 112 B) 그 조건을 붙였다. UniTask 표현은 README대로 ValueTask와 "비슷한" 제약, `UniTask.Run`은 `RunOnThreadPool`의 옛 이름으로 고쳤다. 취소 로더는 `Task.WaitAny`처럼 동기로 기다리는 틀린 답이 채점 서버를 멈추게 해서, 케이스마다 3초 제한이 있는 스레드에서 돌게 하고 시나리오·제약·노트에 적었다(그 답은 약 18초 만에 FAIL 6개를 낸다). GridPos는 99% 분산 요구를 "65,536칸에서 서로 다른 값 64,881개 이상, 이 문제 자체의 성능 요구"로 정확히 쓰고, `X * 397 ^ Y`(50.4%)는 올바른 해시지만 이 요구만 못 맞춘다고 해설에 밝혔으며, 기본 해시가 정확히 256개 값을 내는 이유를 runtime 소스로 보탰다. 제네릭 제약 과외는 바이트 수와 CS0315·CS0019·CS0453 오류가 모두 재현되어 측정 위치만 적었다.

**끝까지 확인하지 못한 것.** Debug 빌드 바이트 수는 로컬에서만 쟀고 채점 서버에서는 확인하지 못했다. UniTask와 Unity 관련 주장은 실행하지 않고 문서로만 확인했다. async 면접은 Medium으로 두었지만 Hard 경계에 가깝다.

## 묶음 d

- `t1-debug-linq-deferred-chain-lightning` — LINQ 지연 실행의 함정: 맞지 않은 적이 찍히는 연쇄 번개, 터지는 시체 정리, 0만 보이는 웨이브 HUD (디버깅 · Medium · 실행 검증)
- `t1-impl-damage-log-ring-buffer-span-views` — 사망 리캡용 피해 기록: 할당 없이 최근 N개를 보여 주는 원형 버퍼 (실전 구현 · Easy · 실행 검증)
- `t1-interview-loh-arraypool-pinning` — 큰 버퍼와 GC: LOH, ArrayPool<T>, 풀링이 오히려 해로울 때, 고정과 단편화 (압박 면접 · Hard · 문서 대조)
- `t1-impl-arraypool-pathfinding-scratch` — 길찾기 임시 버퍼를 ArrayPool<int>로: 대여, 직접 초기화, 정확히 한 번 반납, 반납 후 사용 금지 (실전 구현 · Medium · 실행 검증)
- `t1-debug-static-state-level-reload` — 다음 레벨로 넘어가도 남는 것들: 정적 리스트·정적 캐시·정적 설정이 붙잡은 이전 레벨 (디버깅 · Easy · 실행 검증)

**무엇을 만들었는지.** LINQ 지연 실행 디버깅, 원형 버퍼 피해 기록, LOH·ArrayPool·고정 면접, ArrayPool 길찾기 버퍼, 정적 필드 누수 디버깅의 5문제다(Easy 2 / Medium 2 / Hard 1). 모든 해설 끝에 출처나 실행으로 확인한 "흔한 오해" 두 항목을 넣었다. 작성자는 LINQ·List·ArrayPool·LOH·GC 기초·GC와 고정 API·Span·Queue Learn 페이지, C# 표준, Wikipedia 원형 버퍼, "Internals of the POH" 블로그 글, Unity 6 도메인 리로드 페이지, dotnet/runtime release/8.0 소스와 BOTR을 읽었다. 커밋 `5ebb208`로 배포했다.

**검수에서 확인한 것.** 인용된 Learn 페이지 전부, Maoni의 POH 글, .NET 5 성능 글과 새 기능 페이지(둘 다 POH API를 언급하지 않는다), Unity 6 페이지 두 개, C# 표준 §12.22.6.3·§13.9.5·§15.3.8·§15.5.3, Wikipedia 원형 버퍼, .NET 8 원본 소스(BOTR, SharedArrayPool.cs, Utilities.cs, GC.CoreCLR.cs, gchelpers.cpp, Where.cs, List.cs)를 열었다. 측정은 채점 서버(Linux, .NET 8.0.24)와 로컬(Windows, 8.0.8)에서 했다. LINQ 디버깅은 버그마다 따로 실패하고 부분 수정(웨이브 뷰에 ToList, 보정 없는 인덱스 루프, 예외 삼키기, 불안정 정렬)도 실패했으며, 시나리오의 증상은 시작 코드가 실제로 찍는 값이었다.

**틀려서 고친 것.** LOH 면접은 LOH 페이지가 Windows만 다룬다는 점을 밝히지 않아 시나리오를 Windows 서버로 바꾸고 어느 주장이 그 페이지에서 왔는지 적었다. 반납한 배열이 "재사용된다"는 단정은 Return 페이지대로 "풀이 보관하거나 버릴 수 있다"로 고쳤다. Learn의 GC.AllocateArray 페이지는 POH를 말하지 않으므로 그 연결은 .NET 8 GC.CoreCLR.cs 소스로 인용하고 구현 사항으로 표시했다. 모호한 "소켓 버퍼"는 네이티브 P/Invoke 라이브러리로 바꿨다. 두 번째 흔한 오해는 허수아비에 가까워서(byte[85000]은 실제로 LOH에 간다) int[30_000] 주장으로 바꾸고, 84,976 경계를 84,976 + 배열 기본 크기 24 B = 85,000으로 설명해 gchelpers.cpp와 측정으로 확인했다. ArrayPool 문제는 반납 후 사용이 맨 IndexOutOfRangeException으로만 보여서 "반납한 배열을 반납 뒤에 읽음"으로 보고하고 반납 후 쓰기도 잡게 했으며, LOH 인용을 플랫폼 중립으로 바꿨다. 정적 누수는 힌트 1의 순서로는 캐시 버그가 드러나지 않아(레벨 A에서 고블린을 잡지 않는다) 고쳤고, readonly 필드 출처 요약이 C# 표준에 없는 말을 하고 있어 Learn readonly 페이지(`ms-learn-readonly`)를 더했으며, Unity 문장은 Unity 6 페이지를 온전히 인용했다. 원형 버퍼는 Wikipedia 인용이 과장되어("count를 흔히 쓴다" → "해법 중 하나") 고치고, Queue 변형이 두 구간 케이스에서 실패한다는 것을 노트에 보탰다.

**끝까지 확인하지 못한 것.** 검수 보고에 남은 미확인 항목은 없다. 84,976 경계는 x64에서 잰 값이다.

## 묶음 e

- `t1-tutor-ref-returns-in-readonly-members` — ref 반환·in 매개변수·readonly 멤버: 64바이트 탄환을 복사하지 않고 고치고 읽기 (과외·개념 · Easy · 문서 대조)
- `t1-impl-weak-reference-config-cache` — 약한 참조 설정 캐시: 쓰는 동안은 한 인스턴스, 아무도 안 쓰면 GC에게 (WeakReference<T>) (실전 구현 · Easy · 실행 검증)
- `t1-interview-unity-backends-managed-native-memory` — Mono와 IL2CPP, 관리 메모리와 네이티브 메모리, 그리고 Profiler의 GC Alloc이 세는 것 (압박 면접 · Medium · 문서 대조)
- `t1-debug-hidden-allocations-targeting` — 꺼진 로그가 메모리를 쓴다: params 배열·보간 문자열, 비교 람다의 클로저, 비제네릭 IComparable의 박싱 (디버깅 · Medium · 실행 검증)
- `t1-impl-timer-wheel-zero-alloc` — 할당 없는 타이머 휠: struct 항목, 미리 등록한 콜백 id, 같은 틱 안의 취소와 재예약 (실전 구현 · Hard · 실행 검증)

**무엇을 만들었는지.** 64바이트 탄환을 복사하지 않고 고치고 읽는 ref 반환·`in`·readonly 멤버 과외, `WeakReference<T>` 설정 캐시, Mono와 IL2CPP·관리/네이티브 메모리·Profiler의 GC Alloc 면접, 꺼진 로그와 비교 람다·비제네릭 `IComparable`의 숨은 할당 디버깅, 할당 없는 타이머 휠의 5문제다(쉬움 2 · 보통 2 · 어려움 1). WeakReference 테스트는 강한 참조를 쥐고 있는 동안에만 실제 GC를 쓰고, 수거는 주입한 `createWeak` 팩터리와 `SetTarget(null)`로 결정적으로 흉내 낸다. 타이머 휠은 `Advance`로만 시간을 움직이고 케이스마다 1.5초 제한이 있다. 작성자는 Microsoft Learn(ref 반환, `in`, 구조체, WeakReference, GC.Collect, ConditionalAttribute, 문자열 보간과 핸들러, PriorityQueue, C# 명세 §12.6.2.3·§12.6.6.1), dotnet/runtime release/8.0 소스(`WeakReference.T.cs`, `ArraySortHelper.cs`, `List.cs`, `Timer.cs`), Unity 6 매뉴얼, Varghese & Lauck 논문, CMU 17-214 3강 슬라이드를 읽었다. 커밋 `0bc9f60`으로 배포했다.

**검수에서 확인한 것.** extraSources 주소를 모두 열었고(GitHub 소스는 raw 파일), 논문과 CMU PDF, Unity reference-types 페이지, C# 명세 §10.8을 대조했다. ref 반환 과외의 예제·퀴즈 출력과 CS1612/CS0131/CS8329/CS8168 오류를 로컬 .NET 8에서 컴파일해 확인했다. 작성자의 측정값은 판정 서버(.NET 8.0.24)에서 모두 재현됐다. 타이머 휠은 케이스당 최대 25 ms라 모든 케이스가 멈춰도 약 12초 안에 끝나고(판정 서버 20초 제한), 틀린 변형 6개가 모두 떨어졌다.

**틀려서 고친 것.** WeakReference 캐시는 테스트 두 개에서 실제 GC가 엉뚱한 순간에 돌면 정답 풀이가 떨어질 수 있었다(GC를 강제로 함께 돌리자 15번 중 15번 실패). `GC.KeepAlive`를 넣어 해결했고, GC 시점에 관한 흔한 오해를 JIT 최적화 수준에 따라 달라진다고 더 정확히 썼다. 백엔드 면접은 매뉴얼의 "거의 같다(nearly identical)"를 "같다"로 쓴 곳을 고치고, `where T : struct`를 붙여도 여전히 느리다는 점을 바로잡고, IL2CPP에도 GC가 있다는 문장에 두 백엔드 모두 Boehm GC를 쓴다는 Unity 페이지를 근거로 달았다. 숨은 할당 디버깅은 보간 문자열 설명을 현재 Learn 페이지에 맞추고, Unity 주장에 Unity 매뉴얼 근거를 달고, 측정하지 못한 부분은 "측정하지 않음"이나 "추론"으로 표시했으며, 트랙 1의 다른 문제와 겹치던 흔한 오해를 메서드 그룹 델리게이트 할당에 관한 새 항목(측정함)으로 바꿨다.

**끝까지 확인하지 못한 것.** Unity Mono/IL2CPP에서의 바이트 수(`IComparer`를 `Sort`에 넘길 때의 64 B, 메서드 진입 시 클로저 할당, 변환당 64 B)는 .NET 8에서만 쟀다. 숨은 할당 디버깅은 트랙 1의 기존 문제 세 개와 부분적으로 겹치지만, 커리큘럼이 요구한 주제이고 조합이 새로워 중복으로 보지 않았다.
