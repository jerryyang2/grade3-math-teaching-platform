// Independent arithmetic and diagram-condition checks for authored question families.
const assert=require('node:assert/strict');
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
 const normalized=String(value).normalize('NFKC').replace(/(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/g,'($1/$2)').replace(/[×]/g,'*').replace(/[÷]/g,'/').replace(/[−－]/g,'-');
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
  const match=text.match(/^(?:計算\s*)?([\d\s.()+\-*/×÷－]+)\s*(?:=\s*\?|。請用|\?請用)/);
  if(match&&/[+\-*/×÷－]/.test(match[1])){
   const expected=number(match[1]),actual=number(q.answer);
   if(expected!==null&&actual!==null){
    assert.ok(Math.abs(expected-actual)<1e-7,q.text+' arithmetic mismatch: '+q.answer);
    arithmetic++;
   }
  }
  const v=q.visual;
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
assert.ok(arithmetic>500,'Arithmetic coverage unexpectedly decreased');
assert.ok(diagrams>300,'Diagram-condition coverage unexpectedly decreased');
console.log(JSON.stringify({status:'PASS',generatedQuestions:questions,independentArithmeticChecks:arithmetic,diagramConditionChecks:diagrams}));
