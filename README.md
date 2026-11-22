# GameDev Mentor

주니어 게임 프로그래머를 위한 클릭형 학습 웹앱(PWA)입니다. 명령어를 외울 필요 없이 기기 · 트랙 · 모드를 눌러 고르면 과외, 압박 면접, 디버깅, 실전 구현 세션이 시작됩니다.

**바로 쓰기:** https://juwon-cha.github.io/gamedev-mentor/ (휴대폰에서는 브라우저 메뉴의 "홈 화면에 추가")

## 기능

- 4개 트랙: C# 핵심 & 메모리/GC, C++ 기초 & 메모리 모델, 게임 알고리즘·자료구조, Unity 엔진 & 아키텍처
- 4개 모드: 과외, 압박 면접(꼬리질문 3단계 이상), 디버깅, 실전 구현(직접 코딩 후 시니어 리뷰)
- 힌트 1·2·3단계 버튼, 포기 전에는 정답 코드를 주지 않는 시스템 프롬프트
- 줄 번호·Tab 들여쓰기 코드 에디터, 스타터 코드 채우기, 태블릿/PC 분할 화면
- 이미지(Profiler 스크린샷) 첨부, 레퍼런스 파일(.md .cs .cpp .txt) 첨부
- 취약점 트래커: 세션 끝에 오답노트 생성 → 취약 태그 누적 → 변형 문제 출제, JSON 내보내기/불러오기, Google Docs용 마크다운 복사
- 다크/라이트 전환

## AI 연결 방식

| 방식 | 준비물 | 동작 |
|---|---|---|
| Gemini API 자동 모드 | Google AI Studio API 키 | 버튼을 누르면 앱 안에서 바로 출제·힌트·리뷰 |
| 프롬프트 복사 모드 | 없음 | 앱이 만든 프롬프트를 복사해 Gemini 앱에 붙여넣기 |

API 키와 학습 기록은 각 기기의 브라우저(localStorage)에만 저장됩니다. 이 저장소에는 키가 들어 있지 않습니다.

## 구조

빌드 과정이 없는 정적 사이트입니다. 모든 경로가 상대 경로라 GitHub Pages 프로젝트 사이트에서 그대로 동작합니다.

```
index.html      화면 구조
styles.css      테마와 레이아웃
prompts.js      트랙·모드·주제 데이터와 시스템 프롬프트 (출제 성향은 여기서 수정)
app.js          앱 로직
manifest.json   PWA 설정
sw.js           오프라인 캐시
icons/          앱 아이콘
```

## 로컬 실행

```
python -m http.server 5173
```

브라우저에서 http://localhost:5173 을 엽니다.

## 배포

`main` 브랜치에 푸시하면 GitHub Pages(Settings → Pages → Deploy from a branch → main / root)가 반영합니다. `sw.js`의 `CACHE` 값을 올리면 예전 캐시가 정리됩니다.
