/* 題目和圖像來自同一次出題；圖像不讀取選項或正解。 */
const WorksheetDiagrams = (() => {
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = (x,y,value,size=15,maxWidth) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="sans-serif" font-size="${size}"${maxWidth?` data-ws-text-width="${maxWidth}"`:''} fill="#142d24">${esc(value)}</text>`;
  const cell = (x,y,w,h,fill='#fff') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#354f44"/>`;
  const arrow = (from,to,y) => `<path d="M${from} ${y}H${to}m-5 -4l5 4l-5 4" fill="none" stroke="#354f44" stroke-width="1.5"/>`;
  const grid = (x,y,rows,columns,size,fill) => Array.from({length:rows},(_,row)=>
    Array.from({length:columns},(_,col)=>cell(x+col*size,y+row*size,size,size,fill)).join('')).join('');
  const whole = '#dceadf', part = '#a9c8b4';
  const shapes = {
    紅圓: '<circle cx="0" cy="0" r="8" fill="#d95454"/>',
    藍方: '<rect x="-8" y="-8" width="16" height="16" fill="#5a9bd5"/>',
    黃三角: '<path d="M0 -9L9 7H-9Z" fill="#edc854"/>',
    綠星: '<path d="M0 -9L2.7 -3L9 -3L4 1L6 8L0 4L-6 8L-4 1L-9 -3L-2.7 -3Z" fill="#7bb264"/>'
  };
  const patternLabels = {紅圓:['紅色','圓形'],藍方:['藍色','正方形'],黃三角:['黃色','三角形'],綠星:['綠色','星形']};
  const make = {
    cards: s => cardRows(s.values,false),
    series: s => cardRows(s.values,true),
    pattern: ({values}) => {
      const columns=5,width=56,height=50;
      const body=values.map((value,index)=>{
        const x=12+index%columns*width,y=4+Math.floor(index/columns)*height;
        const shape=shapes[value];
        return cell(x,y,width-5,height-4,'#fff')+(shape
          ? `<g transform="translate(${x+25.5} ${y+12})" stroke="#354f44">${shape}</g>`+patternLabels[value].map((label,line)=>text(x+25.5,y+29+line*12,label,10,47)).join('')
          : text(x+25.5,y+25,'？',16));
      }).join('');
      return [body,Math.ceil(values.length/columns)*height+4,'從左到右、由上到下看圖卡，問號是待補的一格'];
    },
    timeline: ({start,end}) => {
      const body=cell(14,8,73,38,whole)+cell(213,8,73,38,whole)+text(50.5,32,start)+text(249.5,32,end)
        +arrow(92,207,30)+text(150,22,'經過多久？',13);
      return [body,55,'箭頭指出從開始到結束的方向，長度不代表時間'];
    },
    multipliers: ({start,factors}) => {
      const body=cell(7,21,63,38,whole)+cell(119,21,62,38,whole)+cell(230,21,63,38,whole)
        +text(38.5,37,'小兔',12)+text(38.5,52,start,13)+text(150,44,'小熊')+text(261.5,44,'小鹿')
        +arrow(73,116,43)+arrow(184,227,43)+text(94.5,34,'×'+factors[0],12)+text(205.5,34,'×'+factors[1],12);
      return [body,67,'從小兔出發，沿箭頭讀取每一步的倍數'];
    },
    table: ({rows}) => {
      const width = 276 / rows[0].length;
      return [rows.map((row,i)=>row.map((value,j)=>{
        const x=12+j*width,y=4+i*24;
        return cell(x,y,width,24,i===0?whole:'#fff')+text(x+width/2,y+17,value,15,width-8);
      }).join('')).join(''),rows.length*24+8,'以橫列與直欄排列的資料表'];
    },
    area: ({rows,columns,half}) => {
      const size=15,x0=24,y0=7;
      let body=grid(x0,y0,rows,columns,size,whole);
      const right=x0+columns*size,left=x0-size;
      for(let i=0;i<half;i++){
        const y=y0+Math.floor(i/2)*size;
        const x=i%2?right:left;
        const inner=i%2?x:x+size,outer=i%2?x+size:x;
        body+=cell(x,y,size,size)+`<path d="M${inner} ${y}V${y+size}H${outer}Z" fill="${whole}" stroke="#354f44"/>`;
      }
      return [body,rows*size+14,'每個小方格代表一平方公分，三角形表示半格'];
    },
    rearrangedArea: ({rows,columns}) => {
      const size=13,split=Math.floor(columns/2),other=columns-split,x1=23,x2=186,y=23;
      const body=grid(x1,y,rows,split,size,whole)+grid(x1+split*size,y,rows,other,size,'#c8deee')
        +`<path d="M${x1+split*size} ${y-2}v${rows*size+4}" stroke="#284743" stroke-width="2" stroke-dasharray="3 2"/>`
        +grid(x2,y,rows,split,size,whole)+grid(x2+split*size,y+size,rows,other,size,'#c8deee')
        +text(x1+columns*size/2,16,'切開前',13)+text(x2+columns*size/2,16,'重拼後',13)+arrow(126,169,y+rows*size/2);
      return [body,y+(rows+1)*size+7,'兩塊沿虛線切開，移動後仍沒有重疊或空隙'];
    },
    bars: ({denominator,selected,labels}) => {
      const width=212/denominator;
      const body=selected.map((count,row)=>{
        const y=6+row*28;
        return text(39,y+15,labels[row],12,66)+Array.from({length:denominator},(_,i)=>
          cell(74+i*width,y,width,20,i<count?part:'#fff')).join('');
      }).join('');
      return [body,selected.length*28+6,'每排是一個相同大小的整體，塗色表示題目給定的部分'];
    },
    unitFractions: ({denominator,count}) => {
      const width=Math.min(212/denominator,(212-6*(count-1))/count);
      const body=text(42,22,'一個整體',13)+text(42,50,'要合起來',13)
        +Array.from({length:denominator},(_,i)=>cell(74+i*width,7,width,20,i===0?part:'#fff')).join('')
        +Array.from({length:count},(_,i)=>cell(74+i*(width+6),35,width,20,part)).join('');
      return [body,62,'上排顯示整體與其中一份，下排是要合起來的同樣大小小份'];
    },
    decimalParts: ({ones,tenths}) => {
      const size=15;
      const body=Array.from({length:ones},(_,row)=>
        text(46,18+row*19,'一整條',12)+grid(82,6+row*19,1,10,size,whole)).join('')
        +text(46,ones*19+19,'十分之一小格',12)
        +Array.from({length:tenths},(_,i)=>cell(88+i*19,ones*19+7,size,size,'#c8deee')).join('');
      return [body,ones*19+29,'一整條代表 1，每個分開的小格代表 0.1'];
    },
    ticks: ({labels,pointer}) => {
      let body='<path d="M35 38H265" stroke="#354f44"/>';
      for(let i=0;i<=5;i++)body+=`<path d="M${35+46*i} 29v14" stroke="#354f44"/>`;
      const x=35+46*pointer;
      body+=`<path d="M${x-6} 9h12l-6 19z" fill="#3b7058"/>`+text(35,60,labels[0]+' g',13)+text(265,60,labels[1]+' g',13);
      return [body,66,'重量秤面的局部刻度，兩個標示值之間有五個相等的小格'];
    }
  };
  function cardRows(values,sequence) {
    const columns=Math.min(sequence?4:5,values.length),width=284/columns;
    const body=values.map((value,i)=>{
      const x=8+i%columns*width,y=5+Math.floor(i/columns)*32;
      const fontSize=Math.min(15,Math.floor((width-12)/Math.max(1,String(value).length)));
      return cell(x,y,width-6,26,sequence?'#eef5ef':['#e4f1e6','#faedc8','#deedf8'][i%3])+text(x+(width-6)/2,y+18,value,fontSize,width-12);
    }).join('');
    return [body,Math.ceil(values.length/columns)*32+4,sequence?'從左到右、由上到下排列的已知順序':'題目的已知數值與條件'];
  }
  function render(problem) {
    const draw=make[problem?.visual?.kind];
    if(!draw)return '';
    const [body,height,description]=draw(problem.visual);
    return `<figure class="ws-diagram" data-ws-figure="${esc(problem.id)}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 ${height}" role="img" aria-label="${description}">${body}</svg><figcaption>${description}</figcaption></figure>`;
  }
  function audit(problems) {
    return problems.map(problem=>({id:problem.id,sectionId:problem.sectionId,reviewed:!!render(problem),kind:problem.visual?.kind}));
  }
  return {render,audit};
})();
if(typeof window!=='undefined')window.WorksheetDiagrams=WorksheetDiagrams;
if(typeof module!=='undefined'&&module.exports)module.exports=WorksheetDiagrams;
