/* 同一份課程題庫供全班搶答、練習遊戲與數學島使用。 */
(() => {
  'use strict';
  window.mountCourseActivities = (core,root) => {
    const $=id=>root.querySelector('#'+id);
    const e=core.escape, letters='ABCD';
    const firstStops=[
      [[0,5],[1,5],[2,9]], [[0,5],[0,7],[1,5]], [[0,5],[1,5],[1,7]],
      [[0,5],[1,5],[0,7]], [[0,5],[1,5],[0,7]], [[0,5],[1,5],[1,6]],
      [[0,5],[1,5],[1,8]], [[0,5],[1,5],[0,8]], [[0,5],[1,5],[1,9]]
    ];
    const choose = (q,group,locked=false)=>q.choices.map((value,i)=>`<button type="button" data-option="${i}" data-group="${group}" ${locked?'disabled':''}>${letters[i]}. ${e(value)}</button>`).join('');
    function poolFor(unit,sectionId,count){
      const sections=sectionId==='all'?unit.sections:unit.sections.filter(s=>s.id===sectionId);
      const queue=sections.flatMap(section=>section.questions.map(question=>({section,question})));
      for(let i=queue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]];}
      if(!unit.extension)return queue.slice(0,count);
      const illustrated=[];
      const used=new Set();
      for(let i=0;i<count;i++){
        const section=sections[i%sections.length];
        let question;
        for(let tries=0;tries<16;tries++){
          question=core.makeIllustration(unit,section);
          if(!used.has(question.id))break;
        }
        if(used.has(question.id))continue;
        used.add(question.id);
        illustrated.push({section,question});
      }
      return illustrated.concat(queue).slice(0,count);
    }
    function scopes(select){
      const unit=core.unit(),old=select.dataset.unit===unit.id?select.value:'all';
      select.innerHTML='<option value="all">本單元各小節</option>'+unit.sections.map(s=>`<option value="${s.id}">${e(s.title)}</option>`).join('');
      select.value=[...select.options].some(o=>o.value===old)?old:'all';
      select.dataset.unit=unit.id;
    }
    const state={battle:null,game:null,island:null};
    const battleDeck=window.MathBattleDeck.create(core.grade+'-'+core.term);
    const battleTeams={
      blue:{name:'勇氣藍隊',label:'藍隊',color:'BLUE',mascot:'lion',keys:'QWER'},
      red:{name:'智慧紅隊',label:'紅隊',color:'RED',mascot:'bear',keys:'UIOP'}
    };
    const teamIds=Object.keys(battleTeams);
    const players=window.ClassroomRoster||[];
    const representatives={blue:'',red:''};
    let battleUnit=core.unit(), battleScope='all', waitForTeacher=false, lastLessonUnit=core.unit().id;
    function battleSetup(){
      const sections=battleScope==='all'?battleUnit.sections:battleUnit.sections.filter(s=>s.id===battleScope);
      const pool=sections.flatMap(section=>(section.battleQuestions || section.questions).map(question=>({section,question})));
      state.battle={items:battleDeck.draw(pool,10),at:0,scores:{blue:0,red:0},waiting:waitForTeacher,
        locked:false,played:{},winner:null,showFigure:null};
      battleDeck.markShown(state.battle.items[0]);
      renderBattle();
    }
    const finishBattleQuestion=b=>{b.locked=true;b.waiting=false;};
    function battleStatus(b,g){
      if(b.winner===g)return '⚡ 搶先答對！+10 分';
      if(Object.hasOwn(b.played,g))return '再想一想 · 不扣分';
      if(b.locked)return '一起說說解法';
      return b.waiting?'等老師開放':'準備搶答！';
    }
    function renderBattle(){
      const b=state.battle,stage=$('course-battle-stage');
      if(!b){stage.replaceChildren();return;}
      const item=b.items[b.at],q=item?.question;
      const tied=b.scores.blue===b.scores.red, champion=tied?null:b.scores.blue>b.scores.red?'blue':'red';
      const current=Math.min(b.at+1,b.items.length);
      const figure=q?core.draw(q.visual):'';
      const showFigure=b.showFigure ?? Boolean(q&&(q.type==='看圖解題'||/看圖|圖中|圖上|如圖|下圖|依圖|看表|表中|看鐘面/.test(q.text)));
      const unitLabel=(u,i)=>`第 ${i+1} 單元：${e(u.title)}`;
      const scoreboard=g=>{
        const team=battleTeams[g];
        const animal=players.find(player=>String(player.id)===representatives[g])?.animal||team.mascot;
        return `<div class="battle-player-card player-${g}" data-scored="${b.winner===g}">
          <div class="battle-player-header"><span class="battle-player-badge">${team.name} <small>${team.color}</small></span>
            <select class="battle-player-select" data-battle-team="${g}" aria-label="${team.label}代表">
              <option value="">全隊</option>${players.map(p=>`<option value="${e(p.id)}" ${representatives[g]===String(p.id)?'selected':''}>${e(p.name)}</option>`).join('')}
            </select></div>
          <div class="battle-player-body"><span class="battle-avatar" aria-hidden="true">${window.AdventureArt.portrait(animal)}</span>
            <span class="battle-score-box"><output class="battle-score-num" id="course-score-${g}" aria-label="${team.label}分數">${b.scores[g]}</output><span class="battle-score-unit">分</span></span></div>
          <span class="battle-status-msg">${item?battleStatus(b,g):tied?'並列第一':champion===g?'🏆 本回合冠軍':'完成挑戰'}</span>
        </div>`;
      };
      const station=g=>{
        const team=battleTeams[g],enabled=!b.locked&&!b.waiting&&!Object.hasOwn(b.played,g);
        return `<section class="battle-station station-${g}" aria-label="${team.label}作答區">
          <h3 class="station-label">${team.label}作答區 <span class="key-hint">支援鍵盤 ${team.keys.split('').join(' / ')}${g==='red'?'（或 1 / 2 / 3 / 4）':''}</span></h3>
          <div class="station-options-grid">${q.choices.map((value,i)=>{
            const result=Object.hasOwn(b.played,g)&&b.played[g]===i?(b.winner===g?'btn-correct-burst':'btn-wrong-shake'):'';
            return `<button type="button" class="battle-opt-btn ${result}" data-option="${i}" data-group="${g}" ${enabled?'':'disabled'}>
              <span class="opt-label">${letters[i]}</span><span class="battle-answer-value">${e(core.readingText(value))}</span>
              <kbd class="key-badge" aria-hidden="true">${team.keys[i]}</kbd></button>`;
          }).join('')}</div>
        </section>`;
      };
      stage.innerHTML=`
        <header class="battle-mondrian-heading">
          <div class="battle-title-block"><span class="battle-eyebrow">MATH / TEAM CHALLENGE</span>
            <h2 id="course-heading-battle" tabindex="-1">分組搶答 <span aria-hidden="true">↗</span></h2>
            <p>先算一算，再把解法說出來。</p></div>
          <div class="battle-rule-block"><span>今天的挑戰</span><strong>${b.items.length}<small>題一回合</small></strong><p>答對 +10 分 · 答錯不扣分</p></div>
        </header>
        <div class="battle-stage-card">
          <aside class="battle-top-bar" aria-labelledby="course-battle-settings">
            <h3 class="battle-controls-heading" id="course-battle-settings">對局設定</h3>
            <div class="battle-unit-picker-group">
              <div class="battle-control-field"><label for="course-battle-unit">搶答單元</label>
                <select id="course-battle-unit">${core.units.map((u,i)=>`<option value="${u.id}" ${u===battleUnit?'selected':''}>${unitLabel(u,i)}</option>`).join('')}</select></div>
              <div class="battle-control-field"><label for="course-battle-scope">練習小節</label><select id="course-battle-scope">
                <option value="all">全單元綜合精選</option>${battleUnit.sections.map(s=>`<option value="${s.id}" ${s.id===battleScope?'selected':''}>${e(s.title)}</option>`).join('')}
              </select></div>
              <button type="button" id="course-battle-start" data-battle="restart">↻ 重新抽題</button>
            </div>
            <div class="battle-meta-info">
              <span class="battle-round-badge">${item?`第 ${current} / ${b.items.length} 題`:'本回合結束'}</span>
              <progress class="course-battle-progress" value="${b.at+(b.locked?1:0)}" max="${b.items.length}" aria-label="已完成題數"></progress>
              <label class="battle-think-toggle"><input type="checkbox" id="course-battle-think" ${waitForTeacher?'checked':''}> 老師開放後再作答</label>
              <button type="button" id="btn-battle-next" data-battle="next" ${b.locked&&item?'':'disabled'}>${current===b.items.length?'看比賽結果':'討論完了，下一題 →'}</button>
            </div>
          </aside>
          <div class="battle-scoreboard-grid">${scoreboard('blue')}
            <div class="battle-vs-badge-box"><strong class="battle-vs-circle">VS</strong><span class="battle-vs-sub">分組計算搶答</span></div>${scoreboard('red')}
          </div>
          <section class="battle-question-display ${item?'':'course-battle-finish'}">
          ${item?`<div class="battle-question-tag-row"><span class="battle-question-sub-title">第 ${battleUnit.sections.indexOf(item.section)+1} 小節 · ${e(item.section.title)}</span>
            <button type="button" id="btn-battle-speak-q" data-battle="read">🔊 念這題</button></div>
            <p class="battle-question-text course-battle-prompt" tabindex="-1" data-question-id="${e(q.id)}">${e(core.readingText(q.text.replace('點一下','看圖，找出')))}</p>
            ${figure?`<details class="course-battle-figure" ${showFigure?'open':''}><summary>看題目圖解</summary>${figure}</details>`:''}
            <p id="course-battle-result">${b.locked?`${b.winner?battleStatus(b,b.winner)+'。':''}答案：${e(core.readingText(q.answer))}。 ${e(q.reason)}`:b.waiting?'先算一算，等老師開放。':Object.keys(b.played).length?'另一隊仍可搶答。':'兩隊可以作答。'}</p>
            <div class="battle-teacher-actions">
              <button type="button" data-battle="open" ${b.waiting?'':'hidden'}>開放兩隊作答</button>
              <button type="button" class="outline" data-battle="reveal" ${b.locked?'disabled':''}>略過這題，一起討論</button></div>`
            :`<p class="battle-eyebrow">${b.items.length} 題挑戰完成</p><h3 tabindex="-1">🏆 ${tied?'兩隊平手！':battleTeams[champion].name+'獲勝！'}</h3>
              <p>藍隊 ${b.scores.blue} 分 · 紅隊 ${b.scores.red} 分</p><button type="button" data-battle="restart">再來一場 ↻</button>`}
          </section>
          ${item?`<div class="battle-stations-grid">${teamIds.map(station).join('')}</div>`:''}
        </div>`;
    }
    function read(text){
      core.stopReading();
      if(!('speechSynthesis' in window))return;
      const utterance=new SpeechSynthesisUtterance(text);
      utterance.lang='zh-TW';utterance.rate=Number(document.getElementById('teaching-voice-rate')?.value)||.85;
      window.speechSynthesis.speak(utterance);
    }
    function battleAnswer(team,index){
      const b=state.battle,q=b?.items[b.at]?.question;
      if(!q||b.locked||b.waiting||Object.hasOwn(b.played,team)||!q.choices[index])return;
      b.showFigure=Boolean($('course-battle-stage').querySelector('.course-battle-figure[open]'));
      b.played[team]=index;
      if(q.choices[index]===q.answer){b.scores[team]+=10;b.winner=team;finishBattleQuestion(b);}
      else if(Object.keys(b.played).length===2)finishBattleQuestion(b);
      renderBattle();
      const stage=$('course-battle-stage');
      $('course-battle-announcement').textContent=$('course-battle-result').textContent;
      stage.querySelector(b.locked?'[data-battle=next]':'.course-battle-prompt')?.focus({preventScroll:true});
    }
    const battleStage=$('course-battle-stage');
    battleStage.addEventListener('change',event=>{
      const target=event.target,b=state.battle;
      if(target.id==='course-battle-unit'){
        battleUnit=core.units.find(u=>u.id===target.value)||battleUnit;battleScope='all';
      }else if(target.id==='course-battle-scope')battleScope=target.value;
      else if(target.id==='course-battle-think'){
        waitForTeacher=target.checked;
        if(b&&!b.locked&&!Object.keys(b.played).length){b.waiting=waitForTeacher;renderBattle();$(target.id)?.focus();}
        return;
      }else if(target.dataset.battleTeam){
        const team=target.dataset.battleTeam;
        representatives[team]=target.value;
        const animal=players.find(player=>String(player.id)===target.value)?.animal||battleTeams[team].mascot;
        target.closest('.battle-player-card').querySelector('.battle-avatar').innerHTML=window.AdventureArt.portrait(animal);
        return;
      }
      else return;
      core.stopReading();battleSetup();$('course-battle-announcement').textContent='';$(target.id)?.focus();
    });
    battleStage.addEventListener('click',event=>{
      const answer=event.target.closest('[data-option]');
      if(answer){battleAnswer(answer.dataset.group,Number(answer.dataset.option));return;}
      const action=event.target.closest('[data-battle]')?.dataset.battle,b=state.battle;
      if(!action||!b)return;
      if(action==='restart'){core.stopReading();battleSetup();$('course-battle-announcement').textContent='';$('course-battle-start').focus();return;}
      if(action==='read'){read(b.items[b.at].question.text);return;}
      b.showFigure=Boolean(battleStage.querySelector('.course-battle-figure[open]'));
      if(action==='open')b.waiting=false;
      if(action==='reveal')finishBattleQuestion(b);
      if(action==='next'&&b.locked){
        core.stopReading();b.at++;b.locked=false;b.played={};b.winner=null;b.waiting=waitForTeacher;b.showFigure=null;
        battleDeck.markShown(b.items[b.at]);
      }
      renderBattle();
      $('course-battle-announcement').textContent=$('course-battle-result')?.textContent || '';
      battleStage.querySelector(b.locked?'[data-battle=next]':'.course-battle-prompt,.course-battle-finish h3')?.focus({preventScroll:true});
    });
    document.addEventListener('keydown',event=>{
      if(event.defaultPrevented||event.repeat||event.altKey||event.ctrlKey||event.metaKey||$('course-panel-battle').hidden||
         event.target.closest?.('input,select,textarea,[contenteditable],dialog')||document.querySelector('dialog[open]'))return;
      const key=event.key.toLowerCase(),blue='qwer'.indexOf(key),red='uiop'.indexOf(key),digits='1234'.indexOf(key);
      if(key.length!==1||Math.max(blue,red,digits)<0||!state.battle||state.battle.locked||state.battle.waiting)return;
      event.preventDefault();battleAnswer(blue>=0?'blue':'red',Math.max(blue,red,digits));
    });

    function setSolo(mode,items,at=0){
      state[mode]={items,paired:mode==='game'&&$('course-game-mode').value==='paired',unitId:core.unit().id,at,done:0,correct:0,usedHint:0,attempts:0,locked:false};
      renderSolo(mode);
    }
    function islandStops(unit,scope){
      if(unit.extension&&scope==='all'){
        const positions=firstStops[core.units.indexOf(unit)];
        return positions.map(([sectionIndex,questionIndex],i)=>{
          const section=unit.sections[sectionIndex];
          return {section,question:section.questions[questionIndex],title:unit.extension.mission[i]};
        });
      }
      const sections=scope==='all'?unit.sections:unit.sections.filter(section=>section.id===scope);
      return ['看懂題意','試做一題','說出理由'].map((title,i)=>{
        const section=sections[i%sections.length];
        const level=['guided','apply','reason'][i];
        const question=section.questions.find(q=>q.level===level)||section.questions[Math.min(i*2,section.questions.length-1)];
        return {section,question,title};
      });
    }
    function showIslandStops(){
      const stops=islandStops(core.unit(),$('course-island-lesson').value);
      $('course-island-missions').innerHTML=stops.map(({title,section})=>
        `<li><strong>${e(title)}</strong><span>${e(section.title)}</span></li>`).join('');
    }
    function renderSolo(mode){
      const stage=$(mode==='game'?'course-game-stage':'course-island-stage'),m=state[mode],item=m?.items[m.at];
      if(!m){stage.replaceChildren();return;}
      if(!item){
        stage.innerHTML=`<h3>${mode==='game'?'闖關':'島嶼任務'}結束</h3><p>答對 ${m.done} 題，獨立首次答對 ${m.correct} 題。</p><p>可以再玩一回，或改練別的小節。</p>`;
        return;
      }
      const q=item.question;
      const teammates=m.paired
        ? `<p class="course-hint">夥伴 ${m.at%2+1} 操作，另一位先說方法。下一關交換角色。</p>` : '';
      const trail=mode==='game'
        ? `<ol class="course-game-trail" aria-label="森林闖關進度">${m.items.map((_,i)=>
          `<li ${i===m.at?'aria-current="step"':''}><span aria-hidden="true">${i<m.at?'✓':i+1}</span><small>${i<m.at?'完成':i===m.at?'這一關':'待探索'}</small></li>`).join('')}</ol>` : '';
      stage.innerHTML=`${trail}<div class="course-task-meta"><strong>${mode==='game'?'第':'任務'} ${m.at+1} / ${m.items.length}${item.title?' · '+e(item.title):''}</strong><span>${e(item.section.title)}</span></div>${teammates}
        <p class="course-prompt" tabindex="-1" data-question-id="${e(q.id)}">${e(core.readingText(q.text.replace('點一下','看圖，找出')))}</p>${core.draw(q.visual)}
        <div class="course-action-row"><button type="button" class="outline" data-solo="read">朗讀題目</button><button type="button" class="outline" data-solo="hint" aria-expanded="${Boolean(m.usedHint)}" ${m.usedHint===3?'disabled':''}>${m.usedHint?'下一步提示':'一步一步提示'}</button></div>
        <p class="course-hint" ${!m.usedHint?'hidden':''}>${m.usedHint?`第 ${m.usedHint} 步 · ${e(core.readingText(core.learningSteps(item.section)[m.usedHint-1]))}`:''}</p>
        <div class="choices">${choose(q,mode,m.locked)}</div><p class="course-status" id="course-${mode}-result" role="status">${m.locked?`答案：${e(q.answer)}。 ${e(q.reason)}`:''}</p>
        ${mode==='island'&&m.at===2&&m.locked?'<p class="island-explain">離島前，指著題圖或用實物說一遍，你怎麼知道？</p>':''}
        <div class="course-action-row"><button type="button" class="outline" data-solo="skip" ${m.locked?'disabled':''}>看解法</button><button type="button" data-solo="next" ${!m.locked?'disabled':''}>下一題</button></div>`;
    }
    function soloHandler(mode,event){
      const stage=event.currentTarget,m=state[mode],item=m?.items[m.at];
      if(!item)return;
      const q=item.question,button=event.target.closest('[data-option]'),action=event.target.closest('[data-solo]')?.dataset.solo;
      if(button&&!m.locked){
        const right=q.choices[Number(button.dataset.option)]===q.answer;
        if(!right){
          m.attempts++;
          button.dataset.result='wrong';
          $(`course-${mode}-result`).textContent='再試一次。也可以先看提示。';
          return;
        }
        if(!m.attempts&&!m.usedHint)m.correct++;
        m.done++;m.locked=true;
        if(mode==='island')sendWorld('course-island-complete',{id:m.unitId,mission:m.at});
      }else if(action==='read'){read(q.text);return;}
      else if(action==='hint'&&m.usedHint<3)m.usedHint++;
      else if(action==='skip'&&!m.locked)m.locked=true;
      else if(action==='next'&&m.locked){core.stopReading();m.at++;m.usedHint=0;m.attempts=0;m.locked=false;}
      else return;
      renderSolo(mode);
      stage.querySelector(action==='hint'&&m.usedHint<3?'[data-solo=hint]':m.locked?'[data-solo=next]':'.course-prompt')?.focus();
    }
    $('course-game-start').addEventListener('click',()=>setSolo('game',poolFor(core.unit(),$('course-game-scope').value,5)));
    for(const mode of ['game','island'])$(`course-${mode}-stage`).addEventListener('click',event=>soloHandler(mode,event));
    $('course-island-start').addEventListener('click',()=>setSolo('island',islandStops(core.unit(),$('course-island-lesson').value)));
    const worldFrame=$('course-world-frame'), messaging=window.MathEmbeddedMessaging;
    const sendWorld=(type,data={})=>messaging.send(worldFrame.contentWindow,{type,...data});
    let islandVisible=false;
    function loadWorld(){
      if(worldFrame.hasAttribute('src'))return;
      const url=new URL('../courses/island-scene.html',location.href);
      url.searchParams.set('grade',core.grade);
      url.searchParams.set('term',core.term);
      url.searchParams.set('v','map-scale-2');
      worldFrame.src=url.href;
    }
    $('course-island-meet').onclick=()=>sendWorld('course-island-resident',{id:core.unit().id});
    window.addEventListener('message',event=>{
      if(!messaging.isFrom(event,worldFrame.contentWindow))return;
      const data=event.data;
      if(data?.type==='course-island-ready'){
        sendWorld('math-lesson-visibility',{visible:islandVisible});
        return;
      }
      if(data?.type==='course-island-resize'&&Number.isFinite(data.height)&&data.height>0){
        worldFrame.style.height=`${Math.max(540,Math.min(1400,data.height))}px`;
        return;
      }
      if(!islandVisible)return;
      if(data?.type==='course-island-arrival'&&core.units.some(unit=>unit.id===data.id)){
        if(core.unit().id!==data.id)core.choose(data.id);
        const items=islandStops(core.unit(),$('course-island-lesson').value);
        const at=Number.isInteger(data.mission)?Math.max(0,Math.min(data.mission,items.length-1)):0;
        if(state.island?.unitId!==data.id||at!==0)setSolo('island',items,at);
      }
    });

    $('course-island-lesson').addEventListener('change',()=>{
      state.island=null;
      renderSolo('island');
      showIslandStops();
    });
    function refresh(){
      const unit=core.unit();
      if(lastLessonUnit!==unit.id){
        lastLessonUnit=unit.id;battleUnit=unit;battleScope='all';state.battle=null;
      }
      for(const mode of ['game','island'])if(state[mode]&&state[mode].unitId!==unit.id){
        state[mode]=null;renderSolo(mode);
      }
      for(const select of ['course-game-scope','course-island-lesson'])scopes($(select));
      $('course-island-heading').textContent=unit.extension?.name||unit.title+'島';
      $('course-island-mission-intro').textContent=unit.extension?.focus||unit.action;
      showIslandStops();
      if(!$('course-panel-battle').hidden && !state.battle)battleSetup();
    }
    return {refresh,showIslandWorld(visible){
      islandVisible=visible;
      if(visible)loadWorld();
      if(worldFrame.hasAttribute('src'))sendWorld('math-lesson-visibility',{visible});
    },enterBattle(){
      if(!state.battle)battleSetup();
    }};
  };
})();
