/* 老師記下課堂表現；與線上作答分開，僅保存學生 ID 和結構化觀察。 */
(function () {
  'use strict';
  const key = 'math_g3s2_classroom_diagnostics_v1';
  const outcomes = { independent:'獨立完成', supported:'提示後完成', pending:'待再教', '':'未觀察' };
  const modes = { oral:'口述', point:'指認', hands:'教具操作', written:'紙筆' };
  const prompts = { none:'無解題提示', verbal:'口語線索', visual:'圖像／標記提示', modeled:'教師示範', combined:'多種解題提示' };
  const accommodations = { standard:'依原題呈現', read:'試題報讀', large:'放大／提高對比', time:'延長作答時間', combined:'多種評量調整' };
  const {units} = window.NANI_G3S2_DATA;
  const studentList = () => window.StudentBank.getStudents();
  const getUnit = id => units.find(unit => unit.id === id);
  const esc = value => window.LearningRecords.escapeHtml(value);
  let storageOK = true;
  let records = [];
  let root;

  function validResult(result, unit) {
    return unit.diagnostic.tasks.some(task => task.id === result.taskId) &&
      ['independent', 'supported', 'pending'].includes(result.outcome) &&
      Object.hasOwn(modes, result.mode) && Object.hasOwn(prompts, result.prompt) &&
      (result.outcome !== 'independent' || result.prompt === 'none') &&
      (result.outcome !== 'supported' || result.prompt !== 'none');
  }

  try {
    const loaded = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(loaded) || !loaded.every(entry => {
      const unit = getUnit(entry?.unitId);
      return unit && typeof entry.studentId === 'string' && Number.isFinite(Date.parse(entry.time)) &&
        Object.hasOwn(accommodations, entry.accommodation) && Array.isArray(entry.results) && entry.results.length > 0 &&
        new Set(entry.results.map(result => result?.taskId)).size === entry.results.length &&
        entry.results.every(result => result && validResult(result, unit));
    })) throw new Error('Invalid classroom observation');
    records = loaded;
  } catch (_) { storageOK = false; }

  function persist(next) {
    if (!storageOK) return false;
    try {
      localStorage.setItem(key, JSON.stringify(next));
      records = next;
      document.dispatchEvent(new Event('classroom-diagnostic-change'));
      return true;
    } catch (_) {
      return false;
    }
  }

  const options = entries => entries.map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join('');
  const timeLabel = time => new Date(time).toLocaleString('zh-TW', {dateStyle:'short', timeStyle:'short'});
  function suggestion(unit, entry) {
    const results = entry.results;
    if (results.some(row => row.outcome === 'pending')) return unit.diagnostic.reteach;
    if (results.some(row => row.outcome === 'supported')) return '保留必要的評量調整，減少解題提示，再用同概念的另一題確認。';
    return results.length === unit.diagnostic.tasks.length
      ? '下一節換情境再確認，並記下學生能否自行使用策略。'
      : '補看本回合尚未觀察的項目，再安排換題或換情境。';
  }
  function details(unit, entry) {
    return unit.diagnostic.tasks.map(task => {
      const result = entry.results.find(row => row.taskId === task.id);
      const label = task.id === 'strategy' ? `${task.label}（${unit.diagnostic.indicator.code}）` : task.label;
      return result
        ? `${label}：${outcomes[result.outcome]}（${modes[result.mode]}；${prompts[result.prompt]}）`
        : `${label}：未觀察`;
    });
  }
  function matches(studentId, unitId) {
    return records.filter(entry => entry.studentId === studentId && (!unitId || entry.unitId === unitId));
  }
  function report(unitId, studentId) {
    if (!studentId) return '未選擇帶入教師觀察。';
    const entry = matches(studentId, unitId).at(-1);
    if (!entry) return '此學生在此單元尚無教師觀察紀錄。';
    return [`最近一回合（${timeLabel(entry.time)}），評量方式：${accommodations[entry.accommodation]}`,
      ...details(getUnit(unitId), entry), `建議下一步：${suggestion(getUnit(unitId), entry)}`].join('\n');
  }

  function renderTasks() {
    const unit = getUnit(root.querySelector('#diagnostic-unit').value);
    const area = root.querySelector('#diagnostic-tasks');
    area.innerHTML = unit.diagnostic.tasks.map(task => `<fieldset class="diagnostic-task" data-task="${task.id}">
      <legend>${task.label}${task.id === 'strategy' ? ' · ' + unit.diagnostic.indicator.code : ''}</legend>
      <p>${task.prompt}</p>
      <details><summary>參考作答與觀察重點</summary><p>${task.evidence}</p></details>
      <div class="evidence-toolbar"><label>表現<select name="outcome">${options([['',outcomes['']], ...Object.entries(outcomes).filter(([value]) => value)])}</select></label>
        <label>表達方式<select name="mode" disabled><option value="">請選擇</option>${options(Object.entries(modes))}</select></label>
        <label>解題提示<select name="prompt" disabled>${options(Object.entries(prompts))}</select></label></div>
    </fieldset>`).join('');
    for (const field of area.querySelectorAll('fieldset')) {
      const outcome = field.querySelector('[name="outcome"]');
      const mode = field.querySelector('[name="mode"]');
      const prompt = field.querySelector('[name="prompt"]');
      outcome.addEventListener('change', () => {
        mode.disabled = !outcome.value;
        mode.required = Boolean(outcome.value);
        prompt.disabled = !outcome.value || outcome.value === 'independent';
        prompt.options[0].disabled = outcome.value === 'supported';
        if (!outcome.value) mode.value = '';
        if (prompt.disabled) prompt.value = 'none';
        else if (prompt.options[0].disabled && prompt.value === 'none') prompt.value = '';
        prompt.required = !prompt.disabled;
      });
    }
  }

  function status(message) {
    root.querySelector('#diagnostic-status').textContent = message;
  }

  function renderHistory() {
    const studentId = root.querySelector('#diagnostic-student').value;
    const unit = getUnit(root.querySelector('#diagnostic-unit').value);
    const history = matches(studentId, unit.id).slice().reverse();
    root.querySelector('#diagnostic-history').innerHTML = history.length ? history.map(entry => `<details class="diagnostic-history-entry">
      <summary>${timeLabel(entry.time)} · 觀察 ${entry.results.length} 項</summary>
      <p>評量調整：${accommodations[entry.accommodation]}</p><ul>${details(unit, entry).map(line => `<li>${line}</li>`).join('')}</ul>
      <p><strong>建議下一步：</strong>${suggestion(unit, entry)}</p></details>`).join('') : '<p>此代號在本單元尚無教師觀察。</p>';
    const all = matches(studentId);
    root.querySelector('#diagnostic-export').disabled = !all.length;
    root.querySelector('#diagnostic-clear').disabled = !all.length;
  }

  function init() {
    root = document.getElementById('classroom-diagnostics');
    if (!root) return;
    const student = root.querySelector('#diagnostic-student');
    const unit = root.querySelector('#diagnostic-unit');
    const accommodation = root.querySelector('#diagnostic-accommodation');
    const form = root.querySelector('form');
    function refreshStudents() {
      const selected = student.value;
      student.innerHTML = '<option value="">請選擇學生代號</option>' +
        studentList().map(item => `<option translate="no" value="${esc(item.id)}">${esc(item.name)}</option>`).join('');
      student.value = [...student.options].some(option => option.value === selected) ? selected : '';
    }
    function resetTasks() {
      accommodation.selectedIndex = 0;
      renderTasks();
      renderHistory();
      status(storageOK ? '' : '目前無法讀取本機紀錄，請保留原有資料並檢查瀏覽器儲存設定。');
    }
    unit.innerHTML = options(units.map(item => [item.id, item.title]));
    accommodation.innerHTML = options(Object.entries(accommodations));
    refreshStudents();
    resetTasks();
    student.addEventListener('change', resetTasks);
    unit.addEventListener('change', resetTasks);
    document.addEventListener('student-bank-renamed', refreshStudents);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const currentUnit = getUnit(unit.value);
      const results = [...form.querySelectorAll('[data-task]')].flatMap(field => {
        const outcome = field.querySelector('[name="outcome"]').value;
        return outcome ? [{taskId:field.dataset.task, outcome, mode:field.querySelector('[name="mode"]').value, prompt:field.querySelector('[name="prompt"]').value}] : [];
      });
      if (!results.length) return status('請先選擇至少一項觀察表現。');
      if (!studentList().some(item => String(item.id) === student.value) ||
          !results.every(result => validResult(result, currentUnit))) return status('請確認學生代號、表達方式與解題提示。');
      const entry = {studentId:student.value, unitId:unit.value, time:new Date().toISOString(), accommodation:accommodation.value, results};
      if (!persist([...records, entry])) return status('未能儲存這回合，表單內容仍保留；請檢查瀏覽器儲存設定。');
      resetTasks();
      root.querySelector('.diagnostic-history-entry').open = true;
      status('已儲存本回合。' + suggestion(currentUnit, entry));
      root.querySelector('#diagnostic-status').focus();
    });
    root.querySelector('#diagnostic-export').addEventListener('click', () => {
      const data = matches(student.value).map(entry => {
        const item = getUnit(entry.unitId);
        return {...entry, unitTitle:item.title, mathCode:item.curriculumCode, strategyCode:item.diagnostic.indicator.code,
          observation:details(item, entry), nextStep:suggestion(item, entry)};
      });
      const url = URL.createObjectURL(new Blob([JSON.stringify({schema:1, observations:data}, null, 2)], {type:'application/json'}));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'math-classroom-observations.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    });
    root.querySelector('#diagnostic-clear').addEventListener('click', () => {
      if (!confirm('清除此代號在所有單元的教師觀察？可先匯出備份。')) return;
      if (!persist(records.filter(entry => entry.studentId !== student.value))) return status('未能清除紀錄。');
      renderHistory();
      status('已清除此代號的教師觀察。');
    });
    root.querySelector('#diagnostic-iep').addEventListener('click', () => {
      const evidence = document.getElementById('iep-evidence-student');
      const reportUnit = document.getElementById('iep-unit-select');
      evidence.value = student.value;
      reportUnit.value = unit.value;
      evidence.dispatchEvent(new Event('change'));
      reportUnit.dispatchEvent(new Event('change'));
      evidence.focus();
    });
  }

  function open(unitId) {
    window.switchSpEdTab('iep');
    const picker = root.querySelector('#diagnostic-unit');
    if (picker.value !== unitId) {
      picker.value = unitId;
      picker.dispatchEvent(new Event('change'));
    }
    document.getElementById('diagnostic-title').focus();
  }
  window.ClassroomDiagnostics = {open, report};
  document.addEventListener('DOMContentLoaded', init);
})();
