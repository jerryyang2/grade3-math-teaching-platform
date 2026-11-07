/* Illustrated practice for the four early-grade semesters. The print order is reproducible. */
(() => {
  'use strict';
  const {n,q,time,compare}=window.MathCourseKit;
  const firstLower=[
    ['sequence','place','sequence'],['sum','sum'],['measure','ribbons'],['take','take'],
    ['shape','solid'],['calendar','calendar'],['coins','coins'],['columnAdd','columnSub'],['classify','classify']
  ];
  const secondUpper=[
    ['place','comparePlace'],['columnAdd','columnSub','columnSub'],['ruler','ruler'],['parts','parts'],
    ['capacity','capacity'],['sequenceAdd','sequenceSub'],['times2','times5','times4','times8'],
    ['clock','elapsed'],['times3','times6','times7','times9'],['shape','perimeter']
  ];
  const secondLower=[
    ['place','coins'],['columnAdd','estimate'],['meters','meters'],['calendar','calendar'],
    ['times01','times10'],['weight','weight'],['groupsPlus','groupsRemove'],['pack','share'],
    ['fraction','fractionCompare'],['area','solid']
  ];
  const iconNames=['蘋果','種子','星星'];
  const cards=(values,icons)=>({kind:'earlyCards',values,icons});
  const groups=(values,icon,extra)=>({kind:'earlyGroups',values,icon,...extra});
  const scaffold={
    sequence:['用數卡排出順序。','沿著格子指一指，看看每次多多少。','讀出空格應填的數。'],
    place:['拿百格、十條和小方塊排數。','指著圖，分開看百、十、個。','把數字寫進對應的位子。'],
    comparePlace:['把兩個數排在定位板上。','從最高位開始比；一樣才往下一位。','讀出較大的數，再選符號。'],
    sum:['拿兩種小物排成兩堆。','先看看哪一堆可以湊滿 10。','把 10 和剩下的合起來。'],
    take:['先拿出原來的數量。','用手指劃過要拿走的物品。','數留下的，或用減法記下來。'],
    measure:['拿同樣長的小物排在一起。','從同一端開始，排緊，不重疊。','數總共用了幾格。'],
    ribbons:['用紙帶接出兩段長度。','用手指從最左端走到最右端。','數兩段合起來有幾格。'],
    ruler:['拿尺，把它放在線段旁。','指起點和終點，數中間的小格。','寫長度，再加上「公分」。'],
    shape:['摸一摸圖形的邊。','沿圖形走一圈，遇到角就停一下。','說出形狀，或記下角、邊的數量。'],
    solid:['拿盒子、罐子和球觀察。','找一找有沒有平面，或能不能滾。','說出哪個物品符合題目。'],
    calendar:['把手指放在題目說的那一天。','照題意向右一格，或往下一週。','讀出手指停下的日期。'],
    coins:['把同面額的錢分在一起。','先數大面額，再數小面額。','寫一共有幾元。'],
    columnAdd:['用十條和單格排出兩個數。','先合個位，滿十就換成一條十。','個位對個位，寫下直式結果。'],
    columnSub:['用定位板排出原來的數。','先拿個位；不夠就拆一條十。','寫下剩的數，再試著加回去。'],
    classify:['選一種特徵來分類。','每指一個物品，就記一次。','看該列的記號，寫個數。'],
    parts:['用一張卡代表全部，另兩張代表部分。','指一指已知的部分和空格。','用加或減找出空格。'],
    capacity:['拿同一個小杯倒水。','比較兩個容器各需幾小杯才裝滿。','用小杯數作比較。'],
    sequenceAdd:['用小物擺出開始的數。','照圖的箭頭一次做一個改變。','記下第一步的結果，再算第二步。'],
    sequenceSub:['用小物擺出開始的數。','照箭頭做第一步，看看還剩多少。','用剩下的數接著做第二步。'],
    clock:['在教具鐘上找到長針和短針。','先看短針，再從 12 數長針走的格。','讀出幾時幾分。'],
    elapsed:['在時間線找到開始和結束。','從開始往後一格一格數。','記下共經過幾分鐘。'],
    perimeter:['用手指沿圖形外邊走一圈。','每走過一邊，就記下一個長度。','把走過的邊長加起來。'],
    estimate:['用整百數卡代表接近的數。','找最靠近的整百。','把估出的數合起來。'],
    meters:['拿一段一公尺的繩子比一比。','每一公尺都可以換成 100 公分。','統一成公分，再記下總長。'],
    weight:['先看看天平哪端往下。','用同樣重的小砝碼做比較。','說哪邊重，或相差幾個。'],
    times:['拿小物排出一樣多的各組。','先圈出一組，再數有幾組。','用乘法記下每組個數和組數。'],
    groupsPlus:['先擺每袋一樣多的果子。','算出袋子裡的總數，再看袋外的。','把袋外的量加進去。'],
    groupsRemove:['把各組的小物排好。','看清楚每組先拿走幾個。','用每組剩下的數，算全部剩多少。'],
    pack:['拿小物，每袋放相同數量。','用筆把每袋的量圈在一起。','數可以分成幾袋。'],
    share:['拿出題目說的人數和物品。','輪流一人發一個，直到發完。','數每人拿到的量。'],
    fraction:['拿一整條紙帶。','數一共分成幾個一樣大的部分。','說塗色的一份是幾分之一。'],
    fractionCompare:['找兩條同樣長的紙帶。','比一比兩條紙帶各自塗色的一份。','說出哪一份較長。'],
    area:['拿一樣大的方格蓋住面。','每格只數一次，分開數甲和乙。','比較兩個方格總數。']
  };
  const firstUpper = [
    ['count','count','count'],['measure','measure'],['parts','parts'],['order','count'],
    ['place','sequence'],['sum','sum'],['shape','shape'],['take','take'],['clock','clock']
  ];
  scaffold.count=['把小物一個一個排好。','每指一個，就說一個數。','最後數到幾，就寫幾。'];
  scaffold.order=['把動物卡排成一列。','先找到題目說的起點和方向。','指到指定動物，說它是第幾個。'];

  function kind(grade,term,unit,section){
    const topics=grade===1?(term==='upper'?firstUpper:firstLower):(term==='upper'?secondUpper:secondLower);
    return topics[Number(unit.id.slice(1))-1][unit.sections.indexOf(section)];
  }
  function steps(grade,term,unit,section){
    const id=kind(grade,term,unit,section);
    return scaffold[id.startsWith('times')?'times':id];
  }
  function illustrated(id,i,grade,term){
    const a=2+i%6,b=1+(i+2)%4,icon=i%3;
    const number=(text,answer,visual,reason)=>n(text,answer,reason,1,visual);
    const item=(text,answer,others,visual,reason)=>q(text,answer,others,reason,visual);
    if(id.startsWith('times')){
      const each=id==='times01'?i%2:Number(id.slice(5)), count=a;
      return number('每盤一樣多。一共有幾個圖案？',each*count,groups(Array(count).fill(each),icon),
        `每盤 ${each} 個，有 ${count} 盤。`);
    }
    switch(id){
      case 'sequence': {
        const first=11+i*4,step=i%2?5:10;
        return number(`每次多 ${step}。空格要填幾？`,first+2*step,
          {kind:'firstPath',values:[first,first+step,'□',first+3*step]},'從左邊一格接著數。');
      }
      case 'place': case 'comparePlace': {
        const value=(grade===2?(i%2+1)*100:0)+a*10+b, other=value+(i%2?-1:1)*10;
        const digits=String(value).split('');
        return id==='place'?number('把定位卡合起來，是多少？',value,cards(digits.map((d,j)=>[['百位','十位','個位'][3-digits.length+j],d]),[2,1,0]),'從最高位讀到個位。'):
          {...compare('看兩張數卡。中間放哪個符號？',value,other,'從最高位開始比。'),visual:cards([['甲',value],['乙',other]],[3,4])};
      }
      case 'sum': case 'take': {
        const total=11+i%8, extra=1+i%7, start=total-extra;
        return id==='sum'?number(`兩個果盤共有幾個${iconNames[icon]}？`,total,groups([start,extra],icon),'可以先湊滿 10 再接著數。'):
          number('畫叉的果子送走了，還剩幾個？',start,groups([total],0,{removed:extra}),'只數沒有畫叉的果子。');
      }
      case 'measure': case 'ribbons': {
        const lengths=[a,b],t=a+b;
        return number(id==='measure'?'小兔用方格量彩帶。彩帶長幾格？':'兩段彩帶接起來，長幾格？',t,
          {kind:'earlyStrip',lengths:id==='measure'?[t]:lengths},'由左到右數等長的小格。');
      }
      case 'ruler': {
        const start=i%3,end=start+a;
        return number('手指從線段左端走到右端。線段長幾公分？',a,{kind:'ruler',start,end},'數的是兩端之間的格數。');
      }
      case 'shape': {
        const order=Array.from({length:4},(_,j)=>(i+j)%4), target=(i*3+Math.floor(i/4))%4;
        const labels=['甲','乙','丙','丁'], shapes=['三角形','正方形','長方形','圓形'];
        const answer=labels[order.indexOf(target)];
        return item(`圈出${shapes[target]}所在的圖卡。`,answer,labels.filter(x=>x!==answer),{kind:'firstShapes',order,angle:10*(i%4)},'轉方向之後，邊和角的特徵仍然一樣。');
      }
      case 'solid': {
        const order=Array.from({length:3},(_,j)=>(i+j)%3), target=Math.floor(i/2)%3;
        const labels=['甲','乙','丙'],name=['球','圓柱','長方體'][target],answer=labels[order.indexOf(target)];
        return item(`圈出最像${name}的物品。`,answer,labels.filter(x=>x!==answer),{kind:'earlySolids',order},'可用實物觀察平面、曲面與形狀。');
      }
      case 'calendar': {
        const today=3+i,delta=i%2?7:1;
        return number(delta===1?'圈圈標出今天。明天是幾日？':'圈圈標出今天。下一週同一天是幾日？',today+delta,
          {kind:'earlyCalendar',today},delta===1?'往後數一天。':'同一欄往下找一週。');
      }
      case 'coins': {
        const values=[...Array(a-1).fill(grade===1?10:100),5,1,1];
        return number('先圈同面額的錢。合起來有幾元？',values.reduce((x,y)=>x+y),{kind:'earlyCoins',values},'先數面額最大的錢，再接著數。');
      }
      case 'columnAdd': case 'columnSub': {
        const first=(grade===2&&term==='lower'?(i%3+1)*100:0)+27+i*3,second=16+i%7;
        const plus=id==='columnAdd';
        return number('看定位板。從個位開始算，答案是多少？',plus?first+second:first-second,
          {kind:'earlyColumn',first,second,plus},plus?'個位滿十就進一。':'個位不夠減時，向十位借一個十。');
      }
      case 'classify': {
        const values=[a,b,3+i%3], target=i%3;
        return number(`圈出${iconNames[target]}。圖中有幾個？`,values[target],
          {kind:'earlyGroups',values:[values.reduce((x,y)=>x+y)],mixed:values,icon},'每圈一個就記一次。');
      }
      case 'parts': {
        const total=28+i*3,left=12+i;
        return number('兩盒合起來是全部。右邊的盒子有幾張卡？',total-left,cards([['全部',total],['左盒',left],['右盒','？']],[2,3,4]),'用全部減去左盒的數。');
      }
      case 'capacity': {
        const amounts=i%2?[a,a+b]:[a+b,a],big=i%2?'乙':'甲';
        const visual=groups(amounts,5,{names:['甲壺','乙壺']});
        const intro='兩個水壺裝滿後各倒入小杯。';
        if(i%3===0)return item(intro+'哪個水壺容量較大？',big,[big==='甲'?'乙':'甲','一樣大'],visual,'能倒出較多小杯的水壺容量較大。');
        if(i%3===1)return number(intro+`${big}比另一個多幾杯？`,b,visual,'用較多的杯數減掉較少的杯數。');
        return number(intro+'兩壺合起來能倒幾杯？',a*2+b,visual,'先數兩列各有幾杯，再相加。');
      }
      case 'sequenceAdd': case 'sequenceSub': {
        const start=24+i,plus=id==='sequenceAdd';
        return number('沿箭頭做兩步，最後有幾張卡？',start+(plus?a:-a)-b,
          cards([['原有',start],[plus?'再放':'拿走',a],['送出',b]],[2,3,4]),'先算中間，再處理最後一格。');
      }
      case 'clock': {
        const hour=a,minute=5*b;
        return item('看長針、短針，現在是幾時幾分？',time(hour*60+minute),
          [time(hour*60+minute+5),time((hour+1)*60+minute),time(hour*60+minute-5)],{kind:'clock',hour,minute},'從 12 起，長針每一大格是 5 分。');
      }
      case 'elapsed': {
        const start=time(a*60+5),end=time(a*60+5+5*b);
        return number('小兔從起點走到終點，經過幾分鐘？',5*b,{kind:'time',start,end},'終點分鐘數減去起點分鐘數。');
      }
      case 'perimeter':
        return number('沿正方形花圃外邊走一圈，共幾公分？',4*a,{kind:'earlyGrid',sizes:[[a,a]],perimeter:true},'四條邊一樣長，算四個邊長。');
      case 'estimate': {
        const first=198+i%6*100,second=104+i;
        return number('小兔約收了幾張圖卡？先把兩個數估成整百。',300+i%6*100,cards([['第一盒',first],['第二盒',second]],[3,4]),'兩盒先各找接近的整百，再相加。');
      }
      case 'meters':
        return number('把兩段繩長合起來，有幾公分？',100*a+5*b,cards([['長繩',a+' 公尺'],['短繩',5*b+' 公分']],[3,4]),'每公尺換成 100 公分後再相加。');
      case 'weight': {
        const heavy=i%2?'甲':'乙';
        return item('哪個動物的籃子比較重？',heavy,[(heavy==='甲'?'乙':'甲'),'一樣重'],{kind:'earlyBalance',leftLow:i%2},'天平往下的一邊較重。');
      }
      case 'groupsPlus': case 'groupsRemove': {
        const each=4+i%3, count=2+i%4, more=2;
        return id==='groupsPlus'?number('每盤一樣多。加上最後一盤外加的果子，一共有幾個？',each*count+more,
          groups([...Array(count).fill(each),more],0,{names:[...Array(count).fill(''), '外加']}),'先算同樣多的幾盤，再加外加的果子。'):
          number('每盤畫叉的 2 個都拿走，一共剩幾個？',(each-2)*count,
            groups(Array(count).fill(each),0,{removed:2}),'先數一盤剩下幾個，再數全部。');
      }
      case 'pack': case 'share': {
        const each=2+i%4, count=2+i%3,total=each*count;
        return id==='pack'?number(`每 ${each} 個圈成一袋，可以裝幾袋？`,count,groups([total],icon),'每袋放一樣多，再數袋數。'):
          number(`把圖案平分給 ${count} 隻小兔，每隻分到幾個？`,each,groups([total],icon),'每隻輪流發一個，再數每人有幾個。');
      }
      case 'fraction': case 'fractionCompare': {
        const parts=2+i%6;
        return id==='fraction'?item('一整條餅乾平均分開。塗色的一份是幾分之一？','1/'+parts,['1/'+(parts+1),'1/'+(parts+2)],{kind:'earlyFraction',parts:[parts]},'分成幾份，其中一份就是幾分之一。'):
          item('兩條餅乾一樣長。哪一條塗色的部分比較長？','甲',['乙','一樣長'],{kind:'earlyFraction',parts:[parts,parts+1]},'整條相同時，分得越少份，每份越長。');
      }
      case 'area': {
        const w=2+i%4;
        return item('小方格一樣大，哪一塊花圃的面比較大？','乙',['甲','一樣大'],
          {kind:'earlyGrid',sizes:[[w,2],[w,3]]},'比較蓋住的方格數。');
      }
      default: throw Error('缺少題型 '+id);
    }
  }

  function worksheet(grade,term,unit,focus,base){
    const sections=focus?[focus]:unit.sections;
    const unitIndex=Number(unit.id.slice(1))-1;
    let seed=1139*(grade+unitIndex+1)+(focus?59*(unit.sections.indexOf(focus)+1):0);
    const random=()=>{
      seed=seed*48271%2147483647;
      return seed/2147483647;
    };
    const seen=new Set();
    const authored=base.filter(item=>item.visual&&!item.signature).reverse();
    return Array.from({length:10},(_,i)=>{
      if(i%5===4){
        const original=base[i], visual=original.visual;
        if(visual?.kind==='dots'||visual?.kind==='dotRows'){
          return {...original,text:original.text.replaceAll('圓點','圖案'),
            visual:groups(visual.groups||visual.values,i%3,visual.labels?{names:['甲','乙']}:undefined)};
        }
        return original;
      }
      const section=sections[i%sections.length];
      if(grade!==1||term!=='upper')return illustrated(kind(grade,term,unit,section),(i+unitIndex*11+(i>4?17:0))%10,grade,term);
      const authoredIndex=i===2?0:i===6?1:-1;
      const original=authored[authoredIndex];
      if(original&&original!==base[4]&&original!==base[9])return original;
      let draw;
      for(let tries=0;tries<36;tries++){
        draw=window.drawFirstGradeQuestion(unitIndex,unit.sections.indexOf(section),random);
        if(!seen.has(draw.signature))break;
      }
      seen.add(draw.signature);
      return {...draw,text:draw.text.replace('點一下','圈出')};
    });
  }
  window.EarlyLearning={steps,worksheet};
})();
