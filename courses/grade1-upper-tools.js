/* 一上單元操作台。操作數值只留在目前畫面。 */
(() => {
  'use strict';
  window.mountFirstGradeModel = (core, panel) => {
    const specs = {
      count: {
        fields:[['已放進去的種子',0,10,6]],
        draw:([count])=>({kind:'firstTenFrame',groups:[count]}),
        note:([count])=>`每格只放一顆。現在有 ${count} 顆，空 ${10-count} 格。`,
        question:'先看有沒有滿一整排。能從 5 接著數嗎？'
      },
      ribbons: {
        fields:[['甲帶格數',2,9,8],['乙帶格數',2,9,6],['乙帶往右移幾格',0,4,3]],
        draw:([a,b,shift])=>({kind:'firstRibbons',starts:[0,shift],lengths:[a,b]}),
        note:([a,b,shift])=>shift?'兩條左端還沒對齊。移動乙帶只改變位置。':a===b?'起點和終點都相同，兩條一樣長。':`已經對齊起點，${a>b?'甲':'乙'}帶比較長。`,
        question:'先猜哪條帶子比較長，再把「乙帶往右移幾格」調成 0 驗證。'
      },
      split: {
        fields:[['全部珠子',1,10,8],['放進左盤',0,8,3]],
        draw:([total,left])=>({kind:'firstTenFrame',groups:[left,total-left]}),
        note:([total,left])=>`左盤 ${left} 顆，右盤 ${total-left} 顆。合起來是 ${total} 顆。`,
        question:'固定全部珠子，再把一顆從左盤移到右盤。什麼變了？什麼沒變？'
      },
      path: {
        fields:[['一列有幾個座位',2,10,6],['從左邊第幾個',1,6,2]],
        draw:([count,seat])=>({kind:'firstPath',values:Array.from({length:count},(_,i)=>i===seat-1?'★':i+1)}),
        note:([count,seat])=>`同一個星星座位，從左數是第 ${seat} 個，從右數是第 ${count+1-seat} 個。`,
        question:'先指起點，算到星星本人。換一邊數，還是同一個座位嗎？'
      },
      place: {
        fields:[['吸管總根數',10,30,19]],
        draw:([count])=>({kind:'firstPlace',bundles:Math.floor(count/10),ones:count%10}),
        note:([count])=>`${count} 根可以整理成 ${Math.floor(count/10)} 捆和 ${count%10} 根，每捆 10 根。`,
        question:'把 19 根調成 20 根。看哪一部分變成新的整捆。'
      },
      add: {
        fields:[['原來的果子',0,10,4],['新放進去的果子',0,6,3]],
        draw:([first,added])=>({kind:'firstTenFrame',groups:[first,added]}),
        note:([first,added])=>`${first}＋${added}＝${first+added}。蘋果代表原來的數，種子代表新加的數。`,
        question:'先指著原來的數，只為新果子接著數。'
      },
      shape: {
        fields:[['形狀（0 三角形、1 正方形、2 長方形、3 圓形）',0,3,1],['轉動（0 不轉、1 轉動）',0,1,0]],
        draw:([shape,rotate])=>({kind:'shape',shape,rotate:!!rotate}),
        note:([shape])=>['三角形有三條直邊。','正方形有四條一樣長的直邊。','這個長方形的相對兩邊各自一樣長。','圓的邊界沒有角。'][shape],
        question:'轉過方向，再沿著邊走一圈。邊和角有改變嗎？'
      },
      subtract: {
        fields:[['原本有幾顆',0,10,8],['拿走幾顆',0,8,3]],
        draw:([total,removed])=>({kind:'firstTray',groups:[total],icon:0,removed}),
        note:([total,removed])=>`${total}－${removed}＝${total-removed}。有叉叉的果子被拿走。`,
        question:'先說全部有幾顆，再說拿走幾顆，最後數沒有叉叉的果子。'
      },
      time: {
        fields:[['短針剛過幾點',1,12,4],['整點或半點（0 整點、1 半點）',0,1,1]],
        draw:([hour,half])=>({kind:'clock',hour,minute:half*30}),
        note:([hour,half])=>half?`${hour} 點半，長針指 6，短針剛走過 ${hour}。`:`${hour} 點整，長針指 12，短針指 ${hour}。`,
        question:'先找長針，再比較短針在整點和半點的位置。'
      }
    };
    const e=core.escape;
    let current;
    function render() {
      const topic=core.unit().extension;
      if(!topic||current===core.unit().id)return;
      current=core.unit().id;
      const model=topic.model;
      const spec=specs[model];
      panel.innerHTML=`<h3>動手試 · ${e(topic.name)}</h3><p>${e(spec.question)}</p>
        <div class="first-model-inputs">${spec.fields.map(([name,min,max,value],i)=>
          `<label for="first-model-${i}">${e(name)} <output for="first-model-${i}">${value}</output><input type="range" id="first-model-${i}" min="${min}" max="${max}" value="${value}"></label>`).join('')}</div>
        <div id="first-model-figure"></div><p role="status" id="first-model-note"></p>`;
      update();
    }
    function update() {
      const model=core.unit().extension.model;
      const spec=specs[model];
      const fields=[...panel.querySelectorAll('input')];
      const first=fields[0].valueAsNumber;
      if(['split','path','add','subtract'].includes(model))fields[1].max=model==='add'?10-first:first;
      const values=fields.map(field=>field.valueAsNumber);
      panel.querySelectorAll('output').forEach((output,i)=>output.value=values[i]);
      panel.querySelector('#first-model-figure').innerHTML=core.draw(spec.draw(values));
      panel.querySelector('#first-model-note').textContent=spec.note(values);
    }
    panel.addEventListener('input',update);
    document.addEventListener('classroom-scope-change',render);
    render();
  };
})();
