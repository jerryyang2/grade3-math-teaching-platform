/* 學習單的彩色圖是已知條件，可搭配題幹讀圖或用來畫算式。 */
(() => {
  'use strict';
  const colors=['#f9e6a9','#cfeadf','#dceaff','#f8d8c7'];
  const ink='#304e55';
  window.drawWorksheetFigure=(v,svg,label,line,escape)=>{
    const box=(x,y,w,h,fill)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${fill}" stroke="${ink}"/>`;
    const path=(points,fill)=>`<path d="${points}" fill="${fill}" stroke="${ink}" stroke-width="1.4"/>`;
    if(v.kind==='studyCards'){
      // 橫列資料卡留足空間給含有注音的長單位。
      return svg(7+25*v.pairs.length,v.pairs.map(row=>row.join('：')).join('；'),v.pairs.map(([key,val],i)=>{
        const y=4+25*i;
        return box(10,y,280,22,colors[i%4])+label(22,y+15,key,'start')+label(282,y+15,val,'end');
      }).join(''));
    }
    if(v.kind==='studyTable'){
      return `<figure class="math-figure study-table"><table><thead><tr>${v.head.map(x=>`<th scope="col">${escape(x)}</th>`).join('')}</tr></thead><tbody>${v.rows.map(row=>`<tr>${row.map((x,i)=>i===0?`<th scope="row">${escape(x)}</th>`:`<td>${escape(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></figure>`;
    }
    if(v.kind!=='studyPicture')return '';
    const [a,b,c,d,e]=v.data;
    switch(v.model){
      case 'fractions': case 'ratio': {
        const rows=v.model==='ratio'?[[Math.max(a,b),a],[Math.max(a,b),b]]:v.data;
        return svg(80,rows.map(([n,k],i)=>` ${'甲乙'[i]}分成 ${n} 格，塗色 ${k} 格`).join('；'),rows.map(([n,k],i)=>{
          const y=7+i*36,w=233/n;
          return label(21,y+17,'甲乙'[i])+Array.from({length:n},(_,j)=>
            v.model==='ratio'&&j>=k?'':box(43+j*w,y,w,26,j<k?colors[i]:'#fff')).join('');
        }).join(''));
      }
      case 'cut': {
        const size=Math.min(185/a,63/b),x=58,y=11,w=a*size,h=b*size,cut=c*size;
        return svg(103,`長方形為 ${a} 乘 ${b} 公分，右上剪去 ${c} 公分見方`,
          box(x,y,w,h,colors[1])+box(x+w-cut,y,cut,cut,colors[3])+
          label(x+w/2,y+h+19,a+' 公分')+label(x-5,y+h/2,b+' 公分','end')+label(x+w+6,y+cut/2+5,'剪去','start'));
      }
      case 'plot': {
        const [heading,unit,labels,values,step] = v.data;
        const x = i => 59 + 62*i;
        const y = i => 103 - 16*i;
        const grid = Array.from({length:5},(_,i)=>
          line(38,y(i),274,y(i),'#9cb7ad',1)+label(31,y(i)+4,i*step,'end')).join('');
        const ticks = labels.map((name,i)=>
          line(x(i),y(4),x(i),103,'#d9e3dc',1)+label(x(i),122,name)).join('');
        const points = values ? '<polyline points="'+values.map((n,i)=>x(i)+','+y(n/step)).join(' ')+
          '" fill="none" stroke="#315a4a" stroke-width="2.6"/>'+
          values.map((n,i)=>'<circle cx="'+x(i)+'" cy="'+y(n/step)+'" r="3" fill="#315a4a"/>').join('') : '';
        const desc = values ? labels.map((name,i)=>name+' '+values[i]+' '+unit).join('，') : '四個時點的空白座標圖，每格 '+step+' '+unit;
        return svg(133,heading+'，'+desc,
          label(153,15,heading)+label(14,28,unit)+grid+ticks+line(38,y(4),38,103)+line(38,103,274,103)+points);
      }
      case 'rectangle':
        return svg(108,`長方形，長 ${a} ${c}、寬 ${b} ${c}`,box(48,12,166,70,colors[1])+label(131,100,`${a} ${c}`)+label(222,51,`${b} ${c}`,'start'));
      case 'trapezoid':
        return svg(116,`梯形，上底 ${a} ${d}、下底 ${b} ${d}、高 ${c} ${d}`,
          path('M95 23H202L256 89H44Z',colors[1])+line(100,25,100,88,'#925028')+
          path('M100 77h11v12h-11Z','none')+label(147,17,`${a} ${d}`)+label(149,109,`${b} ${d}`)+label(111,58,`${c} ${d}`,'start'));
      case 'route':
        return svg(73,`${a}到${b}：${d}；${b}到${c}：${e}`,line(28,36,150,36,'#b8783e',5)+line(150,36,272,36,'#427b69',5)+
          [28,150,272].map((x,i)=>`<circle cx="${x}" cy="36" r="6" fill="${colors[i]}" stroke="${ink}"/>`+label(x,61,[a,b,c][i])).join('')+
          label(89,22,d)+label(211,22,e));
      case 'box':
        return svg(130,`長方體的長 ${a} ${d}、寬 ${b} ${d}、高 ${c} ${d}`,
          path('M53 51H205L251 17H99Z',colors[0])+path('M53 51H205V103H53Z',colors[1])+path('M205 51L251 17V69L205 103Z',colors[2])+
          label(128,123,`${a} ${d}`)+label(247,93,`${b} ${d}`)+label(47,84,`${c} ${d}`,'end'));
      case 'circle': {
        const rad=(b||0)*Math.PI/180;
        const x=145+45*Math.cos(rad), y=57-45*Math.sin(rad);
        return svg(110,`圓心 O，半徑 ${a} 公分${b?'，扇形圓心角 '+b+' 度':''}`,
          `<circle cx="145" cy="57" r="45" fill="${colors[1]}" stroke="${ink}" stroke-width="2"/>`+
          (b?path(`M145 57H190A45 45 0 ${b>180?1:0} 0 ${x} ${y}Z`,colors[0])+label(197,33,b+'°'):'')+
          line(145,57,190,57,'#925028')+label(168,75,a+' 公分')+label(137,59,'O'));
      }
      case 'quarter':
        return svg(122,`邊長 ${a} 公分的正方形內，左下角有同半徑的四分之一圓`,
          box(103,9,89,89,'#fff')+path('M103 98V9A89 89 0 0 1 192 98Z',colors[1])+label(147,118,a+' 公分'));
      case 'polygon':
        return svg(105,`有 ${a} 條等長的邊`,path('M'+Array.from({length:a},(_,i)=>{
          const theta=2*Math.PI*i/a-Math.PI/2;
          return `${150+46*Math.cos(theta)} ${51+46*Math.sin(theta)}`;
        }).join('L')+'Z',colors[1]));
      case 'solids':
        return svg(92,'從左到右是圓柱、圓錐、球。',path('M27 24V58Q55 78 83 58V24Z',colors[1])+
          '<ellipse cx="55" cy="24" rx="28" ry="8" fill="#eff8f2" stroke="#304e55"/>'+
          path('M150 11L120 57Q150 77 180 57Z',colors[0])+
          '<circle cx="245" cy="42" r="27" fill="#f8d8c7" stroke="#304e55"/>'+
          '<path d="M219 45Q245 57 271 45" fill="none" stroke="#976353" stroke-dasharray="3 3"/>'+
          label(55,87,'圓柱')+label(150,87,'圓錐')+label(245,87,'球'));
      case 'groups':
        return svg(60,`有 ${a} 組，每組 ${b} 個`,Array.from({length:Number(a)},(_,i)=>{
          const w=278/Number(a), x=11+i*w;
          return box(x,10,w-4,39,colors[i%4])+label(x+(w-4)/2,34,b);
        }).join(''));
      default:return '';
    }
  };
})();
