(function(){
'use strict';
history.scrollRestoration='manual';
const $=id=>document.getElementById(id),C=MathIslands,T=MathIslandTeaching,R=MathIslandRewards,audio=window.spEdAudio;
let guideIndex=0,currentCertificate=null,lastFootstep=0;
let storage;try{storage=localStorage;}catch{storage={getItem(){throw Error();},setItem(){throw Error();}};}
const visitors=MathIslandVisitors.create(storage);
let progress=visitors.active().progress,saveOK=visitors.saved();
$('certificate-cheer').innerHTML=window.AdventureArt.cheer();
const evidence=new Map();
let unit=C.islands[0],mission=0,current,state,attempts=0,hinted=false,solved=false,practice=false,world;
function initState(){return {choice:-1};}
function stamp(id,m){const r=progress[id]?.[m];return r?.result==='independent'?'●':r?'◐':'○';}
function renderDirectory(){
 $('island-list').innerHTML=C.islands.map((i,n)=>`<button class="island-card ${document.body.dataset.view==='lesson'&&i.id===unit.id?'selected':''}" data-island="${i.id}" aria-pressed="${document.body.dataset.view==='lesson'&&i.id===unit.id}" style="--island-color:${i.color}"><span class="adventure-landmark directory-landmark" data-landmark="${i.id}" aria-hidden="true"></span><span class="directory-copy"><small>第 ${n+1} 單元 · ${i.unit}</small><strong>${i.name}</strong><span class="mini-stamps" aria-label="三個任務進度">${[0,1,2].map(m=>stamp(i.id,m)).join(' ')}</span></span><span aria-hidden="true">↗</span></button>`).join('');
 const completed=Object.values(progress).reduce((n,v)=>n+Object.keys(v).length,0);$('stamp-count').textContent=`${completed} / ${C.islands.length*3}`;
}
function renderTabs(){ $('mission-tabs').innerHTML=unit.missions.map((name,m)=>`<button data-mission="${m}" aria-pressed="${m===mission}" class="${m===mission?'active':''}" aria-label="任務 ${m+1} ${name} ${stamp(unit.id,m)==='○'?'尚未完成':'已完成'}"><span>${stamp(unit.id,m)}</span> ${m+1}. ${name}</button>`).join('');}
function loadTask(random=false){
 audio.stopSpeech();guideIndex=0;$('guide-panel').hidden=true;$('guide-open').setAttribute('aria-expanded','false');$('guide-open').disabled=$('independent').checked;$('method-route').textContent=T.method(unit.id).route;$('feedback-read').hidden=true;
 if(current)evidence.set(JSON.stringify(current),{attempts,hinted:hinted||solved});
 practice=random;const oldTask=JSON.stringify(current);current=C.task(unit.id,mission,random?Math.random:null);if(random)for(let tries=0;tries<20&&JSON.stringify(current)===oldTask;tries++)current=C.task(unit.id,mission,Math.random);state=initState();const previous=evidence.get(JSON.stringify(current));attempts=previous?.attempts||0;hinted=!!previous?.hinted||(!random&&!!progress[unit.id]?.[mission]);solved=false;
 $('island-kicker').textContent=`ISLAND ${String(C.islands.indexOf(unit)+1).padStart(2,'0')} / ${C.islands.length}`;$('island-name').textContent=unit.name;$('island-unit').textContent=`第 ${C.islands.indexOf(unit)+1} 單元｜${unit.unit}`;$('buddy-icon').innerHTML=window.AdventureArt.portrait(window.AdventureArt.animalForName(unit.buddy));$('buddy-name').textContent=unit.buddy;
 $('mission-number').textContent=random?'換題練習':`任務 ${mission+1} / 3`;$('mission-title').textContent=unit.missions[mission];$('question').textContent=current.prompt;$('hint').textContent=current.hint;$('hint').hidden=true;$('hint-button').setAttribute('aria-expanded','false');$('hint-button').disabled=$('independent').checked;
 $('feedback').textContent='';$('feedback').className='feedback';$('check').disabled=false;$('check').textContent='完成了，檢查一下 ↗';$('next').hidden=true;
 $('learning-goal').textContent=unit.goal;$('teacher-say').textContent=unit.say;$('unit-link').href=`../lower.html?unit=${unit.id}`;
 $('mission-panel').style.setProperty('--accent',unit.color);renderTabs();renderDirectory();renderManipulative();updateRewards();
}
function selectIsland(id,focus=true,missionIndex=0){if(unit.id!==id)playFx('arrive');const selected=C.islands.find(i=>i.id===id);if(!selected)return;unit=selected;mission=[0,1,2].includes(missionIndex)?missionIndex:0;loadTask();world?.select(id,focus);document.querySelectorAll('.island-label').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.island===id)));history.replaceState(null,'',`#${id}`);}
function setView(view){const landing=view==='landing';document.body.dataset.view=view;$('mission-panel').hidden=landing;$('landing-welcome').hidden=!landing;$('back-to-landing').hidden=landing;$('skip-game').href=landing?'#world':'#mission-panel';$('skip-game').textContent=landing?'跳至群島地圖':'跳至數學任務';}
function showLanding(){audio.stopSpeech();setView('landing');$('resident-dialogue').hidden=true;world?.overview();document.querySelectorAll('.island-label').forEach(b=>b.setAttribute('aria-pressed','false'));renderDirectory();history.replaceState(null,'',`${location.pathname}${location.search}#landing`);requestAnimationFrame(()=>$('expedition').scrollIntoView({block:'start',behavior:'auto'}));}
function chooseIsland(id,m=0){setView('lesson');selectIsland(id,false,m);requestAnimationFrame(()=>$('expedition').scrollIntoView({block:'start',behavior:'auto'}));}
function arriveAtIsland(id,focus=false,m=0){if(document.body.dataset.view==='lesson'&&unit.id===id){world?.select(id,false);return;}chooseIsland(id,m);}
function renderManipulative(){
  const host=$('manipulative'), p=current.problem;
  host.innerHTML=WorksheetDiagrams.render(p)+`<div class="island-answer-options" role="group" aria-label="選擇答案">${p.options.map((value,index)=>
    `<button type="button" data-choice="${index}" aria-pressed="${state.choice===index}">${value}</button>`).join('')}</div>`;
  host.querySelectorAll('button').forEach(button=>button.disabled=solved);
}
$('manipulative').addEventListener('click',event=>{
  const button=event.target.closest('[data-choice]');
  if(!button||solved)return;
  state.choice=Number(button.dataset.choice);
  $('manipulative').querySelectorAll('[data-choice]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  playFx('click');
});
$('check').addEventListener('click',()=>{
 if(solved)return;attempts++;const correct=C.evaluate(current,state);$('feedback').className=`feedback ${correct?'correct':'retry'}`;
 if(!correct){playFx('retry');$('feedback-read').hidden=false;$('feedback').textContent=T.narration.retry;return;}

 const previousAwards=R.earned(progress);playFx('correct');solved=true;world?.complete(unit.id,mission);const result=attempts===1&&!hinted?'independent':'supported';progress[unit.id]??={};if(progress[unit.id][mission]?.result!=='independent')progress[unit.id][mission]={attempts,result};
 saveOK=visitors.record(progress);world?.setProgress(progress);
 $('feedback').textContent=`靠岸成功！${C.solution(current)} ${result==='independent'?'● 獨立首次完成':'◐ 支持後完成'}${saveOK?'':'（目前無法儲存；進度保留到關閉頁面前。）'}`;$('check').disabled=true;$('check').textContent='✓ 這一步，做到了';$('next').hidden=false;$('next').textContent=mission<2?'下一個任務 →':'前往下一座島 →';
 $('manipulative').querySelectorAll('button,input').forEach(e=>{e.disabled=true;});$('manipulative').querySelectorAll('[data-action="slice"]').forEach(e=>{e.setAttribute('aria-disabled','true');e.tabIndex=-1;});renderTabs();renderDirectory();
 $('feedback-read').hidden=false;updateRewards();const awards=R.earned(progress);if(awards.grand&&!previousAwards.grand){playFx('award');showCertificate('grand');}else if(awards.units.includes(unit.id)&&!previousAwards.units.includes(unit.id)){playFx('award');showCertificate(unit.id);}
});
$('hint-button').onclick=()=>{hinted=true;$('hint').hidden=!$('hint').hidden;$('hint-button').setAttribute('aria-expanded',String(!$('hint').hidden));};
$('independent').onchange=()=>{const independent=$('independent').checked;$('hint-button').disabled=independent;$('guide-open').disabled=independent;if(independent){$('guide-panel').hidden=true;$('guide-open').setAttribute('aria-expanded','false');$('hint').hidden=true;$('hint-button').setAttribute('aria-expanded','false');}};
$('reset').onclick=()=>{const wasSupported=hinted||attempts>0||solved;state=initState();solved=false;hinted=wasSupported;$('feedback-read').hidden=true;$('feedback').textContent='已清空操作，可以重新試試。';$('feedback').className='feedback';$('check').disabled=false;$('check').textContent='完成了，檢查一下 ↗';$('next').hidden=true;renderManipulative();};
$('random').onclick=()=>loadTask(true);$('next').onclick=()=>{if(mission<2){mission++;loadTask();}else world.travelTo(C.islands[(C.islands.indexOf(unit)+1)%C.islands.length].id,0);};
$('mission-tabs').onclick=e=>{const b=e.target.closest('[data-mission]');if(b){mission=Number(b.dataset.mission);loadTask();}};
$('island-list').onclick=e=>{const b=e.target.closest('[data-island]');if(b)world.travelTo(b.dataset.island,0);};
$('island-labels').innerHTML=C.islands.map((i,n)=>`<button class="island-label" data-island="${i.id}" aria-pressed="false"><span aria-hidden="true">${i.icon}</span><small>${String(n+1).padStart(2,'0')}</small><b>${i.name}</b></button>`).join('');
$('island-labels').onclick=e=>{const b=e.target.closest('[data-island]');if(b)world.travelTo(b.dataset.island,0);};
function openPassport(){ audio.stopSpeech();world.stop();$('passport-owner').textContent=visitors.active().name; $('passport-grid').innerHTML=C.islands.map(i=>`<div class="passport-row"><span aria-hidden="true">${i.icon}</span><div><strong>${i.name}</strong><small>${i.missions.map((m,j)=>`${stamp(i.id,j)} ${m}`).join('　')}</small><button data-certificate="${i.id}" ${R.earned(progress).units.includes(i.id)?'':'disabled'}>${R.earned(progress).units.includes(i.id)?'領取本島小證書':'完成三個任務領證書'}</button></div></div>`).join('');updateRewards();$('save-status').textContent=saveOK?'目前訪客的進度自動保留在這台瀏覽器。':'瀏覽器暫時不允許儲存；目前紀錄會保留到關閉頁面前。';$('passport').showModal();}
$('passport-open').onclick=openPassport;$('passport-close').onclick=()=>$('passport').close();$('passport').onclick=e=>{if(e.target===$('passport')){const r=$('passport').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('passport').close();}};
function playFx(kind){if(audio.isMuted||!audio.audioCtx)return;if(audio.audioCtx.state!=='running'&&!navigator.userActivation?.isActive)return;const sounds={click:[[523],.06,.028],step:[[180],.035,.012],arrive:[[440,659],.12,.045],retry:[[262,220],.12,.035],correct:[[523,659,784],.18,.055],award:[[523,659,784,1046],.3,.065]};const [notes,duration,volume]=sounds[kind]||sounds.click;audio.playTone(notes,'sine',duration,volume);}
function speak(text){playFx('click');return MathIslandNarration.speak(text);}
function renderGuide(){const all=T.steps(current),s=all[Math.min(guideIndex,all.length-1)];$('guide-count').textContent=`解題步驟 ${guideIndex+1} / ${all.length}`;$('guide-title').textContent=s.title;$('guide-text').textContent=s.text;$('guide-formula').textContent=s.formula;$('guide-formula').hidden=!s.formula;$('guide-prev').disabled=guideIndex===0;$('guide-next').disabled=guideIndex===all.length-1;$('manipulative').dataset.guide=String(guideIndex);renderManipulative();}
$('guide-open').onclick=()=>{hinted=true;const open=$('guide-panel').hidden;$('guide-panel').hidden=!open;$('guide-open').setAttribute('aria-expanded',String(open));if(open)renderGuide();else renderManipulative();playFx('click');};
$('guide-prev').onclick=()=>{guideIndex=Math.max(0,guideIndex-1);renderGuide();playFx('click');};$('guide-next').onclick=()=>{guideIndex=Math.min(T.steps(current).length-1,guideIndex+1);renderGuide();playFx('click');};
$('read-question').onclick=()=>speak(current.prompt);$('read-method').onclick=()=>speak(T.method(unit.id).route);$('guide-read').onclick=()=>{hinted=true;const s=T.steps(current)[guideIndex];speak([s.title,s.text,s.formula]);};$('feedback-read').onclick=()=>speak(solved?[T.narration.correct,C.solution(current)]:T.narration.retry);
$('island-audio-toggle').onclick=()=>{audio.toggleMute($('island-audio-toggle'));try{localStorage.setItem('math_g3s2_island_muted',String(audio.isMuted));}catch{}};$('speech-stop').onclick=()=>audio.stopSpeech();$('island-speech-rate').onchange=e=>audio.setSpeechRate(Number(e.target.value));
try{if(localStorage.getItem('math_g3s2_island_muted')==='true')audio.toggleMute($('island-audio-toggle'));}catch{}
document.addEventListener('pointerdown',()=>{if(!audio.isMuted)audio.ensureAudioContext();},{passive:true});document.addEventListener('keydown',()=>{if(!audio.isMuted)audio.ensureAudioContext();},{passive:true});
function showResident(resident){if(!resident){$('resident-dialogue').hidden=true;return;}$('resident-name').textContent=resident.name;$('resident-icon').innerHTML=window.AdventureArt.portrait(window.AdventureArt.animalForName(resident.name));$('resident-line').textContent=resident.line;$('resident-dialogue').dataset.resident=resident.id;$('resident-dialogue').hidden=false;playFx('arrive');}
$('resident-close').onclick=()=>{$('resident-dialogue').hidden=true;audio.stopSpeech();};$('resident-read').onclick=()=>{const resident=T.residents.find(r=>r.id===$('resident-dialogue').dataset.resident);if(resident)speak([resident.name,resident.line]);};$('meet-resident').onclick=()=>world.meetResident(unit.id);
function updateRewards(){const awards=R.earned(progress),earned=awards.units.includes(unit.id);$('award-notice').hidden=!earned;$('award-message').textContent=awards.grand?T.narration.grandAward:T.narration.islandAward;$('grand-certificate').hidden=!awards.grand;$('passport-grand').disabled=!awards.grand;$('passport-grand').textContent=awards.grand?'領取十島大證書':'十島大證書（完成十島解鎖）';$('passport-cruise').disabled=!awards.cruise;$('passport-cruise').textContent=awards.cruise?'🚢 登上環遊世界號':'環遊世界號（完成十島解鎖）';$('cruise-board').disabled=!awards.cruise;$('cruise-board').textContent=awards.cruise?'🚢 登上環遊世界號':'🔒 完成十島後登船';$('cruise-status').textContent=awards.cruise?'九座島全部完成！大證書與環遊世界號，都是你的探險獎勵。':`目前完成 ${awards.units.length} / 9 座島。每島完成三個任務，就能集一枚島章；集滿九枚即可登船。`;}
function showCertificate(id){world.stop();audio.stopSpeech();const issuedAt=new Date();const date=new Intl.DateTimeFormat(window.MathI18n?.language==='en'?'en-US':'zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'long',day:'numeric'}).format(issuedAt);const c=R.certificate(progress,id,visitors.active().name,date);if(!c)return;$('passport').close();currentCertificate=c;c.issuedAt=issuedAt.toISOString();$('certificate-title').textContent=c.title;$('certificate-art').innerHTML=R.svg(c);$('certificate-cruise').hidden=!R.earned(progress).cruise;$('certificate-dialog').showModal();}
$('unit-certificate').onclick=()=>showCertificate(unit.id);$('grand-certificate').onclick=()=>showCertificate('grand');$('passport-grand').onclick=()=>showCertificate('grand');$('passport-grid').onclick=e=>{const b=e.target.closest('[data-certificate]');if(b&&!b.disabled)showCertificate(b.dataset.certificate);};$('certificate-close').onclick=()=>$('certificate-dialog').close();
$('certificate-download').onclick=()=>{if(!currentCertificate)return;const url=URL.createObjectURL(new Blob([window.MathI18n?.markup(R.svg(currentCertificate)) ?? R.svg(currentCertificate)],{type:'image/svg+xml;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=`math-island-${currentCertificate.id}-certificate.svg`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('certificate-print').onclick=()=>{if(!currentCertificate)return;document.body.classList.add('printing-certificate');window.print();};window.addEventListener('afterprint',()=>document.body.classList.remove('printing-certificate'));
function cruiseState(riding){$('cruise-board').hidden=riding;$('cruise-return').hidden=!riding;$('cruise-disembark-map').hidden=!riding;document.querySelectorAll('[data-walk]').forEach(b=>{b.disabled=riding||$('world').classList.contains('flat');});if(riding)$('resident-dialogue').hidden=true;}
function startCruise(){if(!R.earned(progress).cruise)return;$('certificate-dialog').close();$('passport').close();if(world.boardCruise()){playFx('award');MathIslandNarration.speak(T.narration.cruiseWelcome);$('world').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}else $('cruise-status').textContent='登船資格已解鎖。請在支援 3D 的模式搭乘環遊世界號，證書仍可正常領取。';}
$('cruise-board').onclick=startCruise;$('passport-cruise').onclick=startCruise;$('certificate-cruise').onclick=startCruise;$('cruise-return').onclick=()=>{audio.stopSpeech();world.endCruise();};$('cruise-disembark-map').onclick=()=>{audio.stopSpeech();world.endCruise();};

let visitorEdit=false;
function visitorBadge(){const v=visitors.active();$('active-visitor-name').textContent=v.name;$('visitor-color').style.background=v.color;}
function visitorList(){
 $('visitors-list').replaceChildren();
 for(const v of visitors.list()){
  const row=document.createElement('div');row.className='visitor-row';
  const avatar=document.createElement('span');avatar.className='visitor-avatar';avatar.style.background=v.color;avatar.textContent='♟';
  const copy=document.createElement('div'),name=document.createElement('strong'),detail=document.createElement('small');name.setAttribute('translate','no');name.textContent=v.name;detail.textContent=`${Object.values(v.progress).reduce((n,p)=>n+Object.keys(p).length,0)} / ${C.islands.length*3} 個任務`;copy.append(name,detail);
  const button=document.createElement('button');button.dataset.visitor=v.id;button.textContent=v.id===visitors.active().id?'目前訪客':'切換';button.disabled=v.id===visitors.active().id;row.append(avatar,copy,button);$('visitors-list').append(row);
 }
}
function visitorForm(edit){visitorEdit=edit;$('visitor-name').value=edit?visitors.active().name:'';$('visitor-look').value=edit?visitors.active().color:MathIslandVisitors.colors[0];$('visitor-form-title').textContent=edit?'自訂目前訪客':'新增訪客';$('visitor-submit').textContent=edit?'儲存姓名與造型':'新增並出發 →';$('visitor-add-mode').hidden=!edit;$('visitor-error').textContent='';}
function openVisitors(edit=false){world.stop();visitorList();visitorForm(edit);$('visitors-dialog').showModal();if(edit)$('visitor-name').focus();}
function applyVisitor(){audio.stopSpeech();$('certificate-dialog').close();currentCertificate=null;const v=visitors.active();progress=v.progress;saveOK=visitors.saved();current=null;evidence.clear();world.setVisitor(v,{atLanding:true});world.setProgress(progress);visitorBadge();loadTask();showLanding();}
$('visitors-open').onclick=()=>openVisitors(false);$('visitor-switch').onclick=()=>openVisitors(false);$('visitor-edit').onclick=()=>openVisitors(true);$('visitors-close').onclick=()=>$('visitors-dialog').close();$('visitor-add-mode').onclick=()=>visitorForm(false);
$('visitor-form').onsubmit=e=>{e.preventDefault();try{world.stop();if(visitorEdit){visitors.rename($('visitor-name').value,$('visitor-look').value);world.setVisitor(visitors.active(),{preservePosition:true});visitorBadge();}else{visitors.add($('visitor-name').value,$('visitor-look').value);applyVisitor();}saveOK=visitors.saved();$('visitors-dialog').close();}catch(error){$('visitor-error').textContent=error.message;}};
$('visitors-list').onclick=e=>{const button=e.target.closest('[data-visitor]');if(!button)return;world.stop();if(visitors.switchTo(button.dataset.visitor)){applyVisitor();$('visitors-dialog').close();}};
world=createMathWorld(arriveAtIsland,{onTravelStart:chooseIsland,onLanding:showLanding,onPosition(p,id){saveOK=visitors.locate(p,id);},onResident:showResident,onFootstep(){const now=performance.now();if(now-lastFootstep>380){lastFootstep=now;playFx('step');}},onCruise:cruiseState});world.setProgress(progress);world.setVisitor(visitors.active(),{atLanding:true});visitorBadge();
$('overview').onclick=()=>world.overview();$('follow-visitor').onclick=()=>world.follow();$('zoom-in').onclick=()=>world.zoom(.82);$('zoom-out').onclick=()=>world.zoom(1.22);$('motion-toggle').onclick=()=>{const paused=world.toggleMotion();$('motion-toggle').setAttribute('aria-pressed',String(paused));$('motion-toggle').textContent=paused?'恢復動態':'暫停動態';};
document.querySelectorAll('button[data-camera-view]').forEach(button=>{button.onclick=()=>world.setCamera(button.dataset.cameraView);});
$('back-to-landing').onclick=()=>world.returnToLanding();$('landing-label').onclick=()=>world.returnToLanding();
document.addEventListener('math-language-change',()=>{if(currentCertificate){if(currentCertificate.issuedAt)currentCertificate.date=new Intl.DateTimeFormat(window.MathI18n?.language==='en'?'en-US':'zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'long',day:'numeric'}).format(new Date(currentCertificate.issuedAt));$('certificate-art').innerHTML=R.svg(currentCertificate);}});
// 先從碼頭出發；有單元連結時接著前往該島。
const params=new URLSearchParams(location.search);
const classroomUnit=params.get('lesson')||params.get('unit')||location.hash.slice(1);
loadTask();showLanding();
if (/^u(?:[1-9]|10)$/.test(classroomUnit)) {
  requestAnimationFrame(()=>world.travelTo(classroomUnit));
  window.addEventListener('message',event=>{if(window.MathEmbeddedMessaging.isFrom(event,window.parent) && event.data?.type==='math-lesson-visibility' && !event.data.visible){world.stop();audio.stopSpeech();}});
  if (window.MathEmbeddedMessaging.isEmbedded()) document.addEventListener('click',event=>{
    const link=event.target.closest('a');
    if (link && (link.id==='unit-link' || link.getAttribute('href')==='../lower.html') && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();window.MathEmbeddedMessaging.send(window.parent,{type:'math-lesson-return',unit:unit.id});
    }
  });
}

})();
