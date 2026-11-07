/* 使用和隨堂練習相同的題圖，讓教師選小節、示範操作與逐步揭示。 */
window.Grade3LowerUnitTool = (() => {
  const tiles = (filled, total) => `<div class="lower-model-tiles" aria-hidden="true">${Array.from({length:total},(_,i)=>`<i class="${i<filled?'filled':''}"></i>`).join('')}</div>`;
  const models = {
    u2: {
      name:'用圖形排規律', controls:[['重複幾組',2,5,2]],
      view:([n])=>`<div class="lower-model-pattern">${'● ▲ ▲　'.repeat(n)}</div><p>${n} 組，每組是「圓、三角形、三角形」。請說說下一個是什麼。</p>`
    },
    u3: {
      name:'撥動時間', controls:[['24 時制的時刻',0,23,15],['分鐘',0,59,0]],
      view:([h,m])=>`<svg class="lower-model-clock" viewBox="0 0 110 110" aria-hidden="true"><circle cx="55" cy="55" r="49" fill="#fff8dd" stroke="#345446" stroke-width="3"/><text x="55" y="21" text-anchor="middle">12</text><text x="92" y="60" text-anchor="middle">3</text><text x="55" y="99" text-anchor="middle">6</text><text x="19" y="60" text-anchor="middle">9</text><path d="M55 55V34" stroke="#345446" stroke-width="5" transform="rotate(${h*30+m/2} 55 55)"/><path d="M55 55V27" stroke="#a25e45" stroke-width="3" transform="rotate(${m*6} 55 55)"/></svg><p>${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}，${h<12?'上午':'下午'} ${h%12||12} 時 ${m} 分</p>`
    },
    u4: {
      name:'分兩步裝盒', controls:[['每袋顆數',2,6,3],['每盒袋數',2,5,2],['盒數',2,4,3]],
      view:([a,b,c])=>`<div class="lower-model-groups">${Array.from({length:c},()=>`<span>${Array.from({length:b},()=>`<b>${'●'.repeat(a)}</b>`).join('')}</span>`).join('')}</div><p>每盒 ${a} × ${b}＝${a*b} 顆。全部 ${a*b} × ${c}＝${a*b*c} 顆。</p>`
    },
    u5: {
      name:'用方格鋪面積', controls:[['每排格數',2,8,4],['排數',1,6,3]],
      view:([c,r])=>`<div class="lower-model-grid" style="grid-template-columns:repeat(${c},1.7rem)" aria-hidden="true">${'<i></i>'.repeat(c*r)}</div><p>${r} 排，每排 ${c} 個 1 平方公分方格，共 ${c*r} 平方公分。</p>`
    },
    u6: {
      name:'讀取秤面刻度', controls:[['指針的小格位置',0,5,3]],
      view:([p])=>WorksheetDiagrams.render({id:'scale-demo',visual:{kind:'ticks',labels:[0,500],pointer:p}})+`<p>每一小格是 100 公克。從 0 數 ${p} 小格，是 ${p*100} 公克。</p>`
    },
    u8: {
      name:'用同一組材料讀乘除', controls:[['每組幾顆',2,8,6],['組數',2,6,4]],
      view:([a,b])=>`<div class="lower-model-groups">${Array.from({length:b},()=>`<span>${'●'.repeat(a)}</span>`).join('')}</div><p>${a} × ${b}＝${a*b}。同一張圖也表示 ${a*b} ÷ ${b}＝${a}，以及 ${a*b} ÷ ${a}＝${b}。</p>`
    },
    u9: {
      name:'用十分格表示小數', controls:[['完整的條數',0,2,1],['多出幾個十分之一',0,9,3]],
      view:([u,n])=>`<div aria-hidden="true">${tiles(10,10).repeat(u)}${tiles(n,10)}</div><p>${u} 個一和 ${n} 個十分之一，寫成 ${u}.${n}。</p>`
    },
    u10: {
      name:'沿著列和欄找資料', controls:[['選列',1,2,1],['選欄',1,2,1]],
      view:([r,c])=>{
        const rows=[['日期','故事書','科普書'],['週一',3,8],['週二',6,4]];
        return `<table class="lower-model-table"><caption>閱讀本數</caption>${rows.map((row,i)=>`<tr>${row.map((value,j)=>{
          const tag=i===0||j===0?'th':'td',highlight=(i===r&&j===c)||(i===0&&j===c)||(j===0&&i===r);
          return `<${tag}${tag==='th'?` scope="${i===0?'col':'row'}"`:''}${highlight?' class="marked"':''}>${value}</${tag}>`;
        }).join('')}</tr>`).join('')}</table><p>${rows[r][0]}的${rows[0][c]}有 ${rows[r][c]} 本。</p>`;
      }
    }
  };
  function mountModel(host, unitId) {
    const id=host.id;
    if(unitId==='u1'){window.HandsOnTools.mountDivision(id);return;}
    if(unitId==='u7'){window.HandsOnTools.mountFraction(id,{denominator:5,numerator:2});return;}
    const model=models[unitId];
    host.innerHTML=`<h4>${model.name}</h4><div class="lower-model-controls">${model.controls.map(([label,min,max,value],i)=>
      `<label>${label} <output data-model-value="${i}">${value}</output><input type="range" min="${min}" max="${max}" value="${value}"></label>`).join('')}</div>
      <div class="lower-model-view" aria-live="polite"></div>`;
    const inputs=[...host.querySelectorAll('input')],view=host.querySelector('.lower-model-view');
    const draw=()=>{
      const values=inputs.map(input=>Number(input.value));
      host.querySelectorAll('output').forEach((output,i)=>output.textContent=values[i]);
      view.innerHTML=model.view(values);
    };
    host.addEventListener('input',draw);
    draw();
  }
  function mount(slot, unitId, initialProblem = null) {
    const unit=NANI_G3S2_DATA.units.find(item=>item.id===unitId);
    const problems=NANI_G3S2_DATA.practiceBank.filter(item=>item.unitId===unitId);
    let position=0,step=0,selected=-1;
    slot.innerHTML=`
      <section class="scaffold-wizard-box lower-unit-tool">
        <h3>${unit.icon} ${unit.title}｜圖像操作台</h3>
        <p>${unit.model}</p>
        <details class="lower-model"><summary>展開動手操作</summary><div id="${slot.id}-lower-model"></div></details>
        <label>選小節 <select class="kid-select">${unit.sections.map(s=>`<option value="${s.id}">${s.title}</option>`).join('')}</select></label>
        <div class="lower-tool-problem"></div>
        <div class="lower-tool-actions">
          <button type="button" class="kid-btn kid-btn-secondary" data-tool="hint">逐步提示</button>
          <button type="button" class="kid-btn kid-btn-secondary" data-tool="read">朗讀題目</button>
          <button type="button" class="kid-btn kid-btn-primary" data-tool="next">換一題</button>
        </div>
        <ol class="lower-tool-steps"></ol>
        <p class="lower-tool-feedback" role="status"></p>
      </section>`;
    const select=slot.querySelector('select'), host=slot.querySelector('.lower-tool-problem');
    const status=slot.querySelector('.lower-tool-feedback'), steps=slot.querySelector('.lower-tool-steps');
    const visible=()=>problems.filter(p=>p.sectionId===select.value);
    if (unit.sections.some(section => section.id === initialProblem?.sectionId)) {
      select.value = initialProblem.sectionId;
      position = Math.max(0, visible().findIndex(problem => problem.id === initialProblem.id));
    }
    const current=()=>visible()[position];
    function draw(){
      const p=current();
      host.innerHTML=`<p><strong>${p.question}</strong></p>${WorksheetDiagrams.render(p)}
        <div class="lower-tool-options" role="group" aria-label="選擇答案">${p.options.map((value,i)=>
          `<button type="button" class="kid-btn kid-btn-secondary" data-tool-answer="${i}" aria-pressed="false">${value}</button>`
        ).join('')}</div>`;
      selected=-1;step=0;steps.replaceChildren();status.textContent='';
      slot.querySelector('[data-tool="hint"]').disabled=false;
    }
    select.addEventListener('change',()=>{position=0;draw();});
    slot.onclick=event=>{
      const button=event.target.closest('button');
      if(!button)return;
      const p=current();
      if(button.dataset.toolAnswer!==undefined){
        selected=Number(button.dataset.toolAnswer);
        host.querySelectorAll('[data-tool-answer]').forEach((item,i)=>item.setAttribute('aria-pressed',String(i===selected)));
        status.textContent=selected===p.answerIndex?`答對了。${p.solutionSpeech}`:'再試一次。可以看圖，或請老師開啟逐步提示。';
      }
      if(button.dataset.tool==='hint'){
        const li=document.createElement('li');
        li.textContent=p.stepScaffolds[step++];
        steps.append(li);
        button.disabled=step===p.stepScaffolds.length;
      }
      if(button.dataset.tool==='read')window.spEdAudio.speak(p.speechText);
      if(button.dataset.tool==='next'){position=(position+1)%visible().length;draw();}
    };
    mountModel(slot.querySelector('.lower-model > div'),unitId);
    draw();
  }
  return {mount};
})();
