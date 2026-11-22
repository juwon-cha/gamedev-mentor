# 트랙 4 검수 기록

[문서 목록](../README.md) · [작성·검수 기준](../STANDARDS.md)

## 초기 문제

- `t4-debug-lifecycle-event-leak` — 체력바 HUD와 포션 입력: 0 / 100 표시, 씹히는 포션 키, 씬 재로드 후 MissingReferenceException (디버깅 · Medium · 문서 대조)
- `t4-interview-damage-text-canvas-rebuild` — 데미지 텍스트 수백 개와 200칸 인벤토리에서 프레임이 떨어진다: Canvas 리빌드, 배칭, 풀링 (압박 면접 · Hard · 문서 대조)
- `t4-impl-battlemanager-singleton-to-di` — 비대한 BattleManager 싱글턴을 인터페이스와 생성자 주입으로 분리하기 (실전 구현 · Hard · 문서 대조)

**무엇을 만들었는지.** 정적 문제은행으로 전환한 커밋 `dc1905f`에서 트랙 4에 세 문제가 처음 실렸다. 작성자는 세 문제를 새 스키마로 썼고, 세 문제 모두 Unity 의존 코드라 숨은 테스트는 없다. 작성 단계에서 JSON 구문, 채점표 배분 35/30/20/15와 감점 2~3개, 출처 id 해석을 확인했고, DI 문제의 순수 C# 핵심을 dotnet 8로 컴파일해 가짜 객체로 동작 검사 8개를 통과시켰다. MonoBehaviour 코드와 NUnit 예제는 읽기로만 확인했다. 독립 검수 결과는 커밋 `45b6f0f`로 반영했고 이때 난이도를 Easy/Medium/Hard로 바꿨다.

**검수에서 확인한 것.** Unity API(Awake, OnEnable, OnDisable, FixedUpdate, GetKeyDown, ObjectPool<T>와 생성자, Random.value, Canvas.willRenderCanvases, MonoBehaviour), 매뉴얼(실행 순서 6000.0·2022.3·한국어 2021.3, 풀링, 도메인 리로드, asmdef 인스펙터, 씬 뷰 모드, 2022.3 UI Profiler), uGUI(Canvas, Mask, RectMask2D, CanvasUpdateRegistry), UI 최적화 팁, 지원 문서 두 편, 사용자 정의 `==` 블로그, Test Framework, C# 명세(Delegates), VContainer README와 Hello World, Seemann의 글을 열었다. 아무것도 Unity에서 컴파일하거나 실행하지 않았고, 문서 대조와 코드 한 줄씩 읽기로 검증했다(세 문제 모두 `reviewed`).

**틀려서 고친 것.** 생명주기 디버깅의 "Unity는 오브젝트마다 Awake 바로 뒤에 OnEnable을 부른다"는 출처가 없어 문서대로 "같은 오브젝트에서 Awake 뒤에만 보장된다"로 고쳤고, 빌드에서의 `NullReferenceException`을 더하고 "SetActive에서 던진다"를 좁혔다. Canvas 면접은 출처 없는 "UI는 반투명으로 그려진다"를 지우고, 겹침에 따른 배칭 깨짐을 유보적으로 쓰고, Mask/RectMask2D 문구를 uGUI 매뉴얼에 맞추고, 오버드로 도구를 UI Details Overdraw 미리 보기와 씬 뷰 Overdraw 모드로 안내했으며, c3이 `Canvas.SendWillRenderCanvases`라는 이름을 요구하지 않게 했다. DI 문제의 해답에 있던 `?? throw`는 에디터에서 할당되지 않은 인스펙터 참조(가짜 null)를 잡지 못하므로 `BattleInstaller.Awake`에 Unity `==` 검사와 `OnDestroy` 보호를 넣었다. VContainer 공식 문서가 `LifetimeScope` 하위 클래스를 컴포지션 루트라고 부른다는 것은 확인되었지만, c8이 인용한 e-book 페이지는 이를 말하지 않아 Seemann으로 바꿨다.

**끝까지 확인하지 못한 것.** Unity의 "Optimizing Unity UI" 가이드가 내려가 `Canvas.SendWillRenderCanvases` 마커 이름은 "보통 그렇고 버전마다 다르다"로 남겼다. 겹침으로 인한 배칭 깨짐은 이슈 트래커 페이지가 열리지 않아 확인하지 못했고, 옛 핸들러에서 어떤 UI 접근이 먼저 예외를 던지는지도 확인하지 못했다.

