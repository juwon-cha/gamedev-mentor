# 트랙 9 검수 기록

[문서 목록](../README.md) · [작성·검수 기준](../STANDARDS.md)

## 초기 문제

- `t9-tutor-render-pipeline-cpu-gpu` — 한 프레임이 화면에 나오기까지: 렌더링 파이프라인과 CPU/GPU 병목 (과외·개념 · Easy · 문서 대조)
- `t9-interview-draw-call-batching` — 드로우 콜과 배칭: 정적·동적 배칭, GPU 인스턴싱, SRP Batcher (압박 면접 · Hard · 문서 대조)
- `t9-interview-overdraw-transparency` — 오버드로우와 반투명: 그리는 순서, 깊이 쓰기, 모바일 파티클 비용 (압박 면접 · Medium · 문서 대조)
- `t9-interview-texture-memory` — 텍스처 메모리 추정: 해상도 · 포맷 · 밉맵 · Read/Write (압박 면접 · Medium · 문서 대조)
- `t9-impl-texture-memory-estimator` — 텍스처 메모리 추정기: 밉 체인 합산과 ASTC 블록 계산 (실전 구현 · Medium · 실행 검증)
- `t9-impl-lambert-blinn-phong` — 픽셀 하나의 라이팅: Lambert 디퓨즈 + Blinn-Phong 스페큘러 (실전 구현 · Medium · 실행 검증)

**무엇을 만들었는지.** 트랙 9의 첫 6문제는 커밋 `7bfdcca`로 실렸다(독립 검수 완료). 숨은 테스트는 텍스처 메모리 추정기(8/8·0/8)와 Lambert/Blinn-Phong(9/9·0/9)에만 있고, 나머지 넷은 돌릴 렌더러가 없어 읽기로만 확인했다. 작성자는 docs.unity.com으로 옮긴 Unity 6.0 매뉴얼(드로우 콜 최적화, 배칭, GPU 인스턴싱, SRP Batcher, Frame Debugger, Rendering Statistics, 렌더 큐, ZWrite, URP Rendering Debugger, 밉맵, GPU 텍스처 포맷, `Texture.isReadable` 등), Wikipedia(Graphics pipeline, Z-buffering, Mipmap, ASTC, Blinn–Phong), Microsoft Learn `Vector3.Normalize`를 읽었다. Early-Z, 블렌딩 순서 의존, 모바일 필레이트, 정적 배칭의 메모리 증가, 밉 크기 규칙 등은 일반 지식으로 표시했다. 가져오기 도구가 요약을 돌려줘서 Unity 수치(64,000 / 900 / 300, 33%, bpp 표, Read/Write 두 배)는 원문이 아니라 요약에서 나왔다.

**검수에서 확인한 것.** `extraSources` URL 24개 전부를 curl로 원문 HTML까지 받아 열었고, 다섯 개(Unity "Enable static batching", GPU Resident Drawer, `Renderer.material`, `TransparencySortMode`, Microsoft Direct3D 11 텍스처 소개)를 더했다. 64,000 / 900 / 300 한도, 방식 표, 적용 순서, SRP Batcher 규칙이 원문과 일치했고, 큐 번호와 2500/2501 규칙, 33%, bpp 표, Read/Write 두 배, ASTC 대체도 확인되었다. 추정기의 기대 바이트 수를 모두 따로 다시 계산해 맞았고, .NET 8에서 `Vector3.Normalize(Vector3.Zero)`가 NaN을 돌려주는 것을 실행으로 확인했다.

