'use strict';
/* GameDev Mentor — 정적 PWA. 빌드 없음. 데이터는 전부 이 기기의 localStorage에만 저장됩니다. */

// ---------- helpers ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};
const LS = { settings: 'gdm.settings', session: 'gdm.session', data: 'gdm.data', pick: 'gdm.pick', theme: 'gdm.theme' };
const byId = (list, id) => list.find(x => x.id === id);

let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}
async function copyText(text, okMsg = '복사했습니다') {
  try { await navigator.clipboard.writeText(text); toast(okMsg); }
  catch {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove(); toast(ok ? okMsg : '복사에 실패했습니다. 직접 선택해서 복사하세요.');
  }
}
function download(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const autoDevice = () => (window.innerWidth < 640 ? 'mobile' : window.innerWidth < 1100 ? 'tablet' : 'pc');

// ---------- state ----------
let settings = Object.assign({ engine: 'copy', apiKey: '', deepModel: 'gemini-4-neon', lightModel: 'gemini-4-hydrogen' }, store.get(LS.settings, {}));
let data = Object.assign({ user_weaknesses: [], sessions: [] }, store.get(LS.data, {}));
let pick = Object.assign({ device: autoDevice(), track: 'cs', mode: 'debug', topic: '' }, store.get(LS.pick, {}));
pick.device = autoDevice();
let session = store.get(LS.session, null);
let refs = [];            // [{name, text}] — 메모리에만 유지
let pendingImages = [];   // [{mime, data, url}]
let inputMode = 'text';
let busy = false;
let view = 'study';

const saveSettings = () => store.set(LS.settings, settings);
const saveData = () => store.set(LS.data, data);
const savePick = () => store.set(LS.pick, pick);
function saveSession() {
  if (!session) return store.del(LS.session);
  // 이미지 원본은 용량이 커서 저장하지 않습니다.
  const slim = { ...session, history: session.history.map(m => ({ ...m, images: (m.images || []).map(i => ({ mime: i.mime })) })) };
  store.set(LS.session, slim);
}

// ---------- weakness tracker ----------
const trackOfTag = tag => (/^CSharp/i.test(tag) ? 'cs' : /^Cpp/i.test(tag) ? 'cpp' : /^Algo/i.test(tag) ? 'algo' : /^Unity/i.test(tag) ? 'unity' : '');
const trackByKey = key => TRACKS.find(t => t.key === key);
function weightOf(w) {
  const m = Math.min(5, Math.max(1, Number(w.mastery_score) || 1));
  const days = Math.max(0, Math.round((Date.now() - new Date(w.last_reviewed || today()).getTime()) / 864e5));
  const v = ((5 - m) / 4) * 0.75 + (Math.min(days, 14) / 14) * 0.25;
  return Math.round(Math.min(1, Math.max(0.05, v)) * 100) / 100;
}
const sortedWeak = () => data.user_weaknesses.map(w => ({ ...w, next_review_weight: weightOf(w) })).sort((a, b) => b.next_review_weight - a.next_review_weight);
function upsertWeakness(w, fallbackTrackId) {
  const tag = String(w.tag || '').trim().replace(/\s+/g, '_');
  if (!tag) return;
  const trackId = trackOfTag(tag) || fallbackTrackId || 'cs';
  let cur = data.user_weaknesses.find(x => x.tag === tag);
  if (!cur) { cur = { tag, track: byId(TRACKS, trackId).key, mastery_score: 2, recurring_mistakes: [], next_mission: '', last_reviewed: today(), next_review_weight: 0 }; data.user_weaknesses.push(cur); }
  const m = Number(w.mastery_score); if (m >= 1 && m <= 5) cur.mastery_score = Math.round(m);
  for (const s of (w.recurring_mistakes || [])) if (s && !cur.recurring_mistakes.includes(s)) cur.recurring_mistakes.push(String(s));
  cur.recurring_mistakes = cur.recurring_mistakes.slice(-6);
  if (w.next_mission) cur.next_mission = String(w.next_mission);
  cur.last_reviewed = today();
  cur.next_review_weight = weightOf(cur);
}
function parseWrap(text) {
  const m = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/(\{[\s\S]*"weaknesses"[\s\S]*\})/);
  if (!m) return null;
  try { const j = JSON.parse(m[1]); return Array.isArray(j.weaknesses) ? j : null; } catch { return null; }
}
function absorbWrap(text, meta) {
  const j = parseWrap(text);
  if (!j) return false;
  j.weaknesses.forEach(w => upsertWeakness(w, meta.track));
  data.sessions.push({
    date: today(), track: meta.track, mode: meta.mode, summary: String(j.summary || ''),
    tags: j.weaknesses.map(w => w.tag).filter(Boolean),
    mistakes: j.weaknesses.flatMap(w => w.recurring_mistakes || []),
    mission: j.weaknesses.map(w => w.next_mission).filter(Boolean).join(' / '),
  });
  data.sessions = data.sessions.slice(-200);
  saveData();
  return true;
}
function exportJson() {
  return JSON.stringify({ user_weaknesses: sortedWeak(), sessions: data.sessions, exported_at: new Date().toISOString() }, null, 2);
}
function notesMarkdown() {
  const lines = ['# 오답노트 · 취약점 로그', ''];
  for (const s of data.sessions) {
    const t = byId(TRACKS, s.track), m = byId(MODES, s.mode);
    lines.push(`## ${s.date} · ${t ? t.short : s.track} · ${m ? m.name : s.mode}`);
    if (s.summary) lines.push(s.summary);
    lines.push(`- 취약 개념 태그: ${s.tags.join(', ') || '-'}`);
    lines.push('- 핵심 실수 및 보완점:'); (s.mistakes.length ? s.mistakes : ['-']).forEach(x => lines.push(`  - ${x}`));
    lines.push(`- 다음 복습 미션: ${s.mission || '-'}`, '');
  }
  lines.push('## 현재 취약 태그 (복습 우선순위 순)');
  for (const w of sortedWeak()) lines.push(`- ${w.tag} · 숙련도 ${w.mastery_score}/5 · 가중치 ${w.next_review_weight} · 최근 복습 ${w.last_reviewed}`);
  return lines.join('\n');
}

