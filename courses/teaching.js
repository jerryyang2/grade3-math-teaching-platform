/* 一、二、四、五、六年級共用教室工具；每次操作都以當前學期和單元為準。 */
(() => {
  'use strict';
  const core=window.ClassroomCore;
  if(!core)return;
  document.body.classList.add('course-classroom');
  const $=id=>document.getElementById(id);
  const e=core.escape;
  const enhanced=Boolean(core.unit().extension);
  document.body.classList.toggle('first-grade-upper',enhanced);
  const buttons=[
    ['prep','📝','備課指引','Lesson planning'],['units','📚','課堂教學','Classroom lesson'],
    ['lab','🧰','數位教具操作箱','Manipulatives'],['practice','✏️','隨堂練習','Practice'],
    ['battle','🚩','分組搶答','Team quiz'],['game','⭐','互動遊戲','Games'],
    ['island','🏝️','數學島嶼','Math islands'],['worksheet','🖨️','學習單列印','Worksheets'],
    ['adjust','🍃','課程調整','Learning supports'],['records','📊','隨堂診斷','Observations']
  ];
  const students=window.ClassroomRoster.map(s=>({id:String(s.id),portrait:s.animal,name:s.name}))
    .sort((a,b)=>Number(a.id)-Number(b.id));
  const labelOptions=students.map(x=>`<option value="${x.id}" translate="no">${e(x.name)}</option>`).join('');
  const root=document.createElement('div');
  root.id='course-teaching-panels';
  const panel=(id,title,intro,body)=>`<section class="card course-panel" id="course-panel-${id}" aria-labelledby="course-heading-${id}" hidden>
    <h2 id="course-heading-${id}" tabindex="-1">${title}</h2><p class="course-panel-intro">${intro}</p>${body}</section>`;
  const scope=(id,label='練習範圍')=>`<label>${label}<select id="${id}"></select></label>`;
  root.innerHTML=[
    panel('prep','備課指引','從先備檢核、動手示範到課堂觀察，依學生步調調整。',scope('course-prep-section','選擇備課小節')+'<div id="course-prep-plan"></div>'),
    panel('lab','數位教具操作箱','用教具表示同一道題的條件；先讓學生說看到什麼，再揭示解法。',`
      <div class="course-action-row"><button type="button" id="lab-whiteboard" class="outline">開啟白板</button><button type="button" id="lab-tools" class="outline">直尺・三角板・量角器・圓規</button></div>
      <section class="course-inset"><h3>單元題圖與提示</h3><div class="course-action-row">${scope('course-lab-section','教學小節')}<button type="button" class="outline" id="course-lab-next">換一個例題</button></div><div id="course-lab-example"></div></section>
      <section class="course-inset" id="first-model" hidden></section>
      <section class="course-inset"><h3>可動手操作的圖形</h3><label>選擇教具<select id="course-model-type">
      <option value="dots">分組點陣</option><option value="clock">時鐘</option><option value="strips">分數條</option>
      <option value="rect">周長與面積方格</option><option value="angle">角度</option><option value="line">數線</option><option value="pie">百分率與圓形圖</option>
      <option value="ruler">刻度尺</option><option value="mirror">線對稱</option><option value="trend">折線圖</option>
      <option value="shape">平面圖形</option><option value="speed">速率與距離</option><option value="volume">體積與分層</option>
      </select></label><div id="course-model-inputs"></div><div id="course-model-view"></div><p id="course-model-summary" role="status"></p></section>`),
    `<section class="course-panel" id="course-panel-battle" aria-labelledby="course-heading-battle" hidden><div id="course-battle-stage"></div><p id="course-battle-announcement" role="status" class="course-battle-sr"></p></section>`,
    panel('game','互動遊戲冒險館','6 款互動遊戲。森林拔河對應本學期，其餘五款可作補充活動。',`
      <div class="course-arcade"></div>
      <details class="course-inset course-arcade-extra"><summary>更多本學期練習：森林闖關</summary><div class="course-action-row">${scope('course-game-scope')}<label>遊戲方式<select id="course-game-mode"><option value="solo">一人探險</option><option value="paired">兩人合作</option></select></label><button type="button" id="course-game-start">開始森林闖關</button></div><div id="course-game-stage"></div></details>`),
    panel('island','數學島嶼','點選地圖上的島或攤位，完成三站任務。也可以單獨選一個小節練習。',`
      <div class="course-island-map"><div class="course-island-map-caption"><strong>${e(core.termTitle)} · 森林群島</strong><span>沿著木橋，一站一站探索</span></div>
      <iframe id="course-world-frame" class="course-world-frame" title="${e(core.termTitle)}立體數學群島" allow="fullscreen"></iframe>
      </div>
      <section class="island-dock" aria-labelledby="course-island-heading"><h3 id="course-island-heading"></h3>
      <p id="course-island-mission-intro"></p><button type="button" class="outline" id="course-island-meet">和島上居民說話</button><ol id="course-island-missions"></ol>
      <div class="course-action-row">${scope('course-island-lesson','任務範圍')}<button type="button" id="course-island-start">開始島嶼任務</button><button type="button" class="outline" id="course-island-practice">直接練習這個單元</button></div><div id="course-island-stage"></div></section>`),
    panel('adjust','課程調整','依學生當下需要改變提示、題目呈現或作答方式，保留本單元的數學重點。','<div id="course-adjust-plan"></div>'),
    panel('records','隨堂診斷','這裡是作答與教學觀察，供教師覆核。正式網站使用學生代號，紀錄只留在本瀏覽器；示範作答不列入。',`
      <div class="course-action-row"><label>學生代號<select id="course-record-student">${labelOptions}</select></label>
      ${scope('course-record-unit','觀察單元')}<button class="outline" type="button" id="course-export-records">匯出觀察紀錄</button></div>
      <div id="course-record-results" aria-live="polite"></div>
      <label for="course-observation">教師補充觀察（本次草稿）</label>
      <textarea id="course-observation" rows="3" placeholder="例如：能用方格指出一排幾個；計算仍需口頭提示。"></textarea>
      <div class="course-action-row"><button type="button" id="course-build-report">產生觀察摘要</button><button type="button" class="outline" id="course-print-report" disabled>列印觀察摘要</button></div>
      <pre id="course-report" tabindex="-1" hidden></pre>`)
  ].join('');
  const main=document.querySelector('.classroom-main');
  main.append(root);
  const nav=document.createElement('nav');
  nav.className='course-teaching-nav';
  nav.setAttribute('aria-label','教學功能');
  nav.innerHTML=buttons.map(([id,icon,zh,en])=>`<button type="button" data-view="${id}" aria-controls="${id==='units'||id==='practice'?'lesson':id==='worksheet'?'worksheet':'course-panel-'+id}" ${id==='worksheet'?'aria-haspopup="dialog"':''}><span aria-hidden="true">${icon}</span><span data-zh="${zh}" data-en="${en}">${zh}</span></button>`).join('');
  main.prepend(nav);
  const hero=document.createElement('section');
  hero.className='course-welcome storybook-welcome floating-islands-welcome';
  hero.setAttribute('aria-labelledby','course-welcome-title');
  hero.innerHTML=`
        <div class="floating-islands-scene">
          <img class="floating-islands-art" src="../assets/storybook/floating-islands.webp" width="1586" height="992" alt="" fetchpriority="high">
          <div class="storybook-welcome-copy">
            <span class="storybook-eyebrow">森林數學探險站</span>
            <h2 id="course-welcome-title">小小探險家，<br><em>今天玩什麼？</em></h2>
            <p>動手玩數學，讓想法看得見。</p>
          </div>
        </div>
        <figure class="animal-scene decorative-item">
          <div class="floating-friends-heading">
            <h3>探險夥伴</h3>
            <button type="button" id="storybook-greet" class="storybook-greet" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="6" cy="8" rx="2" ry="3"/><ellipse cx="12" cy="5" rx="2" ry="3"/><ellipse cx="18" cy="8" rx="2" ry="3"/><path d="M5 18c0-4 4-7 7-7s7 3 7 7c0 5-5 1-7 1s-7 4-7-1Z"/></svg><span>夥伴集合</span></button>
          </div>
          <div id="animal-garden" class="animal-garden" role="group" aria-label="五位動物夥伴，點擊角色聽小提醒"></div>
          <figcaption id="storybook-speech" class="storybook-speech" role="status" aria-live="polite">點點小動物，聽聽牠的小提醒！</figcaption>
        </figure>
        <div class="storybook-launch">
          <div class="lesson-quick-picker"><label for="course-home-unit"><span>準備出發</span>今天探索哪一站？</label><select id="course-home-unit">${core.units.map((unit,i)=>`<option value="${e(unit.id)}">第 ${i+1} 單元：${e(unit.title)}</option>`).join('')}</select></div>
          <div class="course-action-row"><button type="button" data-welcome="lesson">開始動手玩 ↓</button>
            <button type="button" class="outline" data-welcome="island">前往數學島</button></div>
        </div>`;
  hero.querySelector('#course-home-unit').addEventListener('change',event=>core.choose(event.target.value));
  document.querySelector('.unit-picker').before(hero);
  const lessonStep=document.createElement('section');
  lessonStep.className='course-inset first-lesson-step';
  $('concept').parentElement.after(lessonStep);
  if(enhanced){
    lessonStep.addEventListener('click',event=>{
      const action=event.target.closest('[data-first-step]')?.dataset.firstStep;
      if(action==='model')openFirstModel();
      if(action==='try')show('practice');
      if(action==='talk')show('prep');
    });
    $('figure').insertAdjacentHTML('afterend',`<div class="practice-support first-practice-links">
      <button type="button" class="outline" id="first-use-model">用教具想一想</button>
      <button type="button" class="outline" id="first-read-choices" hidden>聽選項</button>
      </div>`);
    $('first-use-model').addEventListener('click',openFirstModel);
    $('first-use-model').addEventListener('click',()=>document.dispatchEvent(new Event('classroom-support')));
    if('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window){
      const readChoices=$('first-read-choices');
      readChoices.hidden=false;
      readChoices.addEventListener('click',()=>{
        core.stopReading();
        const options=[...$('choices').querySelectorAll('button:not([hidden])')].map(b=>b.textContent).join('。');
        const voice=new SpeechSynthesisUtterance(options);
        voice.lang='zh-TW';voice.rate=Number($('teaching-voice-rate').value)||.85;
        window.speechSynthesis.speak(voice);
      });
    }
    document.body.insertAdjacentHTML('beforeend',`<dialog id="first-model-dialog" aria-labelledby="first-model-dialog-heading">
      <div class="worksheet-controls"><h2 id="first-model-dialog-heading">用本單元教具想一想</h2>
      <form method="dialog"><button class="outline" autofocus>回到原頁</button></form></div></dialog>`);
    $('first-model-dialog').addEventListener('close',()=>root.querySelector('#course-panel-lab .course-inset').after($('first-model')));
  }
  function openFirstModel(){
    const dialog=$('first-model-dialog');
    dialog.append($('first-model'));
    dialog.showModal();
  }
  hero.addEventListener('click',event=>{
    const destination=event.target.closest('[data-welcome]')?.dataset.welcome;
    if(destination==='island')show('island');
    if(destination==='lesson')$('lesson').scrollIntoView({block:'start'});
  });

  const top=document.createElement('div');
  top.className='course-top-tools';
  top.innerHTML=`
    <label class="course-language"><span data-zh="介面語言" data-en="Interface language">介面語言</span><select id="course-ui-language"><option value="zh">繁體中文</option><option value="en">English menus</option></select></label>
    <details id="course-teacher-tools" name="classroom-tools"><summary data-zh="教學輔助功能" data-en="Teaching tools">教學輔助功能</summary><div class="course-tool-box">
      <button type="button" class="outline" id="course-open-clock">課堂計時器</button>
      <button type="button" class="outline" id="course-open-board">教學白板</button>
      <button type="button" class="outline" id="course-open-toolbox">幾何工具箱</button>
      <button type="button" class="outline" id="course-open-annotation">浮動畫記與放大鏡</button>
    </div></details>
    <details id="course-points" name="classroom-tools"><summary data-zh="學生代幣存摺" data-en="Student star bank">學生代幣存摺</summary>
      <div class="course-menu-panel"><div id="course-point-list" class="course-tool-box"></div><p id="course-point-status" role="status"></p></div></details>
    <details id="course-display-tools" name="classroom-tools"><summary data-zh="顯示與朗讀" data-en="Display and reading">顯示與朗讀</summary>
      <div class="course-menu-panel"><div class="course-tool-box"><button type="button" class="outline" id="course-global-large" aria-pressed="false">放大課堂文字</button>
      <button type="button" class="outline" id="course-high-contrast" aria-pressed="false">高對比</button>
      <label>朗讀速度<select id="teaching-voice-rate"><option value=".72">慢速</option><option value=".85" selected>自然</option><option value="1">較快</option></select></label>
      <button type="button" class="outline" id="course-stop-voice">停止朗讀</button></div></div></details>
    <span class="course-total-stars">⭐ <output id="course-points-total">0</output> 顆星</span>`;
  document.querySelector('.classroom-header').append(top);
  const actions=document.createElement('div');
  actions.className='course-lesson-actions';
  actions.innerHTML='<button class="outline" type="button" id="course-lesson-plan">本步教案</button><button class="outline" type="button" id="course-fullscreen" aria-pressed="false">全螢幕上課</button>';
  document.querySelector('.classroom-nav').append(actions);

  const recordOptions=document.createElement('div');
  recordOptions.className='course-action-row course-practice-settings';
  recordOptions.innerHTML=`<label>練習對象<select id="course-practice-student"><option value="">示範模式（不記錄）</option>${labelOptions}</select></label>
    <label>本題作答支持<select id="course-practice-support"><option value="independent">獨立作答</option><option value="prompted">看過提示</option><option value="verbal">口語引導</option><option value="physical">肢體協助</option></select></label>`;
  if(enhanced) recordOptions.insertAdjacentHTML('afterbegin','<label>練習層級<select id="first-practice-level"><option value="all">全部題目</option><option value="guided">基礎辨認</option><option value="apply">情境應用</option><option value="reason">推理與辨錯</option></select></label>');
  $('practice-title').closest('.practice-heading').after(recordOptions);
  if(enhanced){
    recordOptions.insertAdjacentHTML('afterend',`<div class="course-action-row first-random-controls">
      <button type="button" id="first-random">抽一題圖像練習</button>
      <button type="button" id="first-random-return" class="outline" hidden>回到固定題庫</button>
      <span>練習目前小節，可一直換題。部分題目可以直接點圖或填數字。</span></div>`);
    $('first-random').addEventListener('click',core.drawRandom);
    $('first-random-return').addEventListener('click',core.leaveRandom);
  }
  $('first-practice-level')?.addEventListener('change',event=>core.setPracticeLevel(event.target.value));

  let view='units';
  function show(id,focus=true){
    if(id==='worksheet'){$('worksheet-open').click();return;}
    if(!buttons.some(x=>x[0]===id))return;
    const previous = view;
    if(previous!==id)core.stopReading();
    if(id==='lab'&&(view==='practice'||view==='units')){
      const section=core.section();
      $('course-lab-section').value=section.id;
      exampleIndex=Math.max(0,section.questions.indexOf(core.question()));renderExample();
    }
    view=id;
    hero.hidden=id!=='units';
    const standard=id==='units'||id==='practice';
    $('lesson').hidden=!standard;
    lessonStep.hidden=id!=='units';
    for(const child of root.querySelectorAll('.course-panel'))child.hidden=child.id!=='course-panel-'+id;
    for(const b of nav.querySelectorAll('button')){
      if(b.dataset.view===id)b.setAttribute('aria-current','page');
      else b.removeAttribute('aria-current');
    }
    if(id==='units'){
      window.MathToolbox?.open();
      window.MathFloatingTools?.open();
    }
    if(id==='records')renderRecords();
    activities.showIslandWorld(id==='island');
    if(id==='battle')activities.enterBattle();
    if(previous==='game'||id==='game') document.dispatchEvent(new CustomEvent('math-tab-change',{detail:{tab:id}}));
    if(focus){
      const target=standard?$(id==='practice'?'question':'lesson-title'):$('course-heading-'+id);
      target?.focus({preventScroll:true});
      (id==='practice'?target:standard?$('lesson'):$('course-panel-'+id))?.scrollIntoView({block:'start'});
    }
  }
  nav.addEventListener('click',event=>{const id=event.target.closest('button[data-view]')?.dataset.view;if(id)show(id);});
  $('course-lesson-plan').addEventListener('click',()=>show('prep'));
  $('course-ui-language').addEventListener('change',event=>{
    for(const element of document.querySelectorAll('[data-zh][data-en]')){
      const english=event.target.value==='en';
      element.textContent=english?element.dataset.en:element.dataset.zh;
      element.lang=english?'en':'zh-Hant';
    }
  });
  $('course-open-clock').addEventListener('click',()=>window.classroomClock?.open());
  $('course-open-annotation').addEventListener('click',()=>window.MathFloatingTools?.open());
  for(const id of ['course-open-board','lab-whiteboard'])$(id).addEventListener('click',()=>window.MathWhiteboard?.open());
  for(const id of ['course-open-toolbox','lab-tools'])$(id).addEventListener('click',()=>window.MathToolbox?.open());
  $('course-stop-voice').addEventListener('click',core.stopReading);
  function toggleClass(id,name){
    $(id).addEventListener('click',()=>$(id).setAttribute('aria-pressed',String(document.body.classList.toggle(name))));
  }
  toggleClass('course-global-large','course-large-display');toggleClass('course-high-contrast','course-high-contrast');
  const fullscreen=$('course-fullscreen');
  function projection(on){
    document.body.classList.toggle('course-projection',on);
    fullscreen.setAttribute('aria-pressed',String(on));
    fullscreen.textContent=on?'退出全螢幕上課':'全螢幕上課';
  }
  fullscreen.addEventListener('click',async()=>{
    if(document.body.classList.contains('course-projection')){
      if(document.fullscreenElement&&document.exitFullscreen)try{await document.exitFullscreen();}catch{}
      projection(false);
    }else{
      if(document.documentElement.requestFullscreen)try{await document.documentElement.requestFullscreen();}catch{}
      projection(true);
    }
  });
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)projection(false);});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!document.fullscreenElement&&!document.querySelector('dialog[open]'))projection(false);
  });

  const modelDefs={
    dots:[['每組有幾個',1,10,4],['共有幾組',1,6,3]],
    clock:[['小時',1,12,3],['分鐘',0,55,30,5]],
    strips:[['一共等分幾份',2,12,6],['取幾份',0,12,3]],
    rect:[['長（公分）',1,10,6],['寬（公分）',1,8,4]],
    angle:[['角度（度）',5,180,65,5]],
    line:[['0 到 1 的等分數',2,12,5],['從 0 數幾格',0,12,2]],
    pie:[['A 區百分率',5,95,35,5]],
    ruler:[['起點刻度',0,9,2],['終點刻度',1,10,7]],
    mirror:[['甲點離對稱軸幾格',1,7,3],['是否顯示對稱點（0 否／1 是）',0,1,0]],
    trend:[['週一借書量',0,10,4,2],['週二借書量',0,10,8,2],['週三借書量',0,10,6,2]],
    shape:[['圖形（0 三角形、1 正方形、2 長方形、3 圓形）',0,3,0],['轉動方向（0 否／1 是）',0,1,0]],
    speed:[['每小時幾公里',1,30,12],['經過幾小時',1,5,2]],
    volume:[['底層每列幾格',1,10,4],['底層共有幾列',1,8,3],['堆幾層',1,8,2]]
  };
  function chooseModel(unit){
    const title=unit.title;
    const v=unit.sections.flatMap(s=>s.questions).find(q=>q.visual)?.visual.kind;
    if(v==='mirror'||title.includes('對稱'))return 'mirror';
    if(['bars','group','trend'].includes(v)||/統計|折線/.test(title))return 'trend';
    if(v==='ruler'||/長短|公分|公尺|長度/.test(title)&&!/立方/.test(title))return 'ruler';
    if(/速率|流水/.test(title))return 'speed';
    if(/體積|立方|容積/.test(title))return 'volume';
    if(v==='shape'||/形狀|平面圖形|圖形和形體/.test(title))return 'shape';
    if(v==='clock'||v==='time'||title.includes('時間'))return 'clock';
    if(v==='line'||title.includes('小數'))return 'line';
    if(v==='strips'||title.includes('分數'))return 'strips';
    if(v==='angle'||/角度|扇形/.test(title))return 'angle';
    if(v==='pie'||/百分率|圓形圖/.test(title))return 'pie';
    if(v==='rect'||/面積|周長/.test(title))return 'rect';
    return 'dots';
  }
  const model=$('course-model-type');
  function renderModelInputs(){
    const defs=modelDefs[model.value];
    $('course-model-inputs').innerHTML=defs.map(([name,min,max,value,step=1],i)=>
      `<label>${name} <output data-model-number="${i}">${value}</output><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-model-control="${i}"></label>`).join('');
    drawModel();
  }
  function drawModel(){
    const fields=[...$('course-model-inputs').querySelectorAll('input')];
    const a=Number(fields[0].value);
    if(fields[1]&&['strips','line'].includes(model.value)){
      fields[1].max=String(a);
      if(Number(fields[1].value)>a)fields[1].value=String(a);
    }
    if(model.value==='ruler'){
      fields[1].min=String(a+1);
      if(Number(fields[1].value)<=a)fields[1].value=String(a+1);
    }
    const b=Number(fields[1]?.value)||0;
    const c=Number(fields[2]?.value)||0;
    const values={
      dots:[{kind:'dotRows',values:Array(b).fill(a)},`每組 ${a} 個，共 ${b} 組，一共 ${a*b} 個。`],
      clock:[{kind:'clock',hour:a,minute:b},`${a} 時 ${String(b).padStart(2,'0')} 分。`],
      strips:[{kind:'strips',values:[b,a]},`整條分成 ${a} 等份，塗色 ${b} 份。`],
      rect:[{kind:'rect',wide:a,high:b},`面積 ${a*b} 平方公分；周長 ${2*(a+b)} 公分。`],
      angle:[{kind:'angle',value:a},`兩條射線張開 ${a}°。`],
      line:[{kind:'line',parts:a,at:b},`0 到 1 分成 ${a} 等份，紅點在第 ${b} 格。`],
      pie:[{kind:'pie',percent:a},`A 區 ${a}%，B 區 ${100-a}%。`],
      ruler:[{kind:'ruler',start:a,end:b},`長度＝終點 ${b}－起點 ${a}＝${b-a} 公分。`],
      mirror:[{kind:'mirror',distance:a,reveal:Boolean(b)},b?`兩個對應點各離對稱軸 ${a} 格。`:`甲在左側 ${a} 格。找找對稱點，再切換顯示。`],
      trend:[{kind:'trend',values:[a,b,c]},`週一 ${a} 本，週二 ${b} 本，週三 ${c} 本。找找線段何時上升、下降或保持水平。`],
      shape:[{kind:'shape',shape:a,rotate:Boolean(b)},['三角形有三條邊。','正方形有四條等長的邊和四個直角。','這個長方形有四個直角、相對的兩邊等長。','圓形沒有角。'][a]],
      speed:[{kind:'time',start:'0 公里',end:a*b+' 公里'},`每小時 ${a} 公里，${b} 小時共 ${a*b} 公里。`],
      volume:[{kind:'rect',wide:a,high:b},`圖中是一層，有 ${a*b} 個單位方塊；堆 ${c} 層共 ${a*b*c} 個單位方塊。`]
    };
    const [visual,summary]=values[model.value];
    fields.forEach((input,i)=>$('course-model-inputs').querySelector(`[data-model-number="${i}"]`).textContent=input.value);
    $('course-model-view').innerHTML=core.draw(visual);
    $('course-model-summary').textContent=summary;
  }
  model.addEventListener('change',renderModelInputs);
  $('course-model-inputs').addEventListener('input',drawModel);
  let exampleIndex=0,modelUnit;
  function renderExample(){
    const section=core.unit().sections.find(item=>item.id===$('course-lab-section').value)||core.section();
    const q=section.questions[exampleIndex%section.questions.length];
    $('course-lab-example').innerHTML=`<p class="course-prompt" data-question-id="${e(q.id)}">${e(q.text)}</p>${core.draw(q.visual)}
      <details><summary>分步提示與答案</summary><ol><li>${e(section.tip)}</li><li>${e(q.reason)}</li><li>確認答案：${e(q.answer)}</li></ol></details>`;
  }
  $('course-lab-section').addEventListener('change',()=>{exampleIndex=0;renderExample();});
  $('course-prep-section').addEventListener('change',event=>core.choose(core.unit().id,event.target.value));
  $('course-lab-next').addEventListener('click',()=>{exampleIndex++;renderExample();});
  const activities=window.mountCourseActivities(core,root);
  const arcade=window.mountCourseArcade(core,$('course-panel-game'));
  $('course-island-practice').addEventListener('click',()=>{
    const unit=core.unit(),scope=$('course-island-lesson').value;
    const section=unit.sections.find(item=>item.id===scope)||core.section();
    if(section.id!==core.section().id)core.choose(unit.id,section.id);
    show('practice');
  });
  if(enhanced){
    $('first-model').hidden=false;
    window.mountFirstGradeModel(core,$('first-model'));
  }

  const supportLabels={independent:'獨立作答',prompted:'看過提示',verbal:'口語引導',physical:'肢體協助'};
  const ranks=Object.keys(supportLabels);
  const key=`math115-course-${core.grade}-${core.term}-v1`;
  const runId=`${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let saved={points:{},rows:[]},storageOK=true;
  try{
    const data=JSON.parse(localStorage.getItem(key)||'null');
    if(data&&data.points&&Array.isArray(data.rows))saved=data;
  }catch{storageOK=false;}
  const persist=()=>{
    if(!storageOK)return;
    try{localStorage.setItem(key,JSON.stringify(saved));}catch{storageOK=false;}
  };
  const name=id=>students.find(s=>s.id===id)?.name||'';
  const stars=id=>Math.min(9999,Math.max(0,Math.trunc(Number(saved.points[id])||0)));
  function drawPoints(){
    $('course-point-list').innerHTML=students.map(s=>`<div class="course-student-stars"><span translate="no">${window.AdventureArt.portrait(s.portrait)} ${e(s.name)}</span>
      <output aria-label="目前星星">${stars(s.id)}</output>
      <button type="button" class="outline" data-student="${s.id}" data-delta="-1" aria-label="${e(s.name)} 扣一顆星">−</button>
      <button type="button" class="outline" data-student="${s.id}" data-delta="1" aria-label="${e(s.name)} 加一顆星">＋</button></div>`).join('');
    $('course-points-total').textContent=students.reduce((sum,s)=>sum+stars(s.id),0);
  }
  function point(id,delta){
    saved.points[id]=Math.max(0,Math.min(9999,stars(id)+delta));persist();drawPoints();
    $('course-point-status').textContent=`${name(id)}：${stars(id)} 顆星。${storageOK?'':'目前只暫存於此頁。'}`;
  }
  $('course-point-list').addEventListener('click',event=>{
    const button=event.target.closest('[data-delta]');
    if(!button||!name(button.dataset.student))return;
    const {student,delta}=button.dataset;
    point(student,Number(delta));
    $('course-point-list').querySelector(`[data-student="${student}"][data-delta="${delta}"]`)?.focus();
  });
  drawPoints();

  const recordStudent=$('course-practice-student'),support=$('course-practice-support');
  let limited=false,explain=false;
  const seenPrompts=new Set();
  function applySupportFloor(){
    if(seenPrompts.has(core.question().id)&&support.value==='independent')support.value='prompted';
  }
  function markSupport(){
    seenPrompts.add(core.question().id);
    applySupportFloor();
  }
  support.addEventListener('change',applySupportFloor);
  function practiceDisplay(){
    const q=core.question(),choiceButtons=[...$('choices').querySelectorAll('button')];
    const keep=new Set([q.choices.indexOf(q.answer),q.choices.findIndex(x=>x!==q.answer)]);
    for(const button of choiceButtons)button.hidden=limited&&!keep.has(Number(button.dataset.choice));
    if(limited&&choiceButtons.length>2)markSupport();
    if(explain&&$('hint-open').getAttribute('aria-expanded')!=='true')$('hint-open').click();
  }
  document.addEventListener('classroom-support',markSupport);
  document.addEventListener('classroom-question-change',()=>{
    support.value='independent';
    applySupportFloor();
    practiceDisplay();
  });
  document.addEventListener('classroom-attempt',event=>{
    const id=recordStudent.value;
    if(!name(id))return;
    const {question:q,correct,unit,section}=event.detail;
    applySupportFloor();
    const level=ranks.includes(support.value)?support.value:'independent';
    const at=saved.rows.findIndex(r=>r.run===runId&&r.id===id&&r.q===q.id);
    const prev=saved.rows[at];
    if(prev){
      prev.n++;prev.final ||= correct;
      if(ranks.indexOf(level)>ranks.indexOf(prev.support))prev.support=level;
    }else{
      saved.rows.push({id,run:runId,q:q.id,unit:unit.id,section:section.id,n:1,first:correct,
        final:correct,firstSupport:level,support:level});
      if(saved.rows.length>3000)saved.rows.shift();
    }
    if(correct&&!prev?.rewarded){
      const item=prev||saved.rows.at(-1);item.rewarded=true;point(id,1);
    }else persist();
    if(view==='records')renderRecords();
  });

  const diagStudent=$('course-record-student'),diagUnit=$('course-record-unit');
  diagUnit.innerHTML='<option value="all">全部單元</option>'+core.units.map(u=>`<option value="${u.id}">${e(u.title)}</option>`).join('');
  function filterRows(){
    return saved.rows.filter(row=>row.id===diagStudent.value&&(diagUnit.value==='all'||row.unit===diagUnit.value));
  }
  function summarize(rows){
    return [rows.length,rows.filter(r=>r.first).length,rows.filter(r=>r.first&&r.firstSupport==='independent').length,rows.filter(r=>r.final).length];
  }
  function renderRecords(){
    const rows=filterRows(),data=summarize(rows);
    const titles=['題目觀察','首次答對','獨立首次答對','最終完成'];
    const sections=core.units.flatMap(u=>u.sections.map(s=>({u,s}))).filter(({u})=>diagUnit.value==='all'||u.id===diagUnit.value);
    const contents=sections.map(({u,s})=>{
      const selected=rows.filter(r=>r.section===s.id);
      if(!selected.length)return '';
      const d=summarize(selected);
      return `<tr><th scope="row">${e(u.title)} · ${e(s.title)}</th><td>${d[0]}</td><td>${d[1]}</td><td>${d[2]}</td><td>${d[3]}</td></tr>`;
    }).join('');
    $('course-record-results').innerHTML=`<div class="course-metrics">${titles.map((t,i)=>`<div>${t}<strong>${data[i]}</strong></div>`).join('')}</div>
      ${!storageOK?'<p>目前瀏覽器只允許暫存，重新整理前請匯出。</p>':''}
      ${contents?`<div class="course-evidence-table" tabindex="0"><table><thead><tr><th scope="col">觀察小節</th>${titles.map(t=>`<th scope="col">${t}</th>`).join('')}</tr></thead><tbody>${contents}</tbody></table></div>`:'<p>尚無觀察。可回隨堂練習選擇學生代號後作答。</p>'}`;
  }
  function resetReport(){
    $('course-report').hidden=true;
    $('course-print-report').disabled=true;
  }
  for(const field of [diagStudent,diagUnit])field.addEventListener('change',()=>{resetReport();renderRecords();});
  $('course-observation').addEventListener('input',resetReport);
  $('course-build-report').addEventListener('click',()=>{
    const [total,first,independent,final]=summarize(filterRows());
    const scope=core.units.find(u=>u.id===diagUnit.value)?.title||'全部單元';
    const note=$('course-observation').value.trim();
    const report=$('course-report');
    report.textContent=`${core.termTitle}｜隨堂觀察摘要\n${name(diagStudent.value)} · ${scope}\n\n題目觀察 ${total}；首次答對 ${first}；獨立首次答對 ${independent}；最終完成 ${final}。\n\n教師觀察：${note||'（待教師補充）'}\n\n此摘要供教師覆核，不能單憑作答紀錄判定學習障礙或精熟程度。`;
    report.hidden=false;$('course-print-report').disabled=false;report.focus();
  });
  $('course-print-report').addEventListener('click',()=>{
    document.body.classList.add('course-print-report');
    try{window.print();}finally{document.body.classList.remove('course-print-report');}
  });
  $('course-export-records').addEventListener('click',()=>{
    const a=document.createElement('a');
    const blob=new Blob([JSON.stringify({year:115,grade:core.grade,term:core.term,studentCode:diagStudent.value,observations:filterRows()},null,2)],{type:'application/json'});
    a.href=URL.createObjectURL(blob);
    a.download=`math-observation-${core.grade}-${core.term}-${diagStudent.value}.json`;
    a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  });

  function renderPlans(){
    const unit=core.unit(),s=core.section();
    const q=s.questions[0];
    const topic=unit.extension;
    const steps=core.learningSteps(s);
    lessonStep.innerHTML=`<h3>本小節任務 · ${e(s.title)}</h3>
      <ol class="course-learning-steps">${steps.map(step=>`<li>${e(core.readingText(step))}</li>`).join('')}</ol>
      ${topic?`
      <p>${e(topic.prompt)}</p>${core.draw(q.visual)}
      <div class="course-action-row"><button type="button" data-first-step="model">① 先動手</button>
      <button type="button" class="outline" data-first-step="try">② 試做一題</button>
      <button type="button" class="outline" data-first-step="talk">③ 說說方法</button></div>`:''}`;
    const plan=[
      ['先備檢核',unit.before,'請學生用實物、手勢或口述示範。先記下自己能完成的部分。'],
      ['課堂示範',unit.action,topic?.prompt||'先示範一遍，第二遍讓學生做關鍵步驟。'],
      ['引導練習',s.tip,q.text],
      ['同儕討論','兩人先各想一個方法，再比較用到的數量、位置或關係。','允許用指圖、口述、選卡或寫算式說明。'],
      ['課後小檢核',topic?.check||'挑同一小節另一題，看看是否能把剛才的策略帶到新題。','學生做得到時，先收起提示，讓他用自己的方法完成下一題。']
    ];
    $('course-prep-plan').innerHTML=`<h3>${e(unit.title)} · ${e(s.title)}</h3><ol class="course-plan-list">${plan.map(([step,text,check])=>
      `<li><strong>${step}</strong><p>${e(text)}</p><p>${e(check)}</p>${topic&&step==='引導練習'?core.draw(q.visual):''}</li>`).join('')}</ol>
      ${topic?`<div class="first-teacher-note"><strong>觀察重點</strong><p>${e(topic.focus)}</p><strong>常見迷思</strong><p>${e(topic.misconception)}</p></div>`:''}
      <div class="course-action-row"><button type="button" data-jump="lab">開本單元教具</button><button type="button" class="outline" data-jump="practice">試做本小節</button></div>`;
    const adjust=[
      ['學習內容',`先教「${s.title}」的一個概念：${s.tip}`],
      ['學習歷程',`${unit.action} 如有需要，一次只給一個動作指令；熟悉後再減少提示。`],
      ['學習環境','減少同時顯示的材料，使用高對比或放大文字；給足反應時間。'],
      ['學習評量',`用「${e(q.text)}」觀察學生能否指出已知條件並完成作答。可用指圖、說明或實物代替書寫，另外記錄提示程度。`]
    ];
    $('course-adjust-plan').innerHTML=`<h3>${e(unit.title)} · ${e(s.title)}</h3><dl class="course-adjust-grid">${adjust.map(([title,desc])=>`<div><dt>${title}</dt><dd>${title==='學習評量'?desc:e(desc)}</dd></div>`).join('')}</dl>
      <div class="course-action-row"><label><input id="course-choice-limit" type="checkbox" ${limited?'checked':''}> 練習先呈現兩個選項</label>
      <label><input id="course-auto-hint" type="checkbox" ${explain?'checked':''}> 練習先展開提示</label>
      <button type="button" data-jump="practice">套用並回到練習</button></div>`;
  }
  root.addEventListener('click',event=>{const target=event.target.closest('[data-jump]')?.dataset.jump;if(target)show(target);});
  root.addEventListener('change',event=>{
    if(event.target.id==='course-choice-limit'){limited=event.target.checked;practiceDisplay();}
    if(event.target.id==='course-auto-hint'){explain=event.target.checked;practiceDisplay();}
  });
  function sync(){
    const unit=core.unit(),section=core.section();
    const lab=$('course-lab-section');
    lab.innerHTML=unit.sections.map(s=>`<option value="${s.id}">${e(s.title)}</option>`).join('');
    lab.value=section.id;exampleIndex=0;renderExample();
    $('course-prep-section').innerHTML=lab.innerHTML;
    $('course-prep-section').value=section.id;
    if(modelUnit!==unit.id){modelUnit=unit.id;model.value=chooseModel(unit);renderModelInputs();}
    $('course-home-unit').value=core.unit().id;
    renderPlans();activities.refresh();arcade.refresh();
  }
  document.addEventListener('classroom-scope-change',sync);
  sync();show(location.hash==='#game'?'game':'units',false);
})();
