'use strict';
/* 구독 중인 AI(Gemini·Claude 앱)에 붙여넣을 프롬프트를 조립합니다. 이 앱은 AI를 직접 호출하지 않습니다. */
const PromptBuilder = (() => {
  const MODE_NAME = { tutoring: '과외·개념', interview: '압박 면접', debugging: '디버깅', implementation: '실전 구현' };
  const list = arr => (arr && arr.length ? arr.map(x => `- ${x}`).join('\n') : '- (없음)');
  const fence = (code, lang) => '```' + (lang && lang !== 'none' ? lang : '') + '\n' + String(code).replace(/\s+$/, '') + '\n```';
  const srcLine = (id, sources) => { const s = sources && sources[id]; return s ? `- [${id}] ${s.title} — ${s.url}` : `- [${id}]`; };

  /* 내 답안 + 공식 채점표 시니어 리뷰 요청 */
  function review(p, answer, memo, sources, judgeSummary) {
    const isCode = (p.mode === 'debugging' || p.mode === 'implementation' || (p.mode === 'tutoring' && p.starterCode)) && p.language !== 'none';
    const rb = p.rubric && Array.isArray(p.rubric.criteria) ? p.rubric : null;
    const ids = new Set(p.sourceRefs || []);
    if (rb) [...rb.criteria, ...(rb.criticalDeductions || [])].forEach(c => c.sourceId && ids.add(c.sourceId));
    const out = [
      '너는 시니어 게임 클라이언트 프로그래머이자 기술 면접관이야. 아래 문제에 대한 내 답안을 주니어 게임 프로그래머 채용 기준으로 엄격하게 채점하고 리뷰해 줘. 한국어로 답해.',
      '',
      '## 채점 규칙 (반드시 지킬 것)',
      '- 반드시 아래에 첨부된 공식 채점표(Rubric)와 공식 문서 근거에만 기반해 항목별 점수와 감점 사유를 판정해. 근거 없는 추측은 하지 마.',
      '- 채점표에 없는 기준으로 점수를 주거나 깎지 마. 채점표 밖의 의견은 "추가 의견"으로 따로 적어.',
      '- 확실하지 않은 엔진·언어 동작은 단정하지 말고, 어느 공식 문서를 확인해야 하는지 말해 줘.',
      '- 내 답안이 틀렸다면 완성 코드를 바로 주지 말고, 틀린 지점과 반례 입력을 먼저 짚어 줘. 내가 "정답 보여 줘"라고 하면 그때 보여 줘.',
      '',
      `## 문제: ${p.title}`,
      `- 트랙: ${p.trackName || p.track} / 모드: ${MODE_NAME[p.mode] || p.mode} / 난이도: ${p.difficulty}`,
      `- 태그: ${(p.tags || []).join(', ')}`,
      '',
      '### 시나리오', p.scenario, '',
      '### 제약 조건', list(p.constraints), '',
      '### 엣지 케이스', list(p.edgeCases), '',
    ];
    if (p.starterCode) out.push('### 주어진 초기 코드', fence(p.starterCode, p.language), '');
    if (p.mode === 'interview' && p.followUps && p.followUps.length) out.push('### 예정된 꼬리질문', p.followUps.map((f, i) => `${i + 1}. ${f.question}`).join('\n'), '');
    if (rb) {
      out.push('## 공식 채점표 (100점 만점)',
        '| ID | 분류 | 채점 기준 | 배점 | 근거 |', '|---|---|---|---|---|',
        ...rb.criteria.map(c => `| ${c.id} | ${c.category} | ${String(c.description).replace(/\|/g, '/')} | ${c.points} | ${c.sourceId || '-'} |`), '');
      if ((rb.criticalDeductions || []).length) out.push('### 치명적 감점 (해당하면 차감)',
        ...rb.criticalDeductions.map(d => `- ${d.id}: ${d.description} (${d.penalty}점${d.sourceId ? `, 근거 ${d.sourceId}` : ''})`), '');
      out.push('### 등급', '- 85점 이상: Pass · Senior Ready / 60~84점: Borderline · 복습 권장 / 59점 이하: Retry · 오답노트 필수', '');
    } else if ((p.reviewCriteria || []).length) {
      out.push('## 평가 기준', list(p.reviewCriteria), '');
    }
    if (ids.size) out.push('## 공식 문서 근거', ...[...ids].map(id => srcLine(id, sources)), '');
    out.push(isCode ? '## 내가 작성한 코드' : '## 내가 작성한 답변',
      String(answer || '').trim() ? (isCode ? fence(answer, p.language) : String(answer).trim()) : '(아직 작성하지 않음 — 채점하지 말고, 어떻게 접근해야 할지 질문으로만 유도해 줘)', '');
    if (judgeSummary) out.push('## 실행 채점 결과 (숨은 테스트를 실제로 실행한 결과 — 사실로 취급)', judgeSummary, '');
    if (memo && memo.trim()) out.push('## 내가 헷갈린 점', memo.trim(), '');
    out.push('## 출력 형식',
      rb ? '1. 채점표: 항목 ID별로 [획득 점수 / 배점]과 한 줄 사유 (내 답안의 어느 줄·어느 문장이 근거인지)\n2. 치명적 감점: 해당 여부와 사유\n3. 총점과 등급\n4. 놓친 엣지 케이스와 반례 입력\n5. 다음 리팩토링·복습 챌린지 1개\n6. 드러난 취약 개념 태그 1~3개'
         : '1. 강점\n2. 놓친 엣지 케이스·부정확한 부분\n3. 다음 복습 챌린지 1개\n4. 드러난 취약 개념 태그 1~3개');
    return out.join('\n');
  }

  /* 검증 자료 기반 새 문제 JSON 생성 요청 */
  function newProblem(o) {
    const lang = o.language || 'csharp';
    const srcs = o.sources || [];
    const srcIds = srcs.length ? srcs.map(s => s.id) : ['sources.json의 id'];
    return [
      '너는 시니어 게임 클라이언트 프로그래머이자 기술 교육 콘텐츠 검수자야. 내 학습 웹앱의 문제은행에 추가할 문제 1개를 아래 JSON 스키마에 정확히 맞춰 만들어 줘.',
      '',
      '## 요청',
      `- 트랙: ${o.trackName} ("track": "${o.track}")`,
      `- 모드: ${MODE_NAME[o.mode]} ("mode": "${o.mode}")`,
      `- 난이도: ${o.difficulty}`,
      `- 주제: ${o.topic || '(트랙 범위 안에서 실무 빈도가 높은 주제를 골라 줘)'}`,
      '',
      '## 근거로 삼을 검증 자료',
      srcs.length ? srcs.map(s => `- [${s.id}] ${s.title} — ${s.url}\n  ${s.summary || ''}`).join('\n') : '- (선택한 자료 없음 — 공식 문서를 직접 찾아 근거로 삼고, 그 URL을 답변 끝에 따로 알려 줘)',
      '',
      '## 반드시 지킬 것',
      '1. 위 자료를 실제로 열어 사실을 확인한 뒤, 거기서 확인되는 기술 사실에만 근거해 문제·해설·채점표를 써. 확인하지 못한 내용은 쓰지 마.',
      '2. 추상적인 코딩 테스트가 아니라 실제 게임 기능(전투, 스킬, 인벤토리, AI, UI, 투사체 등) 시나리오로 만들어.',
      '3. 존재하지 않거나 폐기된 API를 지어내지 마. 버전에 따라 동작이 다르면 가정한 버전을 scenario에 적어.',
      '4. starterCode와 solutionCode는 컴파일되는 코드여야 하고, 디버깅 문제의 버그는 주석으로 흘리지 마.',
      '5. hints는 정확히 3단계: ① 개념·반례 ② 문제 지점 축소(수정 코드 금지) ③ 핵심을 비운 의사코드·구조.',
      '6. rubric.criteria는 학습자가 자기 답안을 보고 예/아니오로 체크할 수 있는 구체적 기준으로 쓰고, 배점 합계는 정확히 100점(정확성 35 / 메모리·성능 30 / 엔진·언어 규약 20 / 아키텍처·가독성 15).',
      '7. rubric.criticalDeductions에는 실무에서 즉시 반려되는 실수 2~3개를 -10 ~ -30점으로 적어.',
      `8. sourceRefs와 각 sourceId에는 다음 ID만 써: ${srcIds.join(', ')}`,
      '9. 학습자에게 보이는 글은 한국어로. 출력은 설명 없이 JSON 객체 하나만, ```json 코드 블록으로.',
      '',
      '## JSON 스키마 (모든 필드 필수)',
      '```json',
      JSON.stringify({
        id: `${o.track.replace('rack', '')}-${o.mode.slice(0, 5)}-짧은-영문-슬러그`,
        track: o.track,
        mode: o.mode,
        difficulty: o.difficulty,
        title: '문제 제목',
        tags: [`${o.tagPrefix || 'Prefix_'}Topic_Detail`],
        language: o.mode === 'interview' ? 'none' : lang,
        sourceRefs: srcIds,
        scenario: '게임 실무 배경과 할 일 (마크다운). 면접 모드는 여기에 메인 질문을 굵게 포함',
        constraints: ['제약 조건 (면접 모드는 빈 배열 가능)'],
        starterCode: '버그 코드 또는 스타터 인터페이스 (면접 모드는 빈 문자열)',
        edgeCases: ['점검할 엣지 케이스 2~5개'],
        hints: ['힌트 1단계', '힌트 2단계', '힌트 3단계'],
        followUps: [{ question: '꼬리질문', intent: '면접관의 의도', keyAnswer: '모범 답변 핵심' }],
        concept: '과외 모드 전용 개념 카드 (그 외 빈 문자열)',
        quiz: [{ question: '과외 모드 전용 셀프 체크', answer: '해설' }],
        solutionCode: '모범 코드 (면접 모드는 빈 문자열 가능)',
        explanation: '공식 문서 원리에 근거한 시니어 해설 (마크다운)',
        rubric: {
          criteria: [{ id: 'c1', category: '정확성', description: '검증 가능한 구체적 기준', points: 35, sourceId: srcIds[0] }],
          criticalDeductions: [{ id: 'd1', description: '치명적 감점 항목', penalty: -20, sourceId: srcIds[0] }],
        },
        nextMission: '다음 복습 미션 1개',
      }, null, 2),
      '```',
      '- 모드별 규칙: debugging/implementation은 hints 3개와 followUps 빈 배열, interview는 followUps 정확히 3개(점점 깊어지게)와 hints 빈 배열, tutoring은 concept와 quiz 1~2개를 채워.',
      '- difficulty는 "Easy"(개념 하나, 10~15분), "Medium"(개념 2~3개 결합 또는 엣지 케이스 중심), "Hard"(성능 제약·설계 트레이드오프·복합 버그) 중 하나.',
      '- category는 "정확성", "메모리·성능", "엔진·언어 규약", "아키텍처·가독성" 네 가지만 써.',
      `- tags 접두사: ${o.tagPrefix || 'Topic_'}`,
    ].join('\n');
  }

  return { review, newProblem, MODE_NAME };
})();
