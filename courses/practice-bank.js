/* 課堂練習和學習單各自出題；單元與小節 ID 保留。 */
(() => {
  'use strict';
  const plans = {}, banks = {}, worksheetExtensions = {};
  const register = (grade, upper, lower) => {
    const target=typeof upper[0]?.[0]==='function'?banks:plans;
    target[grade]={upper,lower};
  };
  const cards = (...pairs) => ({kind:'studyCards', pairs});
  const table = (head, ...rows) => ({kind:'studyTable', head, rows});
  const picture = (kind, ...data) => ({kind:'studyPicture', model:kind, data});
  const task = (text, answer, reason, section, type) => ({text,answer:String(answer),reason,section,type,format:'write'});
  const set = (visual, ...tasks) => tasks.map(q=>({...q,visual:q.visual || visual}));
  const R = (text,answer,reason,section=1) => task(text,answer,reason,section,'看圖解題');
  const A = (text,answer,reason,section=2,visual) => Array.isArray(reason)
    ? {...C(text,answer,reason,section,visual),open:true} : task(text,answer,reason,section,'情境應用');
  const E = (text,answer,reason,section=1) => task(text,answer,reason,section,'推理與辨錯');
  const extendWorksheets = (grade, upper, lower) => {
    worksheetExtensions[grade] = {upper, lower};
  };
  const extended = (section, text, answer, reason, visual) =>
    ({...task(text,answer,reason,section,'進階應用'),visual});

  function replaceBasicQuestion(sheet, question) {
    // 同小節換題，優先取代辨認或單純讀值的選擇題。
    const level = {guided:0, apply:2, reason:4};
    const priority = q => (level[q.level] ?? 6) + Number(q.format==='write');
    const index = sheet.reduce((best, q, i) => {
      if(q.section!==question.section) return best;
      return best<0 || priority(q)<priority(sheet[best]) ? i : best;
    }, -1);
    if(index<0) throw Error('進階題的小節未排入學習單：'+question.text);
    sheet[index] = question;
  }

  const format = value => String(Number(Number(value).toFixed(8)));
  const pick = (values,index) => values[index%values.length];
  const C = (text, answer, wrong, reason, visual) => {
    answer=String(answer);
    const choices=[...new Set([answer,...wrong.map(String)])].slice(0,4);
    if(choices.length<2||!reason) throw Error('題目缺少選項或解答：'+text);
    return {text,answer,choices,reason,visual};
  };
  const N = (text,answer,reason,wrong=[],visual) => {
    const value=Number(answer);
    const gap=Number.isInteger(value)?Math.max(1,10**(Math.floor(Math.log10(Math.abs(value)||1))-1)):0.1;
    return C(text,format(value),[...wrong,value+gap,value+2*gap,value>=gap?value-gap:value+3*gap].map(format),reason,visual);
  };
  const W = (...args) => ({...N(...args),open:true});
  const sign = (text,a,b,reason,visual) => C(text,a===b?'＝':a>b?'＞':'＜',['＞','＜','＝'],reason,visual);
  const frac = (a,b) => a+'/'+b;
  const gcd = (a,b) => b?gcd(b,a%b):Math.abs(a);
  const lcm = (a,b) => a*b/gcd(a,b);
  const F = (a,b) => b===gcd(a,b)?String(a/b):frac(a/gcd(a,b),b/gcd(a,b));
  const clock = min => String(Math.floor(min/60)).padStart(2,'0')+':'+String(min%60).padStart(2,'0');
  function asWorksheet(q, write) {
    if(q.paper) return {...q,text:q.paper,format:'write'};
    return {...q,format:write?'write':'choice'};
  }
  function varied(items) {
    for(const start of [0,5]){
      if(items.slice(start,start+5).some(q=>q.format==='write')) continue;
      const pos=start+3;
      items[pos]={...items[pos],format:'reason'};
    }
    return items;
  }
  const signature=q=>q.text+'|'+JSON.stringify(q.visual);
  // 數值及日期的更換不算新的題幹。
  const stem=q=>q.text.normalize('NFKC')
    .replace(/\d+(?:[.,]\d+)*/g,'#')
    .replace(/週[一二三四五六日]/g,'某天')
    .replace(/[\s，。、：？！；]/g,'');

  function selectWorksheet(slots, read, used, preferVisual) {
    const families = new Map();
    const printedStem = question => stem({text:question.paper||question.text});
    return slots.map(({section, variant, mode}, index) => {
      const page = Math.floor(index / 5);
      const candidates = Array.from({length:10}, (_, offset) => read(section,variant+offset))
        .flatMap(questions => questions.map((question, slot) => ({question,slot})))
        .filter(({question}) => !used.has(signature(question)));
      if(!candidates.length) throw Error('學習單題庫沒有足夠的不同題目');
      const score = ({question,slot}) => {
        const family = families.get(printedStem(question));
        return (preferVisual(index) && !question.visual ? 100 : 0) +
          (family?.pages.has(page) ? 20 : 0) + (family?.count || 0)*8 + Number(slot!==mode);
      };
      const {question,slot} = candidates.reduce((best,item) => score(item)<score(best) ? item : best);
      const key = printedStem(question);
      const family = families.get(key) || {pages:new Set(),count:0};
      const repeat = family.count > 0;
      family.pages.add(page);
      family.count++;
      families.set(key,family);
      used.add(signature(question));
      if(!repeat || question.paper) return asWorksheet(question,question.open&&slot!==0);
      if(family.count>2) return {...question,
        text:question.text+' 請畫出題目中的數量或關係，並用圖說明答案。',
        type:'畫圖說明',format:'write'};

      // 當小節題型數有限，第二次遇到同一題幹改練驗算或辨錯。
      const verify = index % 2 === 0;
      const proposed = verify ? question.answer : question.choices.find(option=>option!==question.answer);
      return {...question,
        text:question.text+' 有人答「'+proposed+'」。'+
          (verify?'根據題目寫出驗證的方法。':'指出哪裡不對，寫出正確答案和做法。'),
        type:verify?'驗證做法':'訂正錯誤',format:'write'};
    });
  }
  function prepare(grade, term, units) {
    const plan=plans[grade]?.[term];
    const bank=banks[grade]?.[term];
    const extensions=worksheetExtensions[grade]?.[term] || {};
    if(bank?.length!==units.length) throw Error('練習單元未對應：'+grade+term);
    units.forEach((unit,u)=>{
      const extras=plan?.[u] || [];
      const extension=extensions[unit.id] || {};
      const total=unit.sections.length;
      if(extras.some(q=>!unit.sections[q.section-1])) throw Error('學習單情境未對應：'+unit.title);
      const addScenarios=(base,items)=>{
        const used=new Set();
        for(const [i,extra] of items.entries()){
          const start=(i%2)*5, order=[4,2,3,1,0].map(n=>start+n);
          const accepts=j=>!used.has(j)&&base[j].section===extra.section;
          const position=order.find(accepts) ?? base.findIndex((_,j)=>accepts(j));
          if(position>=0){base[position]=extra;used.add(position);}
        }
        return base;
      };
      if(bank[u]?.length!==total) throw Error('學習單小節未對應：'+unit.title);
      const levels=['guided','apply','apply','reason','reason'];
      const types=['基礎概念','情境應用','熟練運算','推理與辨錯','推理與辨錯'];
      const read=(s,v)=>bank[u][s](v).map((q,i)=>{
        const offset=(u+s+v+i)%q.choices.length;
        return {...q,section:s+1,level:levels[i],type:i===0&&q.visual?'看圖解題':types[i],choices:q.choices.slice(offset).concat(q.choices.slice(0,offset))};
      });
      const distinct=(s,variant,mode,seen,preferVisual=false)=>{
        const candidates=Array.from({length:10},(_,i)=>read(s,variant+i));
        const ordered=candidates.map(items=>items[mode]).concat(candidates.flat());
        const key=signature;
        const unused=ordered.filter(q=>!seen.has(key(q)));
        const q=(preferVisual?unused.find(q=>q.visual):null)||unused[0];
        if(!q) throw Error('無法排出不重複的題目：'+unit.title);
        seen.add(key(q));
        return q;
      };
      const usedInClass=new Set(unit.sections.flatMap(section=>section.questions.map(signature)));
      unit.sections.forEach((section,s)=>{
        section.questions=Array.from({length:section.questions.length},(_,i)=>{
          const q=distinct(s,Math.floor(i/5),i%5,usedInClass);
          return {...q,id:`practice2-g${grade}-${term}-${section.id}-${i+1}`};
        });
        const battleQuestions = new Map(section.questions.map(q=>[signature(q),q]));
        for(let variant=0;variant<10;variant++) for(const [index,q] of read(s,variant).entries()) {
          if(!battleQuestions.has(signature(q))) battleQuestions.set(signature(q),{
            ...q,id:`battle-g${grade}-${term}-${section.id}-${variant}-${index}`
          });
        }
        section.battleQuestions=[...battleQuestions.values()];
      });
      unit.sections.forEach((section,s)=>{
        const usedInWorksheets=new Set(usedInClass);
        if(section.questions.length!==10) return;
        const slots=Array.from({length:10},(_,i)=>({section:s,variant:2+Math.floor(i/5),mode:i%5}));
        section.worksheet=varied(selectWorksheet(slots,read,usedInWorksheets,i=>grade<=2 ? i%5<4 : i%5===0));
      });
      const usedInWorksheets=new Set(usedInClass);
      const slots=Array.from({length:10},(_,i)=>{
        const s=i%total, round=Math.floor(i/total);
        return {section:s,variant:4+round,mode:(s+round+1)%5};
      });
      unit.worksheet=extension.reviewSet || selectWorksheet(slots,read,usedInWorksheets,i=>grade<=2||i%5<2);
      if(!extension.reviewSet && extras.length) addScenarios(unit.worksheet,extras);
      if(!extension.reviewSet && extension.review) replaceBasicQuestion(unit.worksheet,extension.review);
      if(extension.section){
        const focus=unit.sections[extension.section.section-1];
        if(!focus?.worksheet) throw Error('找不到進階題的小節學習單：'+unit.title);
        replaceBasicQuestion(focus.worksheet,extension.section);
        varied(focus.worksheet);
      }
      varied(unit.worksheet);
    });
  }
  const api={register,prepare,cards,table,picture,R,A,E,set,N,C,W,sign,frac,F,gcd,lcm,clock,pick,format,extendWorksheets,extended};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else window.CoursePracticeBank=api;
})();
