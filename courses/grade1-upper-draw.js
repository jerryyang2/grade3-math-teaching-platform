/* Original illustrated practice aligned to the learning goals of each first-grade unit. */
(function (publish) {
  'use strict';
  const shapes = ['三角形','正方形','長方形','圓形'];
  const objects = ['蘋果','種子','星星'];
  function make(unit, section, random = Math.random) {
    const pick = (min,max) => min + Math.floor(random() * (max-min+1));
    const number = (text,answer,reason,visual,min=0,max=30) => {
      const choices = new Set([answer]);
      for (const offset of [-1,1,-2,2,-3,3]) {
        if (choices.size === 4) break;
        if (answer+offset>=min && answer+offset<=max) choices.add(answer+offset);
      }
      return {text,answer,reason,visual,choices:[...choices].map(String),input:'number'};
    };
    const choice = (text,answer,choices,reason,visual) => ({text,answer,choices,reason,visual});
    const tray = (groups,extra) => ({kind:'firstTray',groups,icon:pick(0,2),...extra});
    const a=pick(2,5), b=pick(1,10-a);
    let task;
    switch (unit) {
      case 0: {
        const icon=pick(0,2);
        if (section===2) {
          const index=pick(0,2), groups=[pick(1,3),pick(1,3),pick(1,3)];
          groups[index]=0;
          task=choice('點一下空籃。',['甲','乙','丙'][index],['甲','乙','丙'],'一個也沒有的籃子，數量記成 0。',tray(groups,{icon,labels:true,targets:true}));
        } else {
          const amount=section===0?pick(1,5):pick(6,10);
          task=number(`看圖，籃裡有幾個${objects[icon]}？`,amount,`每個只點數一次。最後數到 ${amount}。`,tray([amount],{icon}),0,10);
        }
        break;
      }
      case 1:
        if (section===0) {
          const lengths=[pick(4,9),pick(4,9)];
          const answer=lengths[0]===lengths[1]?'一樣長':lengths[0]>lengths[1]?'甲':'乙';
          task=choice('哪條紙帶比較長？',answer,['甲','乙','一樣長'],
            '先找到每條紙帶的起點。每小格一樣長，可以數格子比較。',{kind:'firstRibbons',starts:[pick(0,3),pick(0,3)],lengths});
        } else if(pick(0,1)){
          const values=[pick(2,7),pick(2,7)];
          const answer=values[0]===values[1]?'一樣厚':values[0]>values[1]?'甲':'乙';
          task=choice('同一層書架上，哪本書比較厚？',answer,['甲','乙','一樣厚'],
            '比的是上下封面之間的距離。',{kind:'firstBooks',values});
        } else {
          const bent=pick(0,1);
          task=choice('從旗子到樹，哪一條路比較短？',['甲','乙'][1-bent],['甲','乙','一樣長'],
            '兩個端點一樣，拉直的路比較短。',{kind:'firstTrail',bent,curve:pick(18,28)});
        }
        break;
      case 2: {
        const whole=section===0?a+b:10;
        task=number(section===0?'把上面的種子分到兩個籃子。右籃要放幾顆？':'十格板還差幾格就放滿？',
          whole-a,`全部有 ${whole} 個，已經放了 ${a} 個，還差 ${whole-a} 個。`,
          section===0?{kind:'firstParts',whole,left:a}:{kind:'firstTenFrame',groups:[a]},0,10);
        break;
      }
      case 3:
        if (section===0) {
          const count=pick(5,8), index=pick(0,count-1), fromRight=pick(0,1);
          task=number(`從${fromRight?'右':'左'}邊開始數，有星星的是第幾個？`,fromRight?count-index:index+1,
            '從題目指定的那一端開始，第一個數成 1。',{kind:'firstQueue',count,index,fromRight},1,count);
        } else {
          const groups=[pick(3,8),pick(3,8)];
          task=number('兩排一對一配對，有幾個找不到同伴？',Math.abs(groups[0]-groups[1]),
            '每一欄配成一對，數出單獨留下的圖案。',{kind:'firstPairs',groups},0,8);
        }
        break;
      case 4:
        if (section===0) {
          const total=pick(11,30);
          task=number('看圖，整捆和散根合起來有幾根？',total,'一捆是 10 根。先數整捆，再加散根。',{kind:'firstPlace',bundles:Math.floor(total/10),ones:total%10},10,30);
        } else {
          const start=pick(11,25), gap=pick(1,3);
          const values=Array.from({length:5},(_,i)=>i===gap?'□':start+i);
          task=number('每往右一格多 1。空格應放哪張數卡？',start+gap,'從空格左邊的數接著往上數 1。',{kind:'firstPath',values},10,30);
        }
        break;
      case 5:
        task=number(section===0?'兩籃合起來有幾個？':`兩籃交換位置後，合起來有幾個？`,a+b,
          `${a} 和 ${b} 合起來是 ${a+b}。兩籃交換位置，總數一樣。`,tray(section===0?[a,b]:[b,a],{labels:true}),0,10);
        break;
      case 6: {
        const target=pick(0,3), turn=pick(0,3);
        const order=Array.from({length:4},(_,i)=>(i+turn)%4);
        task=choice(`點一下${shapes[target]}。`,['甲','乙','丙','丁'][order.indexOf(target)],['甲','乙','丙','丁'],
          ['找有三條直邊、三個角的圖形。','找四條邊等長、四個角都是直角的圖形。','找四個角都是直角，而且長和寬不同的圖形。','找沒有角、外圈是圓的圖形。'][target],
          {kind:'firstShapes',order,angle:section===0?0:pick(1,4)*10,targets:true});
        break;
      }
      case 7:
        if (section===0) {
          task=number('有叉叉的拿走了。還剩幾個？',a,`一共有 ${a+b} 個，拿走 ${b} 個，剩 ${a} 個。`,tray([a+b],{removed:b}),0,10);
        } else {
          const groups=[a,a+b];
          if(pick(0,1))groups.reverse();
          task=choice('哪個算式可以算出兩籃相差多少？',`${a+b}－${a}`,[`${a+b}－${a}`,`${a}＋${a+b}`,`${a+b}－${a===b?0:b}`],
            `把一樣多的 ${a} 個配成對，多的那一籃還有 ${b} 個。`,tray(groups,{labels:true}));
          task.choices=[...new Set(task.choices)];
        }
        break;
      case 8: {
        const hour=pick(1,12), minute=section===0?0:30;
        const before=hour===1?12:hour-1, after=hour===12?1:hour+1;
        const suffix=minute?'點半':'點整';
        task=choice('看鐘面，現在是幾點？',hour+suffix,[before+suffix,hour+suffix,after+suffix,hour+(minute?'點整':'點半')],
          minute?`長針指 6，短針剛走過 ${hour}，所以是 ${hour} 點半。`:`長針指 12，短針指 ${hour}，所以是 ${hour} 點整。`,
          {kind:'clock',hour,minute});
        break;
      }
      default: return null;
    }
    const choices=task.choices.map(String);
    for(let i=choices.length-1;i>0;i--) {
      const j=pick(0,i);
      [choices[i],choices[j]]=[choices[j],choices[i]];
    }
    const signature=JSON.stringify([task.visual,task.answer]);
    return {...task,choices,answer:String(task.answer),id:`draw-${unit}-${section}-${encodeURIComponent(signature)}`,signature};
  }
  publish(make);
})(make => {
  if(typeof module!=='undefined' && module.exports)module.exports=make;
  else window.drawFirstGradeQuestion=make;
});
