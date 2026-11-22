#!/usr/bin/env node
/* data/의 문제 파일에서 docs/SOURCES.md와 docs/VERIFICATION.md를 만듭니다. (Node 18+, 의존성 없음)
   사용법: node tools/build-docs.js
   정렬 순서가 고정되어 있고 생성 날짜를 넣지 않으므로, 데이터가 같으면 결과도 같습니다. */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data'), docsDir = path.join(root, 'docs');
const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const registry = readJson(path.join(dataDir, 'sources.json')).sources;
const trackList = readJson(path.join(dataDir, 'tracks.json')).tracks;
const MODE = { tutoring: '과외·개념', interview: '압박 면접', debugging: '디버깅', implementation: '실전 구현' };
const DIFF = { Easy: '쉬움', Medium: '보통', Hard: '어려움' };
const LEVEL = { executed: '실행 검증', reviewed: '문서 대조' };
const Q = '\u0060';
const code = s => Q + s + Q;
const cell = s => String(s == null ? '' : s).replace(/\r?\n+/g, ' ').replace(/\|/g, '\\|').trim();
const link = (title, url) => '[' + cell(title).replace(/[\[\]]/g, '') + '](' + String(url).replace(/[()\s]/g, c => encodeURIComponent(c)) + ')';
const pct = (a, b) => b ? (Math.round((a / b) * 1000) / 10).toFixed(1) + '%' : '-';
const trackNo = id => Number(String(id).replace(/\D/g, '')) || 0;
const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

const tracks = trackList.slice().sort((a, b) => trackNo(a.id) - trackNo(b.id)).map(t => {
  const j = readJson(path.join(dataDir, path.basename(t.file)));
  return { id: t.id, short: t.short || j.trackName || t.id, file: path.basename(t.file), extra: j.extraSources || [], problems: j.problems || [] };
});

/* ---------- 인용 집계 ---------- */
const regIds = new Set(registry.map(s => s.id));
// 키: 공통 자료는 id, 트랙 추가 자료는 "트랙id::자료id"
const keyFor = (t, id) => (regIds.has(id) ? id : t.id + '::' + id);
const cites = new Map();
const addCite = (key, pid) => { if (!cites.has(key)) cites.set(key, new Set()); cites.get(key).add(pid); };
for (const t of tracks) for (const p of t.problems) {
  const ids = new Set(p.sourceRefs || []);
  const rb = p.rubric || {};
  for (const c of (rb.criteria || []).concat(rb.criticalDeductions || [])) if (c.sourceId) ids.add(c.sourceId);
  for (const id of ids) addCite(keyFor(t, id), p.id);
}
const citeCell = key => { const s = [...(cites.get(key) || [])].sort(); return s.length + (s.length ? ' — ' + s.map(code).join(', ') : ''); };

/* ---------- SOURCES.md ---------- */
let S = '# 검증 자료 목록\n\n';
S += '> 이 문서는 `node tools/build-docs.js`가 `data/sources.json`과 트랙 파일의 `extraSources`에서 자동으로 만듭니다. 직접 고치지 마세요.\n\n';
S += '"인용 문제"는 그 자료를 문제의 `sourceRefs`나 채점표(`rubric.criteria[]`, `rubric.criticalDeductions[]`)의 `sourceId`로 인용한 문제 수와 문제 id입니다. 자료를 고르는 기준과 출처 우선순위는 [STANDARDS.md](STANDARDS.md)에 있습니다.\n\n';
S += '## 공통 자료 (`data/sources.json`, ' + registry.length + '개)\n\n';
S += '| id | 제목 | 종류 | 트랙 | 인용 문제 |\n|---|---|---|---|---|\n';
for (const s of registry.slice().sort(byId)) {
  S += '| ' + code(s.id) + ' | ' + link(s.title, s.url) + ' | ' + cell(s.kind) + ' | ' + cell((s.tracks || []).join(', ')) + ' | ' + citeCell(s.id) + ' |\n';
}
for (const t of tracks) {
  const extra = t.extra.filter(s => !regIds.has(s.id)).slice().sort(byId);
  const shadow = t.extra.filter(s => regIds.has(s.id)).map(s => s.id).sort();
  S += '\n## ' + cell(t.short) + ' 추가 자료 (`data/' + t.file + '`의 `extraSources`, ' + extra.length + '개)\n\n';
  if (shadow.length) S += '공통 자료와 같은 id로 다시 선언한 항목(주소가 같으므로 위 표에서 집계): ' + shadow.map(code).join(', ') + '\n\n';
  if (!extra.length) { S += '없음\n'; continue; }
  S += '| id | 제목 | 종류 | 트랙 | 인용 문제 |\n|---|---|---|---|---|\n';
  for (const s of extra) S += '| ' + code(s.id) + ' | ' + link(s.title, s.url) + ' | ' + cell(s.kind || '트랙 추가 자료') + ' | ' + t.id + ' | ' + citeCell(t.id + '::' + s.id) + ' |\n';
}

