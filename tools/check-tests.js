#!/usr/bin/env node
/* 문제 파일의 숨은 테스트(tests)를 실제 실행 서비스(Compiler Explorer)에서 검증합니다.
   각 문제에 대해 solutionCode는 전부 PASS, starterCode는 하나 이상 FAIL(또는 컴파일 실패)이어야 합니다.
   사용법: node tools/check-tests.js data/track1_csharp.json [문제 id] */
const fs = require('fs');
const COMPILERS = {
  csharp: { id: 'dotnet80csharpcoreclr', args: '' },
  cpp: { id: 'g132', args: '-std=c++17 -O1' },
};
const text = arr => (arr || []).map(x => x.text).join('\n');

async function run(language, source) {
  const c = COMPILERS[language];
  const res = await fetch(`https://godbolt.org/api/compiler/${c.id}/compile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ source, options: { userArguments: c.args, compilerOptions: { executorRequest: true }, filters: { execute: true } } }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  const built = !j.buildResult || j.buildResult.code === 0;
  return { built, didExecute: !!j.didExecute, timedOut: !!j.timedOut, code: j.code, stdout: text(j.stdout), stderr: text(j.stderr), buildErr: text(j.buildResult && j.buildResult.stderr) };
}
function parse(stdout, cases) {
  const seen = {};
  for (const line of stdout.split('\n')) {
    const m = line.match(/^\[(PASS|FAIL)\]\s+(.+?)(?:\s+::\s+(.*))?$/);
    if (m) seen[m[2].trim()] = { pass: m[1] === 'PASS', detail: m[3] || '' };
  }
  return (cases || Object.keys(seen)).map(name => ({ name, ...(seen[name] || { pass: false, detail: '(출력 없음 — 실행이 중단됨)' }) }));
}
(async () => {
  const file = process.argv[2], only = process.argv[3];
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let bad = 0;
  for (const p of data.problems) {
    if (!p.tests || !p.tests.template || (only && p.id !== only)) continue;
    if (!p.tests.template.includes('{{USER_CODE}}')) { console.log(`✗ ${p.id}: template에 {{USER_CODE}}가 없습니다`); bad++; continue; }
    for (const [label, code] of [['solution', p.solutionCode], ['starter', p.starterCode]]) {
      const r = await run(p.language, p.tests.template.replace('{{USER_CODE}}', () => code));
      const cases = r.built ? parse(r.stdout, p.tests.cases) : [];
      const passed = cases.filter(c => c.pass).length;
      const ok = label === 'solution' ? (r.built && cases.length > 0 && passed === cases.length) : (!r.built || passed < cases.length);
      if (!ok) bad++;
      console.log(`${ok ? '✓' : '✗'} ${p.id} [${label}] built=${r.built} executed=${r.didExecute} timedOut=${r.timedOut} ${passed}/${cases.length}`);
      if (!r.built) console.log('   build error: ' + r.buildErr.split('\n').slice(0, 6).join('\n   '));
      cases.filter(c => !c.pass).forEach(c => console.log(`   FAIL ${c.name} :: ${c.detail}`));
      if (r.built && r.stderr) console.log('   stderr: ' + r.stderr.split('\n').slice(0, 4).join(' | '));
      await new Promise(s => setTimeout(s, 1500));
    }
  }
  console.log(bad ? `문제 있음: ${bad}건` : '모든 테스트 검증 통과');
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
