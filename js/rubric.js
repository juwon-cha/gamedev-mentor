'use strict';
/* 인터랙티브 자가 채점표: 배점 합산, 치명적 감점 차감, 등급 산출. */
const Rubric = (() => {
  const GRADES = [
    { min: 85, id: 'pass', label: 'Pass · Senior Ready', note: '85점 이상' },
    { min: 60, id: 'borderline', label: 'Borderline · 복습 권장', note: '60~84점' },
    { min: 0, id: 'retry', label: 'Retry · 오답노트 필수', note: '59점 이하' },
  ];
  const has = p => !!(p && p.rubric && Array.isArray(p.rubric.criteria) && p.rubric.criteria.length);
  const total = p => p.rubric.criteria.reduce((s, c) => s + (Number(c.points) || 0), 0);
  const gradeOf = score => GRADES.find(g => score >= g.min);

  /* checked: 충족한 criteria id 배열, deductions: 해당하는 치명적 감점 id 배열 */
  function compute(p, checked, deductions) {
    const earned = p.rubric.criteria.filter(c => checked.includes(c.id)).reduce((s, c) => s + (Number(c.points) || 0), 0);
    const lost = (p.rubric.criticalDeductions || []).filter(d => deductions.includes(d.id)).reduce((s, d) => s + Math.abs(Number(d.penalty) || 0), 0);
    const max = total(p) || 100;
    const score = Math.max(0, Math.min(100, Math.round(((earned - lost) / max) * 100)));
    return { score, grade: gradeOf(score).id, gradeLabel: gradeOf(score).label, earned, lost };
  }
  const missed = (p, checked) => p.rubric.criteria.filter(c => !checked.includes(c.id));

  /* basis: 근거 문서 대신 근거의 종류를 밝힌 항목의 배지 */
  const BASIS = {
    principle: { label: '일반 원칙', title: '항목 설명에 밝힌 일반 공학 원칙을 채점합니다' },
    tests: { label: '테스트로 확인', title: '숨은 테스트가 이 동작을 직접 확인합니다' },
  };
  const basisBadge = (b, h) => (BASIS[b] ? `<span class="src basis basis-${b}" title="${h.esc(BASIS[b].title)}">${h.esc(BASIS[b].label)}</span>` : '');
  const badges = (c, h) => (c.sourceId ? ' ' + h.srcBadge(c.sourceId) : '') + (c.basis && BASIS[c.basis] ? ' ' + basisBadge(c.basis, h) : '');

  /* esc, inline: 문자열 이스케이프·인라인 마크다운 함수 / srcBadge: sourceId → 배지 HTML */
  function render(p, saved, h) {
    if (!has(p)) return '';
    const checked = (saved && saved.criteria) || [], ded = (saved && saved.deductions) || [];
    const r = compute(p, checked, ded);
    const cats = [...new Set(p.rubric.criteria.map(c => c.category))];
    const row = (c, kind, on) => `<li><label><input type="checkbox" data-rubric="${kind}" value="${h.esc(c.id)}" id="rb-${kind}-${h.esc(c.id)}" ${on ? 'checked' : ''}>
      <span class="rb-desc">${h.inline(String(c.description))}${badges(c, h)}</span>
      <span class="rb-pts num">${kind === 'c' ? '+' + c.points : c.penalty}</span></label></li>`;
    return `<section class="sec rubric" id="rubric">
      <h3>공식 채점표 · 자가 채점 <span class="muted">(100점 만점)</span></h3>
      <p class="muted small">내 답안이 충족한 항목에 체크하세요. 애매하면 체크하지 않는 쪽이 정확합니다.</p>
      ${cats.map(cat => `<div class="rb-cat"><b>${h.esc(cat)} <span class="muted num">${p.rubric.criteria.filter(c => c.category === cat).reduce((s, c) => s + c.points, 0)}점</span></b>
        <ul class="rb-list">${p.rubric.criteria.filter(c => c.category === cat).map(c => row(c, 'c', checked.includes(c.id))).join('')}</ul></div>`).join('')}
      ${(p.rubric.criticalDeductions || []).length ? `<div class="rb-cat rb-crit"><b>치명적 감점 <span class="muted">실무에서 바로 반려되는 실수 — 해당하면 체크</span></b>
        <ul class="rb-list">${p.rubric.criticalDeductions.map(d => row(d, 'd', ded.includes(d.id))).join('')}</ul></div>` : ''}
      <div class="rb-result grade-${r.grade}" id="rb-result">
        <span class="rb-score num">${r.score}<small>점</small></span>
        <span class="rb-grade">${h.esc(r.gradeLabel)}</span>
        <button type="button" class="btn small primary" id="btn-rubric-apply">이 점수로 채점 완료</button>
      </div>
    </section>`;
  }
  /* 화면의 체크 상태를 읽어 결과 객체로 반환 */
  function read(p, root) {
    const criteria = [...root.querySelectorAll('[data-rubric="c"]:checked')].map(x => x.value);
    const deductions = [...root.querySelectorAll('[data-rubric="d"]:checked')].map(x => x.value);
    return { criteria, deductions, ...compute(p, criteria, deductions) };
  }
  return { has, compute, missed, render, read, gradeOf, GRADES };
})();
