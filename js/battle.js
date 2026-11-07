/**
 * 分組即時計算搶答大對決 (Math Battle Arena)
 * 專為特教班/資源班同儕共學、平板雙人共玩、電子白板分組競賽設計
 * 每個單元 (U1 ~ U9) 與各小節均支援專屬 10 題搶答測驗，支援觸控大按鈕與實體鍵盤對決
 */

(function(window) {
  'use strict';

  const escapeText = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const questionDeck = window.MathBattleDeck.create('3-lower');

  const BattleArena = {
    currentUnitId: 'u1',
    currentSectionId: 'all',
    roundCount: 10,
    autoRead: true,
    thinkBeforeAnswer: false,
    waitingForClass: false,
    questionVersion: 0,
    currentQuestionIndex: 0,
    questions: [],
    isRoundActive: false,
    timerInterval: null,
    secondsElapsed: 0,

    player1: {
      name: '',
      avatar: '🦁',
      team: 'blue',
      score: 0,
      stars: 0,
      isLocked: false,
      combo: 0
    },

    player2: {
      name: '',
      avatar: '🐰',
      team: 'red',
      score: 0,
      stars: 0,
      isLocked: false,
      combo: 0
    },

    init() {
      this.bindGlobalKeys();
    },

    // 安全獲取課程資料庫
    getData() {
      if (typeof window !== 'undefined' && window.NANI_G3S2_DATA) {
        return window.NANI_G3S2_DATA;
      }
      if (typeof NANI_G3S2_DATA !== 'undefined') {
        return NANI_G3S2_DATA;
      }
      return null;
    },

    // 取得當前可選選手（整合資源班名單與吉祥物）
    getAvailablePlayers() {
      const bankStudents = (window.StudentBank && typeof window.StudentBank.getStudents === 'function')
        ? window.StudentBank.getStudents()
        : [];

      const mascots = [
        { id: 'm_lele', name: '樂樂獅', avatar: '🦁' },
        { id: 'm_foxie', name: '萌萌狐', avatar: '🦊' },
        { id: 'm_bobo', name: '波波熊', avatar: '🐻' },
        { id: 'm_tuzi', name: '跳跳兔', avatar: '🐰' }
      ];

      return [...bankStudents, ...mascots];
    },

    // 啟動指定單元與小節的搶答對決 (每單元/小節預設 10 題)
    startBattle(unitId = 'u1', sectionId = 'all', rounds = 10) {
      // 確保任何舊的頒獎彈窗被清理
      const oldModal = document.getElementById('battle-ceremony-modal');
      if (oldModal) oldModal.remove();

      this.currentUnitId = unitId;
      this.currentSectionId = sectionId || 'all';
      this.roundCount = rounds || 10;
      this.currentQuestionIndex = 0;
      this.player1.score = 0;
      this.player1.stars = 0;
      this.player1.isLocked = false;
      this.player1.combo = 0;

      this.player2.score = 0;
      this.player2.stars = 0;
      this.player2.isLocked = false;
      this.player2.combo = 0;

      // 載入該單元題目並隨機洗牌抽題 (每單元每小節 10 題)
      this.prepareQuestions(this.currentUnitId, this.currentSectionId, this.roundCount);
      this.renderArena();
      this.loadQuestion(0);
    },

    // 題目篩選與抽題（支援每單元、各小節 10 題精準篩選或全冊大亂鬥）
    prepareQuestions(unitId, sectionId = 'all', count = 10) {
      const data = this.getData();
      if (!data || !data.practiceBank) {
        this.questions = [];
        return;
      }

      const extra = (data.units || []).flatMap(unit => unit.sections.flatMap(section =>
        window.WorksheetQuestionVariants?.getWorksheet(data, unit.id, section.id, 'lower')?.problems
          .filter(question => question.id.startsWith('ws3-') && !question.worksheetSource) || []));
      const available = [...data.practiceBank, ...extra];
      let pool = [];
      if (unitId === 'all') {
        pool = available;
      } else if (sectionId && sectionId !== 'all') {
        pool = available.filter(p => p.unitId === unitId && (p.sectionId === sectionId || p.sectionTitle?.includes(sectionId)));
        if (pool.length === 0) {
          pool = available.filter(p => p.unitId === unitId);
        }
      } else {
        pool = available.filter(p => p.unitId === unitId);
      }

      this.questions = questionDeck.draw(pool, count);
    },

    // 渲染分組搶答擂台主畫面
    renderArena() {
      const container = document.getElementById('battle-arena-container');
      if (!container) return;

      const data = this.getData();
      const unit = (data && data.units)
        ? data.units.find(u => u.id === this.currentUnitId)
        : null;
      const unitTitle = unit ? `第 ${unit.number} 單元：${unit.title}` : (this.currentUnitId === 'all' ? '🌟 全冊全能大亂鬥' : '分組搶答大對決');

      const players = this.getAvailablePlayers();
      for (const [index, player] of [this.player1,this.player2].entries()) {
        const choice = players.find(item=>item.name===player.name) || players[index];
        if (choice) {
          player.name = choice.name;
          player.avatar = choice.avatar;
        }
      }

      container.innerHTML = `
        <header class="battle-mondrian-heading">
          <div class="battle-title-block">
            <span class="battle-eyebrow">MATH / TEAM CHALLENGE</span>
            <h2>分組搶答<span aria-hidden="true">↗</span></h2>
            <p>先算一算，再把解法說出來。</p>
          </div>
          <div class="battle-rule-block">
            <span>今天的挑戰</span>
            <strong>${this.questions.length || this.roundCount}<small>題一回合</small></strong>
            <p>答對 +10 分 · 答錯不扣分</p>
          </div>
        </header>
        <div class="battle-stage-card">
          <!-- 頂部控制列：單元選擇、小節選擇、局數與選手設定 -->
          <div class="battle-top-bar">
            <h3 class="battle-controls-heading">對局設定</h3>
            <div class="battle-unit-picker-group">
              <div class="battle-control-field">
              <label for="battle-unit-select">搶答單元</label>
              <select id="battle-unit-select" class="form-control">
                <option value="all" ${this.currentUnitId === 'all' ? 'selected' : ''}>🌟 全冊跨單元大亂鬥 (10題)</option>
                ${(data ? data.units : []).map(u => `
                  <option value="${u.id}" ${u.id === this.currentUnitId ? 'selected' : ''}>
                    第 ${u.number} 單元：${u.title}
                  </option>
                `).join('')}
              </select>
              </div>
              <div class="battle-control-field">
              <label for="battle-section-select">練習小節</label>
              <select id="battle-section-select" class="form-control">
                <!-- 動態注入小節列表 -->
              </select>
              </div>
              <button class="kid-btn kid-btn-secondary" id="btn-battle-restart">
                ↻ 重新抽題
              </button>
            </div>

            <div class="battle-meta-info">
              <span class="battle-round-badge" id="battle-round-indicator">第 1 / ${this.questions.length || 10} 題</span>
              <label class="battle-think-toggle"><input type="checkbox" id="battle-think-mode" ${this.thinkBeforeAnswer ? 'checked' : ''}> 老師開放後再作答</label>
              <button class="btn btn-primary" id="btn-battle-next" disabled>討論完了，下一題 →</button>
              <button class="btn btn-speech btn-sm" id="btn-battle-tts-toggle">
                ${this.autoRead ? '🔊 自動念題：開啟' : '🔇 自動念題：關閉'}
              </button>
            </div>
          </div>

          <!-- 雙人計分板與選手頭銜 -->
          <div class="battle-scoreboard-grid">
            <!-- 藍方（左）選手資訊 -->
            <div class="battle-player-card player-blue" id="card-player-blue">
              <div class="battle-player-header">
                <span class="battle-player-badge">勇氣藍隊 <small>BLUE</small></span>
                <select class="battle-player-select" id="select-player-blue" aria-label="藍隊學生代號">
                  ${players.map(p => `
                    <option translate="no" value="${escapeText(p.name)}" data-avatar="${p.avatar || '🦁'}" ${p.name === this.player1.name ? 'selected' : ''}>
                      ${escapeText(p.name)}
                    </option>
                  `).join('')}
                </select>
              </div>
              <div class="battle-player-body">
                <div class="battle-avatar" id="avatar-player-blue" aria-hidden="true">${window.AdventureArt.forAvatar(this.player1.avatar)}</div>
                <div class="battle-score-box">
                  <div class="battle-score-num" id="score-player-blue">0</div>
                  <div class="battle-score-unit">分 (⭐ <span id="stars-player-blue">0</span>)</div>
                </div>
              </div>
              <div class="battle-status-msg" id="status-player-blue">準備搶答！</div>
            </div>

            <!-- 中央對戰 VS 徽章 -->
            <div class="battle-vs-badge-box">
              <div class="battle-vs-circle">VS</div>
              <div class="battle-vs-sub">分組計算搶答</div>
            </div>

            <!-- 紅方（右）選手資訊 -->
            <div class="battle-player-card player-red" id="card-player-red">
              <div class="battle-player-header">
                <span class="battle-player-badge">智慧紅隊 <small>RED</small></span>
                <select class="battle-player-select" id="select-player-red" aria-label="紅隊學生代號">
                  ${players.map(p => `
                    <option translate="no" value="${escapeText(p.name)}" data-avatar="${p.avatar || '🦊'}" ${p.name === this.player2.name ? 'selected' : ''}>
                      ${escapeText(p.name)}
                    </option>
                  `).join('')}
                </select>
              </div>
              <div class="battle-player-body">
                <div class="battle-avatar" id="avatar-player-red" aria-hidden="true">${window.AdventureArt.forAvatar(this.player2.avatar)}</div>
                <div class="battle-score-box">
                  <div class="battle-score-num" id="score-player-red">0</div>
                  <div class="battle-score-unit">分 (⭐ <span id="stars-player-red">0</span>)</div>
                </div>
              </div>
              <div class="battle-status-msg" id="status-player-red">準備搶答！</div>
            </div>
          </div>

          <!-- 中央核心題目展示區 -->
          <div class="battle-question-display">
            <div class="battle-question-tag-row">
              <span class="battle-question-sub-title" id="battle-question-meta">${unitTitle}</span>
              <button class="btn btn-speech" id="btn-battle-speak-q">
                🔊 念這題
              </button>
            </div>
            <div class="battle-question-text" id="battle-question-text" tabindex="-1">
              載入題目中...
            </div>
            <details id="battle-question-visual" hidden><summary>看題目圖解</summary><div id="battle-question-figure"></div></details>
            <p id="battle-teacher-status" role="status"></p>
            <p id="battle-answer-discussion" role="status" hidden></p>
            <details id="battle-answer-reveal" hidden><summary>核對正確答案</summary><p id="battle-answer-text"></p></details>
            <div class="battle-teacher-actions">
              <button type="button" class="btn btn-primary" id="btn-battle-open" hidden>開放兩隊作答</button>
              <button type="button" class="btn btn-outline" id="btn-battle-skip">略過這題，一起討論</button>
            </div>
          </div>

          <!-- 雙人同台雙答題區 (One Screen, Two Buzzer Stations) -->
          <div class="battle-stations-grid">
            <!-- 藍方控制台 (左側按鈕區) -->
            <div class="battle-station station-blue" id="station-blue">
              <div class="station-label">
                <span>藍隊作答區</span>
                <span class="key-hint">支援鍵盤 Q / W / E / R</span>
              </div>
              <div class="station-options-grid" id="options-blue">
                <!-- 動態注入選項按鈕 -->
              </div>
            </div>

            <!-- 紅方控制台 (右側按鈕區) -->
            <div class="battle-station station-red" id="station-red">
              <div class="station-label">
                <span>紅隊作答區</span>
                <span class="key-hint">支援鍵盤 U / I / O / P (或 1 2 3 4)</span>
              </div>
              <div class="station-options-grid" id="options-red">
                <!-- 動態注入選項按鈕 -->
              </div>
            </div>
          </div>
        </div>
      `;

      this.bindArenaEvents();
    },

    bindArenaEvents() {
      // 單元與小節動態連動切換
      const unitSelect = document.getElementById('battle-unit-select');
      const sectionSelect = document.getElementById('battle-section-select');

      const populateSections = (unitId, selectedSectionId = 'all') => {
        if (!sectionSelect) return;
        const data = this.getData();
        const unit = data?.units?.find(u => u.id === unitId);

        let html = '';
        if (unitId === 'all' || !unit) {
          html = `<option value="all">🌟 全冊題庫精選 10 題</option>`;
        } else {
          html = `<option value="all" ${selectedSectionId === 'all' ? 'selected' : ''}>📚 全單元綜合精選 (10 題)</option>`;
          if (unit.sections) {
            unit.sections.forEach((sec, idx) => {
              const secId = typeof sec === 'object' ? sec.id : `s${unit.number}_${idx + 1}`;
              const secTitle = typeof sec === 'string' ? sec : (sec.title || `第 ${idx + 1} 小節`);
              html += `<option value="${secId}" ${selectedSectionId === secId ? 'selected' : ''}>📖 ${secTitle} (10 題)</option>`;
            });
          }
        }
        sectionSelect.innerHTML = html;
      };

      populateSections(this.currentUnitId, this.currentSectionId);

      if (unitSelect) {
        unitSelect.addEventListener('change', (e) => {
          this.currentUnitId = e.target.value;
          this.currentSectionId = 'all';
          populateSections(this.currentUnitId, 'all');
          this.startBattle(this.currentUnitId, 'all', 10);
        });
      }

      if (sectionSelect) {
        sectionSelect.addEventListener('change', (e) => {
          this.currentSectionId = e.target.value;
          this.startBattle(this.currentUnitId, this.currentSectionId, 10);
        });
      }

      // 重啟抽題按鈕
      const btnRestart = document.getElementById('btn-battle-restart');
      if (btnRestart) {
        btnRestart.addEventListener('click', () => {
          this.startBattle(this.currentUnitId, this.currentSectionId, 10);
        });
      }

      // 選手選擇
      const selBlue = document.getElementById('select-player-blue');
      if (selBlue) {
        selBlue.addEventListener('change', (e) => {
          const opt = e.target.selectedOptions[0];
          this.player1.name = opt.value;
          this.player1.avatar = opt.dataset.avatar || '🦁';
          const av = document.getElementById('avatar-player-blue');
          if (av) av.innerHTML = window.AdventureArt.forAvatar(this.player1.avatar);
        });
      }

      const selRed = document.getElementById('select-player-red');
      if (selRed) {
        selRed.addEventListener('change', (e) => {
          const opt = e.target.selectedOptions[0];
          this.player2.name = opt.value;
          this.player2.avatar = opt.dataset.avatar || '🦊';
          const av = document.getElementById('avatar-player-red');
          if (av) av.innerHTML = window.AdventureArt.forAvatar(this.player2.avatar);
        });
      }

      document.getElementById('btn-battle-next').addEventListener('click', () => {
        if (!this.isRoundActive) {
          this.loadQuestion(this.currentQuestionIndex + 1);
          if (this.isRoundActive) document.getElementById('battle-question-text').focus();
        }
      });
      document.getElementById('battle-think-mode').addEventListener('change', event => {
        this.thinkBeforeAnswer = event.target.checked;
        if (this.isRoundActive) {
          this.waitingForClass = this.thinkBeforeAnswer;
          this.updateAnswerControls();
        }
      });
      document.getElementById('btn-battle-open').addEventListener('click', () => {
        this.waitingForClass = false;
        this.updateAnswerControls();
        document.querySelector('#options-blue button:not(:disabled)')?.focus();
      });
      document.getElementById('btn-battle-skip').addEventListener('click', () => this.finishQuestion());
      document.getElementById('btn-battle-tts-toggle').addEventListener('click', event => {
        this.autoRead = !this.autoRead;
        event.currentTarget.textContent = this.autoRead ? '🔊 自動念題：開啟' : '🔇 自動念題：關閉';
        if (!this.autoRead) window.spEdAudio?.stopSpeech();
      });
      // 朗讀題目按鈕
      const btnSpeak = document.getElementById('btn-battle-speak-q');
      if (btnSpeak) {
        btnSpeak.addEventListener('click', () => {
          const q = this.questions[this.currentQuestionIndex];
          if (q && window.spEdAudio) {
            window.spEdAudio.speak(q.speechText || q.question);
          }
        });
      }
    },

    // 載入當前回合題目
    loadQuestion(index) {
      if (!this.questions || this.questions.length === 0) {
        this.prepareQuestions(this.currentUnitId, this.currentSectionId, this.roundCount);
      }
      if (!this.questions || this.questions.length === 0) {
        const qTextEl = document.getElementById('battle-question-text');
        if (qTextEl) {
          qTextEl.textContent = '題庫載入中，請點擊「重新發牌」開始！';
        }
        return;
      }

      if (index >= this.questions.length) {
        this.showFinalCeremony();
        return;
      }

      document.getElementById('btn-battle-next').disabled = true;
      this.currentQuestionIndex = index;
      this.questionVersion++;
      this.isRoundActive = true;
      this.waitingForClass = this.thinkBeforeAnswer;
      this.player1.isLocked = false;
      this.player2.isLocked = false;

      const q = this.questions[index];
      questionDeck.markShown(q);

      // 更新進度與標題
      const roundEl = document.getElementById('battle-round-indicator');
      if (roundEl) {
        roundEl.textContent = `第 ${index + 1} / ${this.questions.length} 題`;
      }

      const metaEl = document.getElementById('battle-question-meta');
      if (metaEl) {
        metaEl.textContent = q.sectionTitle || '快問快答速度計算';
      }

      const qTextEl = document.getElementById('battle-question-text');
      if (qTextEl) {
        qTextEl.textContent = q.question;
      }

      const visual = document.getElementById('battle-question-visual');
      const figure = document.getElementById('battle-question-figure');
      figure.innerHTML = window.WorksheetDiagrams?.render(q) || '';
      visual.hidden = !figure.firstElementChild;
      visual.open = !visual.hidden && /看圖|圖中|圖上|如圖|下圖|依圖|看表|表中|看鐘面/.test(q.question);
      document.getElementById('battle-answer-discussion').hidden = true;
      const answerReveal = document.getElementById('battle-answer-reveal');
      answerReveal.hidden = true;
      answerReveal.open = false;

      // 重設狀態指示條
      const stBlue = document.getElementById('status-player-blue');
      const stRed = document.getElementById('status-player-red');
      if (stBlue) stBlue.textContent = '計算搶答中！';
      if (stRed) stRed.textContent = '計算搶答中！';

      // 渲染藍方選項 (Key: Q, W, E, R)
      const blueKeys = ['Q', 'W', 'E', 'R'];
      const optBlueContainer = document.getElementById('options-blue');
      if (optBlueContainer) {
        optBlueContainer.innerHTML = q.options.map((opt, i) => `
          <button class="battle-opt-btn btn-blue" data-index="${i}" id="blue-opt-${i}">
            <span class="key-badge">${blueKeys[i]}</span>
            <span class="opt-label">(${['A', 'B', 'C', 'D'][i]})</span>
            <span class="opt-content">${opt}</span>
          </button>
        `).join('');

        optBlueContainer.querySelectorAll('.battle-opt-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index, 10);
            this.handlePlayerBuzz('blue', idx);
          });
        });
      }

      // 渲染紅方選項 (Key: U, I, O, P)
      const redKeys = ['U', 'I', 'O', 'P'];
      const optRedContainer = document.getElementById('options-red');
      if (optRedContainer) {
        optRedContainer.innerHTML = q.options.map((opt, i) => `
          <button class="battle-opt-btn btn-red" data-index="${i}" id="red-opt-${i}">
            <span class="key-badge">${redKeys[i]}</span>
            <span class="opt-label">(${['A', 'B', 'C', 'D'][i]})</span>
            <span class="opt-content">${opt}</span>
          </button>
        `).join('');

        optRedContainer.querySelectorAll('.battle-opt-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index, 10);
            this.handlePlayerBuzz('red', idx);
          });
        });
      }

      this.updateAnswerControls();
      // 語音自動念題（若開啟）
      if (this.autoRead && window.spEdAudio) {
        window.spEdAudio.speak(q.speechText || q.question);
      }
    },

    updateAnswerControls() {
      for (const player of [this.player1, this.player2]) {
        document.querySelectorAll('#options-' + player.team + ' button').forEach(button => {
          button.disabled = !this.isRoundActive || this.waitingForClass || player.isLocked;
        });
      }
      document.getElementById('btn-battle-open').hidden = !this.isRoundActive || !this.waitingForClass;
      document.getElementById('btn-battle-skip').hidden = !this.isRoundActive;
      document.getElementById('battle-teacher-status').textContent = !this.isRoundActive ? '' :
        this.waitingForClass ? '先聽題目、各自想一想，等老師開放。' : '兩隊可以作答。';
    },

    finishQuestion() {
      if (!this.isRoundActive) return;
      this.isRoundActive = false;
      this.updateAnswerControls();
      const question = this.questions[this.currentQuestionIndex];
      const discussion = document.getElementById('battle-answer-discussion');
      discussion.textContent = '一起討論：' + question.hint;
      discussion.hidden = false;
      const choice = question.answerIndex;
      document.getElementById('battle-answer-text').textContent = '(' + ['A', 'B', 'C', 'D'][choice] + ') ' + question.options[choice];
      document.getElementById('battle-answer-reveal').hidden = false;
      const next = document.getElementById('btn-battle-next');
      next.disabled = false;
      next.focus();
    },

    // 處理選手搶答點擊
    handlePlayerBuzz(team, chosenIndex) {
      if (!this.isRoundActive || this.waitingForClass) return;

      const player = team === 'blue' ? this.player1 : this.player2;
      const otherPlayer = team === 'blue' ? this.player2 : this.player1;

      if (player.isLocked) return;

      const q = this.questions[this.currentQuestionIndex];
      const isCorrect = chosenIndex === q.answerIndex;

      const btnEl = document.getElementById(`${team}-opt-${chosenIndex}`);
      const statusEl = document.getElementById(`status-player-${team}`);

      if (isCorrect) {
        // 搶答正確！該回合結束並計分
        this.finishQuestion();
        player.score += 10;
        player.stars += 1;
        player.combo += 1;

        if (btnEl) btnEl.classList.add('btn-correct-burst');

        // 更新計分板
        const scoreEl = document.getElementById(`score-player-${team}`);
        const starsEl = document.getElementById(`stars-player-${team}`);
        if (scoreEl) scoreEl.textContent = player.score;
        if (starsEl) starsEl.textContent = player.stars;

        if (statusEl) {
          statusEl.innerHTML = `🎉 <strong>搶先答對！+10 分</strong> ⭐`;
          statusEl.style.color = '#059669';
        }

        // 聲光刺激：播放號角、彩花炸裂、語音喝采
        if (window.spEdAudio) {
          window.spEdAudio.playBuzzer(team);
          setTimeout(() => {
            window.spEdAudio.playFanfare();
          }, 120);
        }

        if (window.KidEffects) {
          window.KidEffects.triggerConfetti(50, 1800);
          if (btnEl) window.KidEffects.flyStarToken(btnEl);
        }

        const cheerText = `${player.name} 搶先答對！加十分！`;
        if (window.spEdAudio) {
          window.spEdAudio.speak(cheerText);
        }

      } else {
        // 答錯：不扣分（特教友善），但該選手短暫鎖定 2 秒，對手可繼續作答
        player.isLocked = true;
        player.combo = 0;
        if (btnEl) btnEl.classList.add('btn-wrong-shake');

        if (statusEl) {
          statusEl.innerHTML = `💡 沒關係，對手還有機會！`;
          statusEl.style.color = '#d97706';
        }

        if (window.spEdAudio) {
          window.spEdAudio.playEncouragement();
        }

        if (otherPlayer.isLocked) {
          this.finishQuestion();
        } else {
          this.updateAnswerControls();
          const version = this.questionVersion;
          setTimeout(() => {
            if (this.isRoundActive && this.questionVersion === version) {
              player.isLocked = false;
              btnEl?.classList.remove('btn-wrong-shake');
              if (statusEl) statusEl.textContent = '可以再次作答！';
              this.updateAnswerControls();
            }
          }, 2000);
        }
      }
    },

    // 鍵盤實體按鍵監聽 (支援雙人一機鍵盤對戰)
    bindGlobalKeys() {
      if (typeof window === 'undefined') return;

      window.addEventListener('keydown', (e) => {
        // 若當前不在對戰畫面或該回合已結束，忽略按鍵
        if (!this.isRoundActive || this.waitingForClass || e.defaultPrevented || e.repeat ||
            e.ctrlKey || e.metaKey || e.altKey ||
            e.target.closest?.('input, select, textarea, [contenteditable], dialog')) return;
        const activeTab = document.querySelector('.tab-pane.active');
        if (!activeTab || activeTab.id !== 'tab-battle') return;

        const k = e.key.toUpperCase();

        // 藍隊鍵盤對應：Q -> 0, W -> 1, E -> 2, R -> 3 (或 A, S, D, F)
        if (k === 'Q' || k === 'A') { e.preventDefault(); this.handlePlayerBuzz('blue', 0); }
        else if (k === 'W' || k === 'S') { e.preventDefault(); this.handlePlayerBuzz('blue', 1); }
        else if (k === 'E' || k === 'D') { e.preventDefault(); this.handlePlayerBuzz('blue', 2); }
        else if (k === 'R' || k === 'F') { e.preventDefault(); this.handlePlayerBuzz('blue', 3); }

        // 紅隊鍵盤對應：U -> 0, I -> 1, O -> 2, P -> 3 (或 數字鍵 1, 2, 3, 4)
        else if (k === 'U' || k === '1') { e.preventDefault(); this.handlePlayerBuzz('red', 0); }
        else if (k === 'I' || k === '2') { e.preventDefault(); this.handlePlayerBuzz('red', 1); }
        else if (k === 'O' || k === '3') { e.preventDefault(); this.handlePlayerBuzz('red', 2); }
        else if (k === 'P' || k === '4') { e.preventDefault(); this.handlePlayerBuzz('red', 3); }
      });
    },

    // 頒獎典禮 (Celebration Ceremony - 友誼第一、雙方皆獲得正向增強星星)
    showFinalCeremony() {
      this.isRoundActive = false;
      const isTie = this.player1.score === this.player2.score;
      const winner = this.player1.score > this.player2.score ? this.player1 : this.player2;

      // 避免重複堆疊彈窗
      const oldModal = document.getElementById('battle-ceremony-modal');
      if (oldModal) oldModal.remove();

      if (window.spEdAudio) {
        window.spEdAudio.playCelebration();
      }
      if (window.KidEffects) {
        window.KidEffects.triggerConfetti(80, 3000);
      }

      const modal = document.createElement('div');
      modal.className = 'kid-modal-backdrop';
      modal.id = 'battle-ceremony-modal';
      modal.innerHTML = `
        <div class="kid-modal-card ceremony-card" style="position:relative;">
          <button id="btn-close-battle-modal" style="position:absolute; top:14px; right:16px; background:none; border:none; font-size:1.6rem; color:#94a3b8; cursor:pointer; z-index:10; line-height:1;" title="關閉">✕</button>
          <div class="celebration-sunburst"></div>
          <div style="font-size: 3.5rem; margin-bottom: 8px;">🏆</div>
          <h2 style="font-size: 1.8rem; color: #1e1b4b; font-weight: 800; margin-bottom: 6px;">
            ${isTie ? '🤝 實力相當！兩隊都是算術大贏家！' : `🎉 恭喜 ${escapeText(winner.name)} 奪得搶答冠軍！`}
          </h2>
          <p style="font-size: 1.15rem; color: #4b5563; margin-bottom: 20px;">
            藍隊 <strong translate="no">${escapeText(this.player1.name)}</strong> (${this.player1.score}分) ｜ 紅隊 <strong translate="no">${escapeText(this.player2.name)}</strong> (${this.player2.score}分)
          </p>

          <div class="ceremony-rewards-box">
            <div class="ceremony-reward-item">
              ${window.AdventureArt.forAvatar(this.player1.avatar)}
              <strong translate="no">${escapeText(this.player1.name)}</strong>
              <span class="badge-star">+${this.player1.stars + 1} ⭐ 努力之星</span>
            </div>
            <div style="font-size: 1.6rem; color: #f59e0b;">✨ 友誼第一 ✨</div>
            <div class="ceremony-reward-item">
              ${window.AdventureArt.forAvatar(this.player2.avatar)}
              <strong translate="no">${escapeText(this.player2.name)}</strong>
              <span class="badge-star">+${this.player2.stars + 1} ⭐ 努力之星</span>
            </div>
          </div>

          <div style="margin-top: 24px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button class="kid-btn kid-btn-solution" id="btn-save-stars-to-bank">
              ⭐ 將獎勵星星記入學生存摺
            </button>
            <button class="kid-btn kid-btn-primary" id="btn-battle-play-again">
              🔄 再來一場對決！
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // 點擊背景或叉叉關閉
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
      const btnClose = modal.querySelector('#btn-close-battle-modal');
      if (btnClose) {
        btnClose.addEventListener('click', () => {
          modal.remove();
        });
      }

      // 獎勵代幣入帳
      const btnSave = modal.querySelector('#btn-save-stars-to-bank');
      if (btnSave) {
        btnSave.addEventListener('click', () => {
          if (window.StudentBank && typeof window.StudentBank.getStudents === 'function') {
            const students = window.StudentBank.getStudents();
            const s1 = students.find(s => s.name === this.player1.name || s.name === this.player1.name.slice(0, 1) || this.player1.name.startsWith(s.name));
            const s2 = students.find(s => s.name === this.player2.name || s.name === this.player2.name.slice(0, 1) || this.player2.name.startsWith(s.name));
            if (s1) window.StudentBank.addStar(s1.id, this.player1.stars + 1);
            if (s2) window.StudentBank.addStar(s2.id, this.player2.stars + 1);
            btnSave.disabled = true;
            btnSave.innerHTML = '✅ 星星已成功入帳存摺！';
            if (window.spEdAudio) window.spEdAudio.playCoin();
          } else {
            btnSave.disabled = true;
            btnSave.innerHTML = '✅ 星星已成功入帳存摺！';
          }
        });
      }

      // 再玩一次
      const btnAgain = modal.querySelector('#btn-battle-play-again');
      if (btnAgain) {
        btnAgain.addEventListener('click', () => {
          modal.remove();
          this.startBattle(this.currentUnitId, this.currentSectionId, this.roundCount);
        });
      }
    }
  };

  window.MathBattleArena = BattleArena;

  // 初始化擂台
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      BattleArena.init();
    });
  }

})(typeof window !== 'undefined' ? window : this);
