/* 課堂、學習單與遊戲共用題圖。 */
(() => {
  'use strict';
  const escape = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const line = (x1,y1,x2,y2,stroke = '#315a4a',width = 2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"/>`;
  const label = (x,y,text,anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}">${escape(text)}</text>`;
  const svg = (h,description,content) => `<figure class="math-figure"><svg viewBox="0 0 300 ${h}" role="img" aria-label="${escape(description)}">${content}</svg></figure>`;
  const forestIcons = [
    '<path d="M0-3C-9-9-14-2-11 6c3 8 8 7 11 5 3 2 8 3 11-5 3-8-2-15-11-9Z" fill="#d6554b" stroke="#873a32"/><path d="M0-3q0-6 3-10M2-8q4-5 9-3Q9-5 2-8" fill="#71a44f" stroke="#456038"/><path d="M-7-2q-2 2-1 5" fill="none" stroke="#ffdfbb" stroke-width="1.8"/>',
    '<path d="M-10 7Q-14-3 3-10Q13-5 10 3Q4 13-7 11Z" fill="#bd793f" stroke="#6c492d"/><path d="M-8 8Q-2 1 5-5" stroke="#754b31" fill="none"/><path d="M-2-7Q-8-7-11-13Q-2-14 1-9" fill="#82aa54" stroke="#527336"/>',
    '<path d="m0-13 3.6 8.4 9.3 1-6.9 6.2 2 9.3L0 7.3l-8 4.6 2-9.3-6.9-6.2 9.3-1Z" fill="#f9c555" stroke="#95622e"/><path d="M-3 1v1m6-1v1M-2 5q2 2 4 0" stroke="#744223" stroke-linecap="round" fill="none"/>',
    '<path d="M-6-3q-7-14-2-13 4 1 5 10h6q1-9 5-10 5-1-2 13 6 3 6 8 0 7-12 7T-12 5q0-5 6-8Z" fill="#fff0d8" stroke="#875a49"/><path d="M-5 3v1m10-1v1M-2 7q2 2 4 0" stroke="#603f38" stroke-linecap="round" fill="none"/><path d="M-8 6h2m12 0h2" stroke="#df9186" stroke-width="2"/>',
    '<path d="M-10-2-12-13-4-9Q0-11 4-9l8-4-2 11q4 5 0 10Q0 15-10 8q-4-5 0-10Z" fill="#df874e" stroke="#874626"/><path d="M-11 4Q-4 0 0 7q4-7 11-3Q10 11 0 12-10 11-11 4Z" fill="#fff0d8"/><path d="M-5-1v1m10-1v1M-2 5q2 3 4 0" stroke="#603f38" stroke-linecap="round" fill="none"/>'
  ];
  const forestIcon = (type,x,y,size=1) => `<g transform="translate(${x} ${y}) scale(${size})">${forestIcons[type]}</g>`;
  const groupNames = ['甲','乙','丙','丁'];
  function draw(v,interactive=false) {
    if (!v) return '';
    switch (v.kind) {
      case 'firstTray': {
        const pitch=276/v.groups.length;
        const cols=v.groups.length===3?3:5;
        const rows=Math.max(1,Math.ceil(Math.max(...v.groups)/cols));
        const bottom=55+(rows-1)*25;
        return svg(bottom+25,v.groups.map((n,i)=>`${v.labels?groupNames[i]+'籃':'籃子'}有 ${n} 個`).join('；')+(v.removed?`，其中 ${v.removed} 個被畫上叉叉。`:'。'),v.groups.map((n,i)=>{
          const x=12+i*pitch, center=x+pitch/2;
          const gap=v.groups.length===3?22:24;
          const target=interactive&&v.targets?`data-picture-choice="${groupNames[i]}"`:'';
          return `<g ${target}><rect x="${x+3}" y="6" width="${pitch-6}" height="${bottom+13}" rx="14" fill="#fffaf0" stroke="#b69059"/>`
            +`<path d="M${x+10} 21H${x+pitch-10}L${x+pitch-20} ${bottom-4}q-1 4-7 4H${x+27}q-6 0-7-4Z" fill="#f9dfa9" stroke="#976437" stroke-width="1.5"/>`
            +`<path d="M${x+20} ${bottom-5}H${x+pitch-20}L${x+pitch-25} ${bottom+1}H${x+25}Z" fill="#d39a56" stroke="#976437"/>`
            +Array.from({length:n},(_,j)=>{
              const row=Math.floor(j/cols), inRow=Math.min(cols,n-row*cols);
              const px=center+(j%cols-(inRow-1)/2)*gap, py=34+row*25;
              return forestIcon(v.icon,px,py,.84)+(v.removed&&j>=n-v.removed?line(px-9,py-9,px+9,py+9,'#641e29',2.8)+line(px+9,py-9,px-9,py+9,'#641e29',2.8):'');
            }).join('')+(v.labels?label(center,bottom+14,groupNames[i]):'')+'</g>';
        }).join(''));
      }
      case 'firstPairs': {
        return svg(86,`甲列有 ${v.groups[0]} 個，乙列有 ${v.groups[1]} 個。`,v.groups.map((n,i)=>{
          const y=22+i*39;
          return label(24,y+5,groupNames[i])+Array.from({length:n},(_,j)=>forestIcon(i,54+j*Math.min(30,224/Math.max(1,n-1)),y,.78)).join('');
        }).join(''));
      }
      case 'firstParts': {
        const seeds=(n,y,center=150,cols=n)=>Array.from({length:n},(_,i)=>{
          const row=Math.floor(i/cols),inRow=Math.min(cols,n-row*cols);
          return forestIcon(1,center+(i%cols-(inRow-1)/2)*22,y+row*19,.8);
        }).join('');
        return svg(116,`上面有 ${v.whole} 顆種子，左邊有 ${v.left} 顆，右邊待填。`,
          '<rect x="22" y="6" width="256" height="34" rx="13" fill="#fff1c7" stroke="#af8a55"/>'
          +seeds(v.whole,24)+line(150,41,83,57)+line(150,41,227,57)
          +'<rect x="20" y="57" width="128" height="44" rx="12" fill="#e9f3d9" stroke="#728951"/><rect x="165" y="57" width="113" height="44" rx="12" fill="#f7ecda" stroke="#af8a55"/>'
          +seeds(v.left,v.left>5?70:78,84,5)+label(222,85,'？'));
      }
      case 'firstBooks': {
        const y=height=>84-height*7;
        return svg(106,`甲書厚 ${v.values[0]} 格，乙書厚 ${v.values[1]} 格。`,line(20,84,280,84)+v.values.map((height,i)=>{
          const x=41+i*130;
          return `<rect x="${x}" y="${y(height)}" width="86" height="${height*7}" rx="2" fill="#fff1cd" stroke="#665041"/>`
            +[0,height].map(n=>line(x-4,y(n),x+90,y(n),i?'#477e64':'#a25941',4)).join('')
            +Array.from({length:height-1},(_,j)=>line(x+8,y(j+1),x+78,y(j+1),'#a5855d',.9)).join('')
            +label(x+43,101,groupNames[i]);
        }).join(''));
      }
      case 'firstTrail': {
        const row=(i,y)=>{
          const road=i===v.bent?`M62 ${y} Q108 ${y-v.curve*1.3} 150 ${y} T238 ${y}`:`M62 ${y}H238`;
          return label(22,y+5,groupNames[i])+`<path d="${road}" fill="none" stroke="${i?'#3b8d76':'#bc774a'}" stroke-width="5" stroke-linecap="round"/>`
            +`<path d="M55 ${y+5}v-21l15 3-15 5" fill="#ecae47" stroke="#754b37"/><path d="M238 ${y+8}v-9m-9 0 9-17 9 17Z" fill="#74a455" stroke="#496741"/>`;
        };
        return svg(104,`甲乙兩條路起點和終點相同；${groupNames[v.bent]}路彎曲，另一條筆直。`,row(0,28)+row(1,76));
      }
      case 'firstQueue': {
        return svg(72,`從左到右有 ${v.count} 隻動物。星星在左起第 ${v.index+1} 隻上面。`,
          Array.from({length:v.count},(_,i)=>{
            const x=150+(i-(v.count-1)/2)*32;
            return forestIcon(3+i%2,x,42,.82)+(i===v.index?forestIcon(2,x,14,.53):'');
          }).join('')+label(10,62,'左','start')+label(290,62,'右','end'));
      }
      case 'firstShapes': {
        const silhouettes=['<path d="M-15 12H15L1-14Z"/>','<rect x="-12" y="-12" width="24" height="24"/>','<rect x="-17" y="-10" width="34" height="20"/>','<circle r="13"/>'];
        return svg(84,v.order.map((n,i)=>groupNames[i]+'：'+['三條直邊','四條邊一樣長','四個直角且長寬不一樣','圓圓的，沒有角'][n]).join('；'),v.order.map((n,i)=>{
          const x=45+70*i;
          const target=interactive&&v.targets?`data-picture-choice="${groupNames[i]}"`:'';
          return `<g ${target}><rect x="${x-29}" y="7" width="58" height="70" rx="10" fill="#fff5d9" stroke="#b69059"/>
            <g transform="translate(${x} 34) rotate(${v.angle})" fill="${['#e9ab65','#8fbb86','#8dcbd4','#ebb39c'][n]}" stroke="#3a614e" stroke-width="1.8">${silhouettes[n]}</g>`
            +label(x,69,groupNames[i])+'</g>';
        }).join(''));
      }
      case 'firstTenFrame': {
        const pieces = v.groups.flatMap((count,group)=>Array(count).fill(group));
        const boxes = Array.from({length:10},(_,i)=>{
          const x=50+(i%5)*40, y=14+Math.floor(i/5)*40;
          return `<rect x="${x}" y="${y}" width="40" height="40" fill="#fff8e7" stroke="#49675a" stroke-width="2"/>`
            +(pieces[i]!==undefined?forestIcon(pieces[i],x+20,y+20):'');
        });
        return svg(108,`十格板，依序放了 ${v.groups.join(' 和 ')} 個圖案。`,boxes.join(''));
      }
      case 'firstPath': {
        const width=270/v.values.length;
        return svg(72,'由左向右排列的數卡：'+v.values.join('、'),v.values.map((value,i)=>{
          const x=15+width*i;
          return `<rect x="${x}" y="12" width="${width-4}" height="42" rx="6" fill="${value==='□'?'#fff1cd':'#e8f4e8'}" stroke="#476859"/>`+label(x+(width-4)/2,38,value);
        }).join(''));
      }
      case 'firstRibbons': {
        return svg(86,'兩條紙帶。甲從左端起有 '+v.lengths[0]+' 個等長小格，乙有 '+v.lengths[1]+' 個等長小格。',
          v.lengths.map((length,i)=>{
            const x=45+v.starts[i]*17, y=15+i*34;
            return label(23,y+15,i===0?'甲':'乙')+Array.from({length},(_,j)=>
              `<rect x="${x+j*17}" y="${y}" width="17" height="22" fill="${i===0?'#f7bc69':'#81c9b2'}" stroke="#476859"/>`
            ).join('');
          }).join(''));
      }
      case 'firstPlace': {
        const sticks = Array.from({length:v.bundles},(_,i)=>{
          const x=24+59*i;
          return `<rect x="${x}" y="13" width="47" height="47" rx="6" fill="#ffe4ad" stroke="#966229"/>`
            +Array.from({length:10},(_,j)=>line(x+5+j*4,18,x+5+j*4,54,'#805c30',1.8)).join('')
            +line(x,33,x+47,33,'#218570',4);
        }).join('');
        const loose=Array.from({length:v.ones},(_,i)=>line(225+i*6,18,225+i*6,54,'#805c30',2.4)).join('');
        return svg(83,`${v.bundles} 捆吸管，每捆 10 根，另外有 ${v.ones} 根。`,sticks+loose+label(108,75,'整捆')+label(250,75,'散根'));
      }
      case 'dots': case 'dotRows': {
        const values=v.groups||v.values;
        if(values.every(count=>count===0)) {
          return svg(56,'盒子裡沒有圓點。','<rect x="77" y="10" width="146" height="35" rx="4" fill="none" stroke="#315a4a" stroke-width="2"/>');
        }
        const named=v.labels;
        const x0=named?48:20, pitch=23;
        return svg(20+values.length*22,`圓點分成 ${values.length} 排，每排依序有 ${values.join('、')} 個。`,
          values.map((count,i)=>(named?label(22,24+i*22,'甲乙'[i]):'')+
            Array.from({length:count},(_,j)=>`<circle cx="${x0+j*pitch}" cy="${20+i*22}" r="7" fill="${i%2?'#b56e37':'#367254'}"/>`).join('')).join(''));
      }
      case 'compareBars': {
        const [a,b]=v.values;
        const bar=(x,y,w,h,fill)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#315a4a"/>`;
        return v.vertical ? svg(135,'兩座塔放在同一底線，分別標為甲、乙。',
          line(55,105,245,105)+bar(90,105-a*10,36,a*10,'#81a984')+bar(174,105-b*10,36,b*10,'#e8c579')+label(108,126,'甲')+label(192,126,'乙')) :
          svg(88,'兩條帶子的左端在同一條線上，分別標為甲、乙。',
            line(55,6,55,80)+bar(55,13,a*24,20,'#81a984')+bar(55,53,b*24,20,'#e8c579')+label(26,29,'甲')+label(26,69,'乙'));
      }
      case 'unitBar': {
        return svg(57,'用相同的小方塊首尾相接量長度。',Array.from({length:v.count},(_,i)=>
          `<rect x="${30+i*28}" y="14" width="28" height="28" fill="#dcebd3" stroke="#315a4a"/>`).join(''));
      }
      case 'ruler': {
        const x = a=>24+a*24;
        return svg(79,`線段的左端對齊 ${v.start}，右端對齊 ${v.end} 公分刻度。`,line(x(v.start),20,x(v.end),20,'#9b5027',4)+
          line(x(v.start),16,x(v.start),27,'#9b5027')+line(x(v.end),16,x(v.end),27,'#9b5027')+line(18,43,274,43)+
          Array.from({length:11},(_,i)=>line(x(i),43,x(i),54)+label(x(i),68,i)).join(''));
      }
      case 'clock': {
        const position=(turn,r)=>[150+r*Math.sin(turn*Math.PI/6),69-r*Math.cos(turn*Math.PI/6)];
        const hour=position(v.hour%12+v.minute/60,31), minute=position(v.minute/5,46);
        const hand=angle=>angle||12;
        const hourDescription=v.minute?`短針在 ${hand(v.hour%12)} 和 ${hand((v.hour+1)%12)} 之間`:`短針指向 ${hand(v.hour%12)}`;
        return svg(140,`鐘面：${hourDescription}，長針指向 ${hand(v.minute/5)}。`,
          '<circle cx="150" cy="69" r="62" fill="#fff8df" stroke="#315a4a" stroke-width="2"/>'+
          Array.from({length:12},(_,i)=>{const [x,y]=position(i,52);return label(x,y+4,i||12);}).join('')+
          line(150,69,...hour,'#204c3d',5)+line(150,69,...minute,'#9b5027',2.8)+'<circle cx="150" cy="69" r="3" fill="#284538"/>');
      }
      case 'shape': {
        const shapes=[
          '<polygon points="111,89 192,89 150,16"/>',
          '<rect x="112" y="18" width="76" height="76"/>',
          '<rect x="85" y="24" width="130" height="62"/>',
          '<circle cx="150" cy="55" r="39"/>'
        ];
        return svg(110,'一個封閉圖形，請觀察邊和角。',`<g fill="#dcebd3" stroke="#315a4a" stroke-width="3" ${v.rotate?'transform="rotate(12 150 55)"':''}>${shapes[v.shape]}</g>`);
      }
      case 'mirror': {
        const x=150-v.distance*17;
        return svg(77,`甲在垂直對稱軸的左邊 ${v.distance} 格。`,
          Array.from({length:17},(_,i)=>line(14+i*17,14,14+i*17,63,'#d0dccc',1)).join('')+
          [14,30,46,63].map(y=>line(14,y,286,y,'#d0dccc',1)).join('')+line(150,7,150,70,'#a0522b',3)+
          `<circle cx="${x}" cy="46" r="5" fill="#315a4a"/>`+label(x,28,'甲')+
          (v.reveal?`<circle cx="${300-x}" cy="46" r="5" fill="#8a4b24"/>`+label(300-x,28,'對稱點'):''));
      }
      case 'valueTable':
        return `<figure class="math-figure"><table class="math-value-table"><caption>各組數量</caption><thead><tr><th scope="col">組別</th><th scope="col">數量</th></tr></thead><tbody>${v.labels.map((name,i)=>`<tr><th scope="row">${escape(name)}</th><td>${v.values[i]}</td></tr>`).join('')}</tbody></table></figure>`;
      case 'pie': {
        const a=v.percent/100*Math.PI*2;
        const x=150+51*Math.sin(a),y=64-51*Math.cos(a);
        return svg(150,`圓形圖有 A、B 兩部分，A 占百分之 ${v.percent}。`,'<circle cx="150" cy="64" r="51" fill="#efcf78" stroke="#315a4a" stroke-width="2"/>'+
          `<path d="M150 64 L150 13 A51 51 0 ${v.percent>50?1:0} 1 ${x} ${y} Z" fill="#3b7859" stroke="#315a4a" stroke-width="2"/>`+
          label(100,138,`綠色 A：${v.percent}%`)+label(205,138,'黃色 B：？'));
      }
      case 'angle': {
        const rad = Math.PI*v.value/180;
        const x = 145+80*Math.cos(rad), y = 105-80*Math.sin(rad);
        const ax = 145+28*Math.cos(rad), ay = 105-28*Math.sin(rad);
        return svg(130,'兩條射線從同一頂點出發，其中一條水平向右。',line(145,105,225,105)+line(145,105,x,y)+
          `<path d="M 173 105 A 28 28 0 0 0 ${ax} ${ay}" fill="none" stroke="#9b5027" stroke-width="3"/><circle cx="145" cy="105" r="3" fill="#315a4a"/>`);
      }
      case 'line': {
        const start=v.start??0,end=v.end??Number(start)+1;
        const x = i => 25 + i * (250/v.parts);
        return svg(65,`從 ${start} 到 ${end} 平均分成 ${v.parts} 格，標在從 ${start} 起第 ${v.at} 格。`,line(19,30,281,30)+
          Array.from({length:v.parts+1},(_,i)=>line(x(i),23,x(i),37)).join('')+
          `<circle cx="${x(v.at)}" cy="30" r="5" fill="#923c23"/>`+label(25,54,start)+label(275,54,end)+(v.blank?label(x(v.at),54,'□'):''));
      }
      case 'quad': {
        const shapes = {rect:[[68,30],[232,30],[232,100],[68,100]],rhombus:[[150,23],[220,65],[150,107],[80,65]],trapezoid:[[95,30],[197,30],[232,100],[62,100]],parallelogram:[[102,30],[239,30],[202,100],[65,100]]};
        const pts = shapes[v.shape];
        return svg(126,v.letters?'四邊形頂點順時針依序為甲、乙、丙、丁。':'題目描述的四邊形示意。',`<polygon points="${pts.map(point=>point.join(',')).join(' ')}" fill="#dcebd3" stroke="#315a4a" stroke-width="3"/>`+
          (v.letters?pts.map(([x,y],i)=>label(x+(i===0||i===3?-14:14),y+(i<2?0:8),'甲乙丙丁'[i])).join(''):''));
      }
      case 'triangle': {
        const [a,b,c]=v.sides;
        const bx=(a*a+c*c-b*b)/(2*a), by=Math.sqrt(c*c-bx*bx);
        const scale=Math.min(170/a,72/by);
        const x1=(300-a*scale)/2,x2=x1+a*scale,x3=x1+bx*scale;
        const y1=103,y3=y1-by*scale;
        return svg(126,`三角形的三條邊長是 ${a}、${b}、${c} 公分。`,
          `<polygon points="${x1},${y1} ${x2},${y1} ${x3},${y3}" fill="#dcebd3" stroke="#315a4a" stroke-width="3"/>`+
          label((x1+x2)/2,120,a+' 公分')+label((x2+x3)/2+8,(y1+y3)/2,b+' 公分','start')+
          label((x1+x3)/2-8,(y1+y3)/2,c+' 公分','end'));
      }
      case 'bars': case 'trend': case 'group': {
        const columns = [76,156,236];
        const y = n => 114 - n*9;
        const groups = v.kind === 'group';
        const axes = line(36,24,36,114)+line(36,114,273,114)+label(9,17,'本','start')+label(156,16,'借書本數')+
          Array.from({length:6},(_,i)=>line(36,y(i*2),273,y(i*2),'#d9dfd0',1)+label(27,y(i*2)+4,i*2,'end')).join('')+
          columns.map((x,i)=>label(x,135,['週一','週二','週三'][i])).join('');
        const rect = (x,amount,fill) => `<rect x="${x}" y="${y(amount)}" width="18" height="${114-y(amount)}" fill="${fill}" stroke="#315a4a"/>`;
        const data = v.kind==='trend'
          ? `<polyline points="${columns.map((x,i)=>x+','+y(v.values[i])).join(' ')}" fill="none" stroke="#315a4a" stroke-width="3"/>`+
            columns.map((x,i)=>`<circle cx="${x}" cy="${y(v.values[i])}" r="4" fill="#315a4a"/>`).join('')
          : columns.map((x,i)=>groups ? rect(x-20,v.values[i],'#437a58')+rect(x+2,v.other[i],'#edca74') : rect(x-9,v.values[i],'#437a58')).join('');
        const legend = groups ? '<rect x="62" y="147" width="12" height="12" fill="#437a58"/>'+label(80,158,'故事書','start')+
          '<rect x="161" y="147" width="12" height="12" fill="#edca74"/>'+label(179,158,'科普書','start'):'';
        const info = v.values.map((value,i)=>`週${'一二三'[i]}${groups?'故事書':''}${value}本${groups?`，科普書${v.other[i]}本`:''}`).join('；');
        return svg(groups?170:146,'借書本數。'+info+'。',axes+data+legend);
      }
      case 'rect': {
        const size = Math.min(220/v.wide,80/v.high), x = 30, y = 13, w=v.wide*size, h=v.high*size;
        return svg(130,`長方形長 ${v.wide} 公分、寬 ${v.high} 公分。`,
          `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e3efdb" stroke="#315a4a" stroke-width="2"/>`+
          Array.from({length:v.wide-1},(_,i)=>line(x+(i+1)*size,y,x+(i+1)*size,y+h,'#a1b49a',1)).join('')+
          Array.from({length:v.high-1},(_,i)=>line(x,y+(i+1)*size,x+w,y+(i+1)*size,'#a1b49a',1)).join('')+
          label(x+w/2,y+h+20,v.wide+' 公分')+label(x+w+4,y+h/2+4,v.high+' 公分','start'));
      }
      case 'strips': {
        const [a,b]=v.values;
        return svg(62,`將同一條分成 ${b} 等份，其中 ${a} 份塗色。`,
          Array.from({length:b},(_,i)=>`<rect x="${25+i*250/b}" y="13" width="${250/b}" height="36" fill="${i<a?'#78a684':'#fff'}" stroke="#315a4a"/>`).join(''));
      }
      case 'time':
        return svg(68,`時間線，起點 ${v.start}，終點 ${v.end}。`,line(40,30,260,30)+line(40,23,40,37)+line(260,23,260,37)+label(40,55,v.start)+label(260,55,v.end));
      default: return window.drawWorksheetFigure(v,svg,label,line,escape)||window.drawEarlyFigure?.(v,svg,label,line,forestIcon)||'';
    }
  }
  window.ClassroomFigures = {draw, escape};
})();
