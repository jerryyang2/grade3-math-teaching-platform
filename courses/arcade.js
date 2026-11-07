/* 一、二、四、五、六年級共用遊戲館。補充遊戲使用原本的獨立頁。 */
(() => {
  'use strict';
  const folder = '../games/';
  const supplemental = [
    ['game1-addition-adventure', '🏪', '補充 · 低年級加法', '小二加法冒險王：森林超商大採購',
      '結合「位值積木點數（點擊出聲）」與「森林超商金幣進位收銀台」，落實 C-R-A 具體表徵，支援 5 位特教學童專屬代幣存摺！',
      ['🪙 錢幣進位換算', '🧱 具體積木點數', '📋 IEP評量記錄']],
    ['game2-vertical-addition', '🧮', '補充 · 整數直式加減', '三四位數直式加減 · 學障友善園地',
      '專為學障與低感官刺激設計：四色位值定錨（千紅百藍十綠個橘）、防呆進借位提示圈與溫和木琴音效，徹底消除視覺雜訊！',
      ['🌈 位值四色對齊', '⭕ 防呆進借位', '🌿 低刺激木琴音']],
    ['game3-math-tug-of-war', '🪢', '補充 · 跨年級 3v3', '數學拔河大對決 (Math Tug of War)',
      '超人氣 3v3 團隊拔河或雙人對決！答對題隊伍奮力將繩子拉向己方，具備逼真拔河張力物理、連擊強拉大招與 8-bit 晶片配樂！',
      ['⚔️ 同儕團隊拔河', '⚡ 連擊齊心強拉', '🎵 8-bit 歡樂音效']],
    ['game4-math-park-board', '🎨', '手寫塗鴉與列印', '學習教室數學樂園 & 數位小白板',
      '整合數位觸控計算小白板（學生在大螢幕直接筆算塗鴉）、注音標準排版、語音報讀，並可一鍵生成 A4 四合一實體列印小單！',
      ['✏️ 觸控手寫板', '🖨️ A4 實體練習單', '🔤 標準注音排版']],
    ['game5-dual-math-battle', '⚡', '中年級血條對戰', '國小中年級數學雙雄爭霸戰',
      '閃電暴龍隊 vs 烈火鳳凰隊！雙人同台血條對抗、搶答計分、首殺號角與大招能量蓄力，徹底激發學童的主動計算動機！',
      ['🦖 雙雄血條對決', '⏱️ 計時搶答競速', '🔥 大招能量奧義']]
  ];

  window.mountCourseArcade = (core, panel) => {
    const e = core.escape;
    const tug = ['game6-grade3-tug', '🪢', `${core.termTitle} · ${core.units.length} 單元`,
      `森林拔河運動會｜${core.termTitle}`,
      '選擇本學期的單元、小節和難度。雙隊同機或和電腦陪練，一起看圖、聽題、說方法。',
      ['🪢 雙隊或電腦陪練', '🔊 圖像與朗讀', '🛟 不限時慢慢想']];
    function tugLink() {
      const params = new URLSearchParams({grade:core.grade, term:core.term, unit:core.unit().id});
      return folder + tug[0] + '/index.html?' + params;
    }

    const gallery = panel.querySelector('.course-arcade');
    gallery.innerHTML = `
      <div id="arcade-player-modal" style="display:none">
        <section class="arcade-player-card" aria-labelledby="arcade-player-title">
          <div class="arcade-player-header">
            <div><span id="arcade-player-icon" aria-hidden="true"></span> <strong id="arcade-player-title"></strong></div>
            <div class="course-arcade-controls">
              <button class="outline" type="button" id="arcade-fullscreen-toggle" aria-pressed="false">⛶ 全螢幕遊玩</button>
              <a class="course-arcade-link" id="course-game-external" target="_blank" rel="noopener">另開分頁 ↗</a>
              <button type="button" data-close-arcade>關閉遊戲</button>
            </div>
          </div>
          <div class="arcade-iframe-wrapper"><iframe id="arcade-game-frame" title="互動遊戲" allowfullscreen></iframe></div>
        </section>
      </div>
      <div class="arcade-cards-grid">${[tug, ...supplemental].map(([id, icon, badge, title, description, skills], index) => `
        <article class="arcade-card">
          <div class="course-arcade-banner">
            ${index === 0 ? `<img src="${folder}${id}/favicon.svg" alt="" width="50" height="50">` : `<span aria-hidden="true">${icon}</span>`}
            ${index === 3 ? '<strong class="course-arcade-recommended">超級推薦</strong>' : ''}
            <span class="course-arcade-badge">${e(badge)}</span>
          </div>
          <div class="course-arcade-body">
            <h3 class="arcade-card-title">${e(title)}</h3>
            <p>${e(description)}</p>
            <ul class="course-arcade-skills">${skills.map(skill => `<li>${e(skill)}</li>`).join('')}</ul>
            <div class="arcade-card-actions">
              <button type="button" data-open-arcade data-icon="${icon}">🎮 平台內遊玩</button>
              <a class="course-arcade-link" href="${index === 0 ? e(tugLink()) : folder + id + '/index.html'}" target="_blank" rel="noopener">⛶ 獨立分頁</a>
            </div>
          </div>
        </article>`).join('')}</div>`;

    const stage = gallery.querySelector('#arcade-player-modal');
    const frame = gallery.querySelector('#arcade-game-frame');
    const closeButton = gallery.querySelector('[data-close-arcade]');
    const firstLink = gallery.querySelector('.arcade-card-actions a');
    let opener;
    function close() {
      stage.style.display = 'none';
      frame.removeAttribute('src');
      if (!panel.hidden) opener?.focus();
    }
    window.launchArcadeGame = (url, title, icon, trigger) => {
      opener = trigger;
      stage.style.display = 'block';
      frame.src = url;
      frame.title = title;
      gallery.querySelector('#arcade-player-title').textContent = title;
      gallery.querySelector('#arcade-player-icon').textContent = icon;
      gallery.querySelector('#course-game-external').href = url;
      closeButton.focus({preventScroll:true});
      stage.scrollIntoView({block:'start'});
    };
    gallery.addEventListener('click', event => {
      const open = event.target.closest('[data-open-arcade]');
      if (!open) return;
      const card = open.closest('.arcade-card');
      window.launchArcadeGame(card.querySelector('a').getAttribute('href'),
        card.querySelector('.arcade-card-title').textContent, open.dataset.icon, open);
    });
    closeButton.addEventListener('click', close);
    window.addEventListener('message', event => {
      if (event.data === 'close-game-modal' && window.MathEmbeddedMessaging.isFrom(event, frame.contentWindow)) close();
    });

    return {
      refresh() { firstLink.href = tugLink(); }
    };
  };
})();
