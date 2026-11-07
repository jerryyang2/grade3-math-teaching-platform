(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const query = new URLSearchParams(location.search);
  const term = query.get('term') === 'lower' ? 'lower' : 'upper';
  const expanded = document.documentElement.dataset.catalog === 'all';
  const catalog = expanded ? window.MathCourseKit.catalog : {4:window.Grade4Math};
  const requestedGrade = Number(query.get('grade'));
  const grade = expanded ? Object.hasOwn(catalog,requestedGrade) ? requestedGrade : 1 : 4;
  const year = '一二三四五六'[grade-1];
  const termTitle = year+(term === 'upper' ? '上數學' : '下數學');
  const units = catalog[grade][term];
  const early=grade<=2?window.EarlyLearning:null;
  window.CoursePracticeBank.prepare(grade,term,units);
  document.body.classList.toggle('early-grade',Boolean(early));
  const letters = 'ABCD';
  // 字嗨的 IVS 選出已校對的多音字讀法，題庫原文仍可直接朗讀。
  const readingText = text => String(text)
    .replace(/數(?=一數|到|出|一個|了幾|剩下|留下|要|空格|同一|長針|下去|有幾|方格|右邊|圖案|星星|小格|同樣|袋數|每人|每盤)/gu,'數\u{E01E1}')
    .replace(/(?<=數\u{E01E1}一)數/gu,'數\u{E01E1}')
    .replace(/量(?=一量|長度|彩帶|紙帶|桌|出|起|每段|總長)/gu,'量\u{E01E1}')
    .replace(/(?<=量\u{E01E1}一)量/gu,'量\u{E01E1}')
    .replace(/重(?=新|複|疊|算)/gu,'重\u{E01E1}');

  const {draw, escape} = window.ClassroomFigures;
  let unit = units.find(u=>u.id===query.get('unit')) || units[0];
  let section = unit.sections.find(s=>s.id===query.get('section')) || unit.sections[0];
  let index = 0;
  let practiceLevel = 'all';
  let randomQuestion = null;
  let randomCount = 0;
  let lastRandom = '';
  const makeIllustration = (targetUnit=unit,targetSection=section) =>
    targetUnit.extension && window.drawFirstGradeQuestion?.(units.indexOf(targetUnit),targetUnit.sections.indexOf(targetSection));
  const questions = () => practiceLevel==='all'
    ? section.questions
    : section.questions.filter(question=>question.level===practiceLevel);
  const currentQuestion = () => randomQuestion || questions()[index];
  document.title = termTitle+'｜慢慢把數學玩懂';
  $('term-title').textContent = termTitle;
  const volumes=['一','二','三','四','五','六','七','八','九','十','十一','十二'];
  $('volume').textContent = '第'+volumes[(grade-1)*2+(term==='lower'?1:0)]+'冊';
  $('other-term').href = '?'+(expanded?'grade='+grade+'&':'')+'term='+(term==='upper'?'lower':'upper');
  $('other-term').textContent = '切換到'+year+(term==='upper'?'下':'上');
  $('unit-list').innerHTML = units.map((u,i)=>`<button type="button" data-unit="${u.id}" aria-pressed="false"><span>${u.icon} 第 ${i+1} 單元</span>${escape(u.title)}</button>`).join('');
  function stopReading() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
  function setAddress() {
    if (location.protocol==='file:') return;
    const url = new URL(location.href);
    if(expanded)url.searchParams.set('grade',grade);
    url.searchParams.set('term',term);url.searchParams.set('unit',unit.id);url.searchParams.set('section',section.id);
    history.replaceState(null,'',url);
  }
  function renderUnit() {
    $('unit-number').textContent = '第 '+(units.indexOf(unit)+1)+' 單元';
    $('lesson-title').textContent = unit.title;
    $('before').textContent = unit.before;
    $('action').textContent = unit.action;
    $('unit-list').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.unit===unit.id)));
    $('section-select').innerHTML=unit.sections.map(s=>`<option value="${s.id}">${escape(s.title)}</option>`).join('');
    $('section-select').value=section.id;
    renderSection();
  }
  function renderSection() {
    $('concept').textContent = section.tip;
    randomQuestion=null;randomCount=0;lastRandom='';
    index=0;renderQuestion();
    document.dispatchEvent(new Event('classroom-scope-change'));
  }
  const hint=$('hint');
  const hintButton=$('hint-open');
  const stepNames=['先找條件','照圖或教具試試','記下答案'];
  let hintIndex=0;
  const revealedQuestions=new Set();
  function learningSteps(target=section){
    const specific=early?.steps(grade,term,unit,target);
    if(specific)return specific;
    return ['先指出題目給了什麼，要找什麼。',target.tip,'選出答案，再用圖、算式或口頭說明檢查。'];
  }
  function renderQuestion(focus=false) {
    stopReading();
    const question = currentQuestion();
    $('question').dataset.questionId = question.id;
    $('question').textContent=readingText(question.text);
    $('figure').innerHTML=draw(question.visual,Boolean(randomQuestion));
    const form=$('first-number-form');
    if(form){
      form.hidden=!randomQuestion || question.input!=='number';
      form.reset();
      const back=$('first-random-return');
      if(back)back.hidden=!randomQuestion;
    }
    $('progress').textContent=randomQuestion?`隨機圖像練習 · 第 ${randomCount} 題`:`第 ${index+1} 題 / 共 ${questions().length} 題`;
    $('feedback').textContent=revealedQuestions.has(question.id)?'已看過這題的解法。可以再練習，作答不列入觀察紀錄。':'';
    delete $('feedback').dataset.result;
    hintIndex=0;
    hintButton.setAttribute('aria-expanded','false');
    hintButton.textContent='一步一步提示';
    hint.hidden=true;
    hint.replaceChildren();
    $('solution-open').hidden=true;
    $('choices').innerHTML=question.choices.map((choice,i)=>`<button type="button" data-choice="${i}">${letters[i]}. ${escape(choice)}</button>`).join('');
    $('previous').disabled=Boolean(randomQuestion)||index===0;
    $('next').disabled=index===questions().length-1 && unit.sections.indexOf(section)===unit.sections.length-1;
    $('next').textContent=index<questions().length-1?'下一題':$('next').disabled?'本單元最後一題':'下一小節';
    if(randomQuestion){
      $('next').disabled=false;
      $('next').textContent='再抽一題';
    }
    document.dispatchEvent(new Event('classroom-question-change'));
    if (focus) $('question').focus();
  }
  $('unit-list').addEventListener('click',e=>{
    const chosen=e.target.closest('button[data-unit]');
    if(!chosen)return;
    unit=units.find(u=>u.id===chosen.dataset.unit);section=unit.sections[0];setAddress();renderUnit();$('lesson-title').focus();
  });
  $('section-select').addEventListener('change',e=>{section=unit.sections.find(s=>s.id===e.target.value);setAddress();renderSection();});
  $('large-text').addEventListener('click',()=>{
    const enlarged=$('large-text').closest('.practice').classList.toggle('large-text');
    $('large-text').setAttribute('aria-pressed',String(enlarged));
  });
  hintButton.addEventListener('click',()=>{
    const opening=hint.hidden;
    hint.hidden=!opening;
    hintButton.setAttribute('aria-expanded',String(opening));
    if(opening){renderHint();document.dispatchEvent(new Event('classroom-support'));}
    else $('solution-open').hidden=true;
  });
  function renderHint(){
    const steps=learningSteps();
    hint.innerHTML=`<p role="status"><strong>第 ${hintIndex+1} 步 · ${stepNames[hintIndex]}</strong><br>${escape(readingText(steps[hintIndex]))}</p>
      <div class="hint-steps"><button type="button" class="outline" data-hint-step="-1" ${hintIndex===0?'disabled':''}>上一步</button>
      <button type="button" class="outline" data-hint-step="1" ${hintIndex===steps.length-1?'disabled':''}>下一步提示</button></div>`;
    $('solution-open').hidden=hintIndex!==steps.length-1||$('feedback').dataset.result==='correct';
  }
  hint.addEventListener('click',event=>{
    const control=event.target.closest('[data-hint-step]');
    if(!control)return;
    hintIndex+=Number(control.dataset.hintStep);
    renderHint();
    (hint.querySelector(`[data-hint-step="${control.dataset.hintStep}"]:enabled`)||
      ($('solution-open').hidden?hint.querySelector('[data-hint-step="-1"]'):$('solution-open')))?.focus();
    document.dispatchEvent(new Event('classroom-support'));
  });
  $('solution-open').addEventListener('click',()=>{
    const {id,answer,reason}=currentQuestion();
    revealedQuestions.add(id);
    $('feedback').dataset.result='shown';
    $('feedback').textContent=`答案是 ${answer}。 ${reason} 再做這題只作練習，不列入觀察紀錄。`;
    document.dispatchEvent(new Event('classroom-support'));
  });
  if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
    $('read').hidden=false;
    $('stop-read').hidden=false;
    $('stop-read').addEventListener('click',stopReading);
    $('read').addEventListener('click',()=>{
      stopReading();const utterance=new SpeechSynthesisUtterance(currentQuestion().text);
      utterance.lang='zh-TW';utterance.rate=Number(document.getElementById('teaching-voice-rate')?.value)||.85;window.speechSynthesis.speak(utterance);
    });
  }
  window.addEventListener('pagehide',stopReading);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopReading();});
  function answerQuestion(value, button) {
    if($('feedback').dataset.result==='correct')return;
    const question=currentQuestion(),correct=String(value)===question.answer;
    const practiceOnly=revealedQuestions.has(question.id);
    if(!practiceOnly)document.dispatchEvent(new CustomEvent('classroom-attempt',{detail:{question,correct,unit,section}}));
    if(button)button.dataset.result=correct?'correct':'wrong';
    $('feedback').dataset.result=correct?'correct':'wrong';
    $('feedback').textContent=(correct?'答對了！'+question.reason
      :$('figure').firstElementChild?'再試一次。先找題圖上的已知條件，也可以看提示。':'再試一次。先找題目給了什麼、要問什麼，也可以看提示。')
      +(practiceOnly?' 這次作答只作練習，不列入觀察紀錄。':'');
    if(correct){
      $('solution-open').hidden=true;
      $('choices').querySelectorAll('button').forEach(b=>b.disabled=true);
      $('first-number-submit')?.setAttribute('disabled','');
      ($('next').disabled?$('feedback'):$('next')).focus();
    }
  }
  $('choices').addEventListener('click',event=>{
    const button=event.target.closest('button[data-choice]');
    if(button)answerQuestion(currentQuestion().choices[Number(button.dataset.choice)],button);
  });
  $('figure').addEventListener('click',event=>{
    const target=event.target.closest('[data-picture-choice]');
    if(randomQuestion&&target)answerQuestion(target.dataset.pictureChoice);
  });
  function drawRandom() {
    let candidate=makeIllustration();
    if(!candidate)return;
    for(let tries=0;tries<20&&candidate.signature===lastRandom;tries++)candidate=makeIllustration();
    lastRandom=candidate.signature;
    randomQuestion=candidate;
    randomCount++;
    renderQuestion(true);
  }
  if(unit.extension){
    $('figure').insertAdjacentHTML('afterend',`<form id="first-number-form" class="first-number-form" hidden>
      <label for="first-number">寫下你的答案<input id="first-number" name="number" inputmode="numeric" type="number" min="0" max="30" step="1" required></label>
      <button type="submit" id="first-number-submit">送出</button></form>`);
    $('first-number-form').addEventListener('submit',event=>{
      event.preventDefault();
      const input=$('first-number');
      if(randomQuestion?.input==='number'&&input.value!=='')answerQuestion(Number(input.value));
    });
    document.addEventListener('classroom-question-change',()=>$('first-number-submit').removeAttribute('disabled'));
  }
  $('previous').addEventListener('click',()=>{if(index>0){index--;renderQuestion(true);}});
  $('next').addEventListener('click',()=>{
    if(randomQuestion){drawRandom();return;}
    if(index<questions().length-1){index++;renderQuestion(true);return;}
    const following=unit.sections[unit.sections.indexOf(section)+1];
    if(following){section=following;$('section-select').value=section.id;setAddress();renderSection();$('concept').scrollIntoView({block:'nearest'});$('section-select').focus();}
  });
  const worksheet=$('worksheet');
  const worksheetUnit=$('worksheet-unit');
  const worksheetScope=$('worksheet-scope');
  worksheetUnit.innerHTML=units.map((u,i)=>`<option value="${u.id}">第 ${i+1} 單元：${escape(u.title)}</option>`).join('');
  function setWorksheetScopes(preferred='all'){
    const chosen=units.find(u=>u.id===worksheetUnit.value);
    worksheetScope.innerHTML='<option value="all">單元總複習</option>'+chosen.sections.filter(s=>s.worksheet)
      .map(s=>`<option value="${s.id}">${escape(s.title)}</option>`).join('');
    worksheetScope.value=chosen.sections.some(s=>s.id===preferred&&s.worksheet)?preferred:'all';
    renderWorksheet();
  }
  function renderWorksheet(){
    const selected=units.find(u=>u.id===worksheetUnit.value);
    const number=units.indexOf(selected)+1;
    const focusSection=selected.sections.find(s=>s.id===worksheetScope.value);
    const items=focusSection?.worksheet || selected.worksheet;
    const title=focusSection?.title || '單元總複習';
    const pictures=$('worksheet-color').checked;
    const grid=$('worksheet-grid').checked;
    const zihi=$('worksheet-zihi').checked;
    const date=$('worksheet-date').value.trim() || '____ 年 ___ 月 ___ 日';
    const item=(q,i)=>`<article class="worksheet-card" data-question-number="${i+1}" data-answer-format="${q.format}">
      <div class="worksheet-meta"><span>第 ${i+1} 題 · ${number}-${q.section} · ${q.type}</span><span>答：____</span></div>
      <p class="worksheet-prompt">${escape(readingText(q.text))}${q.format==='reason'?' 選好後，在格子裡寫下理由。':''}</p>
      ${draw(q.visual)}
      <div class="work-line ${grid?'work-grid':''}" aria-label="計算與畫圖區"></div>
      ${q.format!=='write'?`<ol class="worksheet-options" type="A">${q.choices.map(c=>`<li>${escape(readingText(c))}</li>`).join('')}</ol>`:''}
    </article>`;
    $('worksheet-pages').classList.toggle('worksheet-zihi',zihi);
    $('worksheet-pages').classList.toggle('worksheet-monochrome',!pictures);
    $('worksheet-pages').innerHTML=[0,1].map(i=>{
      const start=i*5;
      return `<section class="worksheet-sheet"><header>
        <p class="worksheet-school" translate="no">115年大埤國小學習教室</p>
        <h3>${termTitle} · 第 ${number} 單元：${escape(selected.title)}</h3>
        <p class="worksheet-subtitle">${escape(title)} · 共 10 題</p>
        <p class="worksheet-student"><span>姓名：____________　日期：${escape(date)}</span><span>第 ${i+1} / 2 頁　得分：____</span></p>
        ${early?'<p class="worksheet-routine">① 看圖和題目　② 圈出重點　③ 在格子裡畫一畫或寫算式</p>':'<p class="worksheet-routine">先讀圖和題目，再在格子裡記下做法。示意圖請依標示判讀。</p>'}
      </header><div class="worksheet-columns">${[[0,3],[3,5]].map(([a,b])=>`<div class="worksheet-column">${items.slice(start+a,start+b).map((q,j)=>item(q,start+a+j)).join('')}</div>`).join('')}</div>
      ${i===1?`<footer class="worksheet-support" aria-label="個別化支持紀錄">
        <p>個別化支持紀錄（教師依實際提供的支持勾選）</p>
        <div class="worksheet-support-grid">
          <label><input type="checkbox">學習內容：題意簡化、圖像提示</label>
          <label><input type="checkbox">學習歷程：計算對齊、分段引導</label>
          <label><input type="checkbox">學習環境：減少干擾、安心練習</label>
          <label><input type="checkbox">學習評量：延長時間、報讀題目</label>
        </div>
      </footer>`:''}</section>`;
    }).join('');
    $('worksheet-answers').innerHTML=items.map(q=>`<li>${q.format!=='write'?letters[q.choices.indexOf(q.answer)]+'. ':''}${escape(q.answer)}。 ${escape(q.reason)}</li>`).join('');
    worksheet.querySelector('.answer-key').open=false;
  }
  worksheetUnit.addEventListener('change',()=>setWorksheetScopes());
  worksheetScope.addEventListener('change',renderWorksheet);
  for(const id of ['worksheet-color','worksheet-grid','worksheet-zihi','worksheet-date']){
    $(id).addEventListener('change',renderWorksheet);
  }
  $('worksheet-open').addEventListener('click',()=>{
    stopReading();
    worksheetUnit.value=unit.id;
    setWorksheetScopes(section.id);
    worksheet.showModal();
  });
  $('worksheet-print').addEventListener('click',()=>{
    renderWorksheet();
    document.fonts.ready.then(()=>window.print());
  });
  renderUnit();
  window.ClassroomCore = {
    grade,term,termTitle,units,draw,escape,stopReading,learningSteps,readingText,
    unit:()=>unit,section:()=>section,question:currentQuestion,makeIllustration,drawRandom,
    leaveRandom(){
      randomQuestion=null;randomCount=0;
      renderQuestion(true);
    },
    setPracticeLevel(level){
      if(level!=='all'&&!section.questions.some(question=>question.level===level))return;
      randomQuestion=null;randomCount=0;
      practiceLevel=level;
      index=0;
      renderQuestion();
    },
    choose(unitId,sectionId){
      const target=units.find(item=>item.id===unitId);
      if(!target)return;
      unit=target;section=unit.sections.find(item=>item.id===sectionId)||unit.sections[0];
      setAddress();renderUnit();
    },
  };
})();
