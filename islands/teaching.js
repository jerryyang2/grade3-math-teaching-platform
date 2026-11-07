/* 島嶼解題沿用課堂資料的步驟順序；題目數字由同一份運算過程產生。 */
(function(root){
'use strict';
const data=typeof module!=='undefined'?require('../js/data.js'):root.NANI_G3S2_DATA;
const residents=data.units.map(unit=>({id:unit.id,unitId:unit.id,name:unit.buddy,role:unit.island,icon:unit.icon,line:unit.steps[0]}));
function method(id){
  const unit=data.units.find(item=>item.id===id);
  if(!unit)throw new RangeError('未知單元');
  return {route:unit.steps.join(' → '),sourceTitle:unit.title};
}
function steps(task){
  return task.problem.stepScaffolds.map((text,i)=>({title:['先讀題','看看線索','核對方法'][i],text,formula:''}));
}
const narration={retry:'再看看，還差一小步。可以調整後再檢查，也可以打開提示。',correct:'靠岸成功！這一步，你做到了！',islandAward:'恭喜完成這座島的三個任務，可以領取小證書！',grandAward:'十座島，三十個任務，全部完成！大證書和環遊世界號都為你準備好了！',cruiseWelcome:'歡迎登上環遊世界號！帶著你的數學超能力，一起航向更大的世界！'};
const api={method,steps,residents,narration};if(typeof module!=='undefined')module.exports=api;else root.MathIslandTeaching=api;
})(typeof window!=='undefined'?window:globalThis);
