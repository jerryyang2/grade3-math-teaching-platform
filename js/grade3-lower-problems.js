/* 每小節以可重現的數值變化產生 10 題。圖像只呈現題目已知條件。 */
const Grade3LowerProblems = (() => {
  const cards = (...values) => ({kind:'cards', values});
  const series = (...values) => ({kind:'series', values});
  const table = (headers, ...rows) => ({kind:'table', rows:[headers,...rows]});
  const area = (rows, columns, half = 0) => ({kind:'area', rows, columns, half});
  const bars = (denominator, selected, labels) => ({kind:'bars', denominator, selected, labels});
  const ticks = (labels, pointer) => ({kind:'ticks',labels,pointer});
  const compare = (a,b) => a>b ? '＞' : a<b ? '＜' : '＝';
  const relation = (question,a,b,hint,reason,visual) =>
    [question,compare(a,b),['＞','＜','＝','無法比較'].filter(value=>value!==compare(a,b)),hint,reason,visual];
  const num = (question,answer,hint,reason,visual,unit='',wrong=[answer+1,answer+2,answer+10]) =>
    [question,answer+unit,wrong.map(value=>value+unit),hint,reason,visual];
  const decimal = tenths => (tenths / 10).toFixed(1);
  const div = (n,d) => `${Math.floor(n/d)} 餘 ${n%d}`;
  const makers = [
    [
      i => { const d=3+i%5, n=48+4*i; return [`把 ${n} 張卡平均分給 ${d} 組，每組幾張、剩幾張？沒有剩餘請選餘 0。`,div(n,d),[div(n,d+1),`${Math.floor(n/d)+1} 餘 ${n%d}`,`${Math.floor(n/d)} 餘 ${(n%d+1)%d}`],'先分十位；不夠分的一個十可以換成 10 個一。',`${d} × ${Math.floor(n/d)} ＋ ${n%d}＝${n}，餘數小於 ${d}。`,cards(`${n} 張`,`分 ${d} 組`)]; },
      i => {const d=3+i%5,n=204+i*43,q=Math.floor(n/d);return [`用直式計算 ${n} ÷ ${d}。哪個商和餘數正確？`,div(n,d),[`${q+10} 餘 ${n%d}`,`${q+1} 餘 ${n%d}`,`${q} 餘 ${(n%d+1)%d}`],'從最高位開始，看這一位夠不夠分。',`${q} × ${d} ＋ ${n%d}＝${n}。`,cards(n,'÷',d,'？')];},
      i => {const d=4+i%4,q=4+i,n=d*q+1,all=i%2===0;return num(all?`${n} 人要搭車，每車最多 ${d} 人。至少要幾輛車？`:`有 ${n} 元，每張貼紙 ${d} 元。最多買幾張？`,q+Number(all),'先求完整的份數，再判斷剩下的 1 要不要另成一份。',`${n} ÷ ${d}＝${q} 餘 1。${all?'剩下的人仍要坐車，所以多用 1 輛。':'剩下的 1 元不夠再買一張。'}`,all ? cards(`共有 ${n} 人`,`每車最多 ${d} 人`) : cards(`共有 ${n} 元`,`每張 ${d} 元`),all?' 輛':' 張',[q+Number(!all),q+2,q-1]);},
      i => {const d=3+i%5,q=i%2?60+i*10:100+i*100,n=q*d+2;return num(`把被除數換成最接近的整${q%100===0?'百':'十'}數，估算 ${n} ÷ ${d} 的商。`,q,'先找接近、容易整除的被除數。',`${n} 接近 ${q*d}，而 ${q*d} ÷ ${d}＝${q}。`,cards(n,'÷',d), '',[q-10,q+10,q*2]);}
    ],
    [
      i => {const group=[['紅燈','綠燈','黃燈'],['鐘聲','鼓聲','鈴聲'],['開燈','關燈'],['鼓掌','跺腳']][i%4],n=2*group.length+Math.floor(i/4)%group.length;const values=Array.from({length:n},(_,k)=>group[k%group.length]);const ans=group[n%group.length];return [`活動依序是「${values.join('、')}」。照原規律，下一個是什麼？`,ans,[...group.filter(x=>x!==ans),'暫停','同時進行'].slice(0,3),'先找重複的一整組，再看最後停在哪裡。',`每組是「${group.join('、')}」，下一個是${ans}。`,series(...values,'？')];},
      i => {const pool=['紅圓','藍方','黃三角','綠星'];const group=[pool[i%4],pool[i%4],pool[(i+1)%4]],n=6+i%3;const values=Array.from({length:n},(_,k)=>group[k%3]),ans=group[n%3];return [`圖卡排成「${values.join('、')}」。接著應該放哪張？`,ans,pool.filter(x=>x!==ans),'一起觀察顏色與形狀，把重複的一組框起來。',`每三張重複一次，接著是${ans}。`,{kind:'pattern',values:[...values,'？']}];},
      i => {const a=3+i*2,d=i%2?3+i:2+i,seq=Array.from({length:4},(_,k)=>a+k*d);return num(`觀察數列 ${seq.join('、')}。若每次變化相同，下一個數是多少？`,a+4*d,'比較前後兩個數差多少。',`每次加 ${d}，所以 ${seq[3]} ＋ ${d}＝${a+4*d}。`,series(...seq,'？')); }
    ],
    [
      i => {const h=i+1;return num(`下午 ${h} 時用 24 時制表示是幾時？`,h+12,'下午 1 時起，將原來的時數加 12。',`12 ＋ ${h}＝${h+12}，所以是 ${h+12}:00。`,cards(`下午 ${h} 時`,'24 時制？'),' 時',[h,h+11,h+13]);},
      i => {const days=1+i%3,h=2+i;return num(`${days} 日又 ${h} 小時，共幾小時？`,days*24+h,'先將日換成小時。',`${days} × 24＝${days*24}，再加 ${h} 小時。`,cards(`${days} 日`,`${h} 小時`),' 小時');},
      i => {const m=1+i,s=5+3*i;return num(`${m} 分 ${s} 秒，共幾秒？`,m*60+s,'1 分鐘是 60 秒。',`${m} × 60 ＋ ${s}＝${m*60+s}。`,cards(`${m} 分`,`${s} 秒`),' 秒',[m*100+s,m+s,m*60]);},
      i => {const a=8+i,b=a+1+i%3;return num(`從 ${a}:15 到 ${b}:45，經過幾分鐘？`,(b-a)*60+30,'可以從起點先跳整小時，再補剩餘的分鐘。',`先到 ${b}:15，經過 ${b-a} 小時，再加 30 分鐘，共 ${(b-a)*60+30} 分鐘。`,{kind:'timeline',start:`${a}:15`,end:`${b}:45`},' 分鐘',[(b-a)*60,(b-a)*60+15,(b-a)*60+45]);}
    ],
    [
      i => {const a=3+i,b=2+i%3,c=2+i%4;return num(`每袋有 ${a} 顆糖，每盒有 ${b} 袋，${c} 盒共有幾顆糖？`,a*b*c,'先算一盒幾顆，再算所有盒。',`${a} × ${b}＝${a*b}；${a*b} × ${c}＝${a*b*c}。`,cards(`每袋 ${a}`,`每盒 ${b} 袋`,`${c} 盒`),' 顆');},
      i => {const a=6+i,b=2+i%3,c=2+i%2;return num(`小兔有 ${a} 張圖卡，小熊是小兔的 ${b} 倍，小鹿是小熊的 ${c} 倍。小鹿有幾張？`,a*b*c,'先找小熊的張數，再用小熊的張數找小鹿。',`${a} × ${b}＝${a*b}；${a*b} × ${c}＝${a*b*c}。`,{kind:'multipliers',start:a,factors:[b,c]},' 張');},
      i => {const a=3+i,b=5+i%4,d=3+i%3;return num(`白色積木有 ${a*d} 顆，綠色有 ${b*d} 顆，合起來平均分成 ${d} 盒。每盒幾顆？`,a+b,'先求兩色合計的顆數，再平分。',`${a*d} ＋ ${b*d}＝${(a+b)*d}；${(a+b)*d} ÷ ${d}＝${a+b}。`,cards(`白色 ${a*d} 顆`,`綠色 ${b*d} 顆`,`分 ${d} 盒`),' 顆');},
      i => {const a=5+i,b=2+i%3,d=3+i%4;return num(`有 ${(a+b)*d} 個麵包，賣掉 ${b*d} 個，剩下平均裝入 ${d} 袋。每袋幾個？`,a,'先算賣掉後還有幾個，再分袋。',`${(a+b)*d} － ${b*d}＝${a*d}；${a*d} ÷ ${d}＝${a}。`,cards(`原有 ${(a+b)*d}`,`賣 ${b*d}`,`分 ${d} 袋`),' 個');}
    ],
    [
      i => {const r=2+i%4,c=3+i%5;return num(`一個圖形鋪滿 ${r} 排方格，每排 ${c} 格，每格 1 平方公分。面積是多少？`,r*c,'一排一排數裡面的小方格。',`共有 ${r*c} 格，所以是 ${r*c} 平方公分。`,area(r,c),' 平方公分');},
      i => {const r=2+i%4,c=2+i%5,n=r*c;return num(`原圖由 ${r} 排、每排 ${c} 個 1 平方公分方格組成。切成兩塊後重新拼好，沒有重疊或空隙。新圖的面積是多少？`,n,'剪開重排時，材料的量沒有改變。',`小格仍有 ${n} 格，面積仍是 ${n} 平方公分。`,{kind:'rearrangedArea',rows:r,columns:c},' 平方公分');},
      i => {const r=2+i%3,c=2+i%4,h=2+2*(i%3);return num(`葉片約蓋住 ${r*c} 個整格和 ${h} 個半格。每整格是 1 平方公分。面積大約是多少？`,r*c+h/2,'把兩個半格當成一個整格。',`${h} 個半格合成 ${h/2} 個整格，加上 ${r*c} 個整格。`,area(r,c,h),' 平方公分');}
    ],
    [
      i => {const n=1+i;return num(`${n} 公斤等於幾公克？`,n*1000,'把 1 公斤對應到 1000 公克。',`${n} 個 1000 公克就是 ${n*1000} 公克。`,cards(`${n} 公斤`,'？公克'),' 公克',[n*100,n*1000+100,n*1000+1000]);},
      i => {const lo=Math.floor(i/5)*500,p=1+i%5,n=lo+p*100;return num(`秤面從 ${lo} 到 ${lo+500} 公克等分成 5 小格。指針在 ${lo} 右邊第 ${p} 小格。重量是多少？`,n,'先算每小格代表多少公克，再從起點累加。',`500 ÷ 5＝100 公克，${lo} ＋ ${p} × 100＝${n} 公克。`,ticks([lo,lo+500],p),' 公克',[n-50,n+50,n+100]);},
      i => {const kg=1+i%4,g=kg*1000+(i%3-1)*100;return relation(`在 ${kg} 公斤和 ${g} 公克中間應填哪個符號？`,kg*1000,g,'先把公斤化成公克。',`${kg} 公斤是 ${kg*1000} 公克，和 ${g} 公克比較。`,cards(`${kg} kg`,'？',`${g} g`));},
      i => {const a=1300+i*100,b=200+i*10;return num(`水果和盒子共重 ${a} 公克，空盒重 ${b} 公克。水果重幾公克？`,a-b,'總重包含水果和空盒。',`總重減去空盒重量：${a} － ${b}＝${a-b}。`,cards(`總重 ${a} g`,`盒重 ${b} g`),' 公克');}
    ],
    [
      i => {const d=3+i%8,n=2+i%3;return [`${n} 個 1/${d} 合起來是多少？`,`${n}/${d}`,[`${n+1}/${d}`,`${n}/${d+1}`,`1/${d*n}`],'每一小份仍是相同大小。',`把 ${n} 個 ${d} 分之一合起來，就是 ${d} 分之 ${n}。`,{kind:'unitFractions',denominator:d,count:n}];},
      i => {const d=5+i%7,a=1+i%4,b=1+(i*2)%4;return relation(`兩張等大的紙條各等分成 ${d} 份。${a}/${d} 和 ${b}/${d} 中間應填哪個符號？`,a,b,'分母一樣，每份一樣大，直接比較取了幾份。',`比較分子 ${a} 和 ${b}，所以填 ${compare(a,b)}。`,bars(d,[a,b],['第一張','第二張']));},
      i => fractionCalc(5+i%7,1+i%3,1+i%2,false,false),
      i => fractionCalc(6+i%7,4+i%3,1+i%2,true,false),
      i => fractionCalc(5+i%7,3+i%3,1+i%2,i%2===0,true)
    ],
    [
      i => {const a=3+i,b=2+i%5;return num(`已知 ${a} × ${b}＝${a*b}，求 ${a*b} ÷ ${b}＝？`,a,'用乘法的總數除以組數。',`${a} × ${b}＝${a*b}，所以 ${a*b} ÷ ${b}＝${a}。`,cards(a,'×',b,'＝',a*b));},
      i => {const d=3+i%5,q=4+i,r=1+i%2,n=d*q+r;return num(`要驗算「${n} ÷ ${d}＝${q} 餘 ${r}」，用除數乘商再加餘數，會得到幾？`,n,'先算除數 × 商，再加餘數。',`${d} × ${q}＝${d*q}；${d*q} ＋ ${r}＝${n}。`,cards(d,'×',q,'＋',r), '',[d*q,n+r,n+d]);},
      i => {const a=4+i,b=2+i%5;return num(`找出方框：${i%2?`${b} × □`:`□ × ${b}`}＝${a*b}。`,a,'已知乘積和其中一個因數，用乘積除以已知因數。',`${a*b} ÷ ${b}＝${a}。放回方框可得到 ${a*b}。`,cards(i%2?`${b} × □`:`□ × ${b}`,'＝',a*b));},
      i => {const a=6+i,b=2+i%4,n=a*b;return i%2?num(`找出方框：${n} ÷ □＝${a}。`,b,'把總數除以每組數，得到組數。',`${n} ÷ ${a}＝${b}。`,cards(n,'÷','□','＝',a)):num(`找出方框：□ ÷ ${b}＝${a}。`,n,'每組數乘以組數，得到總數。',`${a} × ${b}＝${n}。`,cards('□','÷',b,'＝',a));}
    ],
    [
      i => {const n=1+i%9,u=1+Math.floor(i/4);return [`${u} 個一和 ${n} 個 0.1，寫成一位小數是多少？`,decimal(u*10+n),[decimal(u*10+(n%9)+1),decimal(u*10),decimal((u+1)*10+n)],'個位記完整的 1；十分位記有幾個 0.1。',`${u} ＋ ${decimal(n)}＝${decimal(u*10+n)}。`,{kind:'decimalParts',ones:u,tenths:n}];},
      i => {const a=6+i,b=10+(i*3)%9;return relation(`${decimal(a)} 和 ${decimal(b)} 中間應填哪個符號？`,a,b,'先比個位；個位一樣才比十分位。',`比較 ${a} 個十分之一和 ${b} 個十分之一，所以填 ${compare(a,b)}。`,cards(decimal(a),'？',decimal(b)));},
      i => decimalCalc(12+i,7+i%5,false),
      i => decimalCalc(20+i,4+i%7,true)
    ],
    [
      i => {const a=4+i,b=8+i,c=12+i,n=i%3;const fruit=['梨子','蘋果','香蕉'];return num(`水果表記錄：梨子 ${a} 個、蘋果 ${b} 個、香蕉 ${c} 個。${fruit[n]}有幾個？`,[a,b,c][n],'找到水果名稱，再讀對應的數量。',`${fruit[n]}對應的數量是 ${[a,b,c][n]}。`,table(['水果','個數'],['梨子',a],['蘋果',b],['香蕉',c]),' 個',[a,b,c,a+1].filter(x=>x!==[a,b,c][n]));},
      i => {const a=4+i,b=7+i,c=10+i,d=13+i,n=i%4,days=['週一','週二'],subjects=['故事書','科普書'];return num(`閱讀表：週一故事書 ${a} 本、科普書 ${b} 本；週二故事書 ${c} 本、科普書 ${d} 本。${days[Math.floor(n/2)]}的${subjects[n%2]}有幾本？`,[a,b,c,d][n],'先找星期所在列，再找書籍類別所在欄。','到指定列和欄的交會格讀數。',table(['日期','故事書','科普書'],['週一',a,b],['週二',c,d]),' 本',[a,b,c,d].filter(x=>x!==[a,b,c,d][n]));},
      i => {const a=6+i,b=11+i,c=15+i;return num(`整理借球記錄：甲班借 ${a} 顆，乙班借 ${b} 顆，丙班借 ${c} 顆。填表時，乙班那列的「顆數」要填多少？`,b,'逐筆找出班級，抄到同一列的顆數欄。',`乙班借了 ${b} 顆，因此在乙班那列填 ${b}。`,table(['班級','顆數'],['甲班',a],['乙班','？'],['丙班',c]),' 顆',[a,c,a+b+c]);}
    ]
  ];
  function fractionCalc(d,a,b,minus,story) {
    const op=minus?'－':'＋',result=minus?a-b:a+b;
    return [story?(minus?`有一條 ${a}/${d} 公尺的紙帶，用掉 ${b}/${d} 公尺。剩下多少公尺？`:`把 ${a}/${d} 公尺和 ${b}/${d} 公尺的紙帶接起來，共多長？`):`計算 ${a}/${d} ${op} ${b}/${d}。`,
      `${result}/${d}`,[`${result+1}/${d}`,`${result}/${d+1}`,`${result}/${2*d}`],
      '同分母分數的每一份大小相同，先算份數。',`分母保留 ${d}，分子算 ${a} ${op} ${b}＝${result}。`,bars(d,[a,b],story?(minus?['原有','用去']:['第一段','第二段']):(minus?['被減數','減數']:['第一個分數','第二個分數']))];
  }
  function decimalCalc(a,b,minus) {
    const op=minus?'－':'＋',r=minus?a-b:a+b;
    return [`計算 ${decimal(a)} ${op} ${decimal(b)}。`,decimal(r),[decimal(r+1),decimal(r+10),decimal(r-1)],'個位對齊個位，十分位對齊十分位。',`以 0.1 為一份，${a} ${op} ${b}＝${r} 份，所以是 ${decimal(r)}。`,cards(decimal(a),op,decimal(b))];
  }
  function build(units) {
    return units.flatMap((unit,u) => unit.sections.flatMap((section,s) =>
      Array.from({length:10},(_,i)=>{
        const [question,answer,alternatives,hint,reason,visual]=makers[u][s](i);
        if(new Set([answer,...alternatives]).size!==4||alternatives.length!==3)throw Error(`題目選項重複：${section.id}/${i+1}`);
        const answerIndex=(i+s+u)%4,options=[...alternatives];
        options.splice(answerIndex,0,answer);
        return {
          id:`g3s2p${u+1}_${s+1}_${i+1}`,unitId:unit.id,sectionId:section.id,sectionTitle:section.title,
          level:1+Math.floor(i/4),question,speechText:question,options,answerIndex,hint,
          stepScaffolds:['先讀題，指出已知條件和要找的量。',hint,reason],
          solutionSpeech:`${reason} 答案是 ${answer}。`,visual
        };
      })
    ));
  }
  return {build};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Grade3LowerProblems;
