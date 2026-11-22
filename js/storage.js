'use strict';
/* 학습 진도·오답 메모·작성 중인 답안을 이 기기의 localStorage에 보관하고, JSON으로 백업/복원합니다. */
const Storage = (() => {
  const KEY = 'gdm2.progress';
  const UI_KEY = 'gdm2.ui';
  const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };

  let progress = read(KEY, {});
  const blank = () => ({ status: '', memo: '', draft: '', reveal: { hints: 0, follow: 0, solution: false }, misses: 0, lastReviewed: '', rubric: null, judge: null });
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

  function get(id) {
    const e = progress[id];
    return e ? { ...blank(), ...e, reveal: { ...blank().reveal, ...(e.reveal || {}) } } : blank();
  }
  function update(id, patch) {
    const next = { ...get(id), ...patch };
    progress[id] = next;
    return write(KEY, progress) ? next : null;
  }
  /* 자가 평가: review(어려움) / unsure(애매함) / done(완벽 이해) */
  function rate(id, status) {
    const cur = get(id);
    return update(id, { status, lastReviewed: today(), misses: cur.misses + (status === 'done' ? 0 : 1) });
  }
  const all = () => progress;
  const ui = { get: () => read(UI_KEY, {}), set: v => write(UI_KEY, v) };

  function exportJson() {
    return JSON.stringify({ app: 'gamedev-mentor', version: 2, exported_at: new Date().toISOString(), progress }, null, 2);
  }
  /* 불러온 기록을 현재 기록에 합칩니다. 같은 문제는 더 최근에 복습한 쪽을 남깁니다. */
  function importJson(text) {
    const j = JSON.parse(text);
    if (!j || typeof j.progress !== 'object' || Array.isArray(j.progress)) throw new Error('format');
    let n = 0;
    for (const [id, e] of Object.entries(j.progress)) {
      if (!e || typeof e !== 'object') continue;
      const cur = progress[id];
      if (!cur || String(e.lastReviewed || '') >= String(cur.lastReviewed || '')) { progress[id] = { ...blank(), ...e }; n++; }
    }
    write(KEY, progress);
    return n;
  }
  function clear() { progress = {}; write(KEY, progress); }

  return { get, update, rate, all, ui, exportJson, importJson, clear, today };
})();