**틀려서 고친 것.** 파이프라인 과외에서 CPU 비용이 "오브젝트 수 × 상태 종류"에 비례한다는 근거 없는 주장을 고쳤고, 매뉴얼의 "오버드로의 가장 흔한 원인"을 필레이트 문제의 가장 흔한 원인으로 잘못 옮긴 것을 바로잡았다. 배칭 면접은 `renderer.material`이 "매번" 인스턴스를 만들지는 않는다는 것, GPU Resident Drawer 조언에 실제 요구 조건(Forward+, OpenGL ES 불가, Mesh Renderer만)이 빠졌다는 것을 고쳤고, 정적 배칭의 메모리 증가를 일반 지식 대신 문서로 인용했다. 오버드로 면접은 ZWrite 설명에 "나중에 그려지는" 조건을 더하고, "가장 붉은 영역" 주장과 추측성 플래시·UI 병합 조언을 지웠으며, 오브젝트 중심 기준 정렬을 인용했다. 텍스처 메모리 면접은 `isReadable` 페이지가 "추가 CPU 복사본"을 말하지 않는다는 점과 Wikipedia 지역성 주장을 페이지 내용대로 고쳤다. 추정기에는 실제 오류가 있었다. 16384×16384×4는 2^32가 아니라 2^30이라 int에 들어가므로 오버플로 테스트가 int로 곱하는 답을 통과시키고 있었다. 64bpp(2^31)로 바꾸고 새 오버플로 케이스와 인자 케이스(−8 bpp, 잘못된 블록 높이)를 넣었으며, 밉 규칙은 Direct3D 11 문서로 인용했다. Lambert/Blinn-Phong은 숨은 테스트가 그럴듯한 epsilon 선택을 거부해 제약에 임계값을 밝혔고, 지나치게 엄격하거나 해답과 충돌하던 채점 항목 둘을 고쳤다.

**끝까지 확인하지 못한 것.** early-Z 문구, 모바일 필레이트 민감도, 렌더 큐 오프셋과 메시 분할 조언은 문서로 확인할 수 없어 일반 관행으로 표시해 두었다. Khronos 위키는 403을 돌려줬다.

## 묶음 a

- `t9-tutor-color-srgb-linear` — 색 다루기: RGB와 HSV, sRGB(감마)와 선형 공간 (과외·개념 · Easy · 문서 대조)
- `t9-impl-alpha-over-blend` — 알파 블렌딩 수식: straight·premultiplied over 연산과 레이어 합성 (실전 구현 · Medium · 실행 검증)
- `t9-impl-bilinear-sampler` — 바이리니어 텍스처 샘플링: 텍셀 중심과 Clamp·Repeat 래핑 (실전 구현 · Medium · 실행 검증)
- `t9-interview-vertex-fragment-shader` — 버텍스 셰이더와 프래그먼트 셰이더: 실행 단위, 보간, 모바일의 픽셀 비용 (압박 면접 · Hard · 문서 대조)
- `t9-debug-cpu-sampler-uv-texel` — CPU 텍스처 샘플러의 UV·텍셀 버그: 뒤집힌 V, 반 텍셀 오프셋, 가장자리 래핑 (디버깅 · Hard · 실행 검증)
- `t9-interview-mesh-vertices-indices` — 메시의 구성: 정점·인덱스·노멀·UV, 각진 모서리가 정점을 늘리는 이유 (압박 면접 · Easy · 문서 대조)

**무엇을 만들었는지.** RGB·HSV와 sRGB·선형 공간 과외, straight·premultiplied 알파 over 연산, 텍셀 중심과 Clamp·Repeat 래핑을 지키는 바이리니어 샘플링, 버텍스·프래그먼트 셰이더 면접, CPU 샘플러의 UV·텍셀 버그 디버깅, 정점·인덱스·노멀·UV 메시 면접의 6문제다(2/2/2). 샘플러 디버깅은 반 텍셀 버그를 고치면 래핑 버그가 드러나는 구조다. 작성 단계 check-tests는 9/9·0/9, 8/8·0/8, 8/8·0/8이었다. 과외는 `tests: null`이라 로컬 dotnet 하네스로만 확인했고, 면접 둘은 읽기로만 확인했다. 작성자는 Wikipedia(sRGB, HSL/HSV, Alpha compositing, Bilinear interpolation, Shader), W3C CSS Color 4, Microsoft Learn(D3D10 좌표, HLSL struct), Unity 6 페이지 12개를 curl로 받아 확인했다(인용한 19개 URL 모두 200). 커밋 `2d53900`으로 배포했다.

**검수에서 확인한 것.** 원래 19개와 새로 넣은 10개(Unity Color.linear/gamma, GammaToLinearSpace, RGBToHSV, Linear textures, VertexAttributeDescriptor, Vulkan Sampling·Rasterization, Wikipedia Texture mapping·Vertex normal)를 열었다. 과외 해답을 로컬에서 돌려 인용된 값(0.2140, 0.2159, 0.7354→188, 임계값)이 모두 맞았다. 알파 블렌딩과 바이리니어의 기대값을 다시 계산해 맞았다. 샘플러 디버깅은 부분 수정 조합 16가지와 틀린 수정 4개가 모두 실패하고 버그마다 자기 실패 테스트가 있었다. 다른 정답은 채점 서버(Compiler Explorer)에서 통과했고 틀린 변형은 로컬에서만 돌렸다. 코드와 테스트는 바꿀 필요가 없었다.

