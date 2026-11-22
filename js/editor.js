'use strict';
/* 코드 에디터: 줄 번호, Tab 4칸 들여쓰기, 입력 후 자동 임시저장. 면접·개념 문제에서는 일반 메모장으로 동작합니다. */
const Editor = (() => {
  let ta, gutter, wrap, onSave, timer, codeMode = true;

  function updateGutter() {
    if (!codeMode) return;
    const n = ta.value.split('\n').length;
    let s = ''; for (let i = 1; i <= n; i++) s += i + '\n';
    gutter.textContent = s;
    gutter.scrollTop = ta.scrollTop;
  }
  function scheduleSave() {
    clearTimeout(timer);
    timer = setTimeout(() => onSave && onSave(ta.value), 500);
  }
  function mount(opts) {
    ta = opts.textarea; gutter = opts.gutter; wrap = opts.wrap; onSave = opts.onSave;
    ta.addEventListener('input', () => { updateGutter(); scheduleSave(); });
    ta.addEventListener('scroll', () => { gutter.scrollTop = ta.scrollTop; });
    ta.addEventListener('keydown', e => {
      if (e.key !== 'Tab' || !codeMode || e.shiftKey) return;
      e.preventDefault();
      ta.setRangeText('    ', ta.selectionStart, ta.selectionEnd, 'end');
      updateGutter(); scheduleSave();
    });
    // 탭을 닫거나 다른 문제로 넘어가기 직전에도 저장
    window.addEventListener('pagehide', flush);
  }
  function flush() { clearTimeout(timer); if (onSave && ta) onSave(ta.value); }
  function setMode(isCode, placeholder) {
    codeMode = isCode;
    wrap.classList.toggle('code', isCode);
    gutter.hidden = !isCode;
    ta.placeholder = placeholder || '';
    updateGutter();
  }
  function setValue(v) { ta.value = v || ''; ta.scrollTop = 0; updateGutter(); }
  const getValue = () => ta.value;

  return { mount, setMode, setValue, getValue, flush };
})();