// ---------- markdown + syntax highlight ----------
const KEYWORDS = new Set('abstract as async await base bool break case catch char class const continue default delegate do double else enum event explicit extern false finally fixed float for foreach if implicit in int interface internal is lock long namespace new null object operator out override params private protected public readonly ref return sealed short sizeof static string struct switch this throw true try typeof uint ulong using var virtual void volatile while yield get set where auto constexpr delete friend inline mutable noexcept nullptr template typename typedef union unsigned signed register include define ifdef ifndef endif pragma std'.split(' '));
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
function inline(s) {
  const codes = [];
  s = s.replace(/`([^`\n]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s)
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,!?]|$)/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
}
function blocks(src) {
  const lines = src.split('\n'); let html = '', i = 0;
  const isSpecial = l => /^(#{1,6}\s|\s*[-*]\s+|\s*\d+[.)]\s+|>\s?|\|)/.test(l) || /^\s*(-{3,}|\*{3,})\s*$/.test(l);
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{1,6})\s+(.*)$/))) { html += `<h${m[1].length <= 2 ? 3 : 4}>${inline(m[2])}</h${m[1].length <= 2 ? 3 : 4}>`; i++; continue; }
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
    const p = []; while (i < lines.length && lines[i].trim() && !isSpecial(lines[i])) p.push(lines[i++]);
    html += `<p>${p.map(inline).join('<br>')}</p>`;
  }
  return html;
}
function md(src) {
  return src.split('```').map((part, i) => {
    if (i % 2 === 0) return blocks(part);
    const nl = part.indexOf('\n');
    const lang = nl >= 0 ? part.slice(0, nl).trim() : '';
    const code = (nl >= 0 ? part.slice(nl + 1) : part).replace(/\n$/, '');
    return `<div class="code"><div class="code-bar"><span>${esc(lang || 'code')}</span><button type="button" class="mini" data-copy-code>복사</button></div><pre><code>${highlight(code)}</code></pre></div>`;
  }).join('');
}