**틀려서 고친 것.** 색 과외의 Unity API 문장은 페이지가 말하는 것만 남겼다(공식은 문서에 없고, `RGBToHSV`의 H는 도가 아니라 0–1이다). "비색상 텍스처는 sRGB를 건너뛴다"는 Unity Linear textures 페이지로 인용했고, 출처 없는 파랑/노랑 밝기 예는 Wikipedia의 파랑/흰색 예로 바꿨다. 알파 블렌딩에는 빠져 있던 "출력은 클램프하지 않는다" 규약을 넣었다. 바이리니어의 반 텍셀 채점 항목은 0.5를 빠뜨린 D3D10 페이지 공식을 인용하고 있어 Vulkan 명세로 바꿨다. 셰이더 면접은 1/w 보간을 Vulkan 공식으로 인용하고 모바일 여유 언급을 Unity 페이지 내용으로 바꿨다. 샘플러 디버깅의 해설은 음수 인덱스가 항상 예외를 던진다고 했지만, 여러 행 텍스처에서는 이웃 텍셀을 조용히 읽으므로 고쳤고, 근거가 안 되던 채점 인용 하나를 뺐다. 메시 면접의 바이트 계산은 명시적인 Float32 배치 가정과 출처로 다시 썼고, 평균 법선 주장에 출처를 달았다.

**끝까지 확인하지 못한 것.** Unity의 색 변환이 구간별 sRGB 공식과 정확히 같은지는 확인하지 못했고 본문에 그렇게 적었다. IEC 61966-2-1은 열지 않았고 상수는 W3C와 Wikipedia로 대조했다.

## 묶음 b

