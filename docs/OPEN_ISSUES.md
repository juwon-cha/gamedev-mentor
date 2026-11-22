# 미해결 항목과 알려진 한계

이 문서는 검수와 최종 점검(2026-11-22~23)에서 끝까지 확인하지 못한 것, 판단을 미룬 것, 알려진 한계를 문제 id와 함께 모아 둔 것입니다. 문제를 풀 때 해당 부분은 "문서 근거만 있음" 또는 "판정 서버 환경에서 관찰한 동작"으로 읽어 주세요. 묶음별 자세한 기록은 [reviews/](reviews/)에 있습니다.

[문서 목록](README.md) · [작성·검수 기준](STANDARDS.md)

## 1. Unity 안에서 직접 실행하지 못한 주장

이 작업 환경에는 Unity가 없어서, Unity 엔진·에디터·플레이어 동작은 Unity 6 매뉴얼·스크립팅 API·UnityCsReference 원문과의 대조, 또는 순수 C#으로 만든 모델 실행으로만 확인했습니다.

| 문제 id | 내용 |
|---|---|
| 트랙 4 전체 | Unity 동작에 관한 문장은 문서 대조만 했습니다. 실행 채점이 있는 Unity 문제는 Unity를 흉내 낸 순수 C# 모델 위에서 채점합니다 |
| `t4-debug-singleton-reload-quit-domain` | Unity 대신 테스트 템플릿 안의 순수 C# 모델에서 채점합니다. 객체 사이의 `OnDestroy` 순서, `AddComponent` 안에서 도는 `Awake`는 모델의 선택입니다(시나리오에 밝힘) |
| `t4-impl-ability-executor-anim-events` | `destroyCancellationToken`이 `OnDestroy`에 비해 언제 취소되는지는 문서화되어 있지 않아 순서를 주장하지 않습니다 |
| `t4-interview-job-system-burst-review`, `t7-interview-unity-concurrency-model` | Unity 6 매뉴얼은 `nativeArray[0]++`가 값을 바꾸지 못한다고 쓰지만, C# 명세와 .NET 8에서 같은 형태의 인덱서로 실행한 결과로는 값이 바뀝니다. Unity 안에서는 실행하지 않았습니다 |
| `t1-debug-hidden-allocations-targeting`, `t1-interview-unity-backends-managed-native-memory`, `t1-impl-hud-timer-char-buffer` | 할당 바이트 수는 .NET 8에서 잰 값입니다. Unity Mono/IL2CPP에서는 재지 않았고 본문에 "측정하지 않음"으로 표시했습니다 |
| `t9-tutor-sprite-atlas-batching-bleeding` | Unity 스프라이트 아틀라스가 실제로 쓰는 밉 필터는 확인하지 못해 해설에서 "모델"로 표시했습니다 |
| 트랙 10 일부(오브젝트 풀, ScriptableObject 등) | Unity 플레이어 빌드에서의 동작은 문서로만 확인했습니다 |

## 2. 판정 서버 환경에 기대는 테스트·수치

판정 서버는 Compiler Explorer(.NET 8, GCC 13.2, 코어 2개, 20초 제한)입니다. 아래 항목은 환경이 바뀌면 다시 확인해야 합니다.

| 문제 id | 내용 |
|---|---|
| `t7-impl-debug-console-tokenizer` | 500 ms 시간 기준. 모범 답안 3~5 ms, `+=` 연결 변형 약 4.5 s로 여유가 크지만 판정 서버 속도에 따라 달라질 수 있습니다 |
| `t4-debug-addressables-handle-lifetime` | 숨은 테스트 `stale-response-released`가 강제 GC 뒤 약한 참조로 남은 해제 작업 수를 셉니다(4개 초과면 실패). 정답 풀이는 판정 서버 11회·로컬 여러 설정에서 0~1개로 매번 통과했지만 GC에 기대는 테스트입니다 |
| `t2-debug-inventory-leak-raii` | `new[]`/`delete` 불일치 검출은 GCC 13.2가 배열 블록을 단일 객체용 `operator delete`로 넘기는 관찰된 동작에 기댑니다(표준상 UB, 케이스마다 별도 프로세스, 문제·해설에 밝힘) |
| `t2-impl-string-view-config-tokenizer` | view를 저장하는 틀린 답안이 해제된 메모리를 읽는 결과는 UB이며 판정 서버에서 관찰된 결과일 뿐입니다 |
| `t7-debug-trade-deadlock`, `t7-impl-bounded-blocking-queue`, `t7-debug-loot-ledger-race` 등 동시성 문제 | 캐시를 피한 반복 실행으로 확인했지만, 스레드 수(약 12개 한도)와 스케줄링에 따라 결과가 달라질 수 있습니다 |
| `t5-impl-flood-fill-regions` | 판정 서버에서 재귀가 약 13만 단계에서 멈춘다는 수치는 이전 검수 기록에서 옮긴 값입니다(최종 점검에서 다시 재지 않음). 제약 조건의 예전 판정 서버 시간도 다시 재지 않았습니다 |