// ---------- prompts ----------
function refsBlock() {
  if (!refs.length) return '';
  return '\n\n# 첨부 레퍼런스\n' + refs.map(r => `## ${r.name}\n\`\`\`\n${r.text}\n\`\`\``).join('\n\n');
}
function startMessage(s) {
  const d = byId(DEVICES, s.device), t = byId(TRACKS, s.track), m = byId(MODES, s.mode);
  const lines = ['[세션 시작]', `- 기기: ${d.rule}`, `- 트랙: ${t.name} (${t.scope})`, `- 모드: ${m.rule}`, `- 주제: ${s.topic || '트랙 범위 안에서 멘토가 선택'}`];
  if (s.weak && s.weak.length) {
    lines.push('- 취약 태그 (이 약점을 겨냥한 새로운 변형 문제로 출제):');
    s.weak.forEach(w => lines.push(`  - ${w.tag} (숙련도 ${w.mastery_score}/5)${w.recurring_mistakes.length ? ' — 반복 실수: ' + w.recurring_mistakes.slice(-2).join('; ') : ''}`));
  }
  if (refs.length) lines.push(`- 첨부 레퍼런스 ${refs.length}개에 근거해 출제할 것.`);
  lines.push('', '이 설정으로 바로 시작해 줘.');
  return lines.join('\n');
}
const sessionLabel = s => [byId(DEVICES, s.device).name, byId(TRACKS, s.track).short, byId(MODES, s.mode).name, s.topic].filter(Boolean).join(' · ');

