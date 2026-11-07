/* Semester-specific landmarks and residents for the shared 3D world. */
(() => {
  'use strict';
  const query=new URLSearchParams(location.search);
  const grade=Number(query.get('grade'));
  const term=query.get('term')==='lower'?'lower':'upper';
  const units=(grade===4?window.Grade4Math:window.MathCourseKit.catalog[grade])?.[term];
  if(!units)return;
  const models={
    '1upper':[5,3,1,8,0,2,4,7,9],
    '1lower':[0,2,3,5,4,9,1,7,10],
    '2upper':[0,1,3,5,6,2,7,9,8,4],
    '2lower':[0,2,3,9,7,1,5,6,8,4],
    '4upper':[0,1,8,5,4,7,10,2,6,3],
    '4lower':[1,4,7,2,10,0,3,8,9,6],
    '5upper':[10,1,4,7,8,5,2,3,9,0],
    '5lower':[7,0,2,8,4,1,3,10,6,5],
    '6upper':[4,7,1,8,6,5,3,10],
    '6lower':[2,10,1,3,9,4]
  };
  const landmarks=['金幣港','林間市集','烘焙山','木橋溪谷','幾何城','野餐林','水車工坊','披薩攤','轉盤樂園','鐘樓港','數字圖書館'];
  const residents=['海獺港長','狐狸攤主','小熊麵包師','河狸橋匠','貓頭鷹建築師','松鼠分餐員','青蛙量水員','兔子店長','小鹿嚮導','浣熊鐘錶師','熊貓館員'];
  const palette=['#549183','#a6684b','#6d779f','#b77c55','#748b56','#a7788f'];
  const land=['#c1d998','#d1dfa8','#adcfa9','#e0d5a0','#cad8ae','#b4d3ad'];
  const islands=units.map((unit,i)=>{
    const model=models[grade+term][i];
    return {id:unit.id,model,name:unit.extension?.name||`${unit.title}・${landmarks[model]}`,
      shortName:unit.extension?.name||landmarks[model],icon:unit.icon,color:palette[(i+grade)%palette.length],land:land[(i+(term==='upper'?0:2))%land.length]};
  });
  window.MathIslands={islands};
  window.MathIslandTeaching={residents:units.map((unit,i)=>({
    id:'resident-'+unit.id,unitId:unit.id,icon:unit.icon,name:residents[islands[i].model],
    line:unit.extension?.prompt||unit.action
  }))};
  window.CourseIslandScene={grade,term,title:'一二三四五六'[grade-1]+(term==='upper'?'上':'下')+'數學群島'};
})();
