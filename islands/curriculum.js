/* 三下數學島任務引用共用題庫，題圖、答案與逐步引導使用同一資料。 */
(function(root){
  'use strict';
  const data=typeof module!=='undefined'?require('../js/data.js'):root.NANI_G3S2_DATA;
  const palette=['#70934b','#bc7058','#4d8fa9','#bf6a83','#5e8c72','#d18a22','#c87b4d','#408f99','#8470ae','#4c9b89'];
  const islands=data.units.map((unit,index)=>({
    id:unit.id,name:unit.island,icon:unit.icon,color:palette[index],land:'#b3cda4',
    buddy:unit.buddy,unit:unit.title,goal:unit.goal,say:unit.ask,tip:unit.steps[0],
    missions:[unit.sections[0].title,unit.sections[Math.floor(unit.sections.length/2)].title,unit.sections.at(-1).title]
  }));
  function task(id,mission=0,random=null){
    const unit=data.units.find(item=>item.id===id);
    if(!unit||![0,1,2].includes(mission))throw new RangeError('未知單元或任務');
    const section=[unit.sections[0],unit.sections[Math.floor(unit.sections.length/2)],unit.sections.at(-1)][mission];
    const pool=data.practiceBank.filter(item=>item.sectionId===section.id);
    const index=random?Math.min(pool.length-1,Math.max(0,Math.floor(random()*pool.length))):mission;
    const problem=pool[index];
    return {id,mission,problem,prompt:problem.question,hint:problem.hint};
  }
  function evaluate(task,state){return state.choice===task.problem.answerIndex;}
  function solution(task){return task.problem.solutionSpeech;}
  function readProgress(raw){
    try{const data=JSON.parse(raw);const clean={};for(const i of islands){if(!data?.[i.id])continue;clean[i.id]={};for(let m=0;m<3;m++){const r=data[i.id][m];if(r&&Number.isInteger(r.attempts)&&r.attempts>=0&&r.attempts<=10000&&['independent','supported'].includes(r.result))clean[i.id][m]={attempts:r.attempts,result:r.result};}}return clean;}catch{return {};}
  }
  const api={islands,task,evaluate,solution,readProgress};
  if(typeof module!=='undefined')module.exports=api;else root.MathIslands=api;
})(typeof window!=='undefined'?window:globalThis);
