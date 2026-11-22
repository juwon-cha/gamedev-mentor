'use strict';
/* GameDev Mentor — 정적 문제은행 PWA. 외부 AI를 호출하지 않으며, 문제는 data/*.json에서 읽습니다. */

// ---------- 설정: 트랙 목록은 data/tracks.json에서 읽습니다 ----------
let TRACKS = [];
const MODES = [
  { id: 'tutoring', name: '과외·개념' },
  { id: 'interview', name: '압박 면접' },
  { id: 'debugging', name: '디버깅' },
  { id: 'implementation', name: '실전 구현' },
];
const STATUSES = [
  { id: 'todo', name: '미풀이' },
  { id: 'review', name: '복습 필요(오답)' },
  { id: 'done', name: '완료' },
];
const DIFFS = [{ id: 'Easy', name: '쉬움' }, { id: 'Medium', name: '보통' }, { id: 'Hard', name: '어려움' }];
const diffName = d => ({ Easy: '쉬움', Medium: '보통', Hard: '어려움', Junior: '보통', Mid: '어려움' }[d] || d || '');
const STATUS_LABEL = { review: '복습 필요', unsure: '애매함', done: '완료' };
const HINT_LABELS = ['힌트 1단계: 개념·반례', '힌트 2단계: 문제 지점 축소', '힌트 3단계: 의사코드·핵심 구조'];
const RUNNERS = {
  csharp: { name: '.NET Fiddle', url: 'https://dotnetfiddle.net/' },
  cpp: { name: 'Compiler Explorer', url: 'https://godbolt.org/' },
};

// ---------- helpers ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const trackOf = id => TRACKS.find(t => t.id === id) || { id, short: id };
const modeName = id => (MODES.find(m => m.id === id) || { name: id }).name;
const isCodeMode = p => (p.mode === 'debugging' || p.mode === 'implementation' || (p.mode === 'tutoring' && !!p.starterCode)) && p.language !== 'none';
const safeUrl = u => (/^https?:\/\//i.test(String(u)) ? String(u) : '#');

let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2800);
}
async function copyText(text, okMsg = '복사했습니다') {
  try { await navigator.clipboard.writeText(text); toast(okMsg); return true; }
  catch {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove(); toast(ok ? okMsg : '복사에 실패했습니다. 직접 선택해서 복사하세요.'); return ok;
  }
}
function download(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ---------- markdown + 구문 강조 (외부 라이브러리 없이 오프라인 동작) ----------
const KEYWORDS = new Set('abstract as async await base bool break case catch char class const continue default delegate do double else enum event explicit extern false finally fixed float for foreach if implicit in int interface internal is lock long namespace new null object operator out override params private protected public readonly ref return sealed short sizeof static string struct switch this throw true try typeof uint ulong using var virtual void volatile while yield get set where auto constexpr delete friend inline mutable noexcept nullptr template typename typedef union unsigned signed final include define ifdef ifndef endif pragma'.split(' '));
function highlight(code) {
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|\b(\d[\w.]*)\b|\b([A-Za-z_]\w*)\b/g;
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index)); last = re.lastIndex;
    const tok = esc(m[0]);
    if (m[1]) out += `<span class="tk-com">${tok}</span>`;
    else if (m[2]) out += `<span class="tk-str">${tok}</span>`;
    else if (m[3]) out += `<span class="tk-num">${tok}</span>`;
    else if (KEYWORDS.has(m[4])) out += `<span class="tk-kw">${tok}</span>`;
    else if (code[re.lastIndex] === '(') out += `<span class="tk-fn">${tok}</span>`;
    else if (/^[A-Z]/.test(m[4])) out += `<span class="tk-type">${tok}</span>`;
    else out += tok;
  }
  return out + esc(code.slice(last));
}
function codeBlock(code, lang) {
  return `<div class="code"><div class="code-bar"><span>${esc(lang && lang !== 'none' ? lang : 'code')}</span><button type="button" class="mini" data-copy-code>복사</button></div><pre><code>${highlight(String(code).replace(/\n$/, ''))}</code></pre></div>`;
}
function inline(s) {
  const codes = [];
  s = s.replace(/`([^`\n]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s)
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,!?]|$)/g, '$1<em>$2</em>')
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
}
function blocks(src) {
  const lines = src.split('\n'); let html = '', i = 0;
  const special = l => /^(#{1,6}\s|\s*[-*]\s+|\s*\d+[.)]\s+|>\s?|\|)/.test(l) || /^\s*(-{3,}|\*{3,})\s*$/.test(l);
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{1,6})\s+(.*)$/))) { html += `<h4>${inline(m[2])}</h4>`; i++; continue; }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) { html += '<hr>'; i++; continue; }
    if (/^\s*[-*]\s+/.test(l)) { html += '<ul>'; while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) html += `<li>${inline(lines[i++].replace(/^\s*[-*]\s+/, ''))}</li>`; html += '</ul>'; continue; }
    if (/^\s*\d+[.)]\s+/.test(l)) { html += '<ol>'; while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) html += `<li>${inline(lines[i++].replace(/^\s*\d+[.)]\s+/, ''))}</li>`; html += '</ol>'; continue; }
    if (/^>\s?/.test(l)) { const q = []; while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, '')); html += `<blockquote>${inline(q.join(' '))}</blockquote>`; continue; }
    if (/^\|/.test(l)) {
      const rows = []; while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = r => r.replace(/^\||\|\s*$/g, '').split('|').map(c => c.trim());
      const body = rows.filter(r => !/^\|[\s:|-]+\|?\s*$/.test(r));
      html += '<div class="tbl"><table>' + body.map((r, n) => '<tr>' + cells(r).map(c => (n === 0 ? `<th>${inline(c)}</th>` : `<td>${inline(c)}</td>`)).join('') + '</tr>').join('') + '</table></div>';
      continue;
    }
    const p = []; while (i < lines.length && lines[i].trim() && !special(lines[i])) p.push(lines[i++]);
    html += `<p>${p.map(inline).join('<br>')}</p>`;
  }
  return html;
}
function md(src) {
  return String(src || '').split('```').map((part, i) => {
    if (i % 2 === 0) return blocks(part);
    const nl = part.indexOf('\n');
    return codeBlock(nl >= 0 ? part.slice(nl + 1) : part, nl >= 0 ? part.slice(0, nl).trim() : '');
  }).join('');
}
const srcOf = id => state.sources[id] || null;
function srcBadge(id) {
  const s = srcOf(id);
  return s ? `<a class="src" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener" title="${esc(s.title)}">${esc(id)}</a>` : `<span class="src missing" title="sources.json에 없는 출처 ID">${esc(id)}</span>`;
}
const refsOf = p => (Array.isArray(p.sourceRefs) ? p.sourceRefs : []);
const RUBRIC_H = { esc, inline: s => inline(s), srcBadge };
const ul = arr => (arr && arr.length ? `<ul>${arr.map(x => `<li>${inline(String(x))}</li>`).join('')}</ul>` : '');