- `t9-impl-mvp-clip-ndc-screen` — MVP 변환 직접 따라가기: 클립 공간, 원근 나눗셈, 뷰포트 매핑 (실전 구현 · Medium · 실행 검증)
- `t9-impl-frustum-sphere-culling` — 프러스텀 컬링: 바운딩 구와 여섯 평면 (실전 구현 · Easy · 실행 검증)
- `t9-tutor-depth-buffer-precision` — 깊이 버퍼: 깊이 테스트, z-fighting, near·far 평면과 정밀도 (과외·개념 · Easy · 문서 대조)
- `t9-interview-lighting-models-pbr-baked` — 라이팅 모델 한눈에 보기: 앰비언트·디퓨즈·스페큘러, PBR 파라미터, 베이크와 실시간 (압박 면접 · Medium · 문서 대조)
- `t9-debug-normal-handling` — 노멀 처리 버그: 보간 후 정규화, 비균등 스케일의 노멀 변환, 공간이 섞인 내적 (디버깅 · Hard · 실행 검증)
- `t9-interview-shadow-mapping-cascades` — 그림자: 섀도 매핑, 캐스케이드, 애크니와 피터 패닝, 품질과 비용을 바꾸는 설정 (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** 클립 공간·원근 나눗셈·뷰포트 매핑을 따라가는 MVP 변환, 바운딩 구와 여섯 평면의 프러스텀 컬링, 깊이 테스트·z-fighting·정밀도 과외, 라이팅 모델·PBR·베이크 면접, 노멀 처리 버그 디버깅(버그 3), 섀도 매핑·캐스케이드 면접의 6문제다(2/2/2). 작성 단계 check-tests는 8/8·0/8, 7/7·0/7, 8/8·2/8이었다. 작성자는 로컬 .NET 8에서 시험 대상 셋에 변이 답 28개를 돌려 27개가 실패하고 남은 하나는 해답과 수학적으로 같음을 확인했고, 디버깅의 세 버그마다 실패 케이스가 있으며, 깊이 공식이 `CreatePerspectiveFieldOfView`의 z/w와 약 2e-7 안에서 일치함을 확인했다. 과외는 `tests: null`이라 로컬에서만, 면접 둘과 Unity 주장은 읽기로만 확인했다. 커밋 `2953c87`로 배포했다.

**검수에서 확인한 것.** 인용된 URL 42개(Learn, Direct3D, Unity 6 매뉴얼, Wikipedia)가 모두 200을 돌려주는 것을 확인하고 본문과 대조했다. 클립 깊이 0..w를 실행으로 확인했다. 깊이 과외의 표·퀴즈·채점 수치를 모두 다시 계산해 맞았다. 테스트는 그대로 두었고, 로컬에서 틀린 답 13 + 8 + 9개가 모두 실패하고 다르게 쓴 정답 6개가 통과했다.

**틀려서 고친 것.** MVP 문제는 행렬 원소와 카메라 방향을 문서에 있는 것처럼 썼지만 Learn 페이지는 둘 다 말하지 않는다. ".NET 8 실행으로 확인"으로 바꾸고 D3DX 페이지는 공식에만 인용했다. 프러스텀 컬링은 NaN·무한대 값과 길이 0 법선은 주어지지 않는다고 시나리오와 제약에 적고 "가장 싼 경계 볼륨"을 누그러뜨렸다. 깊이 과외는 z/w 주장에 "실행으로 확인"을 붙이고 반복된 문단을 지웠다. 라이팅 면접의 Unity 주장은 매뉴얼과 맞았고 Phong→PBR 대응은 해석으로 표시했다. 노멀 디버깅은 `TransformNormal`이 위쪽 3×3만 곱하고(실행 확인) 역전치를 적용하지 않는다고 밝혔고, "어느 버그가 언제 보이나" 문장을 고쳤다. 그림자 면접은 "Bias too high"와 "눈으로 조정" 진술을 Normal Bias처럼 Built-in 전용으로 표시하고 URP 자체의 바이어스 문구를 더했다. 파일 전체에서 `sourceRefs`를 문제당 4개로 줄이고(나머지는 채점 `sourceId`로 남김) 쓰지 않는 `unity-camera-view`를 지웠으며, `track6_math.json`과 다른 URL을 가리키던 `ms-matrix4x4`를 같게 맞췄다.

**끝까지 확인하지 못한 것.** 남은 항목은 없다. 노멀 디버깅 해설은 2,274자로 2,200자 범위를 조금 넘는다. 프러스텀 템플릿은 NaN 거리를 보이는 것으로 처리하지만, 여기에 기대는 변이는 없었다.

## 묶음 c

- `t9-impl-triangle-raster-top-left` — 삼각형 래스터화: 에지 함수, top-left 규칙, 무게중심 깊이 보간 (실전 구현 · Hard · 실행 검증)
- `t9-impl-mip-lod-trilinear` — 밉 레벨 고르기: UV 도함수로 LOD 계산하고 트라이리니어 가중치 정하기 (실전 구현 · Easy · 실행 검증)
- `t9-interview-lod-occlusion-cull-distance` — LOD, 오클루전 컬링, 컬링 거리: 무엇을 아끼고 무엇을 대가로 치르나 (압박 면접 · Hard · 문서 대조)
- `t9-tutor-sprite-atlas-batching-bleeding` — 스프라이트 아틀라스와 2D 배칭: 드로우 콜이 줄어드는 조건과 가장자리 번짐(bleeding) (과외·개념 · Easy · 문서 대조)
- `t9-debug-banding-quantize-double-gamma` — CPU 후처리의 밴딩과 정밀도 버그: 너무 이른 8비트 양자화, 두 번 걸린 감마, 버림 (디버깅 · Medium · 실행 검증)
- `t9-interview-post-processing-cost-aa` — 후처리의 비용: 풀스크린 패스, Bloom, Render Scale, MSAA·FXAA·TAA (압박 면접 · Medium · 문서 대조)

**무엇을 만들었는지.** 에지 함수·top-left 규칙·무게중심 깊이 보간 삼각형 래스터화, UV 도함수로 LOD를 계산하고 트라이리니어 가중치를 정하는 밉 선택, LOD·오클루전 컬링·컬링 거리 면접, 스프라이트 아틀라스와 2D 배칭·번짐 과외, 이른 8비트 양자화·두 번 걸린 감마·버림이 섞인 밴딩 디버깅, 후처리 비용과 MSAA·FXAA·TAA 면접의 6문제다(2/2/2). 새로 생긴 Microsoft 자료 지침에 따라 D3D11.3 기능 명세(n.8 정점 스냅, top-left 정점 규칙, LOD 공식, 밉 선택과 2×2 도함수), D3D 래스터화 규칙 페이지, D3D 데이터 변환 규칙(+0.5 반올림 float→sRGB), HLSL ddx 페이지를 깊은 링크로 인용했다. D3D11.3이 정점 위 픽셀 중심의 경우를 정의하므로 그런 입력을 금지하지 않고 시험한다. 작성자는 Vulkan 래스터화·텍스처·한계 장, OpenGL 4.6 PDF, Unity 6 매뉴얼 약 28쪽, Wikipedia sRGB·Colour banding도 읽었다. 커밋 `694b953`으로 배포했다.

**검수에서 확인한 것.** D3D11.3 기능 명세, Learn 페이지(래스터화 규칙, 데이터 변환, ddx, D3D10 좌표), GL 4.6 PDF, Vulkan 래스터화·텍스처 장(textures.adoc 소스 포함), 인용된 Unity 페이지 21개와 Create a sprite atlas, Wikipedia 두 쪽을 열었다. 래스터화는 검수자가 D3D11.3 3.4.2.1 규칙을 정확한 산술로 직접 구현해 모든 테스트를 통과시켰고(에지 위·정점 위 픽셀 중심 포함), 하드코딩된 기대값을 모두 따로 다시 계산해 일치했으며, 틀린 답 10개가 실패하고 다른 정답 2개가 통과했다. 밉 선택은 공식과 상수가 D3D11.3·GL 4.6·Vulkan과 일치했고 틀린 답 10개를 잡았다. 밴딩은 버그마다 따로 실패하고 불완전한 수정 조합 7가지가 모두 실패했다. 후처리 면접은 문제가 없어 빠진 `sourceRefs`만 보탰다.

**틀려서 고친 것.** 래스터화 해설은 Learn 래스터화 페이지를 잘못 옮기고 있었다. 그 페이지를 글자 그대로 읽으면 왼쪽 에지와 오른쪽 에지가 만나는 정점도 다루는데 D3D11.3은 그렇지 않다. 페이지 문구를 인용하고 차이를 밝혔으며, 정점을 스냅하지 않는다고 적었다. 밉 선택은 Vulkan의 N 표본 비등방 평균을 규칙처럼 제시했지만, 명세는 방식을 구현에 맡기고 그 평균은 노트의 예로만 든다. 이를 고쳤다. LOD 면접은 "LOD는 드로우 콜을 절대 줄이지 않는다"며 줄인다고 답하면 −20을 주었지만, 마지막 LOD 임계값보다 작아진 오브젝트는 그려지지 않는다(페이지는 마지막 단계가 사라진다고 하고, 컬링 동작 자체는 일반 지식으로 표시했다). 주장을 좁히고 감점 문구를 고쳤다. 아틀라스 과외는 상자 필터를 연습 자체의 모델이라고 밝혔고(Unity는 아틀라스 밉 필터링 방식을 문서화하지 않는다), 출처 없던 "여러 아틀라스에 든 스프라이트"를 Create a sprite atlas 페이지로 인용했다. 밴딩 디버깅에 인용된 증상 몇 개(46단계, 194, 7–17 → 13)는 버그 하나만 남겼을 때의 값이었고 시작 코드는 실제로 45단계와 226을 낸다. 값마다 어떤 상태에서 나온 것인지 적고 D3D11.3 상수 표를 출처로 더했다.

**끝까지 확인하지 못한 것.** 검수 보고에 남은 미확인 항목은 없다. 래스터라이저의 1초 경계 상자 시간 검사는 로컬 기준으로 필요한 시간보다 약 500배 넉넉하다.

## 묶음 d

- `t9-impl-particle-update-swap-remove` — 파티클 시스템 업데이트: 방출 누적, 수명, swap-remove, 고정 용량 (실전 구현 · Hard · 실행 검증)
- `t9-impl-sdf-2d-smooth-union` — 2D 부호 있는 거리 함수: 원, 상자, smooth union 을 격자에 굽기 (실전 구현 · Easy · 실행 검증)
- `t9-interview-unity-render-pipelines-paths` — Unity 렌더 파이프라인 고르기: Built-in · URP · HDRP 와 Forward · Forward+ · Deferred (압박 면접 · Medium · 문서 대조)
- `t9-tutor-shader-variants-stripping` — 셰이더 변형과 키워드: 조합 폭발을 세어 보고 스트리핑으로 줄이기 (과외·개념 · Easy · 문서 대조)
- `t9-debug-frame-pacing-percentiles` — 프레임 페이싱 분석기 버그: 평균 FPS 의 함정, 백분위 순위, 정렬로 망가진 시간 순서 (디버깅 · Medium · 실행 검증)
- `t9-interview-forest-10000-trees` — 나무 10,000 그루 그리기: 정적 배칭 · 메시 결합 · GPU 인스턴싱의 메모리, 컬링 단위, 머티리얼 제약 (압박 면접 · Hard · 문서 대조)

**무엇을 만들었는지.** 방출 누적·수명·swap-remove·고정 용량의 파티클 업데이트, 원·상자·smooth union 2D SDF를 격자에 굽기, Built-in·URP·HDRP와 Forward·Forward+·Deferred 선택 면접, 셰이더 변형 조합 폭발과 스트리핑 과외, 평균 FPS의 함정·백분위 순위·정렬로 망가진 시간 순서 디버깅, 나무 10,000그루 그리기 면접의 6문제다(2/2/2). 이 묶음으로 트랙 9가 30문제가 되었다. 해설마다 서로 겹치지 않는 "흔한 오해" 두 항목이 있다. 작성 단계 check-tests는 해답 8/8·7/7·7/7, 시작 코드 0/8·0/7·1/7이었다. 작성자는 Unity 6 매뉴얼(대부분 curl로 받은 원문 `.md`), Inigo Quilez의 거리 함수·smooth-min 글, Valve 2007 SDF 논문, Wikipedia(Percentile, Harmonic mean), CapFrameX 글 두 편, GPP Data Locality, Microsoft Learn, DirectX-Graphics-Samples ExecuteIndirect readme를 읽었다. 나무 메모리 수치는 정점당 32 B라는 가정에 기댄다. 커밋 `21accd8`로 배포했다.

**검수에서 확인한 것.** `extraSources` URL 54개 전부와 URP 안티에일리어싱·Rendering Debugger 페이지를 원문(Valve 논문 PDF 포함)으로 열었다. 파티클은 틀린 학습자 버전 12개가 실패하고, 역순 루프·요청마다 용량을 확인하는 버전은 통과했다. SDF는 원·상자·2차 smin(`k *= 4`, k = 블렌드 두께)이 Quilez 원본 코드와 일치했다(오타 "굽힌 → 구운"만 고쳤다). 파이프라인 면접의 URP·HDRP·Built-in 수치는 원문과 맞았다. 프레임 페이싱은 버그를 하나만 남겨도, 셋 중 둘만 고쳐도 실패했다. 나무 면접의 수치는 모두 다시 계산해 맞았다.

**틀려서 고친 것.** 파티클은 예시 둘에 수명이 적혀 있지 않아 넣었고, 매뉴얼은 "일부 파티클이 제거된다"고만 하므로 흔한 오해 하나를 매뉴얼에 관한 주장으로 바꿨다. 파이프라인 면접은 그림자 비용 주장의 잘못된 인용과 어느 파이프라인인지 밝히지 않은 Built-in 주장을 고쳤다. 셰이더 변형 과외는 퀴즈 2가 "192 → 36"을 정답으로 받았지만 192는 그대로이고 필터링 뒤의 수가 144 → 36이 된다. 대안 (가)는 72로 준다고 했지만 맞을 수 있는 모든 머티리얼을 지키려면 12조합, 즉 144가 필요해 줄어들지 않는다. 매뉴얼의 "only"도 과장되어 있었다. 해답을 돌려 수치를 확인한 뒤 모두 고쳤다. 프레임 페이싱의 그래프 증상은 틀렸다. 버그 시작 코드를 돌리면 로그가 매끈한 곡선이 아니라 평평하다가 계단식으로 올라간다. 이를 고쳤고, 채점표처럼 제약도 정렬 한 번을 요구하게 했으며, CapFrameX의 "평균" 방식이 이 문제의 1% low와 같다고 암시하지 않게 하고, 힌트 3이 순위 공식을 주지 않게 했다. 예산과 정확히 같은 프레임에 대한 테스트도 넣었다. 나무 면접은 정적 배칭 메모리에 대해 빌드 타임 페이지는 "추가 GPU 메모리", 런타임 페이지는 "추가 CPU 메모리"라고 해서 두 페이지가 다르며 설명이 없다고 밝혔다. "숲 전체를 한 번의 호출로"는 호출당 한도(1023/511)로, "콘솔(DX12·Vulkan)" 문구도 고쳤다.

**끝까지 확인하지 못한 것.** 키워드 하나짜리 `multi_compile`을 1로 세는 것은 연습 자체의 규칙으로 표시했다. 기존 `t9-interview-draw-call-batching`과는 겹치지 않는다고 판단했다.

## 최종 점검 (2026-11-23)

배포된 30문제 전체를 점검 에이전트 3개(10문제씩)가 차례로 다시 확인하고, 점검에 참여하지 않은 검증 에이전트 2개(15문제씩)가 그 변경을 다시 확인했다. 두 검증 모두 통과 판정을 냈다.

**한 일.** 흔한 오해가 없던 24문제에 "### 흔한 오해" 절을 넣고(출처나 .NET 8 실행으로 뒷받침), 모든 채점 항목·감점에 `sourceId`나 `basis`를 붙이고, `sourceRefs`가 4개를 넘던 문제(최대 11개)를 4개로 줄였다. 새 근거로 Direct3D 문서(sRGB·float→UNORM 변환 규칙, 래스터화, 출력 병합), D3D11.3 명세, 블록 압축 문서, dotnet/runtime release/8.0 `Vector3.cs`·`Matrix4x4.Impl.cs`(구현 사항으로 표시), DirectXMath `DirectXCollision.inl`, Vulkan·OpenGL 4.6 명세, CMU 15-362 S01·4·5강 슬라이드를 더했다.

**확인한 것.** 인용한 페이지를 모두 다시 받아 대조했다(Unity 6 매뉴얼·API 약 60쪽, Microsoft Learn, Quilez, Valve 논문, CapFrameX, Wikipedia 등). 로컬 .NET 8에서 숨은 테스트(모범 답안 통과·초기 코드 실패)와 본문 수치(영벡터 정규화 NaN, sRGB 대 pow 2.2, foreach 할당, 깊이 값 표, 밉 LOD, TransformNormal 결과 등)를 다시 실행했다. 커밋 전 `check-tests.js`를 판정 서버에서 전부 다시 돌려 통과했다.

**틀려서 고친 것.**
- 렌더 파이프라인 CPU/GPU: 프로파일러의 "Balanced"를 병목 종류로 설명했지만 실제로는 어느 쪽에도 묶이지 않은 프레임이라는 뜻이라 고쳤다. 불투명 깊이 테스트가 셰이딩을 아끼는 것은 가까운 물체를 먼저 그릴 때뿐이라는 점을 더했다.
- 오버드로·투명도: Unity는 불투명 물체를 대략적인 구간으로만 앞→뒤 정렬하고, PowerVR/Apple GPU에서는 기본으로 하지 않는다는 점을 넣었다(이 문제의 모바일 시나리오에 중요). 근거가 되지 않던 c2 출처를 CMU 5강으로 바꿨다.
- 드로우콜 배칭: "동적 배칭은 권장하지 않는다"를 "대부분의 경우 그렇고, 저사양 기기에서만 권장"으로 좁혔다.
- 깊이 버퍼 정밀도: Wikipedia의 공식은 내림을 쓰는데 반올림 규칙을 Wikipedia에 귀속했던 것을 Direct3D의 float→UNORM 규칙으로 바꿨다. "2⁻²⁴ = 1/16,777,215"를 "거의 같다"로 고쳤다.
- 후처리·안티에일리어싱: "MSAA는 픽셀당 한 번 셰이딩한다"를 기본(픽셀 빈도) 모드로 한정했다(D3D11.3 명세는 샘플 빈도도 허용). LOD·컬링 면접: CPU 비용 문장을 매뉴얼 표현에 맞추고, 마지막 LOD 너머의 컬링은 "추론"으로 표시했다.
- 그 밖에: 그림자 여드름 설명을 Microsoft 문서에 맞추고, 셰이더 변형 제거에 "Strip Unused Variants" 설정이 필요하다는 전제를 넣고, 영벡터 NaN 채점 항목의 출처를 .NET 8 소스로 바꾸고, Plane.Normalize가 D도 나눈다는 점을 실행으로 뒷받침했다.

**끝까지 확인하지 못한 것.** Unity 스프라이트 아틀라스의 실제 밉 필터는 확인하지 못해 해설에서 "모델"로 표시했다.