## 3. 테스트로 잡을 수 없어 채점표로만 확인하는 것

| 문제 id | 내용 |
|---|---|
| `t2-debug-chunk-streamer-data-race` | 일반 int 카운터 버그와 뮤텍스 없이 설정하는 atomic 정지 플래그는 테스트로 안정적으로 잡을 수 없어 채점표로만 확인합니다(제약 조건에 밝힘) |
| `t7-debug-loot-ledger-race` | 쓰기에만 락을 걸고 읽기에는 걸지 않는 장부 코드는 테스트를 통과합니다(노트와 해설에 밝힘) |
| `t7-impl-bounded-blocking-queue` | 타임아웃을 다시 시작하는 틀린 답안은 기다리는 쪽이 정당하게 항목을 받으면 통과할 수 있고, 폴링 감지는 속도로만 합니다(테스트 노트에 밝힘) |

## 4. 관찰로만 적은 것, 원인을 밝히지 못한 것

| 문제 id | 내용 |
|---|---|
| `t7-interview-os-scheduling-frame-pacing` | `timeBeginPeriod(1)` 실행 결과가 일관되지 않았습니다(대개 1.9 ms, 한 번은 15.5 ms). 원인을 밝히지 못해 관측값으로 적었습니다 |
| `t6-impl-turret-cross-signed-angle`, `t6-impl-move-rotate-towards-max-step` | `Atan2(-0, 음수) = -π`는 x64에서만 관찰했습니다(본문에 밝힘). ARM64와 HLSL 동작은 실행하지 않았습니다 |
| `t2-tutor-aos-soa-projectiles` | GCC -O3가 예제를 벡터화하지 않는 이유는 진단 메시지가 불분명해 주장하지 않았습니다 |
| `t2-debug-iterator-invalidation-cleanup` | MSVC `/MDd` 디버그 빌드가 초기 코드의 `SplitDeadSlimes`에서 단언하지 않고 쓰레기 값으로 끝난 이유는 관찰로만 적었습니다 |
| `t5-debug-recursion-base-case-memo-depth` | 꼬리 재귀 변형이 스택을 넘지 않는지는 앞선 호출에 따라 달라져 관찰 결과로만 적었습니다 |
| `t8-debug-tcp-stream-framing` | `ReadExactly`가 처음 들어간 .NET 버전은 확인하지 못해 ".NET 8에 있다"고만 썼습니다 |
| `t7-interview-debugging-methodology` | "Release 빌드가 9번 줄 크래시를 8번 줄로 보고한다"는 코드 모양에 따라 달라지는 한 예입니다 |

## 5. 문서로만 확인한 도구·기능

| 문제 id | 내용 |
|---|---|
| `t7-interview-version-control-game-team` | UnityYAMLMerge와 Git LFS 잠금은 실행하지 않았습니다. `git lfs migrate import --no-rewrite`가 과거 기록을 건드리지 않는다는 문장은 추론으로 표시했습니다 |
| `t7-interview-debugging-methodology` | Visual Studio 중단점·덤프 기능, WER, `DOTNET_` 덤프 설정은 문서로만 확인했습니다 |

## 6. 형식상 남은 것

- 해설 길이: 일부 문제의 해설은 작성 기준(900~1,500자)보다 깁니다. 정확성을 해치지 않으려고 줄이지 않았습니다.
