# 트랙 7 검수 기록

[문서 목록](../README.md) · [작성·검수 기준](../STANDARDS.md)

## 초기 문제

- `t7-debug-loot-ledger-race` — 레이드 정산 장부의 경쟁 상태: 사라지는 골드와 깨지는 드롭 목록 (디버깅 · Medium · 실행 검증)
- `t7-debug-trade-deadlock` — 거래 서버가 멈춘다: 락 순서가 엇갈린 인벤토리 교착 (디버깅 · Medium · 실행 검증)
- `t7-impl-main-thread-dispatcher` — 메인 스레드 디스패처: 워커의 결과를 프레임마다 안전하게 넘겨받기 (실전 구현 · Medium · 실행 검증)
- `t7-interview-process-thread-context-switch` — 프로세스와 스레드, 컨텍스트 스위치: "스레드를 늘리면 빨라지나요?" (압박 면접 · Medium · 문서 대조)
- `t7-interview-memory-stack-heap-virtual` — 메모리 기초: 스택과 힙, 가상 메모리, 누수와 단편화가 모바일 게임에서 드러나는 방식 (압박 면접 · Medium · 문서 대조)
- `t7-interview-unity-concurrency-model` — Unity 의 동시성 모델: 메인 스레드 전용 API, 코루틴, async/await, Job System 과 Burst (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** 트랙 7의 첫 6문제는 커밋 `edce1df`로 실렸다(독립 검수 완료). 숨은 테스트는 디버깅 둘과 디스패처에 있고, 작성 단계 결과는 장부 경쟁 6/6·1/6, 거래 교착 7/7·2/7, 디스패처 8/8·0/8이었다. 작성자는 Microsoft Learn 5쪽, Wikipedia 7쪽, Unity 6 매뉴얼 6쪽, Burst 1.8 타입 지원을 포함한 19쪽을 읽었다. 채점 서버(Compiler Explorer)가 같은 소스에 캐시된 결과를 돌려줘 check-tests 세 번이 서로 독립적이지 않았으므로, 캐시를 피한 사본을 따로 돌려 결과가 같음을 확인했다. 교착 시작 코드는 제한 시간이 있어 약 3.3초 걸리고 멈추지는 않는다. 렌더 스레드, 암달의 법칙, 모바일 OS의 앱 종료, GC 밖의 네이티브 엔진 자원, `JobHandle`은 처음에 일반 지식으로 쓰였다.

**검수에서 확인한 것.** Unity 6 매뉴얼(Awaitable 두 쪽, 코루틴, 잡 개요, NativeContainer, 잡 생성과 실행, 관리 메모리), `RenderingThreadingMode`, Burst 타입 지원, Microsoft Learn(volatile, Interlocked, lock, `List<T>`, 스레딩 모범 사례, TAP, Lippert 아카이브), Wikipedia 7쪽, Android 메모리 관리를 열었다. 최종 템플릿을 고유한 소스로 채점 서버에서 돌렸다. 서비스 제한은 20초(19초는 통과, 20초는 종료)이고 코어는 2개였으며, 세 스위트 모두 모범 답안은 8/8 통과, 시작 코드는 8/8 실패였다. 다른 수정(모두 `lock` 4/4, `ConcurrentQueue` 장부 4/4, 전역 락 8/8, `Monitor.Enter` 순서 8/8, lock+`Queue` 8/8, `ConcurrentQueue` 디스패처 8/8)도 통과했다. 가장 긴 실행은 2.8초, 최악의 멈춤 경로는 약 11.5초였다. 난이도는 다섯 문제가 Medium, Unity 동시성 면접이 Hard다.

**틀려서 고친 것.** 장부 경쟁은 시작 장벽이 `Thread.SpinWait`로 돌면서 GC 일시 정지를 막아, 모범 답안이 로컬 40회 중 8회 4~10초 멈추다가 타임아웃에 걸렸다. `Thread.Yield`와 횟수가 제한된 랑데부 스핀, 2~3초 타임아웃으로 바꾸고 해설 수치를 관측값으로 고쳤다. 거래 교착은 시작 코드가 "교착 없음" 케이스를 운으로 통과해(반대 방향 2/8, 고리 8/8) 해설의 "매번"이 거짓이었고, 틀린 수정(락을 건 `Gold` getter, 두 락 밖의 잔액 검사)이 8/8로 통과했다. 결정적인 락 보유 탐침과 두 번째 잔액 검사 배치를 넣었다. 디스패처는 락이 전혀 없는 `Post`가 10회 중 2회 통과해서 펌프 없는 폭주 단계와 3라운드를 넣었고, 이제 12/12 실패한다. 프로세스·스레드 면접은 렌더 스레드와 암달의 법칙에 출처를 달고 채점 인용 하나를 바꿨다. 메모리 면접은 "일반 지식" 주장을 Android와 Unity 매뉴얼 문구로 바꿨다. Unity 동시성 면접은 `JobHandle` 문구를 매뉴얼에 맞췄다.

**끝까지 확인하지 못한 것.** 쓰기에만 락을 걸고 읽기에는 걸지 않는 장부 코드는 8/8로 통과하며, 이를 감지할 방법을 찾지 못해 노트와 해설에 그렇게 적었다. iOS의 앱 종료 동작은 Apple 페이지가 열리지 않아 확인하지 못했고 문구를 Android로 좁혔다.

## 묶음 a

- `t7-tutor-bits-status-flags` — 비트와 바이트: 상태 이상 8개를 1바이트에 담기 (과외·개념 · Easy · 문서 대조)
- `t7-impl-bit-pack-unit-header` — 비트 패킹: 유닛 헤더 네 필드를 uint 하나에 (실전 구현 · Easy · 실행 검증)
- `t7-interview-cpu-cache-locality` — CPU 캐시와 메모리 계층: 왜 배열이 포인터 추적보다 빠른가 (압박 면접 · Medium · 문서 대조)
- `t7-debug-integer-pitfalls-combat-math` — 정수의 함정: 줄어든 피해량, 49일짜리 쿨다운, 0% 체력바, 겹치는 대상 id (디버깅 · Medium · 실행 검증)
- `t7-impl-bounded-blocking-queue` — 유한 블로킹 큐: 청크 로더와 디코더 사이의 생산자-소비자 (실전 구현 · Hard · 실행 검증)
- `t7-interview-sync-primitives` — 동기화 도구 고르기: 뮤텍스, 세마포어, 스핀락, 읽기-쓰기 락, 원자적 연산 (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** 상태 이상 8개를 1바이트에 담는 비트 플래그 과외, 유닛 헤더 네 필드를 uint 하나에 넣는 비트 패킹, CPU 캐시와 메모리 계층 면접, 정수 함정 디버깅, 청크 로더와 디코더 사이의 유한 블로킹 큐, 동기화 도구 선택 면접의 6문제다(2/2/2). 정수 디버깅은 커리큘럼의 함정 넷을 모두 담으려고 버그가 4개다. 작성 단계 check-tests는 비트 패킹 7/7·0/7, 정수 함정 9/9·3/9, 블로킹 큐 8/8·0/8이었다. 채점 서버가 추가 스레드를 약 6개만 허용해 블로킹 큐는 케이스 스레드 1개와 워커 최대 4개로 시험하며, 작성 단계에서 모범 답안 8/8 통과, `if`-대신-`while`·Pulse만 쓰기·락 없는 변형은 각각 8/8 실패를 확인했다. 커밋 `8fb31a0`으로 배포했다.

**검수에서 확인한 것.** 인용된 23쪽과 Monitor.Pulse, SemaphoreSlim.Release, CompareExchange, lock 문, ABA 문제, ECMA-335를 열었다. 플래그 과외의 표와 퀴즈 값은 .NET 8에서 재현되었고, 비트 패킹의 16진 예는 모두 다시 계산해 맞았다(두 문제 모두 문제없음). 블로킹 큐는 채점 서버에서 캐시 없이 독립적으로 돌렸다. 모범 답안과 다른 정답 셋(Monitor, SemaphoreSlim 둘, lock + 쪽별 조건)은 각각 8/8 통과했고, if-대신-while, Pulse(두 가지), 락 없음(두 가지), 타임아웃 재시작은 각각 8/8 실패했다. `Sleep(1)` 폴링은 속도 때문에 8/8 실패했다(모범 답안은 그 케이스를 3.8초 제한에 0.2~0.3초에 끝낸다).

**틀려서 고친 것.** 캐시 면접의 "C# 언어 명세가 행 우선을 정한다"는 잘못된 귀속이어서 ECMA-335 §I.8.9.1로 바꿨고(배치는 로컬에서도 확인), 64바이트 라인·GPP의 "trade-offs" 인용·false sharing 문구를 출처 내용으로 좁혔다. 정수 디버깅의 "float는 2^24를 넘는 정수를 표현할 수 없다"는 모호해서 정확히 고쳤고(처음 표현하지 못하는 값은 16,777,217), 테스트 입력 둘이 명시한 공격력 범위를 넘어 바로잡았으며, 노트가 모든 double 수정은 실패한다고 했지만 먼저 곱하는 double 수정은 통과하므로 고쳤다. 모든 수치를 다시 계산했다. 블로킹 큐는 모범 답안이 `TickCount64` 때문에 최대 한 틱 일찍 돌아올 수 있어 `Stopwatch`로 바꿨고, 새 케이스 `timeout-is-total-across-wakeups`가 타임아웃 재시작과 이른 false를 잡게 했다. 느린 틀린 변형이 20초 강제 종료에 대해 16~17초 걸려 총 예산을 13초에서 11.5초로 줄였다. 동기화 면접은 lock 안의 `await`를 lock 문 페이지로 인용하고, 읽기-쓰기 락 오버헤드 문장을 지우고, GC와 ABA에 관한 언급을 Wikipedia ABA 페이지 내용으로 바꿨다.

**끝까지 확인하지 못한 것.** 타임아웃 재시작 케이스는 기다리는 쪽이 세 번 모두 정당하게 항목을 받으면 기본으로 통과한다(모범 답안 8회 중 1회). 폴링 감지는 속도로만 한다. 둘 다 테스트 노트에 적었다. ECMA-335는 PDF가 아니라 GitHub 미러로 읽었다.

## 묶음 b

- `t7-tutor-utf8-nickname-byte-limit` — 문자 인코딩: string.Length 는 글자 수가 아니다 — 닉네임 16바이트 제한 지키기 (과외·개념 · Easy · 문서 대조)
- `t7-impl-lru-asset-cache` — LRU 캐시: 최근에 본 아이템 아이콘만 메모리에 남기기 (실전 구현 · Easy · 실행 검증)
- `t7-debug-lazy-init-double-checked-locking` — 지연 초기화 경쟁: 이중 확인 잠금이 반쯤 찬 아이템 테이블을 내보낼 때 (디버깅 · Medium · 실행 검증)
- `t7-interview-compile-jit-aot-il2cpp` — 컴파일과 실행: 컴파일러·인터프리터·JIT·AOT, 그리고 Unity 의 IL2CPP (압박 면접 · Medium · 문서 대조)
- `t7-impl-fixed-thread-pool-work-queue` — 고정 크기 스레드 풀: 로딩 작업을 전용 작업 스레드 N 개에 맡기고 결과와 예외 돌려받기 (실전 구현 · Hard · 실행 검증)
- `t7-interview-file-io-atomic-save` — 파일 I/O 와 영속성: 강제 종료에도 살아남는 세이브 파일 — 버퍼, flush/fsync, 임시 파일 + rename (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** string.Length가 글자 수가 아님을 다루는 UTF-8 닉네임 16바이트 과외, LRU 아이콘 캐시, 이중 확인 잠금(DCL) 지연 초기화 디버깅, 컴파일러·JIT·AOT·IL2CPP 면접, 고정 크기 스레드 풀, 강제 종료에도 살아남는 세이브 파일 면접의 6문제다(2/2/2). 작성 단계 check-tests는 LRU 8/8·0/8, DCL 5/5·1/5, 스레드 풀 7/7·0/7이었고, DCL 테스트는 주입한 일시 정지 훅을 쓴다. 채점 서버에서 모든 해답이 독립 실행 8회 통과했고 그럴듯한 틀린 변형은 8회 중 8회(일부는 2회 중 2회) 실패했다. 스레드 풀의 락 없는 큐 변형만 스트레스 2라운드에서 8회 중 3회 통과해 6라운드로 늘렸다. 작성자는 Learn, Unity 6 매뉴얼 원문, dotnet/runtime release/8.0 소스, POSIX fsync/rename, man7, SQLite, GDK, RFC 3629, UAX #29를 읽었다. 커밋 `9ba0812`로 배포했다.

**검수에서 확인한 것.** 인용된 Microsoft Learn, Unity 6000.0, POSIX, man7, SQLite, GDK, UAX #29, RFC 3629, Wikipedia 페이지 전부와 .NET 8 원본 소스 파일을 열었다. UTF-8 과외의 바이트 수는 로컬 .NET 8에서 다시 돌려 모두 맞았다. 시험 대상 문제마다 8회 이상 실행해, 모범 답안과 다른 정답(풀: ConcurrentQueue·BlockingCollection, 지연 초기화: LazyInitializer·volatile DCL·실패 시 교체하는 Lazy<T>)은 항상 통과하고, 락 없는 큐를 포함한 그럴듯한 틀린 변형은 항상 실패했으며, 7초를 넘은 실행은 없었다. 난이도는 Easy 2 / Medium 2 / Hard 2이고 기존 트랙 7 문제·묶음 a와 겹치지 않는다.

**틀려서 고친 것.** UTF-8 과외에는 자르기가 코드 포인트는 절대 가르지 않지만 grapheme cluster는 가를 수 있다는 규칙(UAX #29)이 빠져 있어 넣었다. LRU의 `Remove(T)` O(n) 근거는 LinkedList 클래스 페이지로 되어 있었지만 실제로는 메서드 페이지에 있어 새 출처로 바꿨고, 채점 항목 둘이 문제가 묻지 않은 설명을 요구해서 하나는 시나리오가 묻게 하고 다른 하나는 코드로 확인할 수 있게 했다. DCL 테스트는 스레드 생성이 실패하면 다시 시도하게 하고, 노트의 실행 통계를 검수자가 직접 잰 값으로 바꿨다. JIT/AOT/IL2CPP 면접은 런타임에 만든 제네릭 타입이 IL2CPP를 실패시킨다고 했지만 Unity 매뉴얼은 더 느린 공유 코드로 돈다고 하므로 다섯 곳을 고쳤다. 스레드 풀은 채점 서버가 추가 스레드를 6개만 허용하고 join한 스레드가 잠시 남아 있어 모범 답안이 18회 중 1회 실패했으므로 정착 단계와 재시도를 넣었고, `while` 대신 `if`로 기다리는 루프가 통과해서 "다른 워커가 먼저 작업을 가져가는" 강제 단계와 워커 생존 검사를 넣었다(이제 매번 실패한다). 파일 I/O 면접은 Flush 문구에 두 오버로드를 모두 인용하고 macOS `F_FULLFSYNC`를 .NET 8 구현 사항으로 표시했으며, POSIX rename 원자성을 rename 페이지에서 인용하고 출처 없던 "파일 시스템이 정한다"를 POSIX XBD 4.11의 충돌 관련 문구로 바꿨다. Windows 파일 교체가 원자적이라는 주장은 두지 않았다. 검수자가 모든 해설 끝에 출처나 실행으로 뒷받침한 "흔한 오해" 절을 넣었다.

**끝까지 확인하지 못한 것.** 검수 보고에 남은 미확인 항목은 없다. FileStream.Flush 페이지는 Flush()도 "운영 체제 I/O 버퍼"를 비운다고 써 있어, 문서화된 디스크 경로는 Flush(true)로 보고 .NET 8 소스는 구현 사실로 인용했다.

## 묶음 c

- `t7-impl-atomic-save-writer` — 원자적 세이브 저장기: 임시 파일 → 영속 → 검증 → 교체, 어느 단계에서 전원이 나가도 살아남는 로드 (실전 구현 · Hard · 실행 검증)
- `t7-tutor-hash-encode-encrypt-fnv1a` — 해싱·인코딩·암호화 구분하기: 세이브 무결성 체크섬과 FNV-1a 직접 구현 (과외·개념 · Easy · 문서 대조)
- `t7-debug-async-thread-chunk-mesher` — async 와 스레드를 헷갈린 청크 메시 서비스: 멈추는 프레임과 엉뚱한 청크 (디버깅 · Medium · 실행 검증)
- `t7-interview-os-scheduling-frame-pacing` — OS 스케줄링과 타이밍: Sleep(16) 프레임 제한이 32fps 가 되는 이유와 프레임 페이싱 설계 (압박 면접 · Hard · 문서 대조)
- `t7-impl-token-bucket-rate-limiter` — 토큰 버킷 레이트 리미터: 채팅·이모트 도배를 막는 버스트 5, 초당 1개 (실전 구현 · Easy · 실행 검증)
- `t7-interview-client-data-formats-sqlite` — 게임 클라이언트의 데이터 저장 형식: JSON·바이너리·SQLite 고르기와 스키마 버전 관리 (압박 면접 · Medium · 문서 대조)

**무엇을 만들었는지.** 임시 파일 → 영속 → 검증 → 교체 순서의 원자적 세이브 저장기, 해싱·인코딩·암호화 구분과 FNV-1a 과외, async와 스레드를 헷갈린 청크 메시 서비스 디버깅, Sleep(16)이 32fps가 되는 이유와 프레임 페이싱 면접, 버스트 5·초당 1개 토큰 버킷, JSON·바이너리·SQLite와 스키마 버전 면접의 6문제다(2/2/2). 해설마다 "흔한 오해" 두 항목이 있다. 작성자는 POSIX rename·XBD 4.11·fsync, Learn(File.Move/Replace/Flush, Win32 파일 캐싱, Sleep, timeBeginPeriod, 스케줄링 우선순위, QPC, async, Task, System.Text.Json, BinaryFormatter, TimeProvider, TokenBucketRateLimiter), man7, ext4 문서, RFC 9923, CRC 카탈로그, SQLite 문서, Unity 6 targetFrameRate/vSyncCount, dotnet/runtime 8.0과 microsoft/STL 소스를 읽고, CRC/FNV 테스트 벡터와 STJ 동작, Windows와 채점 서버의 `Sleep` 시간을 실행으로 확인했다. 디버깅 스위트는 채점 서버에서 해답이 8회 통과하고 틀린 변형은 각각 8/8 실패했다(해답 0.4~0.5초, 시작 코드 4초, 20초에 강제 종료). 가짜 파일 시스템은 rename을 즉시 영속으로 취급하며 문제에 그렇게 적었다. 작성 중 트랙 4 업데이트 루프 문제의 `vSyncCount = 0` 누락을 발견해 따로 고쳤다(커밋 `9a76c2b`). 커밋 `e9b0a2e`로 배포했다.

**검수에서 확인한 것.** 인용된 URL을 모두 열었다. 스케줄링 수치는 검수자의 Windows 11 PC와 채점 서버에서 다시 쟀다. FNV-1a 해시 값은 모두 다시 계산해 맞았고, 원자적 저장기의 테스트는 타당했다. 토큰 버킷의 double 정밀도 변형이 실패하는 것을 확인했다. 원자적 저장기(구현)와 기존 `t7-interview-file-io-atomic-save`(면접)는 핵심 과제가 달라 중복이 아니다. 세 문제는 `executed`, 세 문제는 `reviewed`로 표시했다.

**틀려서 고친 것.** 원자적 저장은 "디렉터리 fsync"가 실제 시스템에서 rename 틈을 닫는다고 했지만, rename의 영속성은 Linux(fsync(2))와 Windows(파일 캐싱 문서)에서 따로 다뤄야 한다고 고쳤다. 감점 d1의 과장을 고치고, CRC 요약이 근거 없이 zlib/PNG를 들던 것을 바로잡았다. FNV-1a 과외는 NOT RECOMMENDED가 Security Considerations에 있다고 했지만 실제로는 §1.2에 있어 고쳤다. 청크 메시는 람다 복사 틀린 답을 요청 6개에 걸쳐 검사하게 해 매번 잡히게 했고, `Wait(1)`이 통과해서 새 케이스 `tick-no-timed-waits`를 넣었다. 채점 서버가 스레드를 약 12개만 허용해(넘으면 OOM) 최소 스레드 수를 16에서 4로 줄였고, 변수와 참조에 관한 문구를 고쳤으며, Tick이 `List.RemoveAt` 때문에 엄밀히 O(k)가 아니라고 적었다. 스케줄링 면접은 Sleep 수치를 관측값으로 표시하고, 10~16 ms 틱을 GetTickCount64 문서로 인용했으며, Unity의 반올림은 Android·iOS 얘기이고 30 fps 규칙에는 `vSyncCount = 0`이 필요하다고 바로잡았다. 토큰 버킷은 Wikipedia대로 속도가 r로 "제한된다"고 고쳤다. SQLite 면접은 .NET 8이 이미 WinForms/WPF 밖에서 BinaryFormatter를 끈다는 점을 놓치고 있어 넣었고, ALTER TABLE이 3.53.0에서 NOT NULL 설정·해제를 얻었다는 점을 더했다.

**끝까지 확인하지 못한 것.** timeBeginPeriod(1) 실행 결과가 일관되지 않았고(대개 1.9 ms, 한 번은 15.5 ms) 원인을 밝히지 못해 "설명되지 않음"으로 적었다. `Task.Run` 람다 안에서 복사하는 실수는 시간으로만 잡힌다. 작성 단계의 15.5 ms `Sleep` 수치는 Windows PC 한 대에서 잰 값이라 검수 때 관측값으로 표시했다.

## 묶음 d

- `t7-impl-debug-console-tokenizer` — 개발자 콘솔 명령 토크나이저: 따옴표, 이스케이프, 숫자와 문화권 (실전 구현 · Medium · 실행 검증)
- `t7-debug-time-cooldown-daily-reset` — 시간 버그 세 가지: 기기 시각을 바꾸면 끝나는 쿨다운, 해외에서 어긋나는 일일 리셋, 144 Hz 에서 일찍 끝나는 레이드 (디버깅 · Hard · 실행 검증)
- `t7-tutor-object-vs-struct-array-layout` — 메모리 배치: class 객체 배열과 struct 배열은 어떻게 다르게 놓이나 — 문서의 규칙만으로 크기 계산하기 (과외·개념 · Easy · 문서 대조)
- `t7-interview-version-control-game-team` — 게임 팀의 버전 관리: merge 와 rebase, 씬·프리팹 충돌, Git LFS 와 잠금, 출시 브랜치 (압박 면접 · Medium · 문서 대조)
- `t7-impl-refcounted-audio-bank` — 참조 카운팅: 여러 화면이 나눠 쓰는 오디오 뱅크를 마지막 사용자가 놓는 순간 해제하기 (실전 구현 · Easy · 실행 검증)
- `t7-interview-debugging-methodology` — 디버깅 방법론: 10판에 1판 나는 크래시를 재현·이분 탐색·스택 트레이스·중단점·로그·크래시 덤프로 좁혀 가기 (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** 따옴표·이스케이프·숫자 문화권을 다루는 개발자 콘솔 토크나이저, 기기 시각 변경·시간대·고주사율에서 터지는 시간 버그 디버깅, class 객체 배열과 struct 배열의 메모리 배치 과외, 게임 팀의 버전 관리 면접(merge/rebase, 씬·프리팹 충돌, Git LFS와 잠금, 출시 브랜치), 참조 카운팅 오디오 뱅크, 드물게 나는 크래시를 좁혀 가는 디버깅 방법론 면접의 6문제다(2/2/2). 작성자는 Microsoft Learn(API, 디버깅, 덤프, 로깅, Win32 QPC/WER, Azure 브랜치 전략), dotnet/runtime release/8.0 소스와 BOTR, git-scm 문서, git-lfs v3.8.1 매뉴얼, Unity 6.0 매뉴얼, man7 clock_gettime을 읽고 본문의 수치를 모두 실행해 보았다. 작성 단계 check-tests는 세 문제 모두 모범 답안 통과, 초기 코드 0/8·2/7·0/7이었다. 커밋 `41aa679`로 배포했다.

**검수에서 확인한 것.** extraSources 51개 주소를 모두 열었다(전부 200). 토크나이저의 500 ms 기준은 캐시를 피한 판정 서버 실행 세 번에서 안정적이었다(모범 답안 3~5 ms, `+=` 문자열 연결 변형 4.45~4.65 s). 그럴듯한 틀린 답안 여섯 가지가 모두 테스트에서 떨어졌다. 테스트는 스레드를 만들지 않아 판정 서버의 스레드 한도와 무관하다. 구조체 크기·오프셋은 모두 재현했고, "Release 빌드가 9번 줄 크래시를 8번 줄로 보고한다"는 수치도 재현했다. 트랙 7 기존 문제와 핵심 과제가 겹치지 않고, 난이도는 쉬움 2 · 보통 2 · 어려움 2다.

**틀려서 고친 것.** 토크나이저의 "Substring으로 다시 읽지 않는다" 채점 항목이 모범 답안 자신을 떨어뜨려, "줄의 나머지 전체를 다시 읽는 것"을 겨냥하게 고치고 해설과 테스트 노트의 시간 수치를 갱신했다. 시간 버그 문제는 채점표가 "정수 틱"을 정답으로 받았지만 마이크로초 틱은 12프레임 늦게 끝나므로 100 ns 같은 세밀한 틱을 요구하게 고쳤고, QPC와 `CLOCK_MONOTONIC`이 앱과 함께 다시 시작한다는 잘못된 문장을 부팅 시점부터 센다고 바로잡았으며, `IGameClock` 주석의 "NTP를 무시한다"를 "NTP로 인한 점프를 받지 않는다"로 고쳤다(Linux는 NTP로 속도를 조정한다). 메모리 배치 과외는 "CPU가 객체를 미리 가져올 수 없다"를 흩어진 객체의 경우로 좁혔다. 버전 관리 면접은 LFS 실험 설명이 틀려(`git lfs track` 뒤 일반 `git add`만으로 변환되고 편집이 필요 없으며, 과거 기록에는 원래 blob이 남는다) 고쳤다. 참조 카운팅은 모범 답안이 하지 않는 누수 로그를 요구하던 채점 항목을 바꿨다. 디버깅 방법론 면접은 줄 번호 수치가 코드 모양에 따라 달라지므로 "한 예"로 표시하고, 인라인으로 프레임이 사라질 수 있어 스택 트레이스가 증명하는 범위를 좁혔다.

**끝까지 확인하지 못한 것.** UnityYAMLMerge, LFS 잠금, Visual Studio 중단점·덤프 기능, WER, `DOTNET_` 덤프 설정은 실행하지 못하고 문서로만 확인했다. 시간 버그 해설은 약 1,980자로 목표(900~1,500자)보다 길다. 토크나이저의 시간 기준은 판정 서버 속도에 따라 여유가 달라질 수 있다(현재 여유는 약 100배).

## 배포 후 수정: Unity 동시성 면접의 `nativeArray[0]++` 설명

- `t7-interview-unity-concurrency-model` — 세 번째 꼬리질문 모범 답변 (커밋 `ce5b048`)

**무엇이 틀렸는지.** 모범 답변이 Unity 6 매뉴얼(NativeContainer 페이지)의 문장을 옮겨 "NativeContainer는 ref return을 구현하지 않으므로 `nativeArray[0]++` 식의 직접 수정은 값을 바꾸지 못한다"고 했다. C# 명세의 후위 증가 규칙에 따르면 인덱서 접근에 대한 `x[i]++`는 get 접근자 → 증가 → set 접근자로 번역되므로, get/set 인덱서를 가진 `NativeArray<int>`에서는 값이 바뀐다. 매뉴얼의 요지가 맞는 경우는 구조체 요소의 필드를 바꿀 때뿐이다(`nativeArray[0].field = 0`은 CS1612 컴파일 오류).

**점검에서 확인한 것.** 점검자가 Unity 6 매뉴얼 원문, C# 명세 §12.8.16(후위 증가)·복합 대입 절·멤버 접근 절, CS1612 페이지, Unity `NativeArray<T>.this[]` API 페이지(`{ get; set; }`)를 받아 문장을 대조했다. 판정 서버(.NET 8.0.24)에서 ref 반환 없는 get/set 인덱서 구조체로 `[0]=10; [0]++` → 11, `+= 5`가 반영되고, 구조체 요소 필드 대입은 CS1612로 실패함을 실행했다. 점검에 참여하지 않은 검증자가 같은 실행을 캐시 없이 따로 재현하고 자료 id·주소가 트랙 4 묶음 e와 같은지 확인한 뒤 통과 판정을 냈다.

**어떻게 고쳤는지.** "매뉴얼은 이렇게 쓰지만, C# 명세와 실행 결과로는 `++`·`+=`가 get → set으로 값을 되돌려 쓴다. 안 되는 것은 구조체 요소의 필드를 제자리에서 바꾸는 것(CS1612)이고, 그때는 복사본을 고쳐 다시 대입한다"는 형태로 고치고, Unity 안에서 직접 실행한 결과가 아니라는 점을 밝혔다. 자료 `ms-csharp-spec-postfix`, `ms-cs1612`, `ms-csharp-spec-compound-assignment`, `unity-nativearray-indexer-api`를 더했다.

**끝까지 확인하지 못한 것.** Unity 엔진 안에서의 실행. 이 문제의 `sourceRefs`가 9개로 기준(4개)을 넘는 점은 최종 점검에서 다룬다.