// ---------- state ----------
const state = {
  problems: [],
  sources: {},
  loadErrors: [],
  filters: Object.assign({ track: 'all', mode: 'all', diff: 'all', status: 'all', tag: '', q: '' }, (Storage.ui.get().filters) || {}),
  currentId: Storage.ui.get().currentId || null,
};
const saveUi = () => Storage.ui.set({ filters: state.filters, currentId: state.currentId });
const current = () => state.problems.find(p => p.id === state.currentId) || null;
const statusBucket = e => (e.status === 'done' ? 'done' : e.status ? 'review' : 'todo');

function filtered() {
  const f = state.filters, q = f.q.trim().toLowerCase();
  return state.problems.filter(p => {
    if (f.track !== 'all' && p.track !== f.track) return false;
    if (f.mode !== 'all' && p.mode !== f.mode) return false;
    if (f.diff !== 'all' && p.difficulty !== f.diff) return false;
    if (f.status !== 'all' && statusBucket(Storage.get(p.id)) !== f.status) return false;
    if (f.tag && !(p.tags || []).includes(f.tag)) return false;
    if (q && !(`${p.title} ${(p.tags || []).join(' ')}`.toLowerCase().includes(q))) return false;
    return true;
  });
}

// ---------- data ----------
async function loadData() {
  try {
    const res = await fetch('./data/sources.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    ((await res.json()).sources || []).forEach(s => { state.sources[s.id] = s; });
  } catch (e) { state.loadErrors.push(`./data/sources.json: ${e.message}`); }
  try {
    const res = await fetch('./data/tracks.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    TRACKS = (await res.json()).tracks || [];
  } catch (e) { state.loadErrors.push(`./data/tracks.json: ${e.message}`); }
  const results = await Promise.all(TRACKS.map(async t => {
    try {
      const res = await fetch(t.file, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      // 트랙 파일이 자체 선언한 추가 출처를 레지스트리에 합칩니다.
      (j.extraSources || []).forEach(s => { if (s && s.id && !state.sources[s.id]) state.sources[s.id] = { kind: '레퍼런스', ...s, tracks: [t.id] }; });
      return (j.problems || []).map(p => ({ ...p, track: p.track || t.id, trackName: j.trackName || t.short }));
    } catch (e) { t.failed = true; if (!/HTTP 404/.test(e.message)) state.loadErrors.push(`${t.file}: ${e.message}`); return []; }
  }));
  TRACKS = TRACKS.filter(t => !t.failed); // 아직 문제 파일이 없는 트랙은 숨깁니다
  state.problems = results.flat().filter(p => p && p.id && p.title);
}

// ---------- rendering: 목록·필터 ----------
function chipRow(el, items, key) {
  el.innerHTML = [{ id: 'all', name: '전체' }, ...items].map(o => `<button type="button" class="chip" data-filter="${key}" data-value="${o.id}" aria-pressed="${state.filters[key] === o.id}">${esc(o.name || o.short)}</button>`).join('');
}
function renderFilters() {
  chipRow($('#f-track'), TRACKS, 'track');
  chipRow($('#f-mode'), MODES, 'mode');
  chipRow($('#f-diff'), DIFFS, 'diff');
  chipRow($('#f-status'), STATUSES, 'status');
  const tags = [...new Set(state.problems.flatMap(p => p.tags || []))].sort();
  $('#f-tag').innerHTML = '<option value="">모든 태그</option>' + tags.map(t => `<option value="${esc(t)}" ${t === state.filters.tag ? 'selected' : ''}>${esc(t)}</option>`).join('');
  $('#f-q').value = state.filters.q;
}
function renderList() {
  const list = filtered();
  $('#list-count').textContent = `${list.length}문제 / 전체 ${state.problems.length}문제`;
  $('#problem-list').innerHTML = list.length ? list.map(p => {
    const e = Storage.get(p.id);
    return `<li><button type="button" class="pitem" data-open="${esc(p.id)}" aria-current="${p.id === state.currentId}">
      <span class="pitem-title"><i class="dot st-${statusBucket(e)}" title="${esc(STATUS_LABEL[e.status] || '미풀이')}"></i>${esc(p.title)}</span>
      <span class="pitem-meta">${esc(trackOf(p.track).short.split(':')[0])} · ${esc(modeName(p.mode))} · ${esc(diffName(p.difficulty))}${Judge.can(p) ? ' · 실행 채점' + (e.judge && e.judge.total ? ` ${e.judge.passed}/${e.judge.total}` : '') : ''}${e.rubric ? ` · ${e.rubric.score}점` : ''}</span>
    </button></li>`;
  }).join('') : `<li class="empty">${state.loadErrors.length ? '문제 파일을 읽지 못했습니다.<br>' + state.loadErrors.map(esc).join('<br>') : '조건에 맞는 문제가 없습니다.'}</li>`;
}

// ---------- rendering: 문제 ----------
function hintsHtml(p, e) {
  const hints = p.hints || []; if (!hints.length) return '';
  let h = '<section class="sec"><h3>단계별 힌트</h3>';
  hints.forEach((txt, i) => {
    if (i < e.reveal.hints) h += `<div class="reveal hint"><b>${esc(HINT_LABELS[i] || `힌트 ${i + 1}단계`)}</b>${md(txt)}</div>`;
    else h += `<button type="button" class="btn hint wide" data-reveal="hints" ${i > e.reveal.hints ? 'disabled' : ''}>${esc(HINT_LABELS[i] || `힌트 ${i + 1}단계`)}</button>`;
  });
  return h + '</section>';
}
function followHtml(p, e) {
  const fs = p.followUps || []; if (!fs.length) return '';
  let h = '<section class="sec"><h3>압박 꼬리질문</h3>';
  fs.forEach((f, i) => {
    if (i < e.reveal.follow) h += `<div class="reveal follow"><b>꼬리질문 ${i + 1}단계</b>${md(f.question)}
      <details><summary>면접관이 노리는 의도</summary>${md(f.intent)}</details>
      <details><summary>모범 답변 핵심 포인트</summary>${md(f.keyAnswer)}</details></div>`;
    else h += `<button type="button" class="btn wide" data-reveal="follow" ${i > e.reveal.follow ? 'disabled' : ''}>꼬리질문 ${i + 1}단계 열기</button>`;
  });
  return h + '</section>';
}
function solutionHtml(p, e) {
  const label = p.mode === 'interview' ? '모범 답안 & 공식 채점표 열기' : p.mode === 'tutoring' ? '해설 & 공식 채점표 열기' : '정답 해설 & 공식 채점표 열기';
  if (!e.reveal.solution) return `<section class="sec"><button type="button" class="btn danger-soft wide" data-reveal="solution">${label}</button></section>`;
  return `<section class="sec reveal solution"><h3>${p.solutionCode ? '모범 코드' : '모범 답안'}</h3>
    ${p.solutionCode ? codeBlock(p.solutionCode, p.language) : ''}
    <h3>시니어 해설</h3>${md(p.explanation)}
    ${p.nextMission ? `<h3>다음 복습 미션</h3><p>${inline(p.nextMission)}</p>` : ''}
    <button type="button" class="btn small" data-reveal="reset">힌트·해설·채점표 다시 가리기</button></section>
    ${Rubric.render(p, e.rubric, RUBRIC_H)}`;
}
function renderProblem() {
  const p = current();
  $('#problem-empty').hidden = !!p; $('#problem').hidden = !p;
  if (!p) return;
  const e = Storage.get(p.id);
  $('#problem').innerHTML = `
    <button type="button" class="btn ghost small only-mobile" data-mnav="list">← 문제 목록</button>
    <header class="phead">
      <div class="badges"><span class="badge">${esc(trackOf(p.track).short)}</span><span class="badge mode-${esc(p.mode)}">${esc(modeName(p.mode))}</span><span class="badge diff-${esc(p.difficulty || '')}">${esc(diffName(p.difficulty))}</span>${p.verified ? `<span class="badge st-done" title="${esc(p.verified.note || '')}">${p.verified.level === 'executed' ? '실행 검증됨' : '문서 대조 검수됨'}</span>` : ''}${e.status ? `<span class="badge st-${statusBucket(e)}">${esc(STATUS_LABEL[e.status])}</span>` : ''}</div>
      <h1>${esc(p.title)}</h1>
      <div class="tags">${(p.tags || []).map(t => `<button type="button" class="tag" data-tag="${esc(t)}">#${esc(t)}</button>`).join('')}</div>
      ${refsOf(p).length ? `<div class="srcs"><span class="muted small">검증 출처</span>${refsOf(p).map(id => { const s = srcOf(id); return s ? `<a class="src big" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener">${esc(s.title)}</a>` : srcBadge(id); }).join('')}</div>` : ''}
      ${e.rubric ? `<div class="muted small">최근 채점 <b class="num">${e.rubric.score}점</b> · ${esc(Rubric.gradeOf(e.rubric.score).label)}</div>` : ''}
    </header>
    <section class="sec"><h3>${p.mode === 'interview' ? '면접 질문' : '시나리오'}</h3>${md(p.scenario)}</section>
    ${p.concept ? `<section class="sec concept"><h3>핵심 개념</h3>${md(p.concept)}</section>` : ''}
    ${(p.constraints || []).length ? `<section class="sec"><h3>제약 조건</h3>${ul(p.constraints)}</section>` : ''}
    ${(p.edgeCases || []).length ? `<section class="sec"><h3>엣지 케이스 체크리스트</h3><ul class="checks">${p.edgeCases.map((x, i) => `<li><label><input type="checkbox" id="edge-${i}"><span>${inline(String(x))}</span></label></li>`).join('')}</ul></section>` : ''}
    ${p.starterCode ? `<section class="sec"><h3>${p.mode === 'debugging' ? '버그가 숨어 있는 코드' : '초기 코드'}</h3>${codeBlock(p.starterCode, p.language)}</section>` : ''}
    ${(p.quiz || []).length ? `<section class="sec"><h3>셀프 체크 퀴즈</h3>${p.quiz.map((q, i) => `<div class="reveal quiz"><b>Q${i + 1}.</b>${md(q.question)}<details><summary>해설 보기</summary>${md(q.answer)}</details></div>`).join('')}</section>` : ''}
    ${followHtml(p, e)}
    ${hintsHtml(p, e)}
    ${solutionHtml(p, e)}
    <button type="button" class="btn primary wide only-mobile" data-mnav="work">작성·풀이로 이동</button>`;
}

// ---------- rendering: 작성·풀이 ----------
function renderWork() {
  const p = current();
  $('#work-empty').hidden = !!p; $('#work').hidden = !p;
  if (!p) return;
  const e = Storage.get(p.id), code = isCodeMode(p);
  $('#work-title').textContent = code ? '코드 에디터' : (p.mode === 'interview' ? '답변 초안 메모장' : '풀이 메모장');
  $('#work-lang').textContent = code ? (p.language === 'cpp' ? 'C++' : 'C#') : '메모';
  $('#btn-load-starter').hidden = !(code && p.starterCode);
  Editor.setMode(code, code ? '// 여기에 직접 작성하거나 IDE에서 짠 코드를 붙여넣으세요' : '핵심 키워드만이라도 먼저 적어 보세요. 꼬리질문을 열기 전에 내 답을 써 두는 것이 중요합니다.');
  Editor.setValue(e.draft || (code && p.mode === 'debugging' ? p.starterCode : ''));
  $('#memo').value = e.memo || '';
  $('#save-state').textContent = e.draft ? '작성 내용 자동 저장됨' : '';
  $$('#rate [data-rate]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.rate === e.status)));
  const runner = code && RUNNERS[p.language];
  let rb = $('#btn-runner');
  if (!rb) { rb = document.createElement('a'); rb.id = 'btn-runner'; rb.className = 'btn small'; rb.target = '_blank'; rb.rel = 'noopener'; $('.work-tools').appendChild(rb); }
  rb.hidden = !runner;
  if (runner) { rb.href = runner.url; rb.textContent = `코드 복사 후 ${runner.name} 열기`; }
  const judgeable = Judge.can(p);
  $('#judge').hidden = !judgeable; $('#judge-na').hidden = judgeable;
  if (judgeable) {
    const n = (p.tests.cases || []).length;
    $('#btn-judge').textContent = n ? `실행 채점 (테스트 ${n}개)` : '실행 채점';
    $('#btn-judge').disabled = false;
    $('#judge-note').textContent = `${p.tests.note ? p.tests.note + ' ' : ''}코드는 Compiler Explorer(godbolt.org)로 전송되어 ${Judge.info(p).label}에서 실행됩니다.`;
    $('#judge-result').innerHTML = Judge.render(e.judge, { esc });
  }
  $('#btn-ai-review').textContent = code ? '내 코드 + 공식 채점표 복사해서 AI 시니어 리뷰받기' : '내 답변 + 공식 채점표 복사해서 AI 시니어 리뷰받기';
}

// ---------- rendering: 오답노트 ----------
function reviewItems() {
  return state.problems.map(p => ({ p, e: Storage.get(p.id) })).filter(x => x.e.status === 'review' || x.e.status === 'unsure')
    .sort((a, b) => String(b.e.lastReviewed).localeCompare(String(a.e.lastReviewed)));
}
function notesMarkdown() {
  const items = reviewItems();
  if (!items.length) return '';
  return items.map(({ p, e }) => [
    `- **날짜 및 트랙:** ${e.lastReviewed || Storage.today()} | ${p.trackName || trackOf(p.track).short} | ${modeName(p.mode)}`,
    `- **취약 개념 태그:** ${(p.tags || []).map(t => '#' + t).join(', ')}`,
    `- **최종 채점 점수:** ${e.rubric ? `${e.rubric.score}점 (${Rubric.gradeOf(e.rubric.score).label})` : '채점 안 함'}`,
    `- **놓친 채점 기준:** ${e.rubric && Rubric.has(p) ? (Rubric.missed(p, e.rubric.criteria || []).map(c => `${c.description} (${c.points}점)`).join(' / ') || '없음') : '-'}`,
    `- **문제 제목 및 핵심 실수 메모:** ${p.title} — ${e.memo ? e.memo.replace(/\s*\n\s*/g, ' / ') : '(메모 없음)'}`,
    `- **다음 복습 미션:** ${p.nextMission || '-'}`,
  ].join('\n')).join('\n\n');
}
function renderNotes() {
  $('#track-progress').innerHTML = TRACKS.map(t => {
    const ps = state.problems.filter(p => p.track === t.id);
    const done = ps.filter(p => Storage.get(p.id).status === 'done').length;
    const pct = ps.length ? Math.round((done / ps.length) * 100) : 0;
    const scores = ps.map(p => Storage.get(p.id).rubric).filter(Boolean).map(r => r.score);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) + '점' : '채점 없음';
    return `<div class="prog"><div class="prog-head"><span>${esc(t.short)}</span><span class="num">완료 ${done} / ${ps.length} · ${pct}% · 평균 ${avg}</span></div><div class="meter"><i style="width:${pct}%"></i></div></div>`;
  }).join('');
  const counts = {};
  state.problems.forEach(p => { const m = Storage.get(p.id).misses; if (m) (p.tags || []).forEach(t => { counts[t] = (counts[t] || 0) + m; }); });
  const tagRows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = tagRows.length ? tagRows[0][1] : 1;
  $('#tag-stats').innerHTML = tagRows.length ? tagRows.map(([t, n]) => `<button type="button" class="tagrow" data-tag="${esc(t)}"><span class="tag">#${esc(t)}</span><span class="meter warn"><i style="width:${Math.round((n / max) * 100)}%"></i></span><span class="num">${n}회</span></button>`).join('')
    : '<div class="empty">아직 집계된 취약 태그가 없습니다. 문제를 풀고 자가 평가를 누르면 쌓입니다.</div>';
  const items = reviewItems();
  $('#review-list').innerHTML = items.length ? items.map(({ p, e }) => `<button type="button" class="pitem card" data-open="${esc(p.id)}">
      <span class="pitem-title"><i class="dot st-review"></i>${esc(p.title)}</span>
      <span class="pitem-meta">${esc(e.lastReviewed)} · ${esc(STATUS_LABEL[e.status])}${e.rubric ? ` · ${e.rubric.score}점` : ''} · ${esc(trackOf(p.track).short)} · ${esc(modeName(p.mode))}</span>
      ${e.memo ? `<span class="pitem-memo">${esc(e.memo)}</span>` : ''}</button>`).join('')
    : '<div class="empty">복습이 필요한 문제가 없습니다.</div>';
}

// ---------- rendering: 검증 자료 라이브러리 ----------
function renderLibrary() {
  const q = $('#lib-q').value.trim().toLowerCase();
  const all = Object.values(state.sources).filter(s => !q || `${s.id} ${s.title} ${s.summary || ''} ${s.kind || ''}`.toLowerCase().includes(q));
  const used = id => state.problems.filter(p => refsOf(p).includes(id) || (Rubric.has(p) && [...p.rubric.criteria, ...(p.rubric.criticalDeductions || [])].some(c => c.sourceId === id)));
  $('#lib-list').innerHTML = TRACKS.map(t => {
    const list = all.filter(s => (s.tracks || []).includes(t.id));
    if (!list.length) return '';
    return `<h2>${esc(t.short)}</h2>` + list.map(s => `<article class="srccard">
      <div class="srccard-head"><a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener">${esc(s.title)}</a><span class="badge">${esc(s.kind || '')}</span></div>
      <p>${esc(s.summary || '')}</p>
      <div class="srccard-foot"><code>${esc(s.id)}</code>${(s.links || []).map(l => `<a href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}
        ${used(s.id).map(p => `<button type="button" class="mini" data-open="${esc(p.id)}">${esc(p.title)}</button>`).join('')}</div>
    </article>`).join('');
  }).join('') || '<div class="empty">검색 결과가 없습니다.</div>';
}

// ---------- navigation ----------
function setView(v) {
  document.body.dataset.view = v;
  $$('.tab[data-view]').forEach(t => t.setAttribute('aria-current', String(t.dataset.view === v)));
  if (v === 'notes') renderNotes();
  if (v === 'library') renderLibrary();
  syncBottomNav();
}
function setMobilePane(pane) {
  if (pane === 'notes') return setView('notes');
  if (pane === 'problem' && !current()) pane = 'list';
  if (pane === 'work' && !current()) { toast('먼저 문제를 고르세요'); pane = 'list'; }
  document.body.dataset.mpane = pane;
  setView('study');
  window.scrollTo(0, 0);
}
function syncBottomNav() {
  const b = document.body.dataset, active = b.view !== 'study' ? 'notes' : (b.mpane === 'work' ? 'work' : 'problem');
  $$('.bottom-nav [data-mnav]').forEach(x => x.setAttribute('aria-current', String(x.dataset.mnav === active)));
}
function openProblem(id) {
  Editor.flush();
  state.currentId = id; saveUi();
  document.body.dataset.drawer = '';
  renderList(); renderProblem(); renderWork();
  setMobilePane('problem');
  $('#pane-problem').scrollTop = 0;
}
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  $('#btn-theme').textContent = t === 'dark' ? '☀' : '☾';
  $('#btn-theme').title = t === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';
  const meta = $('meta[name="theme-color"]'); if (meta) meta.content = t === 'dark' ? '#080c16' : '#16203a';
}

// ---------- 새 문제 프롬프트 모달 ----------
function newPromptText() {
  const t = trackOf($('#np-track').value);
  const full = state.problems.find(p => p.track === t.id);
  return PromptBuilder.newProblem({ track: t.id, trackName: (full && full.trackName) || t.short, mode: $('#np-mode').value, difficulty: $('#np-diff').value, language: t.language, tagPrefix: t.tagPrefix, topic: $('#np-topic').value.trim(), sources: $$('#np-sources input:checked').map(x => state.sources[x.value]).filter(Boolean) });
}
function renderNpSources() {
  const tid = $('#np-track').value;
  const list = Object.values(state.sources).filter(s => (s.tracks || []).includes(tid));
  $('#np-sources').innerHTML = list.map(s => `<label class="pick"><input type="checkbox" value="${esc(s.id)}" id="np-src-${esc(s.id)}"><span>${esc(s.title)}</span></label>`).join('') || '<span class="muted small">이 트랙에 등록된 자료가 없습니다.</span>';
}
function openNewPrompt() {
  $('#np-track').innerHTML = TRACKS.map(t => `<option value="${t.id}">${esc(t.short)}</option>`).join('');
  $('#np-mode').innerHTML = MODES.map(m => `<option value="${m.id}">${esc(m.name)}</option>`).join('');
  const p = current(); if (p) { $('#np-track').value = p.track; $('#np-mode').value = p.mode; }
  renderNpSources();
  $('#np-preview').value = newPromptText();
  $('#dlg-new').showModal();
}

// ---------- events ----------
document.addEventListener('click', e => {
  const el = e.target.closest('button, a.btn, a.brand'); if (!el) return;
  const d = el.dataset;
  if (d.view) return setView(d.view);
  if (d.mnav) return setMobilePane(d.mnav === 'problem' && document.body.dataset.view === 'study' && document.body.dataset.mpane === 'problem' ? 'list' : d.mnav);
  if (d.filter) { state.filters[d.filter] = d.value; saveUi(); renderFilters(); return renderList(); }
  if (d.open) return openProblem(d.open);
  if (d.tag) { state.filters = { track: 'all', mode: 'all', diff: 'all', status: 'all', tag: d.tag, q: '' }; saveUi(); renderFilters(); renderList(); document.body.dataset.drawer = 'open'; return setMobilePane('list'); }
  if (d.copyCode !== undefined) return copyText(el.closest('.code').querySelector('code').textContent);
  if (d.rate) {
    const p = current(); if (!p) return;
    Editor.flush(); Storage.update(p.id, { memo: $('#memo').value });
    Storage.rate(p.id, d.rate);
    renderList(); renderProblem(); renderWork();
    return toast(d.rate === 'done' ? '완료로 표시했습니다' : '오답노트에 추가했습니다');
  }
  if (d.reveal) {
    const p = current(); if (!p) return;
    const r = { ...Storage.get(p.id).reveal };
    if (d.reveal === 'hints') r.hints++;
    else if (d.reveal === 'follow') r.follow++;
    else if (d.reveal === 'reset') { r.hints = 0; r.follow = 0; r.solution = false; }
    else if (d.reveal === 'solution') {
      if (!confirm(p.mode === 'interview' ? '모범 답안을 볼까요? 먼저 내 답변을 적어 두는 것을 권합니다.' : '정답과 해설을 볼까요? 한 번 보면 스스로 찾는 연습 효과가 줄어듭니다.')) return;
      r.solution = true;
    }
    Storage.update(p.id, { reveal: r });
    return renderProblem();
  }
  switch (el.id) {
    case 'brand': e.preventDefault(); return setMobilePane('list');
    case 'btn-theme': { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; applyTheme(t); try { localStorage.setItem('gdm.theme', t); } catch { /* ignore */ } return; }
    case 'btn-drawer': document.body.dataset.drawer = document.body.dataset.drawer === 'open' ? '' : 'open'; return;
    case 'btn-random': {
      const pool = filtered().filter(p => p.id !== state.currentId);
      const list = pool.length ? pool : filtered();
      if (!list.length) return toast('조건에 맞는 문제가 없습니다');
      return openProblem(list[Math.floor(Math.random() * list.length)].id);
    }
    case 'btn-load-starter': {
      const p = current(); if (!p) return;
      if (Editor.getValue().trim() && Editor.getValue() !== p.starterCode && !confirm('작성한 내용을 지우고 초기 코드로 되돌릴까요?')) return;
      Editor.setValue(p.starterCode); Storage.update(p.id, { draft: p.starterCode }); return toast('초기 코드를 불러왔습니다');
    }
    case 'btn-copy-answer': return copyText(Editor.getValue(), '작성 내용을 복사했습니다');
    case 'btn-runner': copyText(Editor.getValue(), '코드를 복사했습니다. 열린 사이트에 붙여넣어 실행하세요.'); return;
    case 'btn-ai-review': {
      const p = current(); if (!p) return;
      Editor.flush();
      return copyText(PromptBuilder.review(p, Editor.getValue(), $('#memo').value, state.sources, Judge.summary(Storage.get(p.id).judge)), '복사 완료! 구독 중인 제미나이/클로드 앱에 붙여넣으세요');
    }
    case 'btn-new-problem': return openNewPrompt();
    case 'btn-rubric-apply': {
      const p = current(); if (!p) return;
      const r = Rubric.read(p, $('#rubric'));
      Editor.flush();
      Storage.update(p.id, { memo: $('#memo').value, rubric: { criteria: r.criteria, deductions: r.deductions, score: r.score, grade: r.grade, savedAt: Storage.today() } });
      Storage.rate(p.id, r.grade === 'pass' ? 'done' : r.grade === 'borderline' ? 'unsure' : 'review');
      renderList(); renderProblem(); renderWork();
      return toast(`${r.score}점 · ${r.gradeLabel} — ${r.grade === 'pass' ? '완료로 표시했습니다' : '오답노트에 추가했습니다'}`);
    }
    case 'btn-library': return setView('library');
    case 'btn-judge': {
      const p = current(); if (!p || !Judge.can(p)) return;
      const code = Editor.getValue();
      if (!code.trim()) return toast('코드를 작성한 뒤 실행하세요');
      Editor.flush();
      const btn = $('#btn-judge'), label = btn.textContent;
      btn.disabled = true; btn.textContent = '컴파일·실행 중…';
      $('#judge-result').innerHTML = '';
      return Judge.run(p, code).then(r => {
        if (current() !== p) return;
        if (r.status !== 'network') Storage.update(p.id, { judge: { ...r, at: Storage.today() } });
        btn.disabled = false; btn.textContent = label;
        $('#judge-result').innerHTML = Judge.render(r, { esc });
        renderList();
        if (r.status === 'done') toast(r.passed === r.total ? '모든 테스트를 통과했습니다. 채점표로 설계까지 점검해 보세요.' : `테스트 ${r.total}개 중 ${r.passed}개 통과`);
      });
    }
    case 'np-copy': return copyText(newPromptText(), '프롬프트를 복사했습니다. 공식 문서와 함께 AI에 붙여넣으세요.');
    case 'btn-copy-md': { const t = notesMarkdown(); return t ? copyText(t, '복사했습니다. 구글 문서에 붙여넣으세요.') : toast('복습이 필요한 문제가 아직 없습니다'); }
    case 'btn-export': return download(`gamedev-mentor-progress-${Storage.today()}.json`, Storage.exportJson());
    case 'btn-reset':
      if (!confirm('이 기기의 학습 진도, 오답 메모, 작성 중인 답안을 모두 지울까요? 되돌릴 수 없습니다.')) return;
      Storage.clear(); renderList(); renderProblem(); renderWork(); renderNotes(); return toast('학습 기록을 지웠습니다');
  }
});
$('#backdrop').addEventListener('click', () => { document.body.dataset.drawer = ''; });
$('#f-tag').addEventListener('change', e => { state.filters.tag = e.target.value; saveUi(); renderList(); });
$('#f-q').addEventListener('input', e => { state.filters.q = e.target.value; saveUi(); renderList(); });
$('#memo').addEventListener('input', () => { const p = current(); if (p) Storage.update(p.id, { memo: $('#memo').value }); });
['np-track', 'np-mode', 'np-diff', 'np-topic', 'np-sources'].forEach(id => $('#' + id).addEventListener('input', () => { if (id === 'np-track') renderNpSources(); $('#np-preview').value = newPromptText(); }));
$('#lib-q').addEventListener('input', renderLibrary);
// 채점표 체크 → 점수 즉시 계산·저장
$('#problem').addEventListener('change', e => {
  if (!e.target.matches('[data-rubric]')) return;
  const p = current(); if (!p) return;
  const r = Rubric.read(p, $('#rubric'));
  Storage.update(p.id, { rubric: { criteria: r.criteria, deductions: r.deductions, score: r.score, grade: r.grade, savedAt: Storage.today() } });
  const box = $('#rb-result'); box.className = `rb-result grade-${r.grade}`;
  $('.rb-score', box).innerHTML = `${r.score}<small>점</small>`; $('.rb-grade', box).textContent = r.gradeLabel;
});
$('#import-input').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  try {
    const n = Storage.importJson(await f.text());
    renderList(); renderProblem(); renderWork(); renderNotes(); toast(`학습 기록 ${n}건을 불러와 합쳤습니다`);
  } catch { toast('불러올 수 없는 파일입니다. 이 앱에서 내보낸 JSON인지 확인하세요.'); }
});

// ---------- boot ----------
(async function boot() {
  // 이전 버전(API 연동판)이 남긴 데이터 정리 — 저장돼 있던 API 키도 함께 지웁니다.
  ['gdm.settings', 'gdm.session', 'gdm.data', 'gdm.pick'].forEach(k => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
  applyTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  Editor.mount({
    textarea: $('#answer'), gutter: $('#gutter'), wrap: $('#editor'),
    onSave: v => { const p = current(); if (!p) return; const ok = Storage.update(p.id, { draft: v }); $('#save-state').textContent = ok ? `자동 저장됨 ${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}` : '저장 공간이 부족해 저장하지 못했습니다'; },
  });
  await loadData();
  if (!current()) state.currentId = null;
  renderFilters(); renderList(); renderProblem(); renderWork();
  document.body.dataset.mpane = current() ? 'problem' : 'list';
  setView('study');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('./sw.js').catch(() => { /* 캐시 없이도 동작 */ });
})();
