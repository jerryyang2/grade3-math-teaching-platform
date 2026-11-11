// Independent arithmetic and diagram-condition checks for authored question families.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const bank=require('../courses/practice-bank');
const registered=[];
const originalRegister=bank.register;
bank.register=(grade,upper,lower)=>{
  if(typeof upper[0]?.[0]==='function')registered.push({grade,upper,lower});
  return originalRegister(grade,upper,lower);
};
for(const name of ['early','grade4','senior','upper'])require('../courses/practice-'+name);
bank.register=originalRegister;
let questions=0,arithmetic=0,diagrams=0;
const number=value=>{
 const normalized=String(value).normalize('NFKC').replace(/(\d+)\s*又\s*(\d+)\/(\d+)/g,'($1+$2/$3)').replace(/(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/g,'($1/$2)').replace(/[×]/g,'*').replace(/[÷]/g,'/').replace(/[−－]/g,'-');
 if(!/^[\d\s.+*/()\-]+$/.test(normalized))return null;
 const result=Function('"use strict";return ('+normalized+');')();
 return Number.isFinite(result)?result:null;
};
const equals=(q,wanted)=>{
 const actual=number(q.answer);
 assert.notEqual(actual,null,'Missing numeric answer: '+q.text);
 assert.ok(Math.abs(actual-wanted)<1e-7,q.text+' expected '+wanted+' but got '+q.answer);
 diagrams++;
};
for(const item of registered)for(const term of ['upper','lower'])for(const unit of item[term])for(const factory of unit)for(let variant=0;variant<20;variant++){
 for(const q of factory(variant)){
  questions++;
  assert.ok(q.text&&q.reason&&q.choices.includes(String(q.answer)),q.text);
  assert.equal(new Set(q.choices).size,q.choices.length,q.text);
  assert.doesNotMatch(q.text,/undefined|NaN|Infinity|有沒有直邊也沒有角/);
  const text=q.text.normalize('NFKC');
  let conditions;
  if((conditions=text.match(/^數列每次增加 (\d+)。從第 2 項\((\d+)\)走到第 6 項/)))equals(q,4*Number(conditions[1]));
  if((conditions=text.match(/^數列每次增加相同的數。第 7 項比第 1 項多 (\d+)/)))equals(q,Number(conditions[1])/6);
  if((conditions=text.match(/^數列從 (\d+) 開始,原本每次增加 (\d+)。若起點不變,每次改為增加 (\d+),第 4 項/)))assert.equal(q.answer,'多 '+3*(Number(conditions[3])-Number(conditions[2])));
  if((conditions=text.match(/^數列每次增加 (\d+),已知第 8 項是 (\d+)。倒回兩項/)))equals(q,Number(conditions[2])-2*Number(conditions[1]));
  if((conditions=text.match(/^平行四邊形的底是 (\d+) 公分,面積是 (\d+) 平方公分。若底不變、高多 2 公分/)))equals(q,Number(conditions[2])+2*Number(conditions[1]));
  if((conditions=text.match(/^直立的長方體水盒,內底長 (\d+) 公分、寬 (\d+) 公分,原有 (\d+) 毫升水。舀走 (\d+) 毫升後/))){
   assert.ok(Number(conditions[3])>=Number(conditions[4]),q.text);
   equals(q,Number(conditions[4])/(Number(conditions[1])*Number(conditions[2])));
  }
  // These families are used as standalone game cards as well as in a sequence.
  assert.doesNotMatch(q.text,/^同一規律的數列|^照規律從第 2 項|^如果每次改為多|^平行四邊形面積是|^容量原有/);
  if(q.text.includes('每分拉近'))assert.match(q.text,/較快者在後方，尚未追上前/);
  const match=text.match(/^(?:計算\s*)?([\d\s.()+\-*/×÷－]+)\s*(?:=\s*\?|。請用|\?請用)/);
  if(match&&/[+\-*/×÷－]/.test(match[1])){
   const expected=number(match[1]),actual=number(q.answer);
   if(expected!==null&&actual!==null){
    assert.ok(Math.abs(expected-actual)<1e-7,q.text+' arithmetic mismatch: '+q.answer);
    arithmetic++;
   }
  }
  const v=q.visual;
  if(q.text.startsWith('數線從 ')){
   const parts=q.text.match(/^數線從 (\d+) 到 (\d+) 分 (\d+) 等格。從 (\d+) 往右第 (\d+) 格/);
   assert.ok(parts,q.text);assert.equal(v?.kind,'line',q.text+' must show a number line');
   assert.equal(Number(v.start),Number(parts[1]));assert.equal(v.parts,Number(parts[3]));assert.equal(v.at,Number(parts[5]));
   equals(q,Number(parts[1])+Number(parts[5])/Number(parts[3]));
  }
  if(q.text==='數線每一格增加 0.01。空格是多少？'){
   assert.equal(v?.kind,'line');assert.equal(v.parts,3);assert.equal(v.at,1);
   assert.ok(Math.abs(Number(v.end)-Number(v.start)-0.03)<1e-8);
   equals(q,Number(v.start)+0.01);
  }
  if(v?.kind==='firstRibbons'&&/紙帶左端(?:已經|還沒)對齊/.test(q.text)){
   assert.equal(q.text.includes('已經對齊'),v.starts[0]===v.starts[1],q.text+' diagram start mismatch');
   diagrams++;
  }
  if(v?.kind==='firstParts'){
   if(q.text==='看分合圖。右邊那堆有幾顆？')equals(q,v.whole-v.left);
   if(q.text.startsWith('再看分合圖。如果左邊少放 1 顆'))equals(q,v.whole-v.left+1);
  }
  if(v?.kind==='firstQueue'){
   if(q.text==='從左邊數，星星在第幾隻上面？')equals(q,v.index+1);
   if(q.text==='改從右邊數，星星在第幾隻上面？')equals(q,v.count-v.index);
   if(q.text==='星星的左邊還有幾隻？')equals(q,v.index);
   if(q.text.startsWith('星星右邊又排進 1 隻'))equals(q,v.count-v.index+1);
  }
  if(v?.kind==='firstPlace'&&q.text==='整捆和散根合起來，有幾根？'){
   equals(q,v.bundles*10+v.ones);
   assert.doesNotMatch(q.reason,/百/,'First-grade bundle prompt introduces hundreds');
  }
  if(v?.kind==='earlyCoins'&&q.text==='看圖，這些錢合起來幾元？')equals(q,v.values.reduce((a,b)=>a+b,0));
  if(v?.kind==='earlyGroups'&&q.text==='盒裡的東西全送走了。盒裡還有幾個？'){
   equals(q,0);
   assert.equal(v.removed,v.values[0],'All removed items must be crossed out in the diagram');
  }
 }
}
const context={window:{MathCourseKit:require('../courses/curriculum-core.js')}};
for(const file of ['courses/classroom-figures.js','courses/early-learning.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
// Every seed must remain inside its own tray, including the widest split.
for(let left=0;left<=10;left++){
 const figure=context.window.ClassroomFigures.draw({kind:'firstParts',whole:10,left});
 const centers=[...figure.matchAll(/translate\(([\d.]+) ([\d.]+)\) scale\(0\.8\)/g)].map(m=>m.slice(1).map(Number));
 assert.equal(centers.length,10+left);
 for(const [x,y] of centers.slice(10))assert.ok(x-11.2>=20&&x+11.2<=148&&y-11.2>=57&&y+11.2<=101,'Seeds overflow their part tray');
}
const section={},unit={id:'u2',sections:[{},section]};
assert.match(context.window.EarlyLearning.steps(2,'lower',unit,section)[2],/加號或減號/);
const upper=require('../upper/js/data.js'),upperDiagrams=require('../upper/js/worksheet-diagrams.js');
for(const [id,answer]of Object.entries({p3_1_8:'168 盞',p6_1_1:'4 點',p6_1_7:'9 輪',p8_1_1:'四分之一 (1/4) 公尺'})){
 const q=upper.practiceBank.find(p=>p.id===id);
 assert.equal(q.options[q.answerIndex],answer);assert.equal(q.speechText,q.question);
 assert.ok(upperDiagrams.render(q).includes('<svg'),id+' needs a reviewed diagram');
 assert.doesNotMatch(JSON.stringify(q)+upperDiagrams.render(q),/奇美博物館|小可頌|布朗尼/);
}
const audioContext={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../upper/js/female-audio-manifest.js'),'utf8'),audioContext);
assert.doesNotMatch(JSON.stringify(audioContext.window.MathFemaleAudio),/奇美博物館|小可頌|布朗尼/);
for(const file of Object.values(audioContext.window.MathFemaleAudio.clips))assert.ok(fs.existsSync(path.join(__dirname,'../upper',file)),'Missing speech clip');
assert.ok(arithmetic>500,'Arithmetic coverage unexpectedly decreased');
assert.ok(diagrams>300,'Diagram-condition coverage unexpectedly decreased');
console.log(JSON.stringify({status:'PASS',generatedQuestions:questions,independentArithmeticChecks:arithmetic,diagramConditionChecks:diagrams}));