// ---------- Gemini API ----------
const API = 'https://generativelanguage.googleapis.com/v1beta/models';
async function apiError(res) {
  let msg = ''; try { msg = (await res.json()).error.message; } catch { /* ignore */ }
  const tip = res.status === 400 || res.status === 403 ? ' API 키를 확인하세요.' : res.status === 404 ? ' 설정에서 모델 이름을 확인하세요.' : res.status === 429 ? ' 사용량 한도입니다. 잠시 뒤 다시 시도하세요.' : '';
  return new Error(`Gemini API 오류 (${res.status}): ${msg || res.statusText}${tip}`);
}
async function callGemini(kind) {
  const model = (kind === 'hint' || kind === 'wrap' ? settings.lightModel : settings.deepModel).replace(/^models\//, '');
  const contents = session.history.filter(m => m.role !== 'error').map(m => ({
    role: m.role === 'model' ? 'model' : 'user',
    parts: [...(m.images || []).filter(i => i.data).map(i => ({ inlineData: { mimeType: i.mime, data: i.data } })), { text: m.text }],
  }));
  const res = await fetch(`${API}/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': settings.apiKey },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM_PROMPT + refsBlock() }] }, contents }),
  });
  if (!res.ok) throw await apiError(res);
  const j = await res.json();
  const cand = (j.candidates || [])[0];
  const text = ((cand && cand.content && cand.content.parts) || []).filter(p => !p.thought && p.text).map(p => p.text).join('');
  if (!text) throw new Error(`응답이 비어 있습니다 (${(cand && cand.finishReason) || (j.promptFeedback && j.promptFeedback.blockReason) || '원인 미상'}).`);
  return text;
}
async function listModels() {
  const res = await fetch(`${API}?pageSize=200`, { headers: { 'x-goog-api-key': $('#api-key').value.trim() } });
  if (!res.ok) throw await apiError(res);
  const j = await res.json();
  return (j.models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => m.name.replace(/^models\//, ''));
}

// ---------- session flow ----------
function newSession(weakList) {
  const s = { ...pick, weak: weakList || [], history: [], lang: byId(TRACKS, pick.track).lang, startedAt: Date.now(), wrapped: false };
  session = s; pendingImages = [];
  inputMode = s.mode === 'impl' ? 'code' : 'text';
  $('#answer').value = '';
  showView('study');
  send({ text: startMessage(s), label: `세션 시작 — ${sessionLabel(s)}`, kind: 'start' });
}
function startWeak(tag) {
  const all = sortedWeak();
  if (!all.length) return toast('아직 쌓인 취약 태그가 없습니다.');
  let chosen;
  if (tag) chosen = all.filter(w => w.tag === tag);
  else { const inTrack = all.filter(w => w.track === byId(TRACKS, pick.track).key); chosen = (inTrack.length ? inTrack : all).slice(0, 3); }
  const t = trackByKey(chosen[0].track); if (t) pick.track = t.id;
  pick.topic = ''; savePick();
  newSession(chosen);
}
async function send(m) {
  if (busy || !session) return;
  session.history.push({ role: 'user', text: m.text, label: m.label || '', kind: m.kind || 'answer', images: m.images || [] });
  saveSession(); renderSession(); scrollEnd();
  if (settings.engine === 'api') await runModel(m.kind || 'answer');
}
async function runModel(kind) {
  busy = true; renderBusy();
  try {
    const text = await callGemini(kind);
    session.history.push({ role: 'model', text, kind });
    if (kind === 'wrap') {
      if (absorbWrap(text, session)) { session.wrapped = true; toast('오답노트를 취약점 탭에 저장했습니다'); }
      else toast('오답노트 형식을 읽지 못했습니다. 다시 생성해 보세요.');
    }
  } catch (e) {
    session.history.push({ role: 'error', text: e.message || String(e), kind });
  }
  busy = false; saveSession(); renderSession(); scrollEnd();
}
function retry() {
  const last = session.history[session.history.length - 1];
  if (!last || last.role !== 'error') return;
  session.history.pop(); renderSession(); runModel(last.kind);
}
function scrollEnd() {
  const msgs = $$('#thread .msg'); const last = msgs[msgs.length - 1];
  if (last) last.scrollIntoView({ block: 'start', behavior: 'smooth' });
}
function copyPayload(i) {
  const firstUser = session.history.findIndex(m => m.role === 'user');
  const m = session.history[i];
  return i === firstUser ? `${SYSTEM_PROMPT}${refsBlock()}\n\n---\n\n${m.text}` : m.text;
}
function lastStarterCode() {
  for (let i = session.history.length - 1; i >= 0; i--) {
    const m = session.history[i];
    if (m.role !== 'model') continue;
    const parts = m.text.split('```');
    for (let k = parts.length - 2; k >= 1; k -= 2) {
      const nl = parts[k].indexOf('\n'); const lang = parts[k].slice(0, nl).trim().toLowerCase();
      if (lang !== 'json') return parts[k].slice(nl + 1).replace(/\n$/, '');
    }
  }
  return '';
}

// ---------- rendering ----------
function showView(v) {
  view = v;
  const inSession = v === 'study' && !!session;
  $('#view-setup').hidden = !(v === 'study' && !session);
  $('#view-session').hidden = !inSession;
  $('#view-notes').hidden = v !== 'notes';
  $('#view-settings').hidden = v !== 'settings';
  $('#wrap').classList.toggle('wide', inSession);
  $$('.tab[data-view]').forEach(t => t.setAttribute('aria-current', String(t.dataset.view === v)));
  if (v === 'study') (session ? renderSession : renderSetup)();
  if (v === 'notes') renderNotes();
  if (v === 'settings') renderSettings();
  window.scrollTo(0, 0);
}
function optHtml(list, sel, attr) {
  return list.map(o => `<button type="button" class="opt" role="radio" aria-checked="${o.id === sel}" data-${attr}="${o.id}"><b>${esc(o.name)}</b><span>${esc(o.sub)}</span></button>`).join('');
}
function renderSetup() {
  $('#opt-device').innerHTML = optHtml(DEVICES, pick.device, 'device');
  $('#opt-track').innerHTML = optHtml(TRACKS, pick.track, 'track');
  $('#opt-mode').innerHTML = optHtml(MODES, pick.mode, 'mode');
  const t = byId(TRACKS, pick.track);
  $('#opt-topic').innerHTML = t.topics.map(x => `<button type="button" class="chip" aria-pressed="${x === pick.topic}" data-topic="${esc(x)}">${esc(x)}</button>`).join('');
  $('#ref-list').innerHTML = refs.map((r, i) => `<span class="chip static">${esc(r.name)} · ${Math.ceil(r.text.length / 1000)}K자<button type="button" class="mini x" data-ref-del="${i}" aria-label="${esc(r.name)} 제거">×</button></span>`).join('');
  $('#summary').textContent = sessionLabel(pick);
  const weakN = data.user_weaknesses.length;
  $('#btn-start-weak').disabled = !weakN;
  $('#btn-start-weak').textContent = weakN ? `내 취약점 기반 변형 문제 (${weakN})` : '내 취약점 기반 변형 문제';
  $('#engine-hint').innerHTML = settings.engine === 'api'
    ? `Gemini API 자동 모드 · 출제 <code>${esc(settings.deepModel)}</code> / 힌트 <code>${esc(settings.lightModel)}</code>`
    : '프롬프트 복사 모드 · 버튼을 누르면 완성된 프롬프트가 만들어지고, 복사해서 Gemini 앱에 붙여넣습니다. 자동 출제를 원하면 설정에서 API 키를 넣으세요.';
  $('#resume').hidden = true;
}
function msgHtml(m, i) {
  if (m.role === 'error') return `<div class="msg error"><span class="who">오류</span><div class="bubble"><span>${esc(m.text)}</span><button type="button" class="btn small" data-retry>다시 시도</button></div></div>`;
  if (m.role === 'model') {
    const text = m.kind === 'wrap' ? m.text.replace(/```json[\s\S]*?```/i, '').trim() : m.text;
    return `<div class="msg model"><span class="who">멘토</span><div class="bubble">${md(text)}</div></div>`;
  }
  const imgs = (m.images || []).filter(x => x.url).map(x => `<img src="${x.url}" alt="첨부 이미지">`).join('');
  const nImg = (m.images || []).length;
  const shown = m.label ? `<p><strong>${esc(m.label)}</strong></p>` : md(m.text);
  if (settings.engine !== 'api') {
    const isLast = i === session.history.length - 1;
    return `<div class="msg user"><span class="who">나 → Gemini</span><div class="bubble copycard">
      ${shown}
      ${isLast ? '<p class="how">이 메시지를 복사해 Gemini 앱에 붙여넣으세요. 답을 받은 뒤 아래 버튼으로 다음 메시지를 만듭니다.</p>' : ''}
      <div class="row-btns"><button type="button" class="btn ${isLast ? 'primary' : ''} small" data-copy-msg="${i}">프롬프트 복사</button>
      <a class="btn small" href="https://gemini.google.com/app" target="_blank" rel="noopener">Gemini 열기</a></div>
      ${nImg ? '<p class="how">이미지는 Gemini 앱에 직접 첨부하세요.</p>' : ''}
      <details><summary>보낼 내용 보기</summary><pre>${esc(copyPayload(i))}</pre></details></div></div>`;
  }
  return `<div class="msg user"><span class="who">나</span><div class="bubble">${imgs ? `<div class="imgs">${imgs}</div>` : (nImg ? `<p class="muted small">이미지 ${nImg}장 첨부됨</p>` : '')}${shown}</div></div>`;
}
function renderBusy() {
  $('#busy').hidden = !busy;
  $$('#actions .btn, #btn-send').forEach(b => { b.disabled = busy; });
}
function renderSession() {
  const s = session;
  $('#session-chips').innerHTML = [byId(DEVICES, s.device).name, byId(TRACKS, s.track).short, byId(MODES, s.mode).name, s.topic, ...(s.weak || []).map(w => w.tag)]
    .filter(Boolean).map(x => `<span class="chip">${esc(x)}</span>`).join('') + (refs.length ? `<span class="chip">레퍼런스 ${refs.length}</span>` : '');
  $('#thread').innerHTML = s.history.map(msgHtml).join('');
  renderBusy(); renderComposer();
}
function renderComposer() {
  const code = inputMode === 'code';
  $$('.seg-b').forEach(b => b.setAttribute('aria-selected', String(b.dataset.input === inputMode)));
  $('#editor').classList.toggle('code', code);
  $('#gutter').hidden = !code;
  $('#lang').hidden = !code; $('#lang').value = session.lang;
  $('#btn-starter').hidden = !code;
  $('#img-label').hidden = code;
  const ta = $('#answer');
  ta.placeholder = code ? '// 여기에 직접 작성하거나 IDE에서 짠 코드를 붙여넣으세요' : '답변을 입력하세요 (스크린샷은 붙여넣기 Ctrl+V로 첨부)';
  $('#btn-send').textContent = code ? '제출 · 시니어 리뷰 받기' : (settings.engine === 'api' ? '제출' : '메시지 만들기');
  $('#composer-tip').textContent = code ? 'Tab 들여쓰기 · Ctrl+Enter 제출' : 'Ctrl+Enter 제출';
  $('#thumbs').hidden = !pendingImages.length;
  $('#thumbs').innerHTML = pendingImages.map((x, i) => `<img src="${x.url}" alt="첨부 예정 이미지 ${i + 1}">`).join('') + (pendingImages.length ? '<button type="button" class="btn small" id="btn-clear-img">첨부 취소</button>' : '');
  updateGutter();
}
function updateGutter() {
  if (inputMode !== 'code') return;
  const n = $('#answer').value.split('\n').length;
  let s = ''; for (let i = 1; i <= n; i++) s += i + '\n';
  $('#gutter').textContent = s; $('#gutter').scrollTop = $('#answer').scrollTop;
}
function renderNotes() {
  const list = sortedWeak();
  $('#weak-list').innerHTML = list.length ? list.map(w => {
    const t = trackByKey(w.track);
    return `<article class="weak" data-tag="${esc(w.tag)}">
      <div class="weak-head"><span><span class="tag">${esc(w.tag)}</span> <span class="weak-meta">${esc(t ? t.short : w.track)}</span></span>
        <span class="mastery" role="group" aria-label="숙련도">숙련도 ${[1, 2, 3, 4, 5].map(n => `<button type="button" aria-pressed="${n === w.mastery_score}" data-mastery="${n}">${n}</button>`).join('')}</span></div>
      <div class="meter" title="복습 가중치"><i style="width:${Math.round(w.next_review_weight * 100)}%"></i></div>
      ${w.recurring_mistakes.length ? `<ul>${w.recurring_mistakes.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      ${w.next_mission ? `<p class="small"><strong>다음 미션</strong> ${esc(w.next_mission)}</p>` : ''}
      <div class="weak-head"><span class="weak-meta">복습 가중치 ${w.next_review_weight.toFixed(2)} · 최근 복습 ${esc(w.last_reviewed)}</span>
        <span class="row-btns"><button type="button" class="btn small primary" data-drill>이 태그로 변형 문제</button><button type="button" class="btn small danger" data-del>삭제</button></span></div>
    </article>`;
  }).join('') : '<div class="empty">아직 취약 태그가 없습니다. 학습 세션 끝에 “오답노트 생성”을 누르면 자동으로 쌓입니다.</div>';
  const have = new Set(data.user_weaknesses.map(w => w.tag));
  $('#preset-tags').innerHTML = TAG_PRESETS.filter(t => !have.has(t)).map(t => `<button type="button" class="chip" data-add-tag="${t}">+ ${t}</button>`).join('');
  const logs = data.sessions.slice(-20).reverse();
  $('#log-list').innerHTML = logs.length ? logs.map(s => {
    const t = byId(TRACKS, s.track), m = byId(MODES, s.mode);
    return `<div class="log"><span class="log-head">${esc(s.date)} · ${esc(t ? t.short : s.track)} · ${esc(m ? m.name : s.mode)}</span>
      ${s.summary ? `<span>${esc(s.summary)}</span>` : ''}<span>${s.tags.map(x => `<span class="tag">${esc(x)}</span>`).join(' ')}</span></div>`;
  }).join('') : '<div class="empty">기록된 세션이 없습니다.</div>';
}
function renderSettings() {
  const engines = [
    { id: 'api', name: 'Gemini API 자동 모드', sub: 'API 키 필요 · 누르면 바로 출제·힌트·리뷰' },
    { id: 'copy', name: '프롬프트 복사 모드', sub: '무료 · 만든 프롬프트를 Gemini 앱에 붙여넣기' },
  ];
  $('#opt-engine').innerHTML = optHtml(engines, settings.engine, 'engine');
  $('#api-key').value = settings.apiKey;
  $('#deep-model').value = settings.deepModel;
  $('#light-model').value = settings.lightModel;
}
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  $('#btn-theme').textContent = t === 'dark' ? '☀' : '☾';
  $('#btn-theme').title = t === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';
  const meta = $('meta[name="theme-color"]'); if (meta) meta.content = t === 'dark' ? '#080c16' : '#16203a';
}

// ---------- files ----------
const readText = f => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = no; r.readAsText(f); });
const readDataUrl = f => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = no; r.readAsDataURL(f); });
async function addRefs(files) {
  for (const f of files) {
    if (f.size > 2 * 1024 * 1024) { toast(`${f.name}: 2MB를 넘어 건너뜁니다`); continue; }
    refs.push({ name: f.name, text: await readText(f) });
  }
  if (view === 'study') (session ? renderSession : renderSetup)();
}
async function addImages(files) {
  for (const f of files) {
    if (!f.type.startsWith('image/')) continue;
    if (f.size > 6 * 1024 * 1024) { toast('6MB가 넘는 이미지는 첨부할 수 없습니다'); continue; }
    const url = await readDataUrl(f);
    pendingImages.push({ mime: f.type, data: url.slice(url.indexOf(',') + 1), url });
  }
  renderComposer();
}
function routeFiles(files) {
  const list = [...files];
  const imgs = list.filter(f => f.type.startsWith('image/'));
  const texts = list.filter(f => !f.type.startsWith('image/'));
  if (imgs.length && session) addImages(imgs);
  if (texts.length) addRefs(texts).then(() => toast(`레퍼런스 ${texts.length}개 첨부`));
}

// ---------- events ----------
document.addEventListener('click', e => {
  const el = e.target.closest('button, a, label'); if (!el) return;
  const d = el.dataset;
  if (d.view) return showView(d.view);
  if (d.device) { pick.device = d.device; savePick(); return renderSetup(); }
  if (d.track) { pick.track = d.track; pick.topic = ''; savePick(); return renderSetup(); }
  if (d.mode) { pick.mode = d.mode; savePick(); return renderSetup(); }
  if (d.topic !== undefined) { pick.topic = pick.topic === d.topic ? '' : d.topic; savePick(); return renderSetup(); }
  if (d.refDel !== undefined) { e.preventDefault(); refs.splice(+d.refDel, 1); return renderSetup(); }
  if (d.engine) {
    if (d.engine === 'api' && !settings.apiKey) toast('아래에 API 키를 입력하고 저장하세요');
    settings.engine = d.engine; saveSettings(); return renderSettings();
  }
  if (d.input) { inputMode = d.input; return renderComposer(); }
  if (d.hint) return send({ text: HINTS[d.hint], label: `힌트 ${d.hint}단계 요청`, kind: 'hint' });
  if (d.copyMsg !== undefined) return copyText(copyPayload(+d.copyMsg), '복사했습니다. Gemini 앱에 붙여넣으세요.');
  if (d.copyCode !== undefined) return copyText(el.closest('.code').querySelector('code').textContent);
  if (d.retry !== undefined) return retry();
  if (d.addTag) { upsertWeakness({ tag: d.addTag, mastery_score: 2 }); saveData(); return renderNotes(); }
  const card = el.closest('.weak');
  if (card) {
    const w = data.user_weaknesses.find(x => x.tag === card.dataset.tag); if (!w) return;
    if (d.mastery) { w.mastery_score = +d.mastery; w.next_review_weight = weightOf(w); saveData(); return renderNotes(); }
    if (d.drill !== undefined) return startWeak(w.tag);
    if (d.del !== undefined && confirm(`${w.tag} 태그를 삭제할까요?`)) { data.user_weaknesses = data.user_weaknesses.filter(x => x !== w); saveData(); return renderNotes(); }
  }
  switch (el.id) {
    case 'brand': e.preventDefault(); return showView('study');
    case 'btn-theme': { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; applyTheme(t); try { localStorage.setItem(LS.theme, t); } catch { /* ignore */ } return; }
    case 'btn-start': return newSession([]);
    case 'btn-start-weak': return startWeak();
    case 'btn-exit':
      if (session.history.length > 1 && !session.wrapped && !confirm('세션을 끝낼까요? 오답노트를 만들지 않은 내용은 취약점에 반영되지 않습니다.')) return;
      session = null; saveSession(); return showView('study');
    case 'btn-giveup':
      if (!confirm('포기하고 정답과 해설을 볼까요?')) return;
      return send({ text: '포기할게. 정답 코드와 상세 해설을 보여 줘.', label: '포기 · 정답과 해설 요청', kind: 'answer' });
    case 'btn-next': return send({ text: '다음 문제를 내 줘. 같은 트랙·모드에서 방금과 다른 주제나 변형으로.', label: '다음 문제 요청', kind: 'start' });
    case 'btn-wrap': return send({ text: WRAP_PROMPT, label: '오늘 세션 오답노트 생성 요청', kind: 'wrap' }).then(() => { if (settings.engine !== 'api') toast('Gemini 답변을 취약점 탭의 붙여넣기 칸에 넣으면 저장됩니다'); });
    case 'btn-starter': { const c = lastStarterCode(); if (!c) return toast('멘토 메시지에 코드 블록이 없습니다'); $('#answer').value = c; return updateGutter(); }
    case 'btn-clear-img': pendingImages = []; return renderComposer();
    case 'btn-copy-notes': return copyText(notesMarkdown(), '복사했습니다. 구글 문서에 붙여넣으세요.');
    case 'btn-export-notes': return download(`gamedev-mentor-weakness-${today()}.json`, exportJson());
    case 'btn-save-manual': {
      const ok = absorbWrap($('#manual-text').value, session || pick);
      if (ok) { $('#manual-text').value = ''; renderNotes(); toast('저장했습니다'); } else toast('JSON 블록을 찾지 못했습니다. Gemini 답변 전체를 붙여넣었는지 확인하세요.');
      return;
    }
    case 'btn-save-api':
      settings.apiKey = $('#api-key').value.trim();
      settings.deepModel = $('#deep-model').value.trim() || 'gemini-4-neon';
      settings.lightModel = $('#light-model').value.trim() || 'gemini-4-hydrogen';
      if (settings.apiKey) settings.engine = 'api'; else settings.engine = 'copy';
      saveSettings(); renderSettings(); return toast(settings.apiKey ? '저장했습니다. API 자동 모드로 전환합니다.' : '키가 비어 있어 프롬프트 복사 모드로 둡니다.');
    case 'btn-test-api': {
      const st = $('#api-status'); st.className = 'small muted'; st.textContent = '확인하는 중…';
      return listModels().then(names => {
        $('#model-list').innerHTML = names.map(n => `<option value="${esc(n)}">`).join('');
        st.className = 'small status-ok'; st.textContent = `연결 성공 · 사용할 수 있는 모델 ${names.length}개. 모델 칸을 눌러 목록에서 고르세요.`;
      }).catch(err => { st.className = 'small status-bad'; st.textContent = err.message.includes('Failed to fetch') ? '네트워크에 연결할 수 없습니다.' : err.message; });
    }
    case 'btn-clear':
      if (!confirm('이 기기에 저장된 취약점, 세션 기록, API 키를 모두 지울까요? 되돌릴 수 없습니다.')) return;
      Object.values(LS).forEach(k => store.del(k)); location.reload(); return;
  }
});

$('#composer').addEventListener('submit', e => {
  e.preventDefault();
  const raw = $('#answer').value;
  if (!raw.trim() && !pendingImages.length) return toast(inputMode === 'code' ? '코드를 작성한 뒤 제출하세요' : '답변을 입력하세요');
  if (busy) return;
  const fence = session.lang === 'cpp' ? 'cpp' : 'csharp';
  const text = inputMode === 'code' ? `내가 작성한 코드야. 리뷰해 줘.\n\`\`\`${fence}\n${raw.replace(/\s+$/, '')}\n\`\`\`` : (raw.trim() || '첨부한 이미지를 분석해 줘.');
  const images = pendingImages; pendingImages = [];
  $('#answer').value = '';
  send({ text, kind: 'answer', images });
});
$('#answer').addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); return $('#composer').requestSubmit(); }
  if (e.key === 'Tab' && inputMode === 'code' && !e.shiftKey) {
    e.preventDefault(); const ta = e.target, s = ta.selectionStart;
    ta.setRangeText('    ', s, ta.selectionEnd, 'end'); updateGutter();
  }
});
$('#answer').addEventListener('input', updateGutter);
$('#answer').addEventListener('scroll', () => { $('#gutter').scrollTop = $('#answer').scrollTop; });
$('#answer').addEventListener('paste', e => {
  const files = [...(e.clipboardData ? e.clipboardData.files : [])].filter(f => f.type.startsWith('image/'));
  if (files.length) { e.preventDefault(); addImages(files); }
});
$('#lang').addEventListener('change', e => { session.lang = e.target.value; saveSession(); });
$('#img-input').addEventListener('change', e => { addImages(e.target.files); e.target.value = ''; });
$('#ref-input').addEventListener('change', e => { addRefs(e.target.files); e.target.value = ''; });
$('#import-input').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  try {
    const j = JSON.parse(await readText(f));
    if (!Array.isArray(j.user_weaknesses)) throw new Error('형식');
    j.user_weaknesses.forEach(w => { const before = data.user_weaknesses.find(x => x.tag === w.tag); upsertWeakness(w, trackByKey(w.track) && trackByKey(w.track).id); if (!before && w.last_reviewed) data.user_weaknesses.find(x => x.tag === w.tag).last_reviewed = w.last_reviewed; });
    const seen = new Set(data.sessions.map(s => JSON.stringify(s)));
    (j.sessions || []).forEach(s => { if (!seen.has(JSON.stringify(s))) data.sessions.push(s); });
    data.sessions.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    saveData(); renderNotes(); toast(`취약 태그 ${j.user_weaknesses.length}개를 불러와 합쳤습니다`);
  } catch { toast('불러올 수 없는 파일입니다. 이 앱에서 내보낸 JSON인지 확인하세요.'); }
});
for (const zone of [$('#ref-drop'), $('#composer')]) {
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('over'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('over'); routeFiles(e.dataTransfer.files); });
}

// ---------- boot ----------
applyTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
if (session) inputMode = session.mode === 'impl' ? 'code' : 'text';
showView('study');
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('./sw.js').catch(() => { /* 오프라인 캐시 없이도 동작 */ });
