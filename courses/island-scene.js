(() => {
  'use strict';
  const scene=window.CourseIslandScene;
  if(!scene)return;
  const $=id=>document.getElementById(id);
  const islands=window.MathIslands.islands;
  const message=window.MathEmbeddedMessaging;
  const send=(type,detail={})=>message.send(window.parent,{type,...detail});
  const key=`course-island-visitors-${scene.grade}-${scene.term}`;
  const defaults=[{name:'訪客 1',color:'#508c7a'},{name:'訪客 2',color:'#b47454'}];
  let active=0,visitors=defaults,currentResident;
  try {
    const stored=JSON.parse(localStorage.getItem(key)||'null');
    if(stored?.visitors?.length===2){
      visitors=defaults.map((fallback,i)=>({...fallback,...stored.visitors[i]}));
      active=Number(stored.active===1);
    }
  } catch {}
  function save(){
    try {localStorage.setItem(key,JSON.stringify({active,visitors}));} catch {}
  }
  $('map-course-name').textContent=scene.title;
  $('island-labels').replaceChildren(...islands.map((island,i)=>{
    const button=document.createElement('button');
    button.className='island-label';button.type='button';button.dataset.unitId=island.id;
    button.setAttribute('aria-pressed','false');
    button.setAttribute('aria-label',island.name);
    button.title=island.name;
    const icon=document.createElement('span'),number=document.createElement('small');
    const shortName=document.createElement('b'),fullName=document.createElement('b');
    icon.textContent=island.icon;icon.setAttribute('aria-hidden','true');
    number.textContent=String(i+1).padStart(2,'0');
    shortName.className='island-label-short';shortName.textContent=island.shortName;
    fullName.className='island-label-full';fullName.textContent=island.name;
    button.append(icon,number,shortName,fullName);
    button.addEventListener('click',()=>world.travelTo(island.id));
    return button;
  }));
  for(const island of islands)$('island-destination').add(new Option(island.name,island.id));
  $('island-destination').onchange=event=>{
    const id=event.target.value;
    if(id)world.travelTo(id);
    event.target.value='';
  };
  function resident(person){
    currentResident=person;
    $('resident-dialogue').hidden=!person;
    if(!person)return;
    $('resident-icon').innerHTML=window.AdventureArt.portrait(window.AdventureArt.animalForName(person.name));
    $('resident-name').textContent=person.name;
    $('resident-line').textContent=person.line;
  }
  const world=window.createMathWorld((id,_,mission)=>{
    world.select(id,false);
    document.querySelectorAll('.island-label').forEach(button=>
      button.setAttribute('aria-pressed',String(button.dataset.unitId===id)));
    send('course-island-arrival',{id,mission});
  },{
    onResident:resident,
    onTravelStart(id){resident(null);send('course-island-departure',{id});},
    onLanding(){resident(null);send('course-island-dock');},
    onPosition(position,id){
      Object.assign(visitors[active],{position,islandId:id||'u1',atLanding:!id});
      save();
    }
  });
  function applyVisitor(){
    const visitor=visitors[active];
    $('active-visitor-name').textContent=visitor.name;
    world.setVisitor(visitor,{atLanding:visitor.atLanding??!visitor.position});
  }
  applyVisitor();
  world.overview();
  $('landing-label').onclick=()=>world.returnToLanding();
  $('overview').onclick=()=>world.overview();
  $('zoom-in').onclick=()=>world.zoom(.82);
  $('zoom-out').onclick=()=>world.zoom(1.22);
  $('follow-visitor').onclick=()=>world.follow();
  $('motion-toggle').onclick=event=>{
    const paused=world.toggleMotion(),button=event.currentTarget;
    button.setAttribute('aria-pressed',String(paused));
    button.textContent=paused?'恢復動態':'暫停動態';
  };
  document.querySelectorAll('[data-camera-view]').forEach(button=>
    button.addEventListener('click',()=>world.setCamera(button.dataset.cameraView)));
  $('resident-close').onclick=()=>{window.speechSynthesis?.cancel();resident(null);};
  $('resident-read').onclick=()=>{
    if(!currentResident||!('speechSynthesis' in window))return;
    window.speechSynthesis.cancel();
    const line=new SpeechSynthesisUtterance(currentResident.line);
    line.lang='zh-TW';line.rate=.82;window.speechSynthesis.speak(line);
  };
  $('visitor-edit').onclick=()=>{
    $('visitor-name').value=visitors[active].name;
    $('visitor-dialog').showModal();
  };
  $('visitor-dialog').addEventListener('close',event=>{
    if(event.currentTarget.returnValue!=='save')return;
    const name=$('visitor-name').value.trim();
    if(name){visitors[active].name=name;save();applyVisitor();}
  });
  $('visitor-switch').onclick=()=>{
    world.stop();resident(null);active=1-active;save();applyVisitor();
  };
  window.addEventListener('message',event=>{
    if(!message.isFrom(event,window.parent))return;
    const data=event.data;
    if(data?.type==='course-island-resident')world.meetResident(data.id);
    if(data?.type==='course-island-complete')world.complete(data.id,data.mission);
    if(data?.type==='math-lesson-visibility'&&!data.visible)window.speechSynthesis?.cancel();
  });
  send('course-island-ready');
  new ResizeObserver(([entry])=>send('course-island-resize',{height:Math.ceil(entry.target.getBoundingClientRect().height)+2}))
    .observe(document.querySelector('.course-world'));
})();
