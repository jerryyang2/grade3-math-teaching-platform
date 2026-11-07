/* 共用課程頁的直式教學輔助選單。 */
(() => {
  'use strict';

  const core = window.ClassroomCore;
  const tools = document.getElementById('course-teacher-tools');
  if (!core || !tools) return;

  const summary = tools.querySelector('summary');
  const list = tools.querySelector('.course-tool-box');
  const e = core.escape;
  const items = [
    ['features', '🏆', '教學平台特色', 'Platform features', '看看如何搭配教具、練習和學習觀察'],
    ['clock', '◷', '課堂計時器', 'Classroom timer', '練習、評量與分組活動，可暫停或延時'],
    ['switch-access', '🕹️', '單鍵微動開關輔具', 'Single-switch access', '自動掃描可操作項目，按空白鍵選取'],
    ['spotlight', '🔦', '聚光燈', 'Spotlight', '跟隨滑鼠、觸控或鍵盤焦點'],
    ['calm', '🧘', '數學冷靜通道', 'Math calm corner', '呼吸光環、視覺沙漏與可選雨聲'],
    ['communication', '📝', '親師聯絡 & 4合1小單', 'Home–school communication', 'LINE 草稿、IEP 評量草稿與 A4 四合一小單'],
    ['briefing', '⚡', '60秒快速備課卡', '60-second lesson card', '看本小節先備能力、教具與觀察重點']
  ];

  summary.id = 'btn-tools-dropdown';
  list.setAttribute('aria-label', '教學輔助功能清單');
  const existing = [...list.children];
  const clock = existing.shift();
  const menuHeading = document.createElement('p');
  menuHeading.className = 'semester-tool-heading';
  menuHeading.textContent = '直式選單 · 點選項目即刻開啟';
  list.prepend(menuHeading);
  const titles = new Map();
  for (const [id, icon, title, english, description] of items) {
    const button = id === 'clock' ? clock : document.createElement('button');
    button.type = 'button';
    button.className = 'semester-tool-item';
    if (id !== 'clock') button.id = 'btn-tool-' + id;
    if (id === 'switch-access' || id === 'spotlight') button.setAttribute('aria-pressed', 'false');
    if (['features', 'calm', 'communication', 'briefing'].includes(id)) button.setAttribute('aria-haspopup', 'dialog');
    button.innerHTML = `<span class="semester-tool-icon" aria-hidden="true">${icon}</span>
      <span><strong data-zh="${e(title)}" data-en="${e(english)}">${e(title)}</strong><small>${e(description)}</small></span>`;
    titles.set(id, title);
    list.append(button);
  }
  const extra = document.createElement('div');
  extra.className = 'semester-tool-extras';
  extra.append(...existing);
  list.append(extra);

  document.addEventListener('click', event => {
    if (tools.open && !tools.contains(event.target)) tools.open = false;
  });
  tools.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !tools.open) return;
    event.preventDefault();
    tools.open = false;
    summary.focus();
  });
  list.addEventListener('click', event => {
    if (!event.target.closest('button')) return;
    tools.open = false;
    // Keep focus out of the collapsed list while the selected tool opens.
    if (list.contains(document.activeElement)) summary.focus();
  }, true);

  const dialog = document.createElement('dialog');
  dialog.id = 'semester-teaching-dialog';
  dialog.setAttribute('aria-labelledby', 'semester-teaching-title');
  dialog.innerHTML = `<header><h2 id="semester-teaching-title"></h2>
    <form method="dialog"><button type="submit" class="outline">關閉</button></form></header>
    <div id="semester-teaching-content"></div>`;
  document.body.append(dialog);
  const heading = dialog.querySelector('h2');
  const content = dialog.querySelector('#semester-teaching-content');
  dialog.addEventListener('close', () => {
    if (dialog.dataset.tool === 'calm') window.closeCalmCornerModal();
    if (!dialog.dataset.destination) summary.focus();
  });

  function open(id, html = '') {
    dialog.dataset.tool = id;
    delete dialog.dataset.destination;
    heading.textContent = titles.get(id);
    content.innerHTML = html;
    dialog.showModal();
  }

  const switchAccess = window.SwitchAccessManager;
  switchAccess.getTargets = () => {
    const selected = document.querySelector('.course-teaching-nav [aria-current]');
    if (selected?.dataset.view === 'practice') {
      return [...document.querySelectorAll('#choices button, #hint-open, #hint button, #solution-open, #previous, #next')];
    }
    const pane = document.querySelector('.course-panel:not([hidden])') || document.getElementById('lesson');
    const buttons = [...pane.querySelectorAll('button:not(:disabled)')].filter(button => button.offsetParent !== null);
    return buttons.length ? buttons : [...document.querySelectorAll('.course-teaching-nav button')];
  };
  document.getElementById('btn-tool-switch-access').onclick = () => switchAccess.toggle();
  document.getElementById('btn-tool-spotlight').onclick = () => window.SpotlightManager.toggle();

  document.getElementById('btn-tool-features').onclick = () => open('features', `
    <p>${e(core.termTitle)} · 選一個單元，再依學生需要安排教具、圖像和練習。</p>
    <ul>
      <li>用實物或數位教具做一遍，再請學生指圖、口述或寫算式。</li>
      <li>練習時可報讀、放大或使用分步提示。看完解法後可重練。</li>
      <li>可列印本小節的學習單，再把作答與提示程度寫入課堂觀察。</li>
    </ul>
    <div class="course-action-row">
      <button type="button" data-teaching-destination="prep">備課指引</button>
      <button type="button" data-teaching-destination="practice">隨堂練習</button>
      <button type="button" data-teaching-destination="worksheet">學習單列印</button>
    </div>`);
  content.addEventListener('click', event => {
    const target = event.target.closest('[data-teaching-destination]');
    if (!target) return;
    dialog.dataset.destination = target.dataset.teachingDestination;
    dialog.close();
    document.querySelector(`.course-teaching-nav [data-view="${target.dataset.teachingDestination}"]`)?.click();
  });

  document.getElementById('btn-tool-calm').onclick = () => {
    open('calm');
    window.openCalmCornerModal();
    const calm = document.getElementById('calmCornerModal');
    calm.querySelector('.modal-close-btn').hidden = true;
    content.append(calm);
  };

  document.getElementById('btn-tool-briefing').onclick = () => {
    const unit = core.unit();
    const section = core.section();
    const steps = core.learningSteps(section);
    open('briefing', `
      <h3>${e(core.termTitle)} · ${e(unit.title)} · ${e(section.title)}</h3>
      <dl class="semester-briefing">
        <div><dt>先備確認</dt><dd>${e(unit.before)}</dd></div>
        <div><dt>教具與示範</dt><dd>${e(unit.action)}</dd></div>
        <div><dt>這節課先做什麼</dt><dd>${e(steps[0])}</dd></div>
        <div><dt>課後觀察</dt><dd>${e(unit.extension?.check || section.tip)} 請學生用口述、指圖或操作說明做法。</dd></div>
      </dl>`);
  };

  document.getElementById('btn-tool-communication').onclick = () => {
    const unit = core.unit();
    const section = core.section();
    const topic = `${core.termTitle}｜${unit.title} · ${section.title}`;
    const homeTask = `請孩子挑一道本小節的練習，用實物、圖或口頭說明做法。可以先從這一步試起：${core.learningSteps(section)[0]}`;
    open('communication', `
      <p>${e(topic)}</p>
      <label>LINE 親師聯絡草稿<textarea id="semester-family-note" rows="5"></textarea></label>
      <label>IEP 評量草稿<textarea id="semester-iep-note" rows="5"></textarea></label>
      <details><summary>預覽 A4 四合一小單</summary><div id="semester-family-slips"></div></details>
      <div class="course-action-row">
        <button type="button" class="outline" data-copy-note="semester-family-note">複製 LINE 草稿</button>
        <button type="button" class="outline" data-copy-note="semester-iep-note">複製 IEP 草稿</button>
        <button type="button" id="semester-print-family">列印 A4 四合一小單</button>
      </div><p id="semester-copy-status" role="status"></p>`);
    content.querySelector('#semester-family-note').value = `親愛的家長您好：\n本次學習主題為${topic}。\n${homeTask}\n課堂觀察（待老師填寫）：＿＿＿＿`;
    content.querySelector('#semester-iep-note').value = `【數學評量草稿｜${topic}】\n評量日期及學生代號：＿＿＿＿\n作答方式與評量調整：＿＿＿＿\n實際表現及所需解題提示：＿＿＿＿\n下次教學安排：＿＿＿＿`;
    for (const button of content.querySelectorAll('[data-copy-note]')) {
      button.onclick = async () => {
        const note = document.getElementById(button.dataset.copyNote);
        const status = content.querySelector('#semester-copy-status');
        try {
          await navigator.clipboard.writeText(note.value);
          status.textContent = '草稿已複製。';
        } catch (_) {
          note.focus();
          note.select();
          status.textContent = '已選取草稿，可用鍵盤複製。';
        }
      };
    }
    const slips = content.querySelector('#semester-family-slips');
    slips.innerHTML = Array.from({length: 4}, () => `<article><h3>數學學習通知單</h3>
      <p>學生：＿＿＿＿　日期：＿＿＿＿</p><p>${e(topic)}</p><p>${e(homeTask)}</p><p>家長回饋：＿＿＿＿＿＿＿＿</p></article>`).join('');
    content.querySelector('#semester-print-family').onclick = () => {
      slips.parentElement.open = true;
      window.print();
    };
  };
})();