## 묶음 a

- `t4-tutor-lifecycle-order-predict-log` — MonoBehaviour 생명주기: 한 오브젝트 안의 순서와 오브젝트 사이의 순서, 로그 예측하기 (과외·개념 · Easy · 문서 대조)
- `t4-debug-coroutine-attack-loop-hitstop` — 스턴이 풀릴 때마다 빨라지는 몬스터 공격과 끝나지 않는 히트스톱: 코루틴 수명 버그 (디버깅 · Hard · 문서 대조)
- `t4-interview-update-fixedupdate-lateupdate` — Update · FixedUpdate · LateUpdate: 무엇을 어디에 두는가, 그리고 고주사율 모니터에서 떨리는 캐릭터 (압박 면접 · Medium · 문서 대조)
- `t4-impl-ability-cooldown-humble-object` — 대시 스킬 쿨다운: 규칙은 순수 C# 클래스로, MonoBehaviour는 얇은 어댑터로 (실전 구현 · Easy · 실행 검증)
- `t4-debug-nameplate-lookup-cache` — 적 200마리의 이름표: 매 프레임 Find와 GetComponent, 그리고 컷신 뒤에 깨지는 카메라 캐시 (디버깅 · Medium · 문서 대조)
- `t4-interview-prefab-instantiate-pooling` — 초당 수백 발의 탄환: 프리팹 인스턴스화 비용과 오브젝트 풀링을 언제, 어떻게 쓰는가 (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** MonoBehaviour 생명주기 로그 예측 과외, 코루틴 수명 버그 디버깅, Update·FixedUpdate·LateUpdate 면접, Humble Object로 나눈 대시 쿨다운, 이름표 조회·캐시 디버깅, 프리팹 인스턴스화와 풀링 면접의 6문제다(2/2/2). 숨은 테스트는 순수 C# `AbilityCooldown` 구현(7/7·0/7)에만 있고, 나머지는 엔진 의존 디버깅이거나 과외·면접이라 `tests: null`이다. 작성자는 docs.unity.com 6000.0 페이지를 curl로 받아 grep했고, 실행 순서 흐름도 SVG에서 라벨 순서를 뽑았다. 코루틴 문제는 결함 넷이 세 곳에 있다. 커밋 `49685b6`으로 배포했다.

**검수에서 확인한 것.** `extraSources` URL 23개 전부, `unity-exec-order`, `unity-pool`, 흐름도 SVG, 새로 넣은 출처 넷(Object.Destroy, StartCoroutine, Script execution order, ObjectPool.Release), WaitForSecondsRealtime과 LateUpdate 페이지를 열었다. 생명주기 과외의 Q1~Q4 답이 모두 문서화된 보장에서 따라 나오는지 확인했다. 쿨다운 구현은 틀린 변형 6개를 로컬에서 잡고 대안 정답은 통과해 문제가 없었다. Unity에서 실행한 것은 없다.

**틀려서 고친 것.** 생명주기 과외의 "모든 오브젝트의 Awake가 끝난 뒤 Start"는 문제 자체의 비활성 Boss와 모순이어서 활성 오브젝트로 좁혔고(개념, Q2(b), 해답 주석), 출처 없는 "씬 편집에 따라 달라짐"을 Script execution order 문장으로 바꿨으며, c4·c5가 기대던 개념 문장을 더했다. 코루틴 디버깅 해설은 결함 둘을 하나로 묶어 설명하고 있어 네 결함(1-A, 1-B, 2, 3)을 하나씩 설명하고 c10을 맞췄다. "약 2초" 단서는 Destroy 지연이 timeScale의 영향을 받는다는 문서로 뒷받침했다. 업데이트 루프 면접의 점프 예는 반드시 프레임률에 의존하는 것이 아니어서 누르고 있는 동안의 AddForce로 바꿨고, 근거 없는 "떨림이 오히려 또렷"을 지웠으며, d3의 무관한 인용을 바꿨다. 이름표 디버깅은 Camera.main에 대한 "무시할 수 없습니다"를 문서 표현으로 좁히고, 문서가 허용하는 Awake 안의 Find를 깎던 c7을 고쳤다. 풀링 면접은 빌드에서 이중 Release를 했을 때의 동작에 관한 추론을 질문과 핵심 답에서 지웠고, "Get과 Release를 반복"하는 예열 조언은 인스턴스 하나만 만들므로 틀린 조언이라 고쳤으며, "비례"를 누그러뜨렸다. 배포 뒤 트랙 7 묶음 c를 쓰던 중, 업데이트 루프 면접의 다음 미션이 `vSyncCount = 0` 없이 `targetFrameRate`를 바꾼다는 점이 발견되었다. 데스크톱에서는 vSyncCount가 0이 아니면 targetFrameRate가 무시되므로 별도 커밋 `9a76c2b`로 조건을 넣었다.

**끝까지 확인하지 못한 것.** 비활성화나 파괴 중에 OnDisable 안에서 StopCoroutine을 부르는 동작을 설명하는 문서 문장은 찾지 못했다. 해설에 그렇게 적고 에디터에서 확인하라고 안내한다.

## 묶음 b

- `t4-tutor-serialization-rules-scriptableobject` — 인스펙터에 안 보이는 필드, 저장되지 않는 값: Unity 직렬화 규칙과 ScriptableObject 기초 (과외·개념 · Easy · 문서 대조)
- `t4-debug-scriptableobject-shared-runtime-state` — 고블린 한 마리를 때렸는데 전부 아프다: ScriptableObject 에셋에 써 버린 런타임 상태 (디버깅 · Medium · 문서 대조)
- `t4-impl-skill-definition-runtime-state` — 데이터 주도 스킬: 바뀌지 않는 정의(SkillDefinition)와 시전자마다 하나인 런타임 상태(SkillState) (실전 구현 · Easy · 실행 검증)
- `t4-interview-ui-architecture-mvp-binding` — 매 프레임 텍스트를 다시 쓰는 HUD와 서로 어긋나는 골드 표시: MVP/MVVM, 바인딩, 갱신 흐름 (압박 면접 · Hard · 문서 대조)
- `t4-impl-inventory-presenter-mvp` — 인벤토리 화면의 MVP Presenter: 라벨 포맷, 선택, 모델 이벤트로 갱신, Dispose에서 구독 해지 (실전 구현 · Medium · 실행 검증)
- `t4-debug-ui-listener-stacking-captured-index` — 클릭 한 번에 포션 다섯 개: 쌓이는 onClick 리스너, 해지하지 않은 구독, 캡처된 반복 변수 (디버깅 · Hard · 문서 대조)

**무엇을 만들었는지.** Unity 직렬화 규칙과 ScriptableObject 기초 과외, SO 에셋에 써 버린 런타임 상태 디버깅, 바뀌지 않는 SkillDefinition과 시전자별 SkillState 구현, UI 아키텍처(MVP/MVVM·바인딩) 면접, 인벤토리 MVP Presenter, 쌓이는 onClick 리스너 디버깅의 6문제다(2/2/2). 숨은 테스트는 두 구현 문제(8/8·0/8, 9/9·0/9)에만 있다. 작성자는 Unity 6000.0 직렬화·SO·UnityEvent·UI Toolkit 바인딩 문서, uGUI Button API, Unity Learn MVC/MVP, UnityCsReference의 UnityEvent.cs(6000.0), C# 명세, Fowler Passive View 등을 읽었다. 커밋 `f844cc7`로 배포했다.

**검수에서 확인한 것.** 등록된 URL 29개(모두 HTTP 200)와 새로 넣은 셋(`unity-blog-so-6ways`, `ms-mvvm`, `gh-unityevent0-source`)을 열었다. 테스트가 없는 네 문제는 내려받은 문서 원문으로만 대조했다. 스킬 정의는 틀린 변형 7개, 인벤토리 Presenter는 11개를 로컬에서 잡았고, 새 리스트를 만드는 대안 정답은 통과했다(두 문제는 다듬기만 했다). 직렬화 과외의 (a)~(o), Q2, Q3 답은 Serialization rules 페이지와 일치했다.

**틀려서 고친 것.** 직렬화 과외의 직렬화 가능 타입 목록에 고정 크기 버퍼와 "static이 아닌 클래스" 조건이 빠져 있어 넣었다. SO 디버깅은 Play 모드에서의 지속을 매뉴얼과 Unity 블로그 문장("changes to ScriptableObject data do persist in the Editor")에 묶고, 디스크 기록과 빌드 동작은 에디터나 빌드에서 확인할 일로 표현했다. UI 면접은 MVVM 정의를 Microsoft MVVM 페이지로 인용했고, 꼬리질문 3이 Unity Learn의 `HealthPresenter`가 `OnEnable`/`OnDisable`을 쓴다고 암시했지만 실제로는 `Start`에서 구독하고 `OnDestroy`에서 해지하므로 고쳤다. 리스너 디버깅은 `AddListener` 문서 문장(같은 리스너는 한 번만 호출된다)과 6000.0 소스(`UnityEvent_0.cs`와 `InvokableCallList.AddListener`에는 중복 제거가 없다)가 실제로 충돌한다는 것을 확인했다. 버그가 이미 `Bind`마다 새 람다를 쓰고 있어 구조는 바꾸지 않고 충돌을 단서 하나로 정리했으며, 감점 d1은 문서 문장 대신 소스 파일을 인용했다. 해설 길이를 2,000~3,100자에서 1,600~2,450자로 줄였다.

**끝까지 확인하지 못한 것.** 리스너 버그의 정확한 `Use` 호출 횟수는 확인하지 못해 "최소 3회"로 표현했고, Play 모드의 SO 변경이 디스크에 기록되는지도 확인하지 못했다. Unity 엔진에서 실행한 것은 없다.

## 묶음 c

- `t4-interview-physics-rigidbody-trigger-layers` — 문에 파고드는 플레이어와 울리지 않는 함정: Rigidbody 이동, 충돌·트리거 메시지, 레이어 충돌 매트릭스 (압박 면접 · Medium · 문서 대조)
- `t4-debug-physics-knockback-raycast-trigger` — 벽에 파묻히는 넉백, 벽 너머를 보는 적, 울리지 않는 경보: 물리 오용 버그 세 가지 (디버깅 · Medium · 문서 대조)
- `t4-impl-jump-buffer-coyote-time` — "분명히 눌렀는데 안 뛰었어요": 점프 입력 버퍼와 코요테 타임을 순수 C#으로 (실전 구현 · Easy · 실행 검증)
- `t4-tutor-scene-loading-object-lifetime` — 90%에서 멈춘 로딩 바와 끊기는 BGM: 씬 로딩과 오브젝트 수명 (DontDestroyOnLoad, Additive, allowSceneActivation) (과외·개념 · Easy · 문서 대조)
- `t4-impl-scoped-event-channel-subscription-bag` — 씬이 내려가면 구독도 함께 끝난다: 구독 토큰과 씬 단위 SubscriptionBag을 갖춘 이벤트 채널 (실전 구현 · Hard · 실행 검증)
- `t4-interview-asset-management-resources-bundles-addressables` — 도감을 닫아도 내려가지 않는 메모리: Resources, AssetBundle, Addressables의 로드·언로드와 참조 카운트 (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** Rigidbody 이동·충돌과 트리거 메시지·레이어 충돌 매트릭스 면접, 물리 오용 버그 디버깅, 순수 C# 점프 입력 버퍼와 코요테 타임, 씬 로딩과 오브젝트 수명 과외, 구독 토큰과 씬 단위 SubscriptionBag을 갖춘 이벤트 채널, Resources·AssetBundle·Addressables 로드·언로드 면접의 6문제다(2/2/2). 숨은 테스트는 두 구현 문제(각 8/8·0/8)에만 있고, 디버깅과 과외의 Unity 코드는 컴파일하거나 실행하지 않았다. 커밋 `5784971`로 배포했다.

**검수에서 확인한 것.** 인용된 URL 47개 전부(HTTP 200)와 새로 넣은 RequireComponent 페이지를 열어 대조했다. 물리 면접에서 쓴 충돌 매트릭스 행은 모두 문서와 일치했다. 점프 버퍼는 대안 정답 2개가 통과하고 틀린 답 7개가 실패했다. 엔진에서 실행한 것은 없다.

**틀려서 고친 것.** 물리 면접은 트리거 조건을 페이지별로 밝혔다. create-trigger 페이지는 "최소 하나의 동적 콜라이더"라고 한 뒤 "최소 하나의 물리 바디"라고 하고, 매트릭스 페이지는 키네마틱을 명시적으로 포함한다. `sourceRefs`는 18개에서 4개로 줄였다. 물리 디버깅에서는 `[RequireComponent]`가 씬에 이미 놓인 드론에 Rigidbody를 붙여 주지 않아 해답의 `Awake`가 null을 받는다는 점을 제약·해답 주석·해설에 넣고, 증상 1 문구를 문서가 말하는 범위로 좁혔다. 점프 버퍼는 `dt`가 단계마다 달라진다는 것을 시나리오에 적었다. 씬 로딩 과외의 "다시 로드하면 중복이 생긴다"는 페이지 본문이 아니라 DontDestroyOnLoad 예제에서 나온 것으로 귀속했다. 이벤트 채널은 깊이 카운터 대신 bool "발행 중" 플래그를 쓰는 답이 모든 테스트를 통과해서 중첩 발행 장면을 넣었고, 분할 상환 O(1) 해지와 할당 없는 발행은 채점표로만 확인한다고 노트에 적었다. 에셋 면접은 Addressables 진술을 2.7 매뉴얼에 귀속하고 `sourceRefs`를 13개에서 4개로 줄였다. 더 이상 참조되지 않는 `extraSources` 7개를 지웠다.

**끝까지 확인하지 못한 것.** 이벤트 채널의 Publish 규칙은 `t10-impl-observer-event-channel`과 많이 겹치고 새로운 것은 bag, 늦은 Add, 분할 상환 해지뿐이라는 점을 검수자가 판단 사항으로 넘겼다(트랙 1의 이벤트 누수 문제와는 다르다). 엔진 동작은 문서로만 확인했다.

## 묶음 d

- `t4-debug-addressables-handle-lifetime` — 상점 스킨 미리보기: 상점을 나갈 때 터지는 예외, 쌓여 가는 초상화 핸들, 크로스페이드가 읽는 해제된 초상화 (디버깅 · Medium · 실행 검증)
- `t4-impl-save-versioned-migration` — 세 가지 버전이 섞인 세이브 파일: 출시판 · v2 세이브를 v3 로 올리고, 모르는 미래 버전은 건드리지 않는 로더 (실전 구현 · Medium · 실행 검증)
- `t4-interview-profiling-workflow-hypothesis` — 보스전에서만 40 fps, 몇 초마다 끊기는 화면, 들어갔다 나올수록 늘어나는 메모리: Profiler · Frame Debugger · Memory Profiler 로 가설 세우고 검증하기 (압박 면접 · Hard · 문서 대조)
- `t4-tutor-assembly-definitions-editor-split` — HUD 문구 한 줄에 전체 재컴파일, 그리고 깨진 안드로이드 빌드: Assembly Definition 으로 런타임 · 에디터 코드 나누기 (과외·개념 · Easy · 문서 대조)
- `t4-impl-fixed-timestep-accumulator` — 144Hz 에서도 30fps 에서도 같은 탄도: Unity 의 FixedUpdate 모델대로 고정 스텝 시계와 보간 alpha 구현하기 (실전 구현 · Easy · 실행 검증)

**무엇을 만들었는지.** Addressables 핸들 수명 디버깅(버그 3), 출시판·v2 세이브를 v3로 올리고 모르는 미래 버전은 건드리지 않는 로더, Profiler·Frame Debugger·Memory Profiler 가설 검증 면접, Assembly Definition으로 런타임·에디터 코드를 나누는 과외, FixedUpdate 모델대로 만드는 고정 스텝 누산기의 5문제다(Easy 2 / Medium 2 / Hard 1). 작성자는 Addressables 2.7.6, Unity 6000.0 매뉴얼(시간, Profiler, Frame Debugger, asmdef, JSON, 특수 폴더), Memory Profiler 1.2, Microsoft Learn(System.Text.Json, Dictionary), Gaffer "Fix Your Timestep", Boss Room의 asmdef(커밋 1299ba4)를 curl로 받아 확인했고(47개 URL 모두 200), JSON과 float 동작은 .NET 8로 실행했다. Addressables 2.7 문서는 이중 해제, 완료 전 해제, 해제 후 `Result`가 어떻게 되는지 말하지 않아 문제 안의 가짜 로더 규칙으로 정했다. 커밋 `9baca40`으로 배포했고 해설마다 "흔한 오해"가 들어 있다.

**검수에서 확인한 것.** 원래 `extraSources` 47쪽 전부와 Memory 모듈 페이지, Unity 6.0·6.6의 프로그래밍 소개 페이지, 조건부 컴파일 페이지, Boss Room asmdef 원문을 열었다. 세 문제는 채점 서버(Compiler Explorer)에서 실행했고 둘은 문서로 대조했다. 세이브 마이그레이션의 .NET 주장은 .NET 8에서 다시 돌려 모두 맞았다. Addressables 문제의 가짜 로더 규칙(F3/F4)은 실제 Addressables 동작처럼 제시된 적이 없고, 실제 패키지에 대한 주장은 2.7 문서와 맞았다.

**틀려서 고친 것.** Addressables 디버깅은 예외를 try/catch로 삼키는 수정이 모든 테스트를 통과해서 스파이 로더로 실패하게 했고, 문서 규칙과 가짜 규칙을 구분하라는 요구를 과제에 넣었다(c9가 이미 채점하던 내용이다). 세이브 마이그레이션은 c9가 과제가 묻지 않은 설명을 채점해서 과제에 넣었고, c8이 `TryGetValue` 말고도 같은 효과의 검사를 인정하게 했다. 프로파일링 면접의 "GC Allocated In Frame" 차트에는 출처가 없어 Memory Profiler 모듈 페이지를 더했고, `Camera.Render` 표현을 누그러뜨렸다. asmdef 과외는 런타임 코드에서 `UnityEditor`를 쓰면 플레이어 빌드가 깨진다는 주장을 Unity 6.0 "Introduction to programming"으로 인용했고, `Game.UI`에 대해 틀렸던 순환 논증을 고쳤으며, 세 채점 항목이 묻지 않은 답을 채점하고 있어 과제에 5단계를 더했다. 고정 시간 간격 문제는 매뉴얼 흐름도대로 만든 모델이 API 페이지의 상한(16.67)보다 많은 17스텝을 돌 수 있고 문서 세 곳이 이와 어긋난다는 점을 시나리오와 해설 앞부분에서 밝혔으며, 재현되지 않은 이중 누산기 예를 직접 돌린 예로 바꿨다(테스트는 원래 그 경계를 피한다). 해설은 1,928~2,359자로 줄였고 새 출처 id `unity-profiler-memory-module`, `unity-scripting-intro`를 더했다.

**끝까지 확인하지 못한 것.** 실제 Addressables가 이중 해제에 어떻게 반응하는지, 그 경계에서 Unity가 실제로 FixedUpdate를 몇 번 부르는지는 확인하지 못했다. 핸들 목록을 그대로 두고 `IsValid()`/`IsDone`으로 거르는 수정은 여전히 테스트를 통과하고 채점표만 잡는다. 이를 정답으로 볼지 테스트로 막을지는 최종 점검 때 정하기로 남겨 두었다.

## 묶음 e

- `t4-debug-singleton-reload-quit-domain` — 두 겹으로 들리는 BGM, 종료할 때마다 찍히는 NullReferenceException, 두 번째 플레이부터 사라지는 효과음: 싱글턴 AudioManager 디버깅 (디버깅 · Easy · 실행 검증)
- `t4-interview-mobile-optimization-checklist` — 기기에서만 30fps, 15분 뒤 뜨거워지는 폰, 몇 초마다 끊기는 전투: 측정 도구로 말하는 모바일 최적화 체크리스트 (압박 면접 · Medium · 문서 대조)
- `t4-impl-ability-executor-anim-events` — 끊긴 애니메이션에 갇히는 스킬과 이전 클립이 낸 판정: 애니메이션 이벤트를 기한·취소와 함께 기다리는 순수 C# 시전기 (실전 구현 · Hard · 실행 검증)
- `t4-interview-job-system-burst-review` — 탄 8,000 발을 잡으로 옮긴 PR 리뷰: 안전 시스템 규칙, 할당자와 Dispose, Burst 가 받지 않는 코드, 그리고 잡이 이득이 되는 조건 (압박 면접 · Medium · 문서 대조)

**무엇을 만들었는지.** 두 겹 BGM·종료 시 NullReferenceException·두 번째 플레이부터 사라지는 효과음을 일으키는 싱글턴 AudioManager 디버깅, 측정 도구로 말하는 모바일 최적화 체크리스트 면접, 애니메이션 이벤트를 기한·취소와 함께 기다리는 순수 C# 스킬 시전기, 잡 시스템·Burst로 옮긴 PR 리뷰 면접의 4문제다(쉬움 1 · 보통 2 · 어려움 1). 서비스 로케이터 주제는 트랙 10에 있어 일부러 뺐다. 싱글턴 문제는 Unity가 아니라 테스트 템플릿 안의 순수 C# Unity 모델 위에서 채점하며, 시나리오에 어떤 동작이 문서를 따르고 어떤 동작이 모델의 선택인지(객체 사이의 `OnDestroy` 순서, `AddComponent` 안에서 도는 `Awake`) 적었다. 작성자는 Unity 6 매뉴얼·스크립팅 API, Burst 1.8, Memory Profiler 1.2, Adaptive Performance 5.1, Android Thermal API·Power Profiler·메모리 개요, Microsoft Learn(CancellationToken, C# 명세 §12.8.16, CS1612), CMU 15-418 7강·17-214 3강 PDF 등 약 75쪽을 읽었다. 커밋 `0d44e12`로 배포했다.

**검수에서 확인한 것.** 인용한 주소를 모두 열었고(모두 열림), CMU PDF 두 개의 텍스트와 Unity 6의 `Awake`, `AddComponent`, `Application.quitting`, `NativeArray` 인덱서 페이지를 대조했다. 흔한 틀린 답안 15개를 로컬에서 돌려 모두 잡히고, 다르게 쓴 정답 4개는 통과함을 확인했다. 캐시를 피한 판정 서버 실행도 통과했다. 싱글턴 모범 답안은 종료 시 파괴 순서를 바꾸거나 `Awake`를 `AddComponent` 밖으로 옮긴 모델에서도 통과했다. 데스크톱에서 `vSyncCount`가 0이 아니면 `targetFrameRate`가 무시된다는 점을 포함해 프레임률 문장이 Unity 문서와 맞는다. 트랙 1·7·9에서 다시 쓴 자료 id 7개는 주소가 같다.

**틀려서 고친 것.** 싱글턴 문제는 "빌드를 종료할 때도 예외가 난다"는 QA 보고를, iOS에서는 `OnApplicationQuit`이 불리지 않고 모바일 OS가 앱을 죽일 때도 불리지 않을 수 있다는 문서에 맞춰 "보스 방에서 플레이 모드를 끝낼 때"로 좁혔다. `BeforeSceneLoad`가 `SubsystemRegistration`보다 위험한 이유(같은 시점의 콜백끼리는 순서가 보장되지 않음)를 해설에 넣고, 출처 없이 `is null`을 인용하며 "설명할 수 있다"를 요구하던 채점 항목 c8을 코드로 확인할 수 있게 고쳤다. 모바일 면접은 `WaitForTargetFPS`가 길면 항상 프레임 제한이나 VSync를 기다린다고 했지만, 프로파일러 마커 문서는 GPU가 끝나지 않았을 때도 나타난다고 하므로 렌더 스레드도 확인하라고 고쳤고, "텍스처 900 MB면 가장 먼저 종료된다"를 Android 메모리 문서가 말하는 범위로 좁혔다. 스킬 시전기는 인용 페이지가 말하지 않는 "Animator 업데이트 모드의 기본값은 Normal"에서 "기본값"을 빼고, 근거 없는 "Cast는 클로저를 정확히 하나 할당한다"를 "할당할 수 있다"로 고치고, `CrossFade`가 클립 이름이 아니라 상태 이름을 받는다는 주의를 더하고, 시전마다 상태 객체를 따로 두는 동등한 풀이가 감점되지 않게 채점 항목 c10을 넓혔다. 잡 시스템 면접은 `nativeArray[0]++` 흔한 오해를 트랙 7의 수정과 같게 고쳐 쓰고(.NET 8에서 `++`·`+=`는 값을 되돌려 쓰고, 구조체 필드 대입은 CS1612), 인덱서와 복합 대입 자료 id를 트랙 7과 같은 주소로 더했다.

**끝까지 확인하지 못한 것.** `destroyCancellationToken`이 `OnDestroy`에 비해 언제 취소되는지는 문서화되어 있지 않아 문제가 순서를 주장하지 않는다. `nativeArray[0]++` 동작은 C# 명세와 .NET 8 등가 모델로만 확인했고 Unity 안에서는 실행하지 않았다. 싱글턴 문제의 채점은 Unity 자체가 아니라 순수 C# 모델 위에서 이루어진다.

## 최종 점검 (2026-11-23)

배포된 30문제 전체를 점검 에이전트 3개(10문제씩)가 차례로 다시 확인하고, 점검에 참여하지 않은 검증 에이전트 2개(15문제씩)가 그 변경을 다시 확인했다. 두 검증 모두 통과 판정을 냈다.

**한 일.** 흔한 오해가 없던 21문제에 "### 흔한 오해" 절을 넣고(출처나 실행으로 뒷받침), 모든 채점 항목·감점에 `sourceId`나 `basis`를 붙이고, `sourceRefs`가 4개를 넘던 문제(최대 11개)를 4개로 줄였다. 새 근거로 Unity 6000.0 API 페이지(MonoBehaviour, Rigidbody.linearVelocity, UnityEvent.Invoke, Time.timeScale, uGUI Graphic 등), Unity 지원 문서, UnityCsReference 6000.0, Microsoft Learn(Delegate.Remove, List.GetEnumerator, 예외 모범 사례, C# 비교 연산자)을 더했다.

**확인한 것.** Unity 6000.0 매뉴얼·API, Addressables 2.7, Memory Profiler 1.2, Burst 1.8, uGUI 2.0, Android 문서, Gaffer On Games, CMU 15-418 7강·17-214 3강 PDF 등 약 150쪽을 다시 받아 대조했다. Unity 동작을 흉내 낸 작은 모델(리스너 목록, ScriptableObject 공유 상태)과 C# 동작(델리게이트 `+=`/`-=`, NaN 비교, 발행 중 제거된 핸들러, `foreach` 중 `Remove`)은 로컬 .NET 8에서 실행했다. 커밋 전 `check-tests.js`를 판정 서버에서 전부 다시 돌려 통과했다.

**알려진 미해결 항목 처리: Addressables 핸들 디버깅.** `t4-debug-addressables-handle-lifetime`에서 핸들 목록을 유지하면서 `IsValid()`/`IsDone`으로 거르는 풀이는 문제가 밝힌 O(1) 상태 제약을 어기고 클릭마다 해제된 핸들을 계속 붙잡으므로 정답이 아니라고 판단했다. 숨은 테스트 `stale-response-released`를 강화했다(빠른 교체 30번 → 강제 GC → 해제된 작업이 4개를 넘게 남아 있으면 실패. 감시 객체는 약한 참조만 쥔다). 모범 답안과 다르게 쓴 정답 세 가지는 캐시를 피한 판정 서버 실행 11번과 로컬 Debug/Release 여러 설정에서 매번 통과했고(남은 핸들 0~1개), 목록 방식 두 가지는 매번 실패했다(63개). 정해진 개수의 필드라면 어떤 조합이든 인정하도록 채점 항목 c6도 넓혔다.

**틀려서 고친 것.**
- 싱글턴에서 DI로: "fake null" 설명이 너무 넓었다. Unity 6 지원 문서에 따르면 할당하지 않은 내장 타입 필드만 fake null이고 직접 만든 스크립트 타입 필드는 진짜 null이라 좁혔다.
- 고정 시간 간격 누산기: 어느 문서에도 없는 기본값 "0.3333333"을 매뉴얼 값 0.333으로 바꾸고 몫을 16.65로 고쳤다.
- 점프 버퍼·코요테 타임: Celeste의 점프 버퍼는 "눌러서 유지"하는 방식이라 시나리오를 좁히고 차이를 밝혔다.
- UI 아키텍처·MVVM 바인딩: Unity Learn의 표현보다 강하게 쓴 문장을 좁히고, 두 인터페이스 구현만이 "바뀔 때만 갱신"하는 방법은 아니라는 점(MarkDirty 갱신 트리거)을 넣었다. 데미지 텍스트의 갱신 빈도 분리를 "유일한 규칙"이 아니라 가이드의 "한 가지 방법"으로 고쳤다.
- 코루틴: "timeScale 0이면 다시는 재개되지 않는다"를 "0인 동안 재개되지 않는다"로 고쳤다. 에셋 관리 면접: "의존성이 함께 언로드된다"를 Addressables 소개 페이지가 말하는 범위로 좁혔다.
- 잡 시스템 리뷰: CMU 15-418 7강에 귀속한 두 문장이 슬라이드보다 많은 것을 말해 좁혔다. 근거가 되지 않는 페이지를 인용하던 채점 항목(Instantiate 페이지, Button 페이지, SerializeField 페이지 등)을 맞는 문서나 `basis`로 바꿨다.

**끝까지 확인하지 못한 것.** Unity 에디터·플레이어 안에서의 동작은 실행하지 못하고 문서와 순수 C# 모델로만 확인했다. Addressables 테스트는 GC에 기대므로 판정 서버 런타임이 바뀌면 다시 확인해야 한다.
