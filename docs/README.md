# 문서

GameDev Mentor의 문제를 어떻게 만들고 검증했는지 남긴 문서입니다. 모두 한국어로 씁니다.

| 문서 | 내용 | 만드는 방법 |
|---|---|---|
| [STANDARDS.md](STANDARDS.md) | 작성·검수 기준: 출처 우선순위, 문제 형식과 난이도, 채점표, "흔한 오해", 실행 채점 규칙, 검수 절차, 저작권·보안 | 손으로 작성 |
| [SOURCES.md](SOURCES.md) | 검증 자료 목록(공통 자료와 트랙별 추가 자료)과 자료마다 인용한 문제 | `node tools/build-docs.js`로 자동 생성 |
| [VERIFICATION.md](VERIFICATION.md) | 요약 통계와 문제별 검증 기록(검증 수준·날짜·메모·근거·실행 채점 여부) | `node tools/build-docs.js`로 자동 생성 |
| [OPEN_ISSUES.md](OPEN_ISSUES.md) | 끝까지 확인하지 못한 것, 판단을 미룬 것, 알려진 한계(문제 id별) | 손으로 작성 |
| [reviews/](reviews/) | 트랙별·묶음별 검수 요약: 무엇을 만들었고, 무엇을 확인했고, 무엇을 고쳤고, 무엇을 확인하지 못했는지 | 손으로 작성 |

## 트랙별 검수 기록

- [트랙 1](reviews/track1.md)
- [트랙 2](reviews/track2.md)
- [트랙 3](reviews/track3.md)
- [트랙 4](reviews/track4.md)
- [트랙 5](reviews/track5.md)
- [트랙 6](reviews/track6.md)
- [트랙 7](reviews/track7.md)
- [트랙 8](reviews/track8.md)
- [트랙 9](reviews/track9.md)
- [트랙 10](reviews/track10.md)

자동 생성 문서는 데이터가 바뀌면 다시 만듭니다. 배포 스크립트도 배포할 때마다 다시 만듭니다.

```
node tools/build-docs.js
```
