/* 共用題型與驗證；各年級自行編寫題意及教學步驟。 */
(() => {
  'use strict';
  const catalog = {};
  const q = (text,answer,other,reason='',visual) => {
    const result={text,answer:String(answer),choices:[answer,...other].map(String),reason,visual};
    if (new Set(result.choices).size!==result.choices.length || result.choices.length<2 || result.choices.length>4) throw Error('選項有誤：'+text);
    return result;
  };
  const n = (text,value,reason='',gap=1,visual) => q(text,value,[value+gap,value+2*gap,value>=gap?value-gap:value+3*gap],reason,visual);
  const s = (title,tip,factory) => ({title,tip,questions:Array.from({length:5},(_,i)=>factory(i))});
  const u = (title,icon,before,action,...sections) => ({title,icon,before,action,sections});
  const d = (whole, places=2) => (whole/10**places).toFixed(places);
  const gcd = (a,b)=>b?gcd(b,a%b):a;
  const lcm = (a,b)=>a*b/gcd(a,b);
  const f = (a,b)=>`${a}/${b}`;
  const reduced = (a,b)=>{const divisor=gcd(a,b);return b===divisor?String(a/divisor):f(a/divisor,b/divisor);};
  const compare = (text,a,b,reason='') => q(text,a===b?'＝':a>b?'＞':'＜',['＞','＜','＝'].filter(c=>c!==(a===b?'＝':a>b?'＞':'＜')),reason);
  const time = minutes=>String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');
  function add(grade,upper,lower) {
    for (const [term,units] of Object.entries({upper,lower})) units.forEach((unit,i)=>{
      unit.id='u'+(i+1);
      if (unit.sections.length<2) throw Error('單元題庫至少要有十題：'+unit.title);
      unit.sections.forEach((section,j)=>{
        section.id=`s${i+1}_${j+1}`;
        section.questions.forEach((question,k)=>{
          question.id=`g${grade}-${term}-${section.id}-${k+1}`;
          question.reason ||= section.tip;
          const offset=(i+j+k)%question.choices.length;
          question.choices=question.choices.slice(offset).concat(question.choices.slice(0,offset));
        });
      });
    });
    catalog[grade]={upper,lower};
  }
  const api={catalog,q,n,s,u,d,gcd,lcm,f,reduced,compare,time,add};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else window.MathCourseKit=api;
})();
