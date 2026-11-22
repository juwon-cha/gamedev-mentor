# 트랙 2 검수 기록

[문서 목록](../README.md) · [작성·검수 기준](../STANDARDS.md)

## 초기 문제

- `t2-debug-shared-ptr-cycle` — 전투가 끝나도 사라지지 않는 몬스터: shared_ptr 순환 참조 (디버깅 · Easy · 실행 검증)
- `t2-tutor-aos-soa-projectiles` — 투사체 5만 개 업데이트: AoS vs SoA와 캐시 지역성 (과외·개념 · Medium · 문서 대조)
- `t2-interview-move-virtual-cost` — 면접: std::move의 실체, Rule of Five, 가상 함수 호출의 진짜 비용 (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** 정적 문제은행으로 전환한 커밋 `dc1905f`에서 트랙 2에 세 문제가 처음 실렸다. 작성자는 세 문제를 쓰고 MSVC 14.41(`/std:c++17 /W4`, 경고 없음)로 돌려 shared_ptr 문제의 시작 코드는 `destroyed`를 찍지 않고 해답은 둘 다 찍는 것, AoS/SoA 문제의 `sizeof(Projectile)==64`·`sizeof(ProjectileCold)==40`과 두 구현의 위치 결과가 같다는 것, 면접 예제가 `copy / move / copy`를 찍는 것을 확인했다. 이어 새 스키마로 옮기면서 면접 문제에 Rule of Five를 시나리오 질문·해설·채점 항목 둘·감점·경계 사례로 넣고 제목과 태그를 바꿨다. 숨은 테스트는 `t2-debug-shared-ptr-cycle`에만 7케이스를 붙였다(모범 7/7, 시작 1/7). 시작 코드는 타겟이 없는 경우 segfault 하므로, 템플릿의 시그널 핸들러가 충돌한 케이스와 남은 케이스마다 `[FAIL]` 줄을 찍는다. AoS/SoA 문제는 리팩터링이 시작 코드의 함수 시그니처를 없애므로 시작 코드 이름만으로 테스트를 만들 수 없어 `tests: null`로 두었다. 독립 검수 결과는 커밋 `45b6f0f`로 반영했고 이때 난이도를 Easy/Medium/Hard로 바꿨다.

**검수에서 확인한 것.** cppreference(`weak_ptr::lock`, `std::move`, `move_if_noexcept`, 복사 생략, `vector::push_back`), Core Guidelines 원문(R.24, C.20, C.21, C.64, C.66, F.48), Game Programming Patterns(Data Locality, 목차), Wikipedia AoS and SoA를 열었다. shared_ptr 문제에서 틀린 답 넷(원시 포인터, 검사 없는 `lock()`, 예외를 던지는 생성자, shared_ptr 유지)은 실패하고 다르게 쓴 정답 둘은 통과했다. AoS/SoA 해답은 경고 없이 컴파일되고 원래 코드와 같은 결과를 낸다. 면접 예제는 copy/move/copy를 찍었다.

**틀려서 고친 것.** shared_ptr 순환 문제의 만료 타겟 테스트는 "attacks Knight"만 맞춰 봐서, 원시 포인터 답은 해제된 메모리에 이름이 우연히 남아 있을 때만 잡혔다. 그래서 "Orc attacks"를 맞추게 바꾸고 노트에 규칙을 적었다. "weak_ptr는 반드시 lock()을 거친다"는 과장이라 `bad_weak_ptr`를 던지는 shared_ptr 생성자도 언급했고, 감점 d3의 "reset()" 표현이 모범 답안의 `knight.reset()`과 부딪혀 고쳤다. AoS/SoA는 개념 카드가 `static_assert`로 4바이트 정렬을 확인한다고 했지만 크기만 검사하므로 고쳤고, 퀴즈 2의 "최대 7" 캐시 라인을 "최소 7, 차가운 원소가 라인을 걸치면 8"로 바로잡았다. 면접 해설은 `noexcept`가 없으면 재할당 때 vector가 복사한다고 했지만, 시나리오의 `Effect`는 이동 전용이라 여전히 이동되고 대신 강한 예외 보장을 잃는다. 이 실제 오류를 고치고 "push_back은 강한 보장을 준다"에 단서를 달았다. "반환할 때 `std::move`는 절대 도움이 안 된다"는 같은 타입 지역 변수로 좁혔고, `final` 경계 사례는 "보통"으로 누그러뜨렸으며, `cppref-vector-push-back` 출처를 더하고 채점표가 인용하던 출처 둘을 `sourceRefs`에 넣었다.

**끝까지 확인하지 못한 것.** vptr 크기와 가상 호출 제거(devirtualization)는 일반적인 구현에 관한 주장이라 1차 출처 없이 그렇게 표시했다. Wikipedia는 AoS의 단일 원소 접근 이점을 말하지 않아 그 부분은 산술에 기댄다. 크기는 MSVC x64 ABI에서만 쟀다.

## 묶음 a

- `t2-tutor-pointer-vs-reference` — 데미지가 안 들어간다: 포인터 vs 참조, 그리고 const (과외·개념 · Easy · 문서 대조)
- `t2-debug-dangling-turret` — 엉뚱한 적이 맞는 포탑: 댕글링 참조와 무효화된 포인터 (디버깅 · Medium · 실행 검증)
- `t2-impl-raii-texture-handle` — 텍스처 누수 막기: move-only RAII 핸들 구현 (실전 구현 · Medium · 실행 검증)
- `t2-interview-storage-lifetime-raii` — 면접: 스택과 힙, 객체 수명, 예외가 터져도 RAII가 지켜 주는 것 (압박 면접 · Hard · 문서 대조)
- `t2-impl-unique-ptr-entity-factory` — 엔티티 팩토리와 월드: unique_ptr로 소유권 넘기기 (실전 구현 · Easy · 실행 검증)
- `t2-debug-rule-of-three-influence-map` — 스냅샷을 복사하자 터지는 AI: Rule of Three를 어긴 영향력 맵 (디버깅 · Hard · 실행 검증)

**무엇을 만들었는지.** 포인터 vs 참조 과외, 댕글링 포탑 디버깅, move-only RAII 텍스처 핸들, 스택·힙·수명 면접, unique_ptr 엔티티 팩토리, Rule of Three 영향력 맵 디버깅의 6문제다(2/2/2). 과외와 면접은 `tests: null`이고 코드는 GCC 13.2로 손으로 돌렸다. Rule of Three 테스트는 전역 `new[]`/`delete[]`를 바꿔 끼워 할당 실패를 주입한다. 작성자는 cppreference의 언어·메모리·컨테이너 페이지와 Core Guidelines 원문을 읽었다. 커밋 `a576d41`로 배포했다.

**검수에서 확인한 것.** 파일의 cppreference 16쪽 전부와 `unique_ptr::reset`, Core Guidelines 원문(인용한 규칙 18개의 제목이 모두 일치, F.16·F.60 문구 확인), Microsoft Learn `/STACK`·C4172, GCC 13.2 경고 옵션을 열었다. 채점 서버(Compiler Explorer)에서 다르게 쓴 정답(포탑: `unique_ptr`+id 조회, 핸들: `std::exchange` 없는 수동 구현, 팩토리: swap-and-pop, 맵: 명시적 대입·`unique_ptr<float[]>`·vector+copy-and-swap)은 통과하고, vector Rule of Zero 맵을 포함한 전형적인 틀린 답 10개는 실패했다. SIGSEGV가 나도 남은 케이스마다 `[FAIL]`이 찍힌다. `-Wreturn-local-addr`와 C4172는 GCC 13.2(옵션 없음)와 로컬 MSVC(`/W1`)로 컴파일해 재현했다. RAII 핸들은 문제가 없어 self-reset 주장에 `unique_ptr::reset` 출처만 더했다.

**틀려서 고친 것.** Rule of Three 문제의 해설은 `std::vector` Rule of Zero 버전이 "모두 맞다"고 했지만, 멤버별 대입은 vector 대입이 예외를 던지기 전에 width/height를 바꿔 문제가 요구한 강한 보장을 깬다. 실패 주입이 `new[]`만 건드려 테스트가 이를 놓쳤으므로 스칼라 `new`까지 넓히고 제약·노트·해설·채점 항목 c6·c7을 고쳤다. 엉켜 있던 자기 대입 설명도 다시 썼다. 댕글링 포탑에서는 버그 코드의 낡은 쓰기가 재사용된 힙(채점기 자신의 `std::map` 노드 포함)에 떨어질 수 있어서 템플릿이 해제된 메모리를 격리하게 했고, `erase` 관련 "보장되지 않음" 문장을 "원소 이동은 명세되어 있고, 무효화된 포인터의 사용이 정의되지 않는다"로 고쳤다. 면접의 MSVC 기본 스택 1 MB는 출처(x86/x64/ARM64 예약 크기)로 뒷받침하고, 근거 없는 "작업 스레드는 더 작은 경우가 많다"와 "진단 없이 죽는다"를 지웠다. cppreference에는 `unique_ptr` 크기 진술이 없어서 팩토리 문제는 채점 서버 측정값(기본 삭제자 8 B, 함수 포인터 삭제자 16 B)으로 좁혔다. 포인터 과외의 "초기화하지 않은 포인터는 불확정 값"은 지역 변수로 좁혔다.

**끝까지 확인하지 못한 것.** `reserve()`로 피해 가는 꼼수는 포탑 테스트로 잡을 수 없어 채점표만 다룬다. 해설은 줄이지 않았고, Rule of Three 해설은 수정 때문에 약 2,650자로 늘었다.

## 묶음 b

- `t2-impl-rule-of-five-packet-buffer` — 송신 큐가 자랄 때마다 패킷이 통째로 복사된다: PacketBuffer의 Rule of Five (실전 구현 · Medium · 실행 검증)
- `t2-interview-smart-pointer-costs` — 면접: unique_ptr와 shared_ptr의 진짜 비용, make_shared의 대가, weak_ptr가 맞는 자리 (압박 면접 · Hard · 문서 대조)
- `t2-debug-iterator-invalidation-cleanup` — 턴이 끝나면 죽은 적이 남거나 게임이 멈춘다: 순회 중 삭제·삽입과 반복자 무효화 (디버깅 · Medium · 실행 검증)
- `t2-tutor-const-constexpr-stats` — 보스 스탯이 컴파일되지 않는다: const, constexpr, const 멤버 함수 (과외·개념 · Easy · 문서 대조)
- `t2-impl-object-pool-free-list` — 총알 수천 발, 힙 할당 0번: free list로 만드는 고정 크기 오브젝트 풀 (실전 구현 · Hard · 실행 검증)
- `t2-debug-slicing-virtual-destructor` — 유도 미사일이 기본 탄환 데미지만 준다: 객체 슬라이싱과 빠진 가상 소멸자 (디버깅 · Easy · 실행 검증)

**무엇을 만들었는지.** PacketBuffer의 Rule of Five, 스마트 포인터 비용 면접, 반복자 무효화 디버깅(버그 3), const/constexpr 과외, free list 고정 크기 오브젝트 풀, 슬라이싱·가상 소멸자 디버깅(버그 2)의 6문제다(2/2/2). 작성 단계에서 채점 서버(GCC 13.2)로 면접·과외 코드의 크기 8/8/8/16/16/16, 할당 2 대 1, 인용한 GCC 오류를 확인했다. 값 전달 `operator=`, swap 기반 이동, `unique_ptr<unsigned char[]>`, `it = erase(it)` 루프, 포인터로 잇는 free list 같은 다른 정답은 통과하고, swap-and-pop과 `unique_ptr` 풀 같은 틀린 변형은 실패했다. 커밋 `994bea8`로 배포했다.

**검수에서 확인한 것.** 기존 URL 23개 전부와 `extraSources`에 더한 5개(std::copy, move_if_noexcept, vector erase_if, 상수 표현식, libstdc++ Debug Mode)를 열고, Core Guidelines 규칙 번호를 원문 제목과 하나씩 대조했다. 스마트 포인터 면접의 크기와 할당 횟수(2/1/1)는 채점 서버 실행과 일치했다. 반복자 문제는 시작 코드와 틀린 변형 둘이 독립 실행 세 번에서 같은 판정을 냈다. 로컬 g++가 없어 모두 채점 서버에서 돌렸다. 슬라이싱 문제는 문제가 없어 암시적 소멸자에 cppreference 출처만 더했다.

**틀려서 고친 것.** Rule of Five는 모범 답안이 두 곳에서 복사해 채점 항목 c9를 받을 수 없어서 문구를 고쳤고, `Data()`가 훔쳐 온 버퍼여야 한다는 것과 통합 `operator=`에는 `noexcept`가 필요하다는 것을 제약에 적었다. 반복자 무효화는 원래 독살·격리 힙으로 재현성을 만든 미정의 동작에 기대고 있었다. 템플릿을 libstdc++ 디버그 모드로 컴파일해 무효화된 반복자 사용이 결정적으로 중단되게 하고, 케이스마다 별도 프로세스와 1초 제한으로 돌려 충돌이나 멈춤마다 자기 [FAIL] 이유가 남게 했다. swap-and-pop이 실패하는 것은 제약이 턴 순서를 요구하므로 공정하고, `std::erase_if`는 C++20이라 채점 서버에서 컴파일되지 않는다고 적었다. const/constexpr 과외는 `const int k = 60;`도 상수 표현식에 쓸 수 있다는 점(채점 서버로 확인)이 빠져 있어 넣고 c5가 인정하게 했다. 오브젝트 풀은 `alignas(T)`를 빠뜨린 답이 모든 테스트를 통과해서 풀을 여러 주소에 놓는 검사를 넣었고, c8이 요구하는 assert를 모범 답안에 더했으며, 케이스별 프로세스 격리를 적용했다. 스마트 포인터 면접은 표준과 구현을 가르는 표현을 다듬고 `weak_from_this`(C++17)를 cppreference로 인용했다.

**끝까지 확인하지 못한 것.** `SplitDeadSlimes`의 reserve 뒤 범위 for(감점 d3)와 풀의 O(1)·슬롯 안 free list 저장은 테스트로 잡을 수 없어 채점표만 다루며, 테스트 노트에 그렇게 적었다. Compiler Explorer는 8초 실행을 허용했지만 실제 제한을 알 수 없어 반복자 하네스는 타임아웃 세 번 뒤 멈춘다. 마지막 수정은 테스트 없는 두 문제의 `verified.level`만 바꿨으므로 그 뒤에는 validate-data만 다시 돌렸다. 이 문제의 템플릿에 `GLIBCXX_DEBUG_MESSAGE_LENGTH`가 빠져 있다는 점은 묶음 c 검수에서 드러나 묶음 c 커밋에서 보완했다.

## 묶음 c

- `t2-interview-virtual-dispatch-alternatives` — 면접: 가상 호출은 실제로 어떻게 일어나고, 언제 final·CRTP·std::variant·타입별 배열로 바꾸는가 (압박 면접 · Hard · 문서 대조)
- `t2-impl-lifetime-safe-event-bus` — 창을 닫았는데 콜백이 계속 온다: 수명이 안전한 타입별 이벤트 버스와 구독 핸들 (실전 구현 · Hard · 실행 검증)
- `t2-debug-ub-combat-numbers` — 가끔만 틀리는 전투 수치: 초기화 안 된 멤버, 넘친 뒤의 오버플로 검사, 옮긴 뒤 읽는 vector (디버깅 · Medium · 실행 검증)
- `t2-tutor-struct-alignment-padding` — 파티클 10만 개가 1.9MB를 패딩으로 쓴다: 정렬, 패딩, 멤버 순서 (과외·개념 · Easy · 문서 대조)
- `t2-impl-dynarray-growth-lifetime` — 빈칸에는 객체가 없다: 성장·이동·파괴를 제대로 하는 DynArray<T> (실전 구현 · Medium · 실행 검증)

**무엇을 만들었는지.** 가상 호출 대안 면접, 수명이 안전한 타입별 이벤트 버스와 구독 핸들, 초기화 안 된 멤버·넘친 뒤의 오버플로 검사·옮긴 뒤 읽는 vector가 섞인 UB 디버깅, 구조체 정렬·패딩 과외, DynArray의 5문제다. 주제가 무거워 Easy 1 / Medium 2 / Hard 2로 나눴다. 앞서 중단된 작성이 남긴 초안 둘은 다시 확인한 뒤 썼다. 작성 단계에서 채점 서버로 틀린 답과 대안 답 25개를 돌려 틀린 것은 모두 실패하고 정당한 대안은 모두 통과하는 것을 확인했다. 64바이트 `std::function`과 1.5배 성장은 로컬 MSVC 19.41로 쟀다. 채점 서버에서 긴 타입 이름이 든 libstdc++ 디버그 보고가 빈 줄을 끝없이 찍다가 실행이 죽는 일이 있어 `GLIBCXX_DEBUG_MESSAGE_LENGTH`를 설정했다. 커밋 `4d3fca5`로 배포했다.

**검수에서 확인한 것.** 인용된 URL 전부와 고정 커밋의 microsoft/STL, libstdc++, System V psABI 소스를 열었다. 가상 호출 면접의 어셈블리와 sizeof 수치를 채점 서버에서 다시 쟀다. 이벤트 버스는 네 가지 핸들 의미가 이미 명시되고 시험되어 있었고, 다르게 만든 정답 셋이 8/8로 통과하고 흔한 틀린 답 셋은 실패했다. UB 디버깅은 독립 실행 세 번의 결과가 같았다. 정렬 과외의 sizeof·alignof·오프셋은 채점 서버와 MSVC에서 모두 쟀다. 출력 범람 문제도 채점 서버에서 재현했다. 정확히 77열짜리 단어 하나가 빈 줄 734,605개를 찍다가 케이스가 죽었고, 변수를 100000으로 두자 보고가 866바이트였다.

**틀려서 고친 것.** 가상 호출 면접의 variant가 "할당할 수 없다"는 문장은 cppreference에서 사라졌으므로 "안에 중첩되어 담긴다"로 좁혔고, MSVC visit 규칙은 0cabaf3 커밋의 `_Visit_impl`을 인용했다. 이벤트 버스는 버스가 파괴되는 케이스의 핸들을 `static`으로 바꿔, 생존 검사가 없는 버그가 충돌이 아니라 `Active()`로 실패하게 했고, std::function 크기를 구현별로(채점 서버 32 B, MSVC 64 B) 적었다. UB 디버깅은 정답이 정의된 동작만으로 통과하게 하고 trapv는 보조 신호로만 남겼다(pragma가 없어도 정답은 통과하고 시작 코드는 실패한다). trapv와 바이트 패턴에 관한 과장도 고쳤다. 정렬 과외의 제목은 패딩 1.6 MB라고 했지만 실제로는 1.9 MB여서 고쳤고, long double 차이에 대한 틀린 설명을 바로잡고 psABI를 출처로 더했다. DynArray는 해제 후 사용을 해제된 메모리를 읽어서가 아니라 살아 있는 주소 표로 감지하게 했고, 제약을 테스트(cap + cap/2)와 맞췄으며, 성장 배수를 구현별로(libstdc++ ×2, MSVC ×1.5) 표시했다. 검수자가 모든 해설 끝에 출처를 단 "흔한 오해" 절을 넣었다. 이미 배포된 `t2-debug-iterator-invalidation-cleanup`은 그럴듯한 틀린 답에서 범람이 없었지만(stderr 1,760 B) 템플릿에 변수가 없어 77열 단어가 나오면 타임아웃으로 잘못 보고될 수 있었으므로, 같은 설정을 이 묶음 커밋에서 넣었다.

**끝까지 확인하지 못한 것.** 검수 보고에 남은 미확인 항목은 없다. UB 테스트가 쓰는 `#pragma GCC optimize("trapv")`는 GCC 문서상 디버깅용이어서, 위처럼 보조 신호로만 남겼다.

## 묶음 d

- `t2-debug-exception-safety-loot-bag` — 상자를 다시 열면 아이템이 복제된다: 원소 복사가 던질 때 깨지는 가방과 기본·강한 예외 보장 (디버깅 · Hard · 실행 검증)
- `t2-impl-hot-cold-unit-store` — 유닛 1만 개의 이동 루프가 이름표까지 읽는다: hot/cold 분리와 swap-and-pop을 견디는 id 표 (실전 구현 · Medium · 실행 검증)
- `t2-interview-forwarding-parameter-passing` — 면접: lvalue와 rvalue, std::move와 std::forward, 그리고 값·const&·&& 중 무엇으로 받을까 (압박 면접 · Medium · 문서 대조)
- `t2-impl-generation-slot-map` — 죽은 적의 칸에 들어온 새 적을 포탑이 쏜다: 세대 번호로 검사하는 핸들(slot map) (실전 구현 · Easy · 실행 검증)
- `t2-tutor-lambda-capture-delayed-popup` — 몇 프레임 뒤에 뜨는 데미지 숫자가 엉뚱하다: 람다 캡처(값·참조·this)와 지연 콜백의 수명 (과외·개념 · Easy · 실행 검증)

**무엇을 만들었는지.** 원소 복사가 던질 때 깨지는 가방과 기본·강한 예외 보장 디버깅, hot/cold 분리와 swap-and-pop에 견디는 id 표, lvalue/rvalue·`std::move`/`std::forward`·매개변수 전달 방식 면접, 세대 번호로 검사하는 슬롯 맵 핸들, 람다 캡처(값·참조·this)와 지연 콜백의 수명 과외의 5문제다(쉬움 2 · 보통 2 · 어려움 1). 과외 문제지만 람다 캡처에는 UB가 없게 만든 숨은 테스트 5개가 있다. 작성자는 cppreference, Microsoft Learn(예외 안전성, rvalue 참조, 람다), C++ Core Guidelines, 고정 커밋의 microsoft/STL·GSL, libstdc++ 13.2, EnTT v4.0.0, CMU 15-418 3·10강 PDF를 읽었고, 수치는 판정 서버나 로컬 MSVC에서 실행했다. 커밋 `5a513fe`로 배포했다.

**검수에서 확인한 것.** 인용한 자료를 모두 열었다. 문제마다 틀린 답안과 다르게 쓴 정답을 여러 개 판정 서버에서 돌려, 틀린 것은 떨어지고 다른 정답은 통과하는지 확인했다. 과외 문제의 숨은 테스트는 UB가 없고 다른 정답에도 공정해서 유지했다. `sizeof(std::string)` 수치는 실행으로 확인했다(GCC 32, MSVC Release 32, `/MDd` 40). 묶음 e에는 `sizeof(std::string)` 항목이 없어 흔한 오해가 겹치지 않는다. 트랙 2 기존 문제와 핵심 과제가 겹치지 않는다.

**틀려서 고친 것.** 예외 안전성 문제의 GCC 범위 삽입 예는 재할당이 필요 없을 때만 성립해 그렇게 밝혔고, nextMission의 "`std::rotate`는 swap만 쓴다"를 move도 쓸 수 있다고 고쳤다. hot/cold 문제는 "이동 전에 id를 죽은 것으로 표시하면 마지막 유닛 삭제가 깨진다"는 해설이 자기 코드(가드가 있는 코드)에서는 틀렸다. 그런 틀린 답안이 모든 테스트를 통과했기 때문이다. `hole != last` 검사 없이 이동할 때만 맞는 말이고 테스트도 그 경우를 잡으므로 그렇게 고쳤다. 문제가 요구하지 않은 것을 요구하던 채점 항목 두 개는 하나는 과제에 한 줄을 더하고 하나는 고쳐 썼으며, sizeof 주장은 libstdc++라고 밝히고 표준이 크기를 정하지 않는다고 적었다. 전달 면접은 "두 번째 `std::forward`는 항상 이동된 객체를 받는다"를 "받을 수 있다"로 고치고, 채점표가 가이드라인 번호를 요구하지 않게 했다. 슬롯 맵은 해설이 제안한 "0번 칸 비워 두기"를 더미 칸으로 구현하면 숨은 칸 수 검사에 떨어지므로, 통과하는 구현 방법을 해설과 테스트 노트에 적었다. 람다 과외는 표현 하나를 부드럽게 고쳤다.

**끝까지 확인하지 못한 것.** 검수 보고에 남은 미확인 항목은 없다. 해설 길이(약 1,900~3,700자)는 목표보다 길지만 고쳐 쓰지 않았다.

## 묶음 e

- `t2-debug-inventory-leak-raii` — 오래 켜 둘수록 메모리가 새는 가방: 조기 반환·예외 경로·delete[] 불일치를 RAII로 고치기 (디버깅 · Easy · 실행 검증)
- `t2-impl-frame-arena-alignment` — 프레임이 끝나면 한 번에 비우는 임시 메모리: 정렬을 지키는 선형(범프) 할당자 (실전 구현 · Medium · 실행 검증)
- `t2-interview-callbacks-template-virtual-function` — 면접: 게임 루프의 콜백, 템플릿·가상 함수·std::function 중 무엇으로 받을까 — 인라인, 바이너리 크기, 유연성 (압박 면접 · Medium · 문서 대조)
- `t2-impl-string-view-config-tokenizer` — 설정 한 줄을 복사 없이 쪼개기: std::string_view 토크나이저와 view의 수명 (실전 구현 · Easy · 실행 검증)
- `t2-debug-chunk-streamer-data-race` — 빈 지형이 생기고 레벨을 나가면 멈춘다: 로딩 스레드와 메인 루프 사이의 데이터 레이스 (디버깅 · Hard · 실행 검증)

**무엇을 만들었는지.** 조기 반환·예외 경로·`delete[]` 불일치로 새는 가방을 RAII로 고치는 디버깅, 정렬을 지키는 프레임 아레나(범프 할당자), 게임 루프 콜백을 템플릿·가상 함수·`std::function` 중 무엇으로 받을지 묻는 면접, 복사 없는 `std::string_view` 설정 토크나이저, 로딩 스레드와 메인 루프 사이의 데이터 레이스 디버깅의 5문제다(쉬움 2 · 보통 2 · 어려움 1). 작성자는 cppreference, Microsoft Learn(CRT 누수 탐지, ASan alloc-dealloc-mismatch, 스마트 포인터, /OPT, 람다, basic_string_view, volatile, DLL 경계), 고정 커밋의 microsoft/STL `xmemory`와 GSL `pointers`, mimalloc README, GCC 13.2 매뉴얼, CMU 15-418 16·20강 PDF를 읽었다. 데이터 레이스 테스트는 캐시를 피해 여러 번 돌렸다. 묶음 d의 람다 과외와 겹치던 흔한 오해는 작성 단계에서 다른 항목으로 바꿨다. 커밋 `1ff3015`로 배포했다.

**검수에서 확인한 것.** 인용한 주소 43개를 모두 열었다(고정 커밋의 GSL `pointers`, STL `xmemory` raw 파일, Core Guidelines 원문, CMU 15-418 PDF 두 개 포함). MSVC 수치는 로컬 MSVC 19.41로 확인했다. 데이터 레이스 문제는 캐시를 피한 실행 다섯 번에서 모범 답안이 매번 7/7 통과, 초기 코드가 매번 실패했다. 틀린 답안은 떨어지고 다르게 쓴 정답은 통과했다. 묶음 d와 흔한 오해가 겹치지 않고 `sizeof(std::string)` 항목도 없다.

**틀려서 고친 것.** 누수 디버깅의 흔한 오해 하나가 틀렸다. "GCC는 -O1/-O2 -Wall에서 이 코드에 `-Wmismatched-new-delete` 경고를 내지 않는다"고 했지만 g++ 13.2는 가방을 한 함수 안에서 만들고 없애면 경고를 낸다. 만들고 없애는 곳이 다른 함수일 때만 조용하므로 그렇게 고쳤다. "슬롯 저장소는 한 번만 할당한다"는 제약과 채점 항목 c5가 `Load`에서 새 버퍼로 바꾸는 모범 답안과 모순되어 둘 다 고쳐 썼다. `new[]`/`delete` 불일치를 잡는 테스트는 불일치한 `delete`를 실제로 실행하지 않고는 검출할 수 없어 유지하되, 정답 풀이의 통과는 UB에 기대지 않으며, 검출은 표준의 보장이 아니라 판정 서버(g++ 13.2)에서 관찰된 동작이라고 해설과 테스트 노트에 밝히고 채점표로도 확인하게 했다. 프레임 아레나는 테스트가 `Mark()`가 `Used()`와 같은 오프셋을 돌려주기를 조용히 요구하고 있어 초기 코드 주석과 노트에 밝혔고, "32개 중 27개" 정렬 수치를 판정 서버에서 다시 잰 값으로 바꿨다. 콜백 면접은 identical code folding을 "기계어가 같은 함수"가 아니라 "내용이 같은 함수"를 합친다고 고쳤다. 토크나이저는 view를 저장하는 틀린 답안이 해제된 메모리를 읽는 것이 UB이고 판정 서버에서 관찰된 결과일 뿐이라고 밝히고, `remove_prefix` 전제 조건에 출처를 달았다. 데이터 레이스 문제는 일반 int 카운터 버그와 뮤텍스 없이 설정하는 atomic 정지 플래그는 채점표로만 확인한다는 제약을 학습자에게 보이게 넣었다.

**끝까지 확인하지 못한 것.** 검수 보고에 남은 미확인 항목은 없다. 다만 `new[]`/`delete` 불일치 검출은 판정 서버 환경(g++ 13.2)에서 관찰된 동작에 기대므로, 컴파일러나 표준 라이브러리가 바뀌면 달라질 수 있다.

## 최종 점검 (2026-11-23)

배포된 30문제 전체를 점검 에이전트 3개(10문제씩)가 차례로 다시 확인하고, 점검에 참여하지 않은 검증 에이전트 2개(15문제씩)가 그 변경을 다시 확인했다. 두 검증 모두 통과 판정을 냈다.

**한 일.** 흔한 오해가 없던 15문제에 "### 흔한 오해" 절을 넣고(출처나 실행으로 뒷받침, 트랙 안에서 중복 없음), 모든 채점 항목·감점에 `sourceId`(C++ Core Guidelines 규칙 링크, Microsoft 문서 등)나 `basis`를 붙이고, `sourceRefs`가 4개를 넘던 문제(최대 7개)를 4개로 줄였다. 새 근거로 C++14·C++17 초안(N4140, N4659), GSL v5.0.1 `final_action`, microsoft/STL(고정 커밋), Itanium ABI·x86-64 psABI, libstdc++ 13.2 소스, CMU 15-418 3·10강 슬라이드를 더했다. 모범 답안과 숨은 테스트는 바꾸지 않았다.

**확인한 것.** cppreference(약 45쪽), Core Guidelines, Microsoft Learn, GCC 13.2 문서, mimalloc, EnTT, Game Programming Patterns 등을 다시 받아 대조했다. 크기·복사/이동 횟수·컴파일 오류·어셈블리 같은 수치는 판정 서버(GCC 13.2)와 로컬 MSVC 19.41(Release, `/MDd`)에서 다시 실행했다. libstdc++ 디버그 모드를 쓰는 템플릿(반복자 무효화, 이벤트 버스, UB 전투 수치)은 모두 `GLIBCXX_DEBUG_MESSAGE_LENGTH`를 이미 설정하고 있었다. 커밋 전 `check-tests.js`를 판정 서버에서 전부 다시 돌려 통과했다.

**틀려서 고친 것.**
- `t2-interview-move-virtual-cost`: "`final`이어도 기반 포인터 호출은 간접 호출로 남는다"는 엣지 케이스가 틀렸다(GCC 13.2 -O3는 vtable 항목을 비교하고 인라인한다). 추측성 가상 호출 제거는 순수 가상 기반에서만 일어난다는 점으로 좁혔다. 이동 전용 타입에 "noexcept가 없으면 복사"를 보상하던 채점 항목이 같은 문제의 흔한 오해와 모순되어 고쳤다.
- 예외 안전성 가방: 범위 삽입 설명이 너무 넓었다. cppreference는 할당 실패에도 "효과 없음"을 약속하고, 강한 보장이 깨지는 것은 T의 복사가 던질 때뿐이며 끝에 원소 하나를 넣을 때는 그때도 유지된다. "표준이 보장 이름을 정하지 않는다"는 C++17 초안(N4659)으로 한정했다.
- 완벽한 전달 면접: "필요가 증명된 뒤에만 쓰라"는 Core Guidelines보다 강해, F.16("정말 최적화가 필요할 때")·F.15("측정하라")의 실제 표현으로 바꿨다. 람다 캡처: F.53은 "금지"가 아니라 "피하라"다.
- 스마트 포인터 비용: "`Draw(shared_ptr)`는 호출마다 참조 수를 올린다"를 기존 변수를 넘길 때로 좁히고, Microsoft 문서가 말하지 않은 "MSVC의" 귀속과 근거 없는 인용을 고쳤다. 저장 기간과 수명: "할당 1번, 24바이트"는 MSVC Release에서만 맞다(Debug는 2번, 32바이트).
- 규칙 3·5: 자기 대입 설명에 겹치는 `std::copy`가 UB라는 점, 복사가 일어나는 원인에 noexcept가 아닌 이동을 넣었다. 슬라이싱: Core Guidelines C.67이 데이터 멤버가 있는 기반 클래스에 삭제가 아니라 protected 복사를 권한다는 점을 넣었다. 이벤트 버스: 무효화된 반복자는 singular가 "된다"가 아니라 "될 수 있다"로 고쳤다.
- 동적 배열의 흔한 오해가 다른 문제의 noexcept 항목과 겹쳐 reserve 대 resize 항목(실행으로 확인)으로 바꿨다. 근거가 되지 않던 채점 항목(RAII 텍스처 핸들 c5·d2 등)을 `basis: "principle"`로 바꿨다.

**끝까지 확인하지 못한 것.** GCC가 AoS/SoA 예제를 벡터화하지 않는 이유는 진단 메시지가 불분명해 주장하지 않았다. MSVC `/MDd` 디버그 빌드가 `SplitDeadSlimes` 초기 코드에서 단언하지 않고 쓰레기 hp로 끝난 이유는 관찰로만 적었다. `new[]`/`delete` 불일치 검출은 판정 서버(g++ 13.2)에서 관찰된 동작에 기댄다.
