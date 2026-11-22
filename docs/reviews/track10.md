# 트랙 10 검수 기록

[문서 목록](../README.md) · [작성·검수 기준](../STANDARDS.md)

## 초기 문제

- `t10-impl-observer-event-channel` — 타입 이벤트 채널: Publish 도중 구독·해지가 일어나도 안전한 Observer (실전 구현 · Hard · 실행 검증)
- `t10-impl-state-character-fsm` — 캐릭터 상태 기계: 전이 테이블과 Enter / Exit / Update 훅 (실전 구현 · Medium · 실행 검증)
- `t10-impl-command-rebind-replay` — 입력을 커맨드로: 키 리바인딩과 프레임 단위 결정적 리플레이 (실전 구현 · Medium · 실행 검증)
- `t10-debug-object-pool-bullets` — 탄환 오브젝트 풀 디버깅: 한 탄환을 둘이 쓰고, 관통이 옮겨 붙고, 한도를 넘는다 (디버깅 · Medium · 실행 검증)
- `t10-impl-strategy-skill-effects` — 스킬 효과 레지스트리: switch 없이 데이터 id 로 전략 고르기 (실전 구현 · Easy · 실행 검증)
- `t10-interview-singleton-solid` — 3,000줄짜리 GameManager.Instance: 싱글턴의 편리함과 비용, 대안, 그리고 SOLID (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** 트랙 10의 첫 6문제는 커밋 `04bc952`로 실렸다(독립 검수 완료). 시험 대상 다섯 문제의 작성 단계 결과는 풀 디버깅 8/8·1/8, 전략 8/8·0/8, 나머지 셋 8/8·0/8이었고 면접은 `tests: null`이다. 처음에는 채점 서버(Compiler Explorer)가 HTTP 429를 돌려줘 다시 시도해서 통과했다. 항상 던지는 호출 뒤에 `int[,]` 루프가 있는 판정 템플릿이 채점 서버에서 출력 없이 SIGABRT로 죽어서(로컬에서는 정상) State 판정을 1차원 배열로 바꿨다. 작성자는 GPP observer·state·command·object-pool·singleton·service-locator, Microsoft Learn, Wikipedia SOLID·Strategy, Gaffer 결정론적 락스텝, Unity 문서를 읽었다. 풀 해답은 공개 `IsActive`를 더하고, 스킬 효과는 시전마다 만드는 팩토리 대신 상태 없는 공유 전략 레지스트리를 쓴다.

**검수에서 확인한 것.** 사용한 GPP 장 여섯 개와 목차, Gaffer 결정론적 락스텝, MS Learn(`IDisposable.Dispose`, `GetAllocatedBytesForCurrentThread`, `List.Enumerator.MoveNext`, `ReferenceEqualityComparer`, `Delegate`, 아키텍처 원칙), Wikipedia(Strategy, SOLID), Unity(`ObjectPool<T>`, 풀링 매뉴얼, `DontDestroyOnLoad`, ScriptableObject, SO 아키텍처 글, 도메인 리로드, 실행 순서, MonoBehaviour, 패턴 e-book), VContainer(GitHub, 문서)를 열었다. 명백한 사실 오류는 없었고, 고친 것은 테스트 빈틈, 명시되지 않은 의미, 근거 없는 인용, 채점 문구였다. 코드가 있는 문제마다 구조가 다른 정답이 통과했다(Observer는 둘). 이 대안과 틀린 답 탐침은 로컬 .NET 8에서만 돌렸고, 채점 서버에서는 모범 답안과 시작 코드를 돌렸다.

**틀려서 고친 것.** Observer는 c6(핸들러 참조 해제)을 과제가 묻지 않아 제약으로 넣었고, c1·c6이 GPP Observer 장에 없는 내용을 인용하고 있어 그 `sourceId`를 비웠으며, "멀티캐스트 델리게이트는 불변"을 MS Learn Delegate 클래스로 인용했다. State는 테스트가 강제하던 의미 둘, 즉 전이 중 `Exit` 안에서 들어온 요청은 그 전이의 목적지를 기준으로 검증한다는 것과 `AllowTransition`이 등록되지 않은 상태도 받는다는 것을 명시하고 `request-in-exit` 테스트를 더했다. c4가 해시 조회를 특정해 요구하지 않게 했고, 장이 지연 처리를 다루지 않으므로 d1의 GPP 인용을 뺐다. Command는 키를 모았다가 `AdvanceFrame`에서 해석하는 틀린 답이 모든 테스트를 통과해 `press-time-binding`을 넣고 규칙을 적었다. 오브젝트 풀은 참조 동일성 제약이 있는데도 기본 비교자 `HashSet`이 통과해 `reference-identity`를 넣었고, 제네릭 `T`에는 불가능한 객체별 플래그를 제안하던 c4를 고쳤으며, `where T : class` 요구를 명시했다(테스트는 `IsActive`를 쓰지 않는다). Strategy는 c6이 두 번 순회를 강요하고 있어 재사용 버퍼도 인정하게 했다. 싱글턴/SOLID 면접은 MonoBehaviour 생성자와 VContainer 진술에 출처를 달고 표현을 맞췄으며(`[Inject]`를 통한 메서드 주입), c10의 GPP 인용을 뺐다. 빠져 있던 `verified` 필드는 검수 때 여섯 문제 모두에 달았다.

**끝까지 확인하지 못한 것.** Observer의 핸들러 예외 규칙, 리플레이의 O(N+F), 무할당 `Cast`는 테스트로 확인하지 못하고 채점표에만 남았다.

## 묶음 a

- `t10-tutor-solid-score-split` — SOLID 를 한 번에 하나씩: 점수 클래스를 "바뀌는 이유"대로 나누기 (과외·개념 · Easy · 문서 대조)
- `t10-impl-component-entity` — 컴포넌트 기반 엔티티: 타입으로 붙이고 찾고, 순서대로 업데이트하기 (실전 구현 · Hard · 실행 검증)
- `t10-debug-enemy-hierarchy-lsp` — 적 상속 계층 디버깅: 걷지 못하는 박쥐, 부풀려진 흡혈, 두 번 깎이는 방어력 (디버깅 · Medium · 실행 검증)
- `t10-interview-composition-inheritance-ecs` — 상속 계층이 막혔을 때: 컴포지션으로 바꾸는 기준과 데이터 지향 ECS 가 값을 하는 조건 (압박 면접 · Hard · 문서 대조)
- `t10-impl-stat-modifier-pipeline` — 스탯 수정자 파이프라인: 순서 있는 덧셈·곱셈 수정자와 제거 후 재계산 (실전 구현 · Medium · 실행 검증)
- `t10-impl-flyweight-terrain` — 지형 타일 플라이웨이트: 정의는 하나를 함께 쓰고, 칸마다 다른 것만 따로 두기 (실전 구현 · Easy · 실행 검증)

**무엇을 만들었는지.** 점수 클래스를 바뀌는 이유대로 나누는 SOLID 과외, 타입으로 붙이고 찾고 순서대로 업데이트하는 컴포넌트 엔티티, 적 상속 계층의 LSP·깨지기 쉬운 기반 클래스 디버깅, 합성 vs 상속과 ECS 면접, 순서 있는 덧셈·곱셈 스탯 수정자 파이프라인, 지형 타일 플라이웨이트의 6문제다(2/2/2). 작성 단계 check-tests는 8/8, 7/7, 7/7, 7/7과 시작 코드 0/N이었다. 작성자는 로컬에서 구조가 다른 정답이 네 스위트를 모두 통과하고, `List.Sort` 동점이나 `double` 퍼센트 계산 같은 틀린 변형이 스탯 테스트에서 실패하는 것을 확인했다. 과외 해답은 시작 코드와 무작위 연산 2,000개로 대조했다. 커밋 `253292e`로 배포했다.

**검수에서 확인한 것.** Wikipedia SOLID·LSP·SRP·Fragile base class·Composition over inheritance·Decorator, GPP Component·Flyweight·Data Locality, Unity Entities 1.3 개념·아키타입·구조 변경, Unity 잡 시스템 개요와 Burst, Microsoft Learn 산술 연산자·List.Sort·GetEnumerator·Enumerator.MoveNext·상속을 열었다. 시험 대상 문제마다 구조가 다른 정답이 통과하고 틀린 변형 17개가 모두 실패했다(로컬 .NET 8). 스탯 수정자 파이프라인은 4948과 114 수치가 .NET 8에서 재현되어 문제가 없었고 반복만 정리했다.

**틀려서 고친 것.** SOLID 과외의 LSP 정의는 의역이어서 Wikipedia SOLID 문구에 맞췄고, LSP 예외 규칙에서 "상위 타입이 던지는 예외의 하위 타입은 허용된다"는 예외가 빠져 있어 넣었으며, "actor" 휴리스틱을 Wikipedia SRP 글(새 출처 `wiki-srp`)에 귀속했다. 컴포넌트 엔티티는 명세상 제거가 즉시 보여야 하는데 지연 제거 구현이 통과해서 순회 중 Has/Count 검사를 넣었고, 열거자 무효화 주장을 `ms-list-enumerator-movenext`로 인용하며 "첫 Remove에서 예외"를 "다음 MoveNext에서 예외"로 고쳤다. LSP 디버깅도 같은 LSP 문구와 예외 규칙을 고쳤고, Fragile base class 글이 `sealed`를 오버라이드를 막는 키워드로 설명한다고 했지만 글은 상속 금지(final/sealed)라고 하므로 바로잡았다. 합성·ECS 면접은 메시징 비용이 "가장 복잡한 구조"라는 말을 GPP에 암묵적으로 귀속했지만 GPP는 컨테이너가 단순하다고 하므로 일반 경험으로 표시해 고쳤고, Job System/Burst와 "클래스 다중 상속 없음"에 출처를 달았다. 플라이웨이트의 메모리 추정은 64비트 .NET 8 측정값(320,024 + 160,024 바이트)으로 바꾸고 32비트는 다르다고 적었다.

**끝까지 확인하지 못한 것.** 남은 항목은 없다. 해설은 약 1,500~2,025자로 지침보다 길다.

## 묶음 b

- `t10-impl-hsm-nested-states` — 계층형 상태 기계: 공통 조상을 건드리지 않는 진입·이탈 순서와 훅 안의 Fire (실전 구현 · Hard · 실행 검증)
- `t10-debug-observer-reentrant-health` — 체력 통지 디버깅: 사라지는 회복, 옛 값을 보여 주는 체력 바, 두 번 재생되는 사망 연출 (디버깅 · Medium · 실행 검증)
- `t10-impl-mediator-event-bus` — 전투 이벤트 버스: 타입별 메시지, 범위 단위 구독 해지, 전역 static 없는 중재자 (실전 구현 · Medium · 실행 검증)
- `t10-interview-coupling-cohesion` — 아이템 하나에 파일 14개: 결합도와 응집도를 코드에서 찾아내고 의존 방향과 경계 인터페이스 정하기 (압박 면접 · Hard · 문서 대조)
- `t10-tutor-di-by-hand-clock` — 손으로 하는 의존성 주입: 클래스 안의 `new SystemClock()` 을 컴포지션 루트로 밀어내기 (과외·개념 · Easy · 문서 대조)
- `t10-impl-builder-wave-config` — 웨이브 설정 빌더: 틀린 인자는 그 자리에서, 조합 오류는 Build 에서, 결과는 불변으로 (실전 구현 · Easy · 실행 검증)

**무엇을 만들었는지.** 공통 조상을 건드리지 않는 진입·이탈 순서와 훅 안의 Fire를 다루는 계층형 상태 기계, 체력 통지 재진입 디버깅, 타입별 메시지와 범위 단위 구독 해지를 갖춘 전투 이벤트 버스, 결합도와 응집도 면접, 컴포지션 루트로 밀어내는 수동 의존성 주입 과외, 웨이브 설정 빌더의 6문제다(2/2/2). 작성 단계 check-tests는 8/8, 7/7, 7/7, 7/7과 시작 코드 0/N이었고, 로컬 .NET 8에서 구조가 다른 정답이 통과하고 틀린 설계 5~8개가 각각 고정 케이스에서 실패했다. 과외와 면접은 `tests: null`이고 과외는 로컬에서만 컴파일하고 돌렸다. 커밋 `173b72b`로 배포했다.

**검수에서 확인한 것.** Wikipedia 원문 일곱 쪽, GPP State·Observer·Event Queue, Fowler, Seemann, MS 아키텍처 원칙·AsReadOnly·Dispose·GC, Unity asmdef 참조와 미리 정의된 어셈블리 페이지를 열었다. Observer 재진입 디버깅은 부분 수정 여섯 가지가 모두 실패했다. 빌더의 스냅숏 불변성은 이미 시험되고 있었다.

**틀려서 고친 것.** HSM은 이미 활성인 대상으로 다시 들어가는 규칙을 이 문제 자체의 규칙으로 표시하고, UML 외부 전이와 같은 경우(자기 자신, 활성 조상)와 다른 경우(조상이 정의한, 자기 하위 상태로 가는 전이)를 해설에 밝혔다. 명시되지 않던 "SetInitialChild를 다시 부르면 마지막 것이 이긴다"와 null 훅 테스트를 더했다. Observer 재진입은 재진입이 "스레드 안전과 밀접하다"는 문구와 출처 요약이 틀려서(페이지는 필요조건도 충분조건도 아니라고 한다) 고쳤고, 순서 규칙을 뒷받침하지 않는 gpp-observer 채점 인용 둘을 뺐다. 이벤트 버스는 핸들러 안에서의 구독이 기존 채널 문제 둘과 겹치고 Medium을 넘게 만들어 범위에서 뺐고(테스트 케이스와 무작위 동작 제거), 빈 타입 발행 규칙과 테스트를 더했으며, Mediator 인용을 고쳤다. 결합도·응집도 면접은 공통 결합(common coupling)을 구체 클래스 직접 호출과 섞어 쓴 것을 고치고, "재컴파일된다" 주장을 지웠으며, `Assembly-CSharp`를 새 출처 `unity-predefined-assemblies`로 확인해 인용하고, 표시 없던 경계 인터페이스 조언을 경험으로 표시하고, c6·c10 인용을 고쳤다. DI 과외는 Wikipedia 의역 둘을 다듬었고(트랙 4의 BattleManager 문제와는 별개다), 빌더는 문구 둘을 고쳤다.

**끝까지 확인하지 못한 것.** 대안 정답과 틀린 변형은 로컬 .NET 8에서만 돌렸고, 대안 HSM은 채점 서버에서 돌리지 못했다.

## 묶음 c

- `t10-impl-service-locator-scoped-override` — 서비스 로케이터와 범위 오버라이드: 테스트가 끝나면 원래대로, 그리고 코드만 읽어서는 보이지 않는 의존성 (실전 구현 · Medium · 실행 검증)
- `t10-debug-dirty-flag-character-sheet` — 캐릭터 시트 Dirty Flag 디버깅: 일시정지 화면에서만 낡는 공격력과 매 프레임 도는 재계산 (디버깅 · Medium · 실행 검증)
- `t10-impl-dirty-flag-scene-graph` — 씬 그래프 월드 위치 캐시: 읽을 때 낡은 노드만 한 번씩, 재부모화까지 지키는 Dirty Flag (실전 구현 · Hard · 실행 검증)
- `t10-interview-testing-game-code` — 게임 코드 테스트하기: 무엇을 테스트할지, Humble Object, 대역의 이름(dummy·fake·stub·spy·mock), 결정적인 시간과 난수 (압박 면접 · Hard · 문서 대조)
- `t10-impl-chain-of-responsibility-input` — 입력 계층의 책임 연쇄: UI 가 먼저 받고, 소비하면 아래로 내려가지 않는다 (실전 구현 · Easy · 실행 검증)
- `t10-tutor-game-loop-update-method` — Game Loop 와 Update Method: 고정 스텝·가변 스텝, 갱신 순서, 프레임을 세던 석상을 시간 기반으로 옮기기 (과외·개념 · Easy · 문서 대조)

**무엇을 만들었는지.** 테스트 범위 오버라이드가 있는 서비스 로케이터, 캐릭터 시트 Dirty Flag 디버깅, 재부모화까지 지키는 씬 그래프 월드 위치 캐시, 게임 코드 테스트 면접(Humble Object, 대역의 이름, 결정적인 시간과 난수), UI가 먼저 받는 입력 책임 연쇄, Game Loop와 Update Method 과외의 6문제다(2/2/2). 작성자는 시험 대상 네 문제마다 대안 정답 하나와 틀린 설계 7~11개를 로컬에서 확인했다. Microsoft 자료 지침에 따라 출처 둘을 바꿨다. 서비스 로케이터의 의존성 논점은 Seemann 글 대신 Microsoft Explicit Dependencies Principle로, 테스트 면접은 Random 시드 페이지를 빼고 "Unit testing best practices for .NET"으로 인용했다(fake·stub·mock 정의는 Fowler를 따른다). 커밋 `57c4098`로 배포했다.

**검수에서 확인한 것.** GPP 장들, Fowler 글(Mocks Aren't Stubs, Humble Object, Injection), Gaffer, Microsoft 페이지, Unity 문서, Wikipedia, `List.cs`를 열었다. 대안 정답은 통과하고 틀린 변형은 채점 서버에서 실패했으며, 다른 틀린 변형은 로컬 dotnet 8에서 돌렸다. Dirty Flag 디버깅은 부분 수정 여섯 가지가 모두 실패하고 버그마다 따로 실패했으며, 스탯 수정자 파이프라인과 핵심 과제가 다르다.

**틀려서 고친 것.** 서비스 로케이터는 본문과 제목이 의존성을 "숨긴다"고 했지만 출처는 그렇게 말하지 않는다(GPP: 코드를 읽어서는 의존성을 보기 어렵다, Microsoft: 클래스가 필요한 것에 대해 "정직하지 않다"). 출처 표현대로 고치고 Microsoft 생성자 계약 의역도 바로잡았다. Dirty Flag 디버깅은 참조 해답의 `RemoveAt` 루프로는 "Tick은 O(n)"이 거짓이고, c7이 뒤에서부터가 아닌 올바른 제거를 깎았으며, 25→35 예에 기본 스탯이 빠져 있어 모두 고쳤다. 씬 그래프는 비용 문구가 밀어 넣으며 표시하는 방식을 O(1)처럼 암시해 고쳤다. 테스트 면접은 Microsoft의 fake·mock 의미(Microsoft의 "mock"은 단언하는 fake다)를 Fowler·Meszaros 정의와 섞어 쓴 것을 출처별로 나눴고, WaitForSeconds가 스케일된 시간을 쓴다는 문구를 더했으며, UTF를 "1.4 문서"(6000.0 매뉴얼 기준 1.4.3)로 인용하고, CI 주기와 테스트 비율을 경험으로 표시하고, Random 시드 단서를 더했다. 책임 연쇄의 "할당 없음"은 .NET 8 구현 사항으로 표시하고 `List.cs`(release/8.0)를 인용했다(Easy의 위쪽 끝). 게임 루프 과외의 "항상 반 프레임 앞선다"는 틀려서 고쳤고, Update Method 주의 사항을 GPP대로(네 항목, 제거 방법 셋) 맞췄다. 검수자가 범위 밖이라 고치지 못한, 이미 배포된 `gpp-service-locator` 출처 요약의 "숨은 의존성" 표현은 배포 커밋에서 원문 표현에 맞게 고쳤다.

**끝까지 확인하지 못한 것.** 디스패치 도중 제거했다가 다시 추가한 핸들러라는 구석 하나는 시험하지 않았고 채점표의 O(n) 기준이 다룬다. Unity Test Framework 1.4가 Unity 6의 버전인지는 작성 단계에서 확인하지 못했고, 검수 때 6000.0 매뉴얼 기준 1.4.3으로 적었다.

## 묶음 d

- `t10-impl-type-object-breeds` — 몬스터 종족을 데이터로: 부모 종족에게서 기본값을 물려받는 Type Object (실전 구현 · Easy · 실행 검증)
- `t10-impl-event-queue-sound-ring-buffer` — 효과음 요청 큐: 링 버퍼로 요청과 재생을 시간으로 떼어 놓고, 같은 소리는 하나로 합치기 (실전 구현 · Hard · 실행 검증)
- `t10-debug-memento-checkpoint-aliasing` — 체크포인트 디버깅: 부활해도 남아 있는 포션, 두 번째 부활에 올라가 있는 스킬, 구버전 세이브의 크래시 (디버깅 · Medium · 실행 검증)
- `t10-impl-memento-battle-undo` — 턴제 전투 되돌리기: 아무것도 공유하지 않는 스냅숏과 Undo 스택 (Memento) (실전 구현 · Easy · 실행 검증)
- `t10-interview-legacy-refactoring` — 3년 된 전투 코드를 안전하게 고치기: 특성 테스트, 스트랭글러 피그, 기능 플래그, 이름과 리뷰 습관 (압박 면접 · Medium · 문서 대조)
- `t10-interview-unity-architecture-lifetimes` — 중간 규모 Unity 게임의 구조: 데이터·도메인·표현 층, 씬보다 오래 사는 것과 짧게 사는 것, 패턴이 값을 하는 곳과 과한 곳 (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** 부모 종족에게서 기본값을 물려받는 Type Object, 링 버퍼로 요청과 재생을 시간으로 떼어 놓고 같은 소리를 합치는 효과음 이벤트 큐, 체크포인트 메멘토 디버깅, 아무것도 공유하지 않는 스냅숏과 Undo 스택, 레거시 전투 코드 리팩터링 면접, 중간 규모 Unity 게임의 층과 수명 면접의 6문제다(2/2/2). 이 묶음으로 트랙 10이 30문제가 되었다. 해설마다 서로 겹치지 않는 "흔한 오해" 두 항목이 있다. 작성자는 로컬 .NET 8에서 구조가 다른 정답이 통과하고 틀린 변형 34개가 실패하며 디버깅 문제의 부분 수정 여섯 가지가 모두 실패하는 것을 확인했고, 대안 정답과 클로저 할당 틀린 답은 채점 서버에서도 돌렸다. Unity 동작은 읽기로만 확인했다. 커밋 `1fe351d`로 배포했다.

**검수에서 확인한 것.** 모든 주장을 출처 원문과 대조했다. GPP 장 셋, Feathers의 글, Fowler Strangler Fig, refactoring.com, Hodgson 기능 토글, 인용된 Microsoft Learn 페이지와 플레이북, .NET 8 Queue.cs, Wikipedia(circular buffer, memento, characterization test), 인용된 Unity 페이지, Unity e-book 페이지, Unity 지원 문서를 열었다. 채점 서버에서 시험 대상 네 문제의 다르게 쓴 정답이 통과하고 전형적인 틀린 답은 실패했다. 메멘토 디버깅은 로컬과 채점 서버 모두에서 버그마다 따로, 모든 부분 수정이 실패했다. 메멘토 실행 취소는 문제가 없었다.

**틀려서 고친 것.** Type Object는 GPP 상속 규칙의 의역이 하나로 합친 조건(체력이 0이 아니거나 공격이 NULL이 아니면)처럼 읽혔고, 경계 사례 하나가 PaperTroll을 시나리오 표와 다르게 정의하고 있어 고쳤다. 이벤트 큐 해설은 빈칸 하나를 남긴 Capacity+1 배열도 "맞다"고 했지만 명세 1과 모순이라 고쳤고, 슬롯 0부터 병합 검사를 시작하는 답을 랩어라운드 병합 케이스가 잡지 못해(다른 케이스는 잡았다) 케이스를 강화했다. 메멘토 디버깅은 대안 수정 문장이 public 생성자의 복사를 무시해 이중 복사로 이어지는 점을 고쳤고, 확인할 수 없던 c7("…을 안다")을 바꿨다. 레거시 리팩터링은 Fowler 의역이 어긋나 있어("많은 이가 낭비로 본다" 대 "people often balk… may appear to be a waste") 고쳤고 Feathers 본인의 글을 출처로 더했다. Unity 아키텍처는 Addressables 교체 규칙에 "번들의 마지막 에셋" 조건이 빠져 있었고, MVP 조언을 e-book 페이지에 잘못 귀속했으며, 채점 `sourceId` 둘이 기준을 뒷받침하지 않아 모두 고쳤다. 예외 이름도 밝혔다. 에디터에서는 MissingReferenceException("has been destroyed but you are still trying to access it"), Unity 6 이상의 빌드에서는 NullReferenceException이다.

**끝까지 확인하지 못한 것.** Unity에는 MissingReferenceException의 스크립팅 API 페이지가 없어(404) 예외 이름은 Unity 지원 문서에 기댄다.

## 최종 점검 (2026-11-23)

배포된 30문제 전체를 점검 에이전트 3개(10문제씩)가 차례로 다시 확인하고, 점검에 참여하지 않은 검증 에이전트 2개(15문제씩)가 그 변경을 다시 확인했다. 두 검증 모두 통과 판정을 냈다.

**한 일.** 흔한 오해가 없던 24문제에 "### 흔한 오해" 절을 넣고(출처나 .NET 8 실행으로 뒷받침), 모든 채점 항목·감점에 `sourceId`나 `basis`를 붙이고, `sourceRefs`가 4개를 넘던 문제(최대 11개)를 4개로 줄였다. 새 근거로 Microsoft Learn(아키텍처 원칙, TimeProvider, nullable, Dictionary, AsReadOnly, 단위 테스트 모범 사례, WPF 라우트 이벤트 등), dotnet/runtime release/8.0 `ArraySortHelper.cs`·`Array.cs`·`List.cs`·`Queue.cs`, CMU 17-214 3·4·7·9·10강 슬라이드를 더했다.

**확인한 것.** 인용한 페이지를 모두 다시 받아 대조했다(Game Programming Patterns, Unity 6000.0·Entities 1.3, Gaffer On Games, Fowler, Feathers, refactoring.com, VContainer, Wikipedia 등). 로컬 .NET 8에서 숨은 테스트(모범 답안 통과·초기 코드 실패)와 틀린 변형, 본문 수치(델리게이트 `-=`, `List.Sort` 안정성(3개 원소 2,000번 중 225번 순서 바뀜, 17개부터 모두), tr-TR 문화권, 박싱 할당, `lock` 재진입 등)를 다시 실행했다. 커밋 전 `check-tests.js`를 판정 서버에서 전부 다시 돌려 통과했다.

**틀려서 고친 것.**
- `t10-impl-chain-of-responsibility-input`: 명세가 요구하는 `Remove(null)` 처리를 틀린 풀이가 통과하고 있어 테스트에 추가했다(모범 답안 7/7, 초기 코드 0/7). WPF "Handled" 조언을 문서의 표현("고려하라")보다 강하게 쓴 곳을 고쳤다.
- 오브젝트 풀: Unity `collectionCheck`가 이중 반환을 잡는다는 설명에 "에디터에서만 동작한다"는 조건을 넣었다.
- 커맨드 리바인드·리플레이: 부동소수 비결정성의 원인을 Gaffer On Games가 말하는 대로(컴파일러, OS, 명령어 집합) 고쳤다.
- 전략 패턴: 인용한 Unity 전자책 페이지는 전략 패턴을 다루지 않아 CMU 17-214 10강과 Dictionary 문서로 바꿨다. 싱글턴·SOLID: ScriptableObject는 빌드에서 저장된 에셋 데이터만 읽는다는 점, LSP가 모든 하위 타입에 적용된다는 점을 바로잡았다.
- 스탯 수정자: 캐스트는 버림(114.99999999999999 → 114)이고 오버플로는 기본으로 검사하지 않는다는 점을 밝혔다. 플라이웨이트: intrinsic/extrinsic 용어를 GoF의 것으로 밝혔다.
- 테스트가 확인하지 않는 동작을 "테스트로 확인"이라 한 채점 항목(HSM d2, 중재자 c9, 메멘토 c6)과 근거가 되지 않는 할당 API 문서를 인용한 항목을 `basis`로 바로잡았다. Dirty Flag의 "O(d)를 반드시 치른다"를 버전 비교 방식에 한정했다.

**끝까지 확인하지 못한 것.** Unity 플레이어 빌드에서의 동작은 Unity를 설치하지 않아 문서로만 확인했다.
