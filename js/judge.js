'use strict';
/* 실행 채점: 내 코드를 문제의 숨은 테스트(tests.template)에 끼워 넣어 Compiler Explorer(godbolt.org)에서
   컴파일·실행하고, 표준 출력의 [PASS]/[FAIL] 줄을 읽어 결과를 만듭니다. AI는 쓰지 않습니다.
   컴파일러 설정은 tools/check-tests.js와 같아야 합니다. */
const Judge = (() => {
  const COMPILERS = {
    csharp: { id: 'dotnet80csharpcoreclr', args: '', label: '.NET 8' },
    cpp: { id: 'g132', args: '-std=c++17 -O1', label: 'GCC 13.2 · C++17' },
  };
  const ENDPOINT = 'https://godbolt.org/api/compiler';
  const text = arr => (arr || []).map(x => x.text).join('\n');
  const can = p => !!(p && p.tests && typeof p.tests.template === 'string' && p.tests.template.includes('{{USER_CODE}}') && COMPILERS[p.language]);
  const info = p => COMPILERS[p.language];

  function parse(stdout, cases) {
    const seen = {};
    for (const line of String(stdout).split('\n')) {
      const m = line.match(/^\[(PASS|FAIL)\]\s+(.+?)(?:\s+::\s+(.*))?$/);
      if (m) seen[m[2].trim()] = { pass: m[1] === 'PASS', detail: m[3] || '' };
    }
    const names = cases && cases.length ? cases : Object.keys(seen);
    return names.map(name => ({ name, ...(seen[name] || { pass: false, detail: '결과가 출력되지 않았습니다. 실행이 중간에 멈췄을 수 있습니다.' }) }));
  }

  /* 반환: { status: 'done'|'build'|'timeout'|'network', cases, passed, total, message } */
  async function run(p, code) {
    const c = COMPILERS[p.language];
    let j;
    try {
      const res = await fetch(`${ENDPOINT}/${c.id}/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ source: p.tests.template.replace('{{USER_CODE}}', () => code), options: { userArguments: c.args, compilerOptions: { executorRequest: true }, filters: { execute: true } } }),
      });
      if (!res.ok) return { status: 'network', cases: [], passed: 0, total: 0, message: `실행 서비스가 요청을 거절했습니다 (HTTP ${res.status}). 잠시 뒤 다시 시도하세요.` };
      j = await res.json();
    } catch {
      return { status: 'network', cases: [], passed: 0, total: 0, message: '실행 서비스에 연결하지 못했습니다. 인터넷 연결을 확인하세요. 실행 채점은 온라인에서만 됩니다.' };
    }
    if (j.buildResult && j.buildResult.code !== 0) {
      return { status: 'build', cases: [], passed: 0, total: (p.tests.cases || []).length, message: text(j.buildResult.stderr) || text(j.buildResult.stdout) || '컴파일에 실패했습니다.' };
    }
    const cases = parse(text(j.stdout), p.tests.cases);
    const passed = cases.filter(x => x.pass).length;
    if (j.timedOut) return { status: 'timeout', cases, passed, total: cases.length, message: '실행 시간이 제한을 넘었습니다. 무한 루프나 지나치게 느린 연산이 없는지 확인하세요.' };
    return { status: 'done', cases, passed, total: cases.length, message: j.code !== 0 ? `프로그램이 종료 코드 ${j.code}로 끝났습니다.\n${text(j.stderr)}`.trim() : '' };
  }

  function render(r, h) {
    if (!r) return '';
    if (r.status === 'network') return `<div class="jr jr-bad"><b>실행하지 못했습니다</b><p>${h.esc(r.message)}</p></div>`;
    if (r.status === 'build') return `<div class="jr jr-bad"><b>컴파일 실패</b><p class="small">시그니처(클래스·메서드 이름과 매개변수)를 바꾸지 않았는지도 확인하세요.</p><pre>${h.esc(r.message.slice(0, 3000))}</pre></div>`;
    const all = r.total > 0 && r.passed === r.total;
    return `<div class="jr ${all ? 'jr-ok' : 'jr-bad'}"><b>테스트 ${r.passed} / ${r.total} 통과${all ? ' — 모두 통과' : ''}</b>
      <ul>${r.cases.map(c => `<li class="${c.pass ? 'ok' : 'no'}"><span>${c.pass ? '통과' : '실패'}</span><code>${h.esc(c.name)}</code>${c.detail ? `<em>${h.esc(c.detail)}</em>` : ''}</li>`).join('')}</ul>
      ${r.message ? `<pre>${h.esc(r.message.slice(0, 2000))}</pre>` : ''}</div>`;
  }
  function summary(r) {
    if (!r) return '';
    if (r.status === 'build') return '컴파일 실패';
    if (r.status === 'network') return '';
    return `테스트 ${r.passed}/${r.total} 통과` + (r.cases.some(c => !c.pass) ? ` (실패: ${r.cases.filter(c => !c.pass).map(c => c.name + (c.detail ? ' — ' + c.detail : '')).join('; ')})` : '');
  }
  return { can, info, run, render, summary, COMPILERS };
})();
