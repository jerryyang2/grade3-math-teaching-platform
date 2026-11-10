/* SVG objects carry the same quantities and relationships as the problem. */
(() => {
  'use strict';
  window.drawEarlyFigure=(v,svg,label,line,icon)=>{
    const tones=['#fff0c9','#e0f3d9','#dceff4','#fce1d7'];
    const rect=(x,y,w,h,fill,stroke='#5e735b',r=0)=>
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
    const cup=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M-8-9H8L5 9H-5Z" fill="#dbf5fb" stroke="#386e84"/><path d="M-6-2H6L4 8H-4Z" fill="#6abfd6"/></g>`;
    const object=(k,x,y,scale)=>k===5?cup(x,y):icon(k,x,y,scale);
    switch(v.kind){
      case 'earlyCards': {
        const w=276/v.values.length;
        return svg(85,v.values.map(pair=>pair.join(' ')).join('，'),v.values.map(([name,value],i)=>{
          const x=12+i*w,c=x+(w-6)/2;
          return rect(x,8,w-6,69,tones[i],'#5e735b',9)+icon(v.icons[i],c,23,.65)+label(c,49,name)+label(c,67,value);
        }).join(''));
      }
      case 'earlyGroups': {
        const rows=Math.ceil(v.values.length/4), cols=Math.ceil(v.values.length/rows), w=278/cols;
        const mixed=v.mixed?.flatMap((n,k)=>Array(n).fill(k));
        const h=72+(v.names?15:0);
        return svg(h*rows+8,'圖案各組數量：'+v.values.join('、')+(v.removed?'。每組畫叉 '+v.removed+' 個。':''),
          v.values.map((n,i)=>{
            const left=11+i%cols*w,y=5+Math.floor(i/cols)*h;
            const perRow=cols===1?10:cols===2?6:5;
            const gap=(w-12)/perRow;
            return rect(left,y,w-5,66,tones[i%4],'#a28050',10)+Array.from({length:n},(_,j)=>{
              const r=Math.floor(j/perRow),count=Math.min(n-r*perRow,perRow);
              const x=left+(w-5)/2+(j%perRow-(count-1)/2)*gap;
              const cy=y+(n<=perRow?33:Math.ceil(n/perRow)===2?19:15)+r*(Math.ceil(n/perRow)===3?18:25);
              return object(mixed?.[j]??v.icon,x,cy,Math.min(.85,gap/29))+
                (v.removed&&j>=n-v.removed?line(x-6,cy-6,x+6,cy+6,'#862637',2)+line(x+6,cy-6,x-6,cy+6,'#862637',2):'');
            }).join('')+(v.names?label(left+(w-5)/2,y+79,v.names[i]):'');
          }).join(''));
      }
      case 'earlyStrip': {
        let offset=0;
        const blocks=v.lengths.map((n,k)=>Array.from({length:n},()=>rect(36+19*offset++,35,19,22,tones[k],'#486759')).join('')).join('');
        return svg(70,'彩帶分成 '+v.lengths.join(' 和 ')+' 格。',icon(3,18,43,.75)+blocks);
      }
      case 'earlySolids': {
        const shapes=[
          '<circle cy="36" r="19" fill="#e9a762" stroke="#865342"/><path d="M-18 37Q0 19 18 35M0 17Q13 36 0 54M-18 37Q0 53 18 35" fill="none" stroke="#865342"/>',
          '<path d="M-17 25v22q17 15 34 0V25Z" fill="#a6d4c0" stroke="#476c5c"/><ellipse cy="25" rx="17" ry="7" fill="#d7efd6" stroke="#476c5c"/>',
          '<path d="M-23 27 12 27 22 19-13 19Z" fill="#f8d982" stroke="#85653b"/><path d="M-23 27v24h35V27Z" fill="#efa97c" stroke="#85653b"/><path d="M12 27 22 19v24l-10 8Z" fill="#d98a66" stroke="#85653b"/>'
        ];
        return svg(84,'圖中從左到右：'+v.order.map(i=>['球','罐子','鞋盒'][i]).join('、'),v.order.map((k,i)=>{
          const x=53+97*i;
          return rect(x-37,7,74,67,tones[i],'#a28a63',8)+`<g transform="translate(${x})">${shapes[k]}</g>`+label(x,69,['甲','乙','丙'][i]);
        }).join(''));
      }
      case 'earlyCalendar':
        return svg(105,`月曆的一部分，圈選 ${v.today} 日。`,
          ['一','二','三','四','五','六','日'].map((d,i)=>label(39+37*i,18,d)).join('')+
          Array.from({length:21},(_,i)=>{
            const x=21+i%7*37,y=24+Math.floor(i/7)*25;
            return rect(x,y,37,25,tones[Math.floor(i/7)],'#7e8e77')+label(x+18,y+17,i+1)+(i+1===v.today?`<ellipse cx="${x+18}" cy="${y+12}" rx="13" ry="10" fill="none" stroke="#9c442f" stroke-width="2"/>`:'');
          }).join(''));
      case 'earlyCoins': {
        const step=268/v.values.length;
        return svg(63,'錢幣面額：'+v.values.join('、')+' 元。',v.values.map((value,i)=>{
          const x=16+(i+.5)*step,fill=value===1?'#f5c69a':value===5?'#e0e9ee':'#ffda82';
          if(value>=100){
            const width=Math.min(step-4,54);
            return rect(x-width/2,9,width,40,'#efc5c2','#937246',3)+
              rect(x-width/2+3,13,width-6,32,'none','#b5837a',2)+label(x,33,value);
          }
          return `<circle cx="${x}" cy="29" r="${Math.min(step/2-2,22)}" fill="${fill}" stroke="#937246"/>`+label(x,33,value);
        }).join(''));
      }
      case 'earlyColumn': {
        const digits=(value,y)=>[...String(value).padStart(3,' ')].map((d,i)=>label(98+i*52,y,d)).join('');
        return svg(105,`定位板直式：${v.first} ${v.plus?'加':'減'} ${v.second}。`,
          ['百位','十位','個位'].map((d,i)=>rect(73+i*52,7,50,89,tones[i],'#b0a27a',4)+label(98+i*52,25,d)).join('')+
          digits(v.first,48)+digits(v.second,68)+label(57,68,v.plus?'＋':'－')+line(72,76,228,76)+icon(3,261,50,1));
      }
      case 'earlyBalance': {
        const [a,b]=v.leftLow?[53,29]:[29,53];
        return svg(101,'天平 '+(v.leftLow?'左':'右')+'邊較低。',
          '<path d="M150 35l-23 49h46Z" fill="#95c2ac" stroke="#557e65"/>'+line(68,a,232,b,'#825e3f',5)+
          [a,b].map((y,i)=>{
            const x=i?232:68;
            return line(x,y,x,y+15,'#845e42')+rect(x-20,y+15,40,9,'#f9d598','#845e42',3)+icon(3+i,x,y+6,.56)+label(x,y+41,['甲','乙'][i]);
          }).join(''));
      }
      case 'earlyFraction':
        return svg(16+38*v.parts.length,'等長餅乾條，分成 '+v.parts.join(' 和 ')+' 份，各畫出一份。',v.parts.map((n,r)=>{
          const y=9+r*38,w=226/n;
          return label(22,y+20,['甲','乙'][r])+Array.from({length:n},(_,i)=>
            rect(41+i*w,y,w,26,i?'#ffedc9':'#eba96e','#97683d',2)+(i?'':icon(2,41+w/2,y+12,.55))).join('');
        }).join(''));
      case 'earlyGrid':
        return svg(106,v.sizes.map(([w,h])=>w+' 欄 '+h+' 列').join('、'),v.sizes.map(([w,h],i)=>{
          const pitch=v.perimeter?9:17;
          const x=(v.perimeter?149:76+i*148)-w*pitch/2,y=15;
          return Array.from({length:w*h},(_,j)=>rect(x+j%w*pitch,y+Math.floor(j/w)*pitch,pitch,pitch,tones[(i+1)%4],'#577653')).join('')+
            (v.perimeter?label(150,y+h*pitch+16,w+' 公分')+icon(3,90,51,.8):label(x+w*pitch/2,88,['甲','乙'][i]));
        }).join(''));
      default: return '';
    }
  };
})();
