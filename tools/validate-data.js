#!/usr/bin/env node
/* 문제 파일의 스키마·채점표 합계·출처 ID를 검사합니다. (Node 18+)
   사용법: node tools/validate-data.js            → data/의 모든 트랙 파일
           node tools/validate-data.js <파일>...  → 지정한 파일만
           --strict-basis  채점 항목·치명적 감점마다 sourceId나 basis 중 하나를 요구 */
const fs = require('fs'), path = require('path');
const dataDir = path.join(__dirname, '..', 'data');
const regList = JSON.parse(fs.readFileSync(path.join(dataDir, 'sources.json'), 'utf8')).sources;
const reg = new Set(regList.map(s => s.id));
const regUrl = Object.fromEntries(regList.map(s => [s.id, s.url]));
const tracks = JSON.parse(fs.readFileSync(path.join(dataDir, 'tracks.json'), 'utf8')).tracks;
const args = process.argv.slice(2), strictBasis = args.includes('--strict-basis'), fileArgs = args.filter(a => a !== '--strict-basis');
const BASIS = ['principle', 'tests'];
const files = fileArgs.length ? fileArgs : fs.readdirSync(dataDir).filter(f => /^track\d+_.*\.json$/.test(f)).map(f => path.join(dataDir, f));
const CATS = { '정확성': 35, '메모리·성능': 30, '엔진·언어 규약': 20, '아키텍처·가독성': 15 };
const MODES = ['tutoring', 'interview', 'debugging', 'implementation'];
const ids = new Set(); let bad = 0, count = 0;
for (const file of files) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8')), f = path.basename(file);
  const extra = new Set((j.extraSources || []).map(s => s.id));
  const known = id => reg.has(id) || extra.has(id);
  for (const s of j.extraSources || []) if (regUrl[s.id] && regUrl[s.id] !== s.url) { console.log(`${f}: extraSources id ${s.id}가 sources.json의 같은 id와 다른 주소를 가리킴`); bad++; }
  const tr = tracks.find(t => t.id === j.track);
  if (!tr) { console.log(`${f}: tracks.json에 없는 트랙 ${j.track}`); bad++; }
  for (const s of j.extraSources || []) if (!s.id || !s.title || !/^https?:\/\//.test(s.url || '')) { console.log(`${f}: extraSources 항목 오류 ${s.id}`); bad++; }
  for (const p of j.problems || []) {
    count++;
    const e = m => { console.log(`${f} ${p.id}: ${m}`); bad++; };
    if (ids.has(p.id)) e('id 중복'); ids.add(p.id);
    for (const k of ['track', 'mode', 'difficulty', 'title', 'tags', 'language', 'sourceRefs', 'scenario', 'constraints', 'starterCode', 'edgeCases', 'hints', 'followUps', 'solutionCode', 'explanation', 'rubric', 'nextMission']) if (p[k] === undefined) e(`필드 없음: ${k}`);
    if (p.tests === undefined) e('필드 없음: tests (없으면 null)');
    if (p.track !== j.track) e('track 불일치');
    if (!MODES.includes(p.mode)) e(`mode 값 오류: ${p.mode}`);
    if (!['Easy', 'Medium', 'Hard'].includes(p.difficulty)) e(`difficulty 값 오류: ${p.difficulty}`);
    if (!['csharp', 'cpp', 'none'].includes(p.language)) e(`language 값 오류: ${p.language}`);
    if (tr && tr.tagPrefix && !(p.tags || []).length) e('tags 비어 있음');
    if (['debugging', 'implementation'].includes(p.mode) && (p.hints || []).length !== 3) e('hints는 3개여야 함');
    if (p.mode === 'interview' && (p.followUps || []).length !== 3) e('followUps는 3개여야 함');
    if (p.mode === 'tutoring' && (!p.concept || !(p.quiz || []).length)) e('tutoring은 concept와 quiz 필요');
    if (!(p.sourceRefs || []).length) e('sourceRefs 비어 있음');
    (p.sourceRefs || []).forEach(id => known(id) || e(`알 수 없는 출처: ${id}`));
    const rb = p.rubric || {}, crit = rb.criteria || [];
    const sum = crit.reduce((a, c) => a + c.points, 0);
    if (sum !== 100) e(`채점표 합계 ${sum} (100이어야 함)`);
    for (const [cat, pts] of Object.entries(CATS)) { const s = crit.filter(c => c.category === cat).reduce((a, c) => a + c.points, 0); if (s !== pts) e(`${cat} 배점 ${s} (${pts}이어야 함)`); }
    const cid = new Set();
    crit.forEach(c => { if (!(c.category in CATS)) e(`category 오류: ${c.category}`); if (cid.has(c.id)) e(`criteria id 중복: ${c.id}`); cid.add(c.id); if (c.sourceId && !known(c.sourceId)) e(`알 수 없는 sourceId: ${c.sourceId}`); });
    const checkBasis = (c, k) => { if (c.basis !== undefined && !BASIS.includes(c.basis)) e(`${k} ${c.id}: basis 값 오류 ${c.basis} (principle 또는 tests)`); if (c.basis === 'tests' && !p.tests) e(`${k} ${c.id}: basis가 tests인데 문제에 tests가 없음`); if (strictBasis && !c.sourceId && !c.basis) e(`${k} ${c.id}: sourceId나 basis가 필요함`); };
    crit.forEach(c => checkBasis(c, '채점 항목'));
    const ded = rb.criticalDeductions || [];
    if (ded.length < 2 || ded.length > 3) e(`criticalDeductions ${ded.length}개 (2~3개)`);
    ded.forEach(d => { if (!(d.penalty <= -10 && d.penalty >= -30)) e(`penalty 범위 오류: ${d.penalty}`); if (d.sourceId && !known(d.sourceId)) e(`알 수 없는 sourceId: ${d.sourceId}`); checkBasis(d, '감점'); });
    if (p.tests) {
      if (typeof p.tests.template !== 'string' || p.tests.template.split('{{USER_CODE}}').length !== 2) e('tests.template에 {{USER_CODE}}가 정확히 1개 있어야 함');
      if (!(p.tests.cases || []).length) e('tests.cases 비어 있음');
      if (p.language === 'none') e('tests가 있는데 language가 none');
    }
  }
}
console.log(bad ? `문제 있음: ${bad}건 (문제 ${count}개 검사)` : `모두 유효 (문제 ${count}개)`);
process.exit(bad ? 1 : 0);