/* ---------- VERIFICATION.md ---------- */
const all = tracks.flatMap(t => t.problems.map(p => ({ t, p })));
const stat = list => {
  const r = { n: list.length, executed: 0, reviewed: 0, none: 0, tests: 0, misc: 0, crit: 0, critSrc: 0, ded: 0, dedSrc: 0, principle: 0, basisTests: 0, noBasis: 0 };
  for (const { p } of list) {
    const lv = p.verified && p.verified.level;
    if (lv === 'executed') r.executed++; else if (lv === 'reviewed') r.reviewed++; else r.none++;
    if (p.tests) r.tests++;
    if (/###\s*흔한 오해/.test(p.explanation || '')) r.misc++;
    const rb = p.rubric || {};
    for (const c of rb.criteria || []) { r.crit++; if (c.sourceId) r.critSrc++; }
    for (const d of rb.criticalDeductions || []) { r.ded++; if (d.sourceId) r.dedSrc++; }
    for (const c of (rb.criteria || []).concat(rb.criticalDeductions || [])) {
      if (c.basis === 'principle') r.principle++;
      if (c.basis === 'tests') r.basisTests++;
      if (!c.sourceId && !c.basis) r.noBasis++;
    }
  }
  return r;
};
const tot = stat(all);
let V = '# 문제별 검증 기록\n\n';
V += '> 이 문서는 `node tools/build-docs.js`가 트랙 파일에서 자동으로 만듭니다. 직접 고치지 마세요. 검증 수준과 절차의 뜻은 [STANDARDS.md](STANDARDS.md)에 있습니다.\n\n';
V += '## 요약\n\n';
V += '- 전체 문제: **' + tot.n + '개**\n';
V += '- 검증 수준: 실행 검증(`executed`) ' + tot.executed + '개 · 문서 대조(`reviewed`) ' + tot.reviewed + '개' + (tot.none ? ' · 미검증 ' + tot.none + '개' : '') + '\n';
V += '- 실행 채점(숨은 테스트) 문제: ' + tot.tests + '개\n';
V += '- "흔한 오해" 절이 있는 문제: ' + tot.misc + '개\n';
V += '- 채점 항목 중 `sourceId`가 붙은 비율: ' + tot.critSrc + '/' + tot.crit + ' (' + pct(tot.critSrc, tot.crit) + ')\n';
V += '- 치명적 감점 중 `sourceId`가 붙은 비율: ' + tot.dedSrc + '/' + tot.ded + ' (' + pct(tot.dedSrc, tot.ded) + ')\n';
V += '- `basis`별 항목 수(채점 항목 + 감점): 일반 원칙(`principle`) ' + tot.principle + ' · 테스트로 확인(`tests`) ' + tot.basisTests + ' · 근거 표시 없음 ' + tot.noBasis + '\n\n';
V += '| 트랙 | 문제 | 실행 검증 | 문서 대조 | 실행 채점 | 흔한 오해 | 채점 항목 sourceId | 감점 sourceId | principle | tests | 근거 표시 없음 |\n|---|---|---|---|---|---|---|---|---|---|---|\n';
for (const t of tracks) {
  const r = stat(all.filter(x => x.t === t));
  V += '| ' + cell(t.short) + ' | ' + r.n + ' | ' + r.executed + ' | ' + r.reviewed + ' | ' + r.tests + ' | ' + r.misc + ' | ' + r.critSrc + '/' + r.crit + ' | ' + r.dedSrc + '/' + r.ded + ' | ' + r.principle + ' | ' + r.basisTests + ' | ' + r.noBasis + ' |\n';
}
for (const t of tracks) {
  V += '\n## ' + cell(t.short) + ' (`data/' + t.file + '`, ' + t.problems.length + '문제)\n\n';
  V += '| id | 제목 | 모드 | 난이도 | 검증 수준 | 검증 날짜 | 검증 메모 | 근거 id | 실행 채점 |\n|---|---|---|---|---|---|---|---|---|\n';
  for (const p of t.problems) {
    const v = p.verified || {};
    V += '| ' + code(p.id) + ' | ' + cell(p.title) + ' | ' + (MODE[p.mode] || cell(p.mode)) + ' | ' + (DIFF[p.difficulty] || cell(p.difficulty)) + ' | ' + (LEVEL[v.level] || '미검증') + ' | ' + cell(v.date) + ' | ' + cell(v.note) + ' | ' + (p.sourceRefs || []).map(code).join(', ') + ' | ' + (p.tests ? '예 (' + (p.tests.cases || []).length + '케이스)' : '아니오') + ' |\n';
  }
}

fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(path.join(docsDir, 'SOURCES.md'), S);
fs.writeFileSync(path.join(docsDir, 'VERIFICATION.md'), V);
console.log('docs/SOURCES.md, docs/VERIFICATION.md 생성 (문제 ' + tot.n + '개, 공통 자료 ' + registry.length + '개)');
