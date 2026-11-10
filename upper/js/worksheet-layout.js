/* 單張列印與本機彙整 PDF 共用的 A4 排字與分頁；所有座標以 pt 為單位。 */
(function(root){
  'use strict';
  const metrics=typeof module!=='undefined'&&module.exports?require('./worksheet-font-metrics.js'):root.WorksheetFontMetrics;
  const MM=72/25.4,W=210*MM,H=297*MM,M=10*MM,GAP=6*MM,CW=(W-2*M-GAP)/2,TOP=M+77,BOTTOM=H-M-48,CAP=BOTTOM-TOP,QUESTION_GAP=2*MM;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const width=(s,size,font='kai')=>[...String(s)].reduce((n,c)=>n+(metrics[font][c]??1)*size,0);
  function wrap(input,max,size,font='kai'){
    const tokens=String(input).replace(/➔/g,'→').match(/\s+|[（「【『(]*(?:[a-zA-Z0-9]+(?:[.,/-][a-zA-Z0-9]+)*|[^\s])[，。、；：？！）』」】,;:!?)]*/gu)||[];
    let line='',lines=[];
    for(let token of tokens){
      if(width(line+token,size,font)<=max){line+=token;continue;}
      if(line.trim()){lines.push(line.trimEnd());line='';}
      token=token.trimStart();
      for(const c of token){if(width(line+c,size,font)>max&&line){lines.push(line);line='';}line+=c;}
    }
    if(line.trim())lines.push(line.trimEnd());return lines.length?lines:[''];
  }
  const profiles=[
    {name:'標準',grid_mm:26,diagram_mm:24},
    {name:'圖文緊密',grid_mm:24,diagram_mm:22},
    {name:'緊密雙欄',grid_mm:22,diagram_mm:20,compact:true},
    {name:'長題雙欄',grid_mm:16,diagram_mm:18,compact:true}
  ];
  function question(p,number,review,profile,opts){
    const ops=[],inner=CW-4*MM,left=2*MM,leading=opts.language==='en'?1.22:profile.compact?1.24:1.35;let y=1.5*MM;
    const addText=(value,x,baseline,size=14,font='kai',color='#000')=>ops.push({type:'text',text:value,x,y:baseline,size,font,color,width:width(value,size,font)});
    const paragraph=(value,x,max,size=14,font='kai')=>{const lines=wrap(value,max,size,font);for(const l of lines){addText(l,x,y+size,size,font);y+=size*leading;}return lines;};
    const code=review?p.sectionTitle.split(' ')[0]:'';
    addText(opts.t(`第 ${number} 題`)+(code?' · '+code:''),left,y+11,code?9.5:11,'hei');
    const level=opts.t(p.taskKind || ['基礎觀念','熟練運算','生活應用'][p.level-1]);
    const answer=opts.t('答：____');addText(answer,left+inner-width(answer,10,'hei'),y+11,10,'hei');
    const heading=opts.t(`第 ${number} 題`)+(code?' · '+code:'');
    addText(level,left+(opts.language==='en'?width(heading,code?9.5:11,'hei')+6:code?80:47),y+10,opts.language==='en'?7:8.5,'hei');y+=14;
    paragraph(p.question,left,inner,opts.language==='en'?12:profile.compact?13:14);y+=profile.compact?3:4;
    if(opts.withIllustrations&&p.svg){
      const vb=p.svg.match(/viewBox="\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)"/);if(!vb)throw Error('Missing diagram viewBox '+p.id);
      const iw=Number(vb[3]),ih=Number(vb[4]),scale=Math.min(inner/iw,Math.max(profile.diagram_mm,p.svg.includes('data-division-bracket')?26:(opts.language!=='en'&&p.svg.includes('data-capacity-measures')&&p.sectionTitle.startsWith('7-2')?30:0))*MM/ih);
      ops.push({type:'diagram',id:p.id,svg:p.svg,x:left+(inner-iw*scale)/2,y:y+2,w:iw*scale,h:ih*scale});y+=ih*scale+3;
    }
    const optionSize=opts.language==='en'?10.5:profile.compact?11:12;
    const optionTexts=p.options.map((s,i)=>`(${'ABCD'[i]}) ${s}`);
    const optionLines=max=>optionTexts.map(s=>wrap(s,max,optionSize));
    const half=(inner-7)/2,columns=optionLines(half).every(lines=>lines.length*optionSize*leading<=32.5)?2:1;
    const ow=(inner-7)/columns,rows=optionLines(ow),rowHeights=[];
    for(let i=0;i<optionTexts.length;i+=columns)rowHeights.push(Math.max(...rows.slice(i,i+columns).map(l=>l.length*optionSize*leading))+2);
    const gridH=profile.grid_mm*MM;
    const grid=(x,top,w)=>{
      const gy=top+11;
      if(!opts.withGrid){ops.push({type:'rect',x,y:gy,w,h:gridH,stroke:'#999999',lineWidth:.35});return;}
      for(let j=0;j<=6;j++)ops.push({type:'line',x1:x+j*w/6,y1:gy,x2:x+j*w/6,y2:gy+gridH,stroke:'#999999',lineWidth:.35,dash:[1,2]});
      const gridRows=Math.max(3,Math.round(gridH/(8*MM)));
      for(let j=0;j<=gridRows;j++)ops.push({type:'line',x1:x,y1:gy+j*gridH/gridRows,x2:x+w,y2:gy+j*gridH/gridRows,stroke:'#999999',lineWidth:.35,dash:[1,2]});
    };
    for(let i=0;i<optionTexts.length;i+=columns){
      for(let j=0;j<columns&&i+j<optionTexts.length;j++){
        rows[i+j].forEach((line,k)=>addText(line,left+j*(ow+7),y+optionSize+k*optionSize*leading,optionSize));
      }
      y+=rowHeights[i/columns];
    }
    grid(left,y,inner);y+=gridH+13;
    const height=y+1.5*MM;
    return {id:p.id,number,height,ops:[{type:'rect',x:0,y:0,w:CW,h:height,rx:2.5,stroke:'#999999',lineWidth:.45},...ops]};
  }
  function columnHeight(questions) {
    return questions.reduce((height, item) => height + item.height, (questions.length - 1) * QUESTION_GAP);
  }
  function balancePage(questions,capacity) {
    return [2,3].map(split=>[questions.slice(0,split),questions.slice(split)])
      .map(columns=>({columns,heights:columns.map(columnHeight)}))
      .filter(item=>item.heights.every(height=>height<=capacity))
      .sort((a,b)=>Math.abs(a.heights[0]-a.heights[1])-Math.abs(b.heights[0]-b.heights[1]))[0]?.columns;
  }
  function plan(sheet,settings={}){
    const opts={t:s=>s,language:'zh-Hant',withGrid:true,withStamp:true,withIllustrations:true,studentName:'',date:'',...settings};
    if(sheet.problems.length!==10)throw Error('學習單必須包含十題：'+sheet.id);
    const pageBottoms=[H-M-14,opts.withStamp?BOTTOM:H-M-14];
    let pages,profile;
    for(profile of profiles){
      const questions=sheet.problems.map((p,i)=>question(p,i+1,sheet.review,profile,opts));
      const layouts=[balancePage(questions.slice(0,5),pageBottoms[0]-TOP),balancePage(questions.slice(5),pageBottoms[1]-TOP)];
      if(layouts.every(Boolean)){pages=layouts;break;}
    }
    if(!pages)throw Error('學習單需要重新調整版面：'+sheet.id);
    // 將每欄的剩餘高度平均加到各題作答區，選項置於題目下方。
    pages=pages.map((columns,i)=>columns.map(column=>{
      const extraHeight=Math.max(0,pageBottoms[i]-TOP-columnHeight(column))/column.length;
      return column.map(q=>question(sheet.problems[q.number-1],q.number,sheet.review,{
        ...profile,grid_mm:profile.grid_mm+extraHeight/MM
      },opts));
    }));
    const text=(s,x,y,size=10.5,font='hei',align='start')=>{const translated=opts.t(s),w=width(translated,size,font);return {type:'text',text:translated,x:x-(align==='middle'?w/2:align==='end'?w:0),y,size,font,width:w};};
    const results=pages.map((cols,i)=>{
      const pageBottom=pageBottoms[i];
      const ops=[
        {type:'text',text:'115年學習教室',x:M,y:M+9,size:9,font:'hei',width:width('115年學習教室',9,'hei')},
        text(`南一版三年級上學期數學 · 第 ${sheet.unitNumber} 單元：${sheet.unitTitle}`,W/2,M+24,opts.language==='en'?9:10.5,'hei','middle'),
        text(sheet.title+' · 共 10 題',W/2,M+41,12,'hei','middle')
      ];
      const name=opts.studentName||'____________',date=opts.date||opts.t('____ 年 ___ 月 ___ 日');
      // 教師輸入不經翻譯，並依可用寬度換行；預留每頁固定的欄位高度。
      const meta=opts.t('姓名：')+name+'　'+opts.t('日期：')+date;
      const metaWidth=W-2*M-135,metaSize=Math.min(9.5,metaWidth/Math.max(width(meta,1,'hei'),1));
      ops.push({type:'text',text:meta,x:M,y:M+57,size:metaSize,font:'hei',width:width(meta,metaSize,'hei')});
      ops.push(text(`本份第 ${i+1} / ${pages.length} 頁　得分：______`,W-M,M+57,9.5,'hei','end'));
      ops.push(text('圖依已知條件繪製；關係方框不按數量比例，測量示意圖請依標示判讀。',M,M+68,opts.language==='en'?7:8));
      ops.push({type:'line',x1:M,y1:M+73,x2:W-M,y2:M+73,lineWidth:.55,stroke:'#000'},{type:'line',x1:W/2,y1:TOP,x2:W/2,y2:pageBottom,lineWidth:.3,stroke:'#bbbbbb'});
      const bounds=[];
      cols.forEach((col,j)=>{
        let y=TOP;
        const x=M+j*(CW+GAP);
        for(const q of col){
          ops.push({type:'group',x,y,ops:q.ops});
          bounds.push({id:q.id,x,top:H-y,bottom:H-y-q.height,width:CW});
          y+=q.height+QUESTION_GAP;
        }
      });
      if(opts.withStamp&&i===pages.length-1){const y=H-M-44;ops.push({type:'rect',x:M,y,w:W-2*M,h:30,lineWidth:.5,stroke:'#999999'});ops.push(text('個別化支持紀錄（教師依實際提供的支持勾選）',M+5,y+8,9));
        ['學習內容：題意簡化、圖像提示','學習歷程：計算對齊、分段引導','學習環境：減少干擾、安心練習','學習評量：延長時間、報讀題目'].forEach((s,k)=>{const x=M+5+(k%2)*(W-2*M)/2,yy=y+12+Math.floor(k/2)*9;ops.push({type:'rect',x,y:yy,w:5,h:5,stroke:'#999999',lineWidth:.5},text(s,x+9,yy+5,opts.language==='en'?7:8.4));});}
      ops.push(text(`${i+1} / ${pages.length}`,W-M,H-M-3,8,'hei','end'));
      return {ops,questions:bounds,bottom:pageBottom};
    });
    return {id:sheet.id,width:W,height:H,profile,pages:results};
  }
  function svgPage(page){
    function render(op){
      if(op.type==='group')return `<g transform="translate(${op.x} ${op.y})">${op.ops.map(render).join('')}</g>`;
      if(op.type==='text')return `<text x="${op.x}" y="${op.y}"${op.font==='kai'?' data-reading-font="true"':''} font-family="${op.font==='kai'?'Kaiti TC, BiauKai, DFKai-SB, KaiTi, serif':'Heiti TC, Microsoft JhengHei, Arial, sans-serif'}" font-size="${op.size}" fill="${op.color||'#000'}"${op.width>0?` textLength="${op.width}" lengthAdjust="spacingAndGlyphs"`:''}>${esc(op.text)}</text>`;
      if(op.type==='diagram')return op.svg.replace('<svg ',`<svg x="${op.x}" y="${op.y}" width="${op.w}" height="${op.h}" `);
      const style=`fill="none" stroke="${op.stroke||'#999999'}" stroke-width="${op.lineWidth||.5}"${op.dash?` stroke-dasharray="${op.dash.join(' ')}"`:''}`;
      if(op.type==='rect')return `<rect x="${op.x}" y="${op.y}" width="${op.w}" height="${op.h}" rx="${op.rx||0}" ${style}/>`;
      return `<path d="M${op.x1} ${op.y1}L${op.x2} ${op.y2}" ${style}/>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" class="ws-page-art" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(page.questions.map(q=>q.id).join(', '))}">${page.ops.map(render).join('')}</svg>`;
  }
  const api={plan,svgPage,wrap,width,constants:{W,H,M,CW,TOP,BOTTOM,CAP,MM}};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WorksheetLayout=api;
})(typeof window!=='undefined'?window:globalThis);
