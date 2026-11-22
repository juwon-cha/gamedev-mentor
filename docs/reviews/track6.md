# 트랙 6 검수 기록

[문서 목록](../README.md) · [작성·검수 기준](../STANDARDS.md)

## 초기 문제

- `t6-impl-fov-dot-sight` — 경비병 시야 판정: 내적으로 시야각(FOV)과 거리 검사하기 (실전 구현 · Medium · 실행 검증)
- `t6-impl-turret-cross-signed-angle` — 포탑 회전 방향: 2D 외적으로 좌우 판정과 부호 있는 각도 구하기 (실전 구현 · Medium · 실행 검증)
- `t6-debug-framerate-smoothing-integration` — 프레임률에 따라 달라지는 카메라 추적과 점프 높이 디버깅 (디버깅 · Medium · 실행 검증)
- `t6-impl-aabb-circle-overlap` — 충돌 판정 기초: AABB vs AABB, 원 vs AABB 겹침 검사 (실전 구현 · Easy · 실행 검증)
- `t6-impl-ray-sphere-hitscan` — 히트스캔 판정: 반직선과 구의 교차에서 가장 가까운 명중 거리 구하기 (실전 구현 · Medium · 실행 검증)
- `t6-interview-rotation-quaternion-transform` — 회전과 변환: 오일러 각 vs 쿼터니언, 그리고 스케일·회전·이동의 합성 순서 (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** 트랙 6의 첫 6문제는 커밋 `3557ad0`으로 실렸다(독립 검수 완료). 면접을 뺀 다섯 문제에 숨은 테스트가 있고, 작성 단계에서 모범 답안은 8/8 또는 7/7, 시작 코드는 0/N이었다. 작성자는 docs.unity.com 6000.0(Vector3.Dot·Cross, Vector2.SignedAngle, Mathf.Cos, Time.deltaTime, 회전 매뉴얼, Quaternion, Lerp, Slerp, LookRotation, TransformPoint·TransformDirection, Matrix4x4.TRS), Microsoft Learn(MathF.Cos, Vector3.Cross), Wikipedia(Cross product, Exponential smoothing, Line–sphere intersection, Gimbal lock, Slerp), Gaffer(Fix Your Timestep, Integration Basics), MDN 2D/3D 충돌 판정을 읽고 `extraSources` 21개를 달았다. Acos/Sqrt 금지는 채점표로만 확인하고, 원뿔 경계에 딱 걸치는 입력은 0.5° 여유를 두어 테스트에서 뺐다.

**검수에서 확인한 것.** 기존 URL 21개 전부와 새로 넣은 넷(Unity `Transform.eulerAngles`, Unity.Mathematics `float4x4.TRS`, Microsoft Learn `Matrix4x4`, Jonathan Blow의 slerp 글)을 열었다. Wikipedia Slerp 페이지는 nlerp를 언급하지 않았다. 시야 문제는 Acos를 쓴 정답이 통과했고, 포탑 문제에서 금지된 Acos 방식은 무작위 테스트에서 정밀도 때문에 실패했다(노트에 그렇게 적었다). 다섯 문제는 `executed`, 면접은 `reviewed`로 표시했다.

**틀려서 고친 것.** 시야 문제의 "길이 10인 forward는 거의 모든 방향을 통과시킨다"는 틀렸다(fov 90에서 약 86°). 고치고, 시험되지 않던 `fov <= 0`·`fov >= 360` 규칙에 케이스 셋을 넣었으며, 각도 경계 포함(`>=` 대 `>`)은 테스트하지 않는다고 시나리오와 노트에 적었다. 포탑 문제는 +180 계약을 유지하되 `(0,1)→(0,-1)`을 시험한다는 것과 `-0` 함정을 시나리오에서 경고했고, 출처 없는 요(yaw) 부호 주장을 성분 공식 사실(XZ 평면에서 `Cross(a,b).y`는 2D 외적의 부호를 뒤집은 값)로 바꿨다. 프레임률 디버깅은 "모든 가변 dt 적분" 과장을 좁히고, 계수 범위 `[0,1)`을 float에서는 1에 닿을 수 있다고 고쳤으며, 시나리오의 허용 오차를 테스트와 맞췄다. AABB·원 문제는 비교 횟수를 고치고 d1을 뒷받침하지 않던 MDN 인용을 뺐다. 광선-구 문제는 "지름만큼 길다"를 현의 길이로 고치고 NaN 문구를 다듬었다. 면접은 "일반 지식"으로 남아 있던 진술 셋에 출처를 달고, nlerp를 "같은 호를 따르지만 각속도가 일정하지 않다"로 고쳐 계산한 차이를 보탰다.

**끝까지 확인하지 못한 것.** Unity에서 직접 실행한 것은 없다. Unity `Transform`의 S→R→T 순서는 Unity.Mathematics 페이지에 기대고, 월드와 로컬의 곱셈 순서는 연산자 문서에서 유도했다.

## 묶음 a

- `t6-tutor-vector-basics-nearest-enemy` — 벡터 기초: 위치와 방향, 길이와 정규화, 제곱 거리로 가장 가까운 적 찾기 (과외·개념 · Easy · 문서 대조)
- `t6-impl-project-reflect-bounce` — 벽에 맞은 투사체: 벡터 투영으로 미끄러짐과 반사(튕김) 구현하기 (실전 구현 · Easy · 실행 검증)
- `t6-impl-closest-point-segment-sweep` — 근접 공격 스윕 판정: 선분 위의 가장 가까운 점과 점-선분 거리 (실전 구현 · Medium · 실행 검증)
- `t6-debug-normalize-movement-knockback` — 대각선이 더 빠르고, 속도 스탯이 먹지 않고, 겹치면 사라진다: 정규화 버그 디버깅 (디버깅 · Medium · 실행 검증)
- `t6-interview-dot-cross-meaning-uses` — 내적과 외적: 기하학적 의미, 부호, 그리고 게임플레이 판정에서의 쓰임 (압박 면접 · Hard · 문서 대조)
- `t6-impl-move-rotate-towards-max-step` — 지나치지 않는 추적: MoveTowards·각도 감김(±180°)·RotateTowards 를 최대 이동량으로 구현하기 (실전 구현 · Hard · 실행 검증)

**무엇을 만들었는지.** 제곱 거리로 가장 가까운 적을 찾는 벡터 기초 과외, 투영으로 미끄러짐과 반사 구현, 근접 공격 스윕의 점-선분 최근접점, 정규화 버그 디버깅(버그 3), 내적·외적의 의미와 쓰임 면접, ±180° 감김을 다루는 MoveTowards·RotateTowards 구현의 6문제다(2/2/2). 작성 단계 check-tests는 7/7·0/7, 7/7·0/7, 8/8·1/8, 8/8·0/8이었다. 과외와 면접은 `tests: null`이고 과외는 로컬 dotnet 8에서만 확인했다. Sqrt·루프·`Vector2.Reflect` 금지는 채점표로만 확인한다. 커밋 `f8a7432`로 배포했다.

**검수에서 확인한 것.** `extraSources` URL 20개를 모두 열었다. 시험 대상 네 문제 모두 다르게 쓴 정답이 통과하고 틀린 답 9개가 잡혔다(로컬 .NET 8). MoveTowards 문제는 ±180° 이음매를 포함한 모든 기대값을 다시 계산했고, Unity MoveTowards 문서가 반환값이 "target과 같다"고 하며 시나리오도 이를 밝히므로 정확한 `==` 비교가 공정하다고 판단했다(다르게 쓴 정답 둘 통과). 면접의 "뒤쪽" 예와 "왼손 법칙"은 Unity 페이지에 실제로 있었다. 코드와 테스트는 바꾸지 않고 글과 메타데이터만 고쳤다.

**틀려서 고친 것.** 실제 오류는 정규화 디버깅에 있었다. 보고 1("대각선이 더 빠르다")은 재현되지 않았는데, 속도 6에서는 버그 2가 모든 속도를 길이 1로 눌러 버리기 때문이다. 0.5배 감속 디버프에서 드러난다고(0.707 대 0.5, 실행 확인) 시나리오를 고쳤고, 데드존 메모와 "특히 흔한 버그"를 지웠다. 투영/반사의 "단위 법선일 때만 속력이 유지된다"는 과장이었다. |B|² = |A|² + 4(A·N)²(|N|²−1)이라 v·n = 0일 때도 유지되므로 고치고 실행으로 확인했다. 최근접점은 Bourke를 수직 조건에만 인용하고(u 공식은 페이지에 그림으로만 있다) c2 인용을 뺐다. 면접은 acos 수치를 다시 계산했고(0이 아닌 가장 작은 결과는 0.0198°, 0.013° 이하는 0을 돌려준다), "acos는 느리다"와 면적 가중 법선을 지웠으며, 3D 부호 있는 각 공식에 수직 평면 조건을 붙였다. 과외의 "Sqrt는 싸다(경험칙)"는 Unity sqrMagnitude 페이지 내용(일반 산술보다 느리다)으로 바꾸고, 근거 없는 임계값 언급은 Unity normalized 페이지에 묶었다. MoveTowards의 정밀도 메모에는 계산한 수치를 넣었다.

**끝까지 확인하지 못한 것.** 남은 항목은 없다.

## 묶음 b

- `t6-impl-ray-aabb-slab-block-pick` — 조준한 블록 고르기: 반직선과 AABB 의 교차(슬랩 방법)로 진입 거리 구하기 (실전 구현 · Medium · 실행 검증)
- `t6-impl-segment-segment-2d-laser` — 레이저와 벽: 2D 선분-선분 교차를 한 점·겹침·없음으로 분류하기 (실전 구현 · Hard · 실행 검증)
- `t6-debug-turret-angle-atan2-radians-seam` — 엉뚱한 곳을 보는 포탑: Atan2 인자 순서, 도·라디안 혼동, 359°→0° 경계의 각도 보간 디버깅 (디버깅 · Easy · 실행 검증)
- `t6-tutor-interpolation-lerp-remap-smoothstep` — 보간 가족: Lerp, InverseLerp, Remap, SmoothStep 으로 체력바 색 그라디언트 만들기 (과외·개념 · Easy · 문서 대조)
- `t6-impl-ballistic-launch-velocity-two-arcs` — 박격포 조준: 고정 속력으로 목표를 맞히는 발사 속도 구하기(낮은 탄도·높은 탄도·사거리 밖) (실전 구현 · Medium · 실행 검증)
- `t6-interview-coordinate-spaces-screen-to-world-ray` — 좌표 공간의 사슬: 로컬에서 스크린까지, 그리고 마우스 클릭을 월드 반직선으로 되돌리기 (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** 슬랩 방법으로 조준한 블록 고르기, 2D 선분-선분 교차를 한 점·겹침·없음으로 분류, Atan2 인자 순서·도와 라디안·359°→0° 경계 디버깅, Lerp·InverseLerp·Remap·SmoothStep 보간 과외, 고정 속력 박격포의 두 탄도, 로컬에서 스크린까지의 좌표 공간 면접의 6문제다(2/2/2). 작성 단계 check-tests는 9/9·0/9, 7/7·0/7, 8/8·2/8, 7/7·0/7이었다. 과외는 `tests: null`이고 로컬에서만 돌렸다. 커밋 `2b92498`로 배포했다.

**검수에서 확인한 것.** 원래 URL 18개와 새로 넣은 둘(`vulkan-spec-vertex-postprocessing`, `wiki-orthographic-projection`)을 열었다. 시험 대상 문제마다 다르게 쓴 정답 둘이 로컬에서, 하나가 채점 서버(Compiler Explorer)에서 통과했고, 틀린 답 7~8개(선분 교차는 Hard에 해당하는 분기에서 5개)를 모두 잡았다. 선분 교차는 Hard를 유지하고 인용한 Bourke 절만 명확히 했으며, 탄도는 문제가 없었다.

**틀려서 고친 것.** 광선-AABB의 NaN 주장은 반만 맞았다. 순진한 `1f/d` + `MathF.Min/Max` 버전은 마지막 비교를 어떻게 쓰느냐에 따라 NaN 거리와 함께 true를 내거나 명중을 놓친다. 해설에 그렇게 쓰고 "최소 거리를 tExit로"를 최소 `t`로 고쳤다. 각도 디버깅은 버그 셋에 여러 바퀴 감긴 입력까지 더하면 Medium이어서, LerpAngle 입력을 [0, 360)으로 약속하고 시나리오·힌트·해답·c4/d2·테스트를 맞췄으며 여러 바퀴 감김은 다음 미션으로 옮겼다(여전히 Easy의 위쪽 끝이다). Atan2 문서 문구도 좁혔다. 보간 과외의 c1은 클램프하는 Unity Lerp를 비클램프 동작의 근거로 들고 있어 Wikipedia로 바꿨다. 좌표 공간 면접은 −w..w 클리핑을 LearnOpenGL과 Vulkan 명세로 뒷받침하고(이유는 일반 설명으로 표시), 직교 투영의 광선이 평행하다는 것을 Wikipedia와 실행으로 확인했으며, 재현되지 않는 카메라 뒤 수치를 구체적인 점으로 바꿨다. "(view × projection)"은 규약에 중립적인 표현으로 고치고, WorldToScreenPoint 문서의 화면 밖 문장을 더했다.

**끝까지 확인하지 못한 것.** OpenGL 명세 PDF는 열지 않았다. 카메라 뒤 점에 대한 Unity 엔진 동작은 문서화되어 있지 않아 그렇게 표시했다.

## 묶음 c

- `t6-impl-rotation2d-pivot-orbit` — 포탑과 보호막 오브: 2×2 회전 행렬 만들기, 피벗 기준 회전, 궤도 운동 (실전 구현 · Easy · 실행 검증)
- `t6-impl-point-in-triangle-convex-polygon` — 스킬 범위와 점령 구역: 삼각형·볼록 다각형 안의 점 판정(감김 방향 무관, 경계 포함) (실전 구현 · Medium · 실행 검증)
- `t6-debug-matrix3x2-compose-order` — 공전하는 탱크와 거꾸로 놓인 포탑: System.Numerics 행렬 합성 순서와 행·열 규약 디버깅 (디버깅 · Medium · 실행 검증)
- `t6-impl-swept-circles-time-of-impact` — 빠른 탄이 표적을 뚫고 지나간다: 움직이는 두 원의 첫 충돌 시각(TOI)을 이차방정식으로 구하기 (실전 구현 · Hard · 실행 검증)
- `t6-tutor-quaternion-blackbox-numerics` — 쿼터니언을 블랙박스로 쓰기: System.Numerics.Quaternion 으로 회전 만들기·합성·적용·보간 (과외·개념 · Easy · 문서 대조)
- `t6-interview-float-precision-epsilon-large-worlds` — 부동소수점 정밀도: == 비교가 위험한 이유, epsilon 비교 설계, 누적 오차와 큰 월드 좌표 (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** 2×2 회전 행렬과 피벗 회전·궤도 운동, 감김 방향과 무관하고 경계를 포함하는 삼각형·볼록 다각형 판정, System.Numerics 행렬 합성 순서와 행·열 규약 디버깅, 움직이는 두 원의 첫 충돌 시각(TOI), System.Numerics.Quaternion을 블랙박스로 쓰는 과외, 부동소수점 정밀도·epsilon·큰 월드 좌표 면접의 6문제다(2/2/2). 작성자는 MS Learn(MathF.Cos, Matrix3x2와 생성자·CreateRotation, Matrix4x4, Vector2/Vector3.Transform, Quaternion 메서드, Single.Epsilon, System.Single, 부동소수점 타입), DirectXMath, dotnet/runtime release/8.0 Quaternion.cs, C# 표준 §8.3.7, Unity 페이지, Wikipedia, cp-algorithms, Gomez(1999), Dawson, UE5 LWC, UnityCsReference Mathf.cs를 읽었다. Unity 동작은 읽기로만 확인했고, 가져오기 도구가 Gomez의 코드 목록을 원문 대신 요약해 보여 주었다. 커밋 `90f667a`로 배포했다.

**검수에서 확인한 것.** 인용된 Microsoft Learn 페이지 전부, Matrix4x4, C# 표준, dotnet/runtime 8.0 소스, DirectXMath, Unity 페이지 전부, UnityCsReference, Wikipedia 7쪽, cp-algorithms 2쪽, Gomez, Unreal 2쪽, Dawson을 원문으로 열었다. 틀린 답과 대안 답 약 25개가 예상대로 동작했다. Matrix3x2 디버깅에 인용된 증상은 모두 시작 코드의 출력과 같았고, Gomez에 대한 남은 주장은 원문 Listing 2와 맞았다.

**틀려서 고친 것.** 2D 회전은 c7이 Matrix3x2 주석을 요구하는데 해답에 없어 과제와 해답에 넣었고, CreateRotation의 회전 방향은 "실행으로 확인"이라고 쓰고 .NET 8 소스를 인용했다. 점-다각형은 반평면 교집합 주장을 Wikipedia Convex polygon/Convex polytope로 인용했고, 재현되지 않은 "육각형 631개"를 다시 재서 2000개 중 667개(약 3분의 1)로 바꿨으며, c7에 대응하는 주석을 해답에 넣었다. Matrix3x2는 .NET 8 Vector2.cs와 Unity math.mul을 인용하고, DirectXMath가 다른 규약을 쓴다고 암시하던 채점 메모를 고쳤으며(같은 규약이다), 경계 사례 하나를 다듬었다. 원 스윕은 56%를 "약 절반(검수 실행에서 57%)"으로 바꾸고, 기준을 뒷받침하지 않던 채점 인용 둘을 Gomez 원문으로 다시 가리켰으며, c8을 받을 수 있게 재겹침 주석을 해답에 넣었다. 쿼터니언 과외는 길이 드리프트 수치가 어떤 회전에서 나왔는지 밝혔다. 부동소수점 면접에는 실제 오류가 있었다. 시간이 멈추는 시점은 "6일쯤"이 아니라 약 4.8일이고, 0.9375배 느려짐은 2^16이 아니라 2^15부터 시작하며, Unity Approximately 페이지는 Mathf.Epsilon을 실제로 언급한다. 이를 고치고 floating origin은 Unreal World Composition 페이지로 인용했다.

**끝까지 확인하지 못한 것.** 남은 항목은 없다.

## 묶음 d

- `t6-impl-catmull-rom-patrol-arc-length` — 경비병 순찰 경로: 균일 Catmull-Rom 스플라인 평가와 샘플링으로 구하는 근사 호 길이 (실전 구현 · Medium · 실행 검증)
- `t6-impl-steering-seek-arrive-limits` — 펫 드론의 이동: Reynolds 의 seek·arrive 조향을 최고 속력·최대 가속 제한과 dt 적분으로 구현하기 (실전 구현 · Medium · 실행 검증)
- `t6-debug-energy-drift-tunneling` — 출렁이다 폭발하는 젤리 발판과 벽을 뚫는 총알: explicit Euler 에너지 표류, 빠진 dt², 저프레임 터널링 디버깅 (디버깅 · Hard · 실행 검증)
- `t6-impl-circle-collision-response-restitution` — 범퍼카 충돌 처리: 겹친 두 원을 떼어 놓고 반발 계수로 법선 속도 바꾸기(같은 질량) (실전 구현 · Easy · 실행 검증)
- `t6-tutor-gacha-pity-expected-value` — 확률 기초: 기댓값, 천장(피티) 시스템, 독립 뽑기와 비복원 뽑기 — 공식과 시드 고정 시뮬레이션으로 기대 뽑기 수 구하기 (과외·개념 · Easy · 문서 대조)
- `t6-interview-fixed-point-lockstep-determinism` — 고정소수점 vs 부동소수점: 락스텝 멀티플레이에서 기기 간 결정론을 지키는 법 (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** 균일 Catmull-Rom 순찰 경로와 근사 호 길이, Reynolds seek·arrive 조향과 속력·가속 제한, explicit Euler 에너지 표류·빠진 dt²·저프레임 터널링 디버깅, 겹친 두 원 분리와 반발 계수, 기댓값과 천장(피티) 확률 과외, 고정소수점과 락스텝 결정론 면접의 6문제다(2/2/2). 해설마다 출처나 .NET 8 실행으로 뒷받침한 "흔한 오해" 두 항목이 있다. 작성자는 시험 대상 문제마다 틀린 변형을 로컬에서 돌려 모두 잡았고, 과외 해답은 로컬에서 컴파일하고 실행했다. 업계 일화는 Gaffer의 결정론 글이 모아 둔 인용(Battlezone 2, MotoGP, Gas Powered Games)에서 왔고 원출처는 열지 않았다. 커밋 `06b1167`로 배포했다.

**검수에서 확인한 것.** 인용된 URL 전부와 C# 표준 원문, .NET 8 `Vector2.cs`, DirectXMath 소스, `Math.Sin`, Wikipedia Semi-implicit Euler 페이지를 열었다. Catmull-Rom 공식은 DirectXMath 문서·소스·Wikipedia와 일치했다. red3d.com 원문에는 실제로 `desired_velocity = normalize (position - target) * max_speed`라고 적혀 있었다. 적분 디버깅 시작 코드의 QA 증상은 정확히 재현되었고, 천장 시뮬레이션 값 55.228689와 31.77607도 맞았다.

**틀려서 고친 것.** Catmull-Rom은 Wikipedia 카메라 경로 주장의 이유를 잘못 댔고, "끝점에서 느리다"는 예시 경로에만 해당하며, 끝점 규칙은 이 문제의 선택이라는 점을 밝혔다. 시나리오가 묻지 않은 NaN 채점 요구를 지우고 캐싱 규칙을 제약에 적었다. 조향은 위의 원문을 그대로 인용하고 문제가 본문 설명과 그림 3을 따른다고 밝혔으며, arrive의 오버슈트 주장을 고쳤다(2부터가 아니라 제동 거리인 1 m부터 오버슈트가 없다). 적분 디버깅은 위치를 먼저 갱신하는 오일러 변형에 출처를 달았다. 충돌 문제는 시나리오에 반발 계수 정의가 없어 넣었다. 천장 과외의 SplitMix64는 checked 빌드에서 OverflowException을 던져(확인) `unchecked`로 감쌌고, "정확히 확률 p"와 pity=1일 때의 부동소수점 값을 고쳤다. 결정론 면접은 업계 일화를 Gaffer 글 안의 인용으로 귀속하고, 재현되지 않은 합계 5032.67 예를 바꾸고, 한 기기에서의 실행 결과에 "x64 .NET 8.0.8"이라고 표시했다.

**끝까지 확인하지 못한 것.** 업계 일화 자체(간접 인용)와 ARM64 동작은 확인하지 못했다.

## 최종 점검 (2026-11-22)

배포된 30문제 전체를 점검 에이전트 3개(10문제씩)가 차례로 다시 확인하고, 점검에 참여하지 않은 검증 에이전트 2개(15문제씩)가 그 변경을 다시 확인했다. 두 검증 모두 통과 판정을 냈다.

**한 일.** 흔한 오해가 없던 24문제에 "### 흔한 오해" 절을 넣고(출처나 .NET 8 실행으로 뒷받침), 모든 채점 항목·감점에 `sourceId`나 `basis`를 붙이고, `sourceRefs`가 4개를 넘던 문제(최대 13개)를 4개로 줄였다. 새 근거로 Microsoft Learn(Math.Clamp·Acos·Atan2·Max·Sqrt, Vector2.DistanceSquared, XMVector2LinePointDistance, HLSL smoothstep, Matrix Ordering), dotnet/runtime release/8.0 `Vector2/Vector3/MathF` 소스, DirectXMath `DirectXCollision.inl`, UnityCsReference 6000.0, CMU 15-362 2·3·4·8·15·16강 슬라이드를 더했다. 모범 답안과 숨은 테스트는 바꾸지 않았다.

**확인한 것.** 인용한 페이지를 모두 다시 받아 대조했다(약 70쪽). 본문의 수치는 로컬 .NET 8에서 모두 다시 실행했고, DirectXMath 동작(닿기만 해도 충돌, 구 안에서 쏜 광선은 출구 거리)은 MSVC와 DirectXMath 3.17로 확인했다. 테스트가 있는 문제는 로컬에서 모범 답안 통과·초기 코드 실패를 다시 확인했고, 커밋 전 `check-tests.js`를 판정 서버에서 전부 다시 돌려 통과했다.

**틀려서 고친 것.**
- 사분면 포탑 계열: `MathF.Acos`의 0.1도 정밀도 수치가 0.0989가 아니라 0.1009였다. "정확히 왼쪽이면 180"은 offset.Y가 +0일 때만 맞아 -0 주의를 더했다.
- 프레임률 독립 보간: "300으로 튄다"는 t를 자르지 않는 lerp에서만 맞고, Unity `Mathf.Lerp`는 t를 0~1로 잘라 목표에 붙는다고 고쳤다.
- 시야각(FOV): 내적 설명에서 cos 인수가 빠져 있어 바로잡았고, 거리 검사 연산 횟수를 고쳤다.
- 쿼터니언 면접: 총구 오프셋 시나리오가 스스로 모순되어 회전만 적용하도록 고쳤고, 근거 없는 "가장 흔하다" 주장을 뺐다.
- 내적·외적: 영벡터 정규화는 System.Numerics에서 NaN, Unity에서 영벡터라는 차이를 밝혔다. 이동·회전 문제의 Unity `RotateTowards`는 길이도 바꾸므로 그 채점 항목의 근거가 될 수 없어 `basis: "tests"`로 바꿨다.
- 연속 충돌(swept circles): 조건 없이 쓰인 "약 57%"를 실행 조건과 함께 다시 쟀다. 점-삼각형 포함 검사의 신발끈 공식 실패 수(2000개 중)를 시드에 따른 범위로 고쳤다.
- 그 밖에 테스트가 확인하지 않는 것을 "테스트로 확인"이라 한 채점 항목, 범위를 벗어난 반발 계수를 허용하는 페이지를 인용한 항목을 고치고, 시나리오에 없는 좌표를 있다고 한 문장을 지웠다.

**끝까지 확인하지 못한 것.** `Atan2(-0, 음수) = -π`는 x64에서만 관찰했다(본문에 밝힘). HLSL 동작은 문서로만 확인했고 ARM64에서는 실행하지 않았다. 일부 무작위 실험(신발끈 실패 수, 재탐색 비율)은 원래 시드를 알 수 없어 범위로 적었다.
