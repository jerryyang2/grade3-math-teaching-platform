/* 一、二年級：看圖、填空、生活應用、逆想與找錯。 */
(bank=>{
'use strict';
const {register,N,C,W,A,sign,cards,table,clock,pick}=bank;
const nums='甲乙丙丁';
const w=(t,a,v,r,...bad)=>W(t,a,r,bad,v);
const n=(t,a,v,r,...bad)=>N(t,a,r,bad,v);
const c=(t,a,v,r,...bad)=>C(t,a,bad,r,v);
const groups=(values,icon=2,names,removed)=>({kind:'earlyGroups',values,icon,names,removed});
const path=(...values)=>({kind:'firstPath',values});
const strip=(...lengths)=>({kind:'earlyStrip',lengths});
const pair=(a,b)=>({kind:'firstPairs',groups:[a,b]});
const frame=(...groups)=>({kind:'firstTenFrame',groups});
const coins=(...values)=>({kind:'earlyCoins',values});
const clk=(hour,minute)=>({kind:'clock',hour,minute});
const ruler=(start,end)=>({kind:'ruler',start,end});
const box=(first,second,plus)=>({kind:'earlyColumn',first,second,plus});
const set=(v,a,b)=>a+(v*5+Math.floor(v/2))%(b-a+1);
const earlyCount=(lo,hi)=>v=>{
  const a=set(v,lo,hi), b=a===hi?a-1:a+1, r=pick(['星星','蘋果','種子'],v);
  const icon=pick([2,0,1],v), g=groups([a],icon), p=path(a-1,'□',a+1);
  return [
    n(`盒裡有幾個${r}？`,a,g,'每個圖案只數一次，最後讀出的數就是個數。'),
    w(`要放跟這盒一樣多的貼紙，要拿幾張？`,a,g,'先點數圖中的東西，再拿相同張數。'),
    n(`數卡依序多 1。哪張卡放在空格？`,a,p,'在前一個數後面接著數 1。'),
    c(`哪一盤要再補 1 個，才和另一盤一樣多？`,a<b?'甲':'乙',groups([a,b],icon,['甲','乙']),'較少的一盤補 1 個，就和另一盤一樣多。',a<b?'乙':'甲','兩盤都要'),
    w(`把這一盒排成兩堆，一堆放 1 個。另一堆有幾個？`,a-1,g,'從全部拿出 1 個，剩下的是另一堆。')
  ];
};
const zero=v=>{
 const a=set(v,2,8), g=groups([0,a],v%3,['甲','乙']);
 return [
  n('看空盒。盒裡有幾個？',0,groups([0],v%3),'沒有東西，用 0 表示。'),
  w('盒裡的東西全送走了。盒裡還有幾個？',0,groups([a],v%3,undefined,a),'全部送走後，一個也沒有。',a,a-1),
  w('把兩盒的東西倒在一起，有幾個？',a,g,'空盒沒有增加數量，總數和乙盒一樣。'),
  c('哪盒不用再拿，就能在紀錄表填 0？','甲',g,'甲盒一開始就是空的。','乙','兩盒'),
  c('把左盤改記成 1，和圖相符嗎？','不相符',g,'甲盤是空的，不能寫成 1。','相符')];
};
const lengths=(angled=false)=>v=>{
 const a=set(v,4,8), b=a-1-v%2, g={kind:'firstRibbons',lengths:v%2?[b,a]:[a,b],starts:[v%3,2-v%3]};
 const longer=v%2?'乙':'甲', shorter=v%2?'甲':'乙', trail={kind:'firstTrail',bent:v%2,curve:10+v};
 const compare=c(angled?'哪一條是曲線？':'兩條紙帶，哪一條比較長？',angled?nums[v%2]:longer,angled?trail:g,angled?'彎彎的線是曲線。':'先對齊一端，再比較另一端；也可比較格數。',angled?nums[1-v%2]:shorter,'一樣');
 return [
  compare,
  c(angled?'要走直直的路，走哪一條？':'把兩條紙帶的左端對齊後，哪一條的右端伸得比較遠？',angled?nums[1-v%2]:longer,angled?trail:g,'從同一起點比較，直路沒有彎曲；紙帶則看哪條伸得更遠。',angled?nums[v%2]:shorter,'都一樣'),
  w('比較兩條一格一格的紙帶。短的還要接幾格才和長的一樣？',a-b,g,'把等長的格子一一配對，剩下的格子就是相差。'),
  c(`兩條紙帶左端${v%3===1?'已經':'還沒'}對齊。比長短前，先確認什麼？`,'左端對齊',g,'先確認同一起點，再比另一端。','放得高就長','只看右端，不管起點'),
  w('把長紙帶剪成和短紙帶一樣長，剪掉幾格？',a-b,g,'長的格數減去短的格數。')];
};
const parts=(ten=false)=>v=>{
 const a=ten?10:set(v,5,9), b=set(v,2,a-2), d=a-b, diagram={kind:'firstParts',whole:a,left:b};
 return [
  n('看分合圖。右邊那堆有幾顆？',d,diagram,'全部分成兩堆，從全部扣掉左邊的數。'),
  w('把兩盤合起來，會有幾個？',a,groups([b,d],v%3),'把兩盤都數進去，才是合起來的數。'),
  w('兩盤已合起來。拿走右盤原有的數量，會剩幾個？',b,groups([b,d],v%3,['左盤','右盤']),'右盤的都拿走，留下左盤。'),
  c(`原有 ${a} 顆，甲盤放 ${b} 顆。哪個說法正確？`,`乙盤放 ${d} 顆`,diagram,'兩盤合起來必須剛好是全部。',`乙盤放 ${d+1} 顆`,`乙盤放 ${d-1} 顆`),
  w('再看分合圖。如果左邊少放 1 顆、全部不變，右邊要放幾顆？',d+1,diagram,'左邊少 1 顆，右邊就要多 1 顆。')];
};
const order=v=>{
 const a=set(v,6,9), j=set(v,1,a-2), right=a-j, g={kind:'firstQueue',count:a,index:j};
 return [n('從左邊數，星星在第幾隻上面？',j+1,g,'左邊第一隻算第 1 隻。'),
 w('改從右邊數，星星在第幾隻上面？',right,g,'起點換到最右邊，沿著隊伍數到星星。'),
 w('星星的左邊還有幾隻？',j,g,'只數星星左邊的，不把星星那隻算進去。'),
 c(`有 ${a} 隻。星星向左移一位，從左數的序號會怎樣？`,'少 1',g,'往左走一位，離左端更近。','多 1','不變'),
 w('星星右邊又排進 1 隻。從右數，星星現在是第幾隻？',right+1,g,'右端多了 1 隻，從右邊要多數 1 隻才到星星。')];
};
const howMany=v=>{
 const a=set(v,4,8), b=v%2?a+1:a-2, g=pair(a,b), greater=a>b?'甲':'乙', less=a>b?'乙':'甲';
 return [c('把圖案一一配對，哪一排比較多？',greater,g,'配完後還有剩的那排比較多。',less,'一樣多'),
 w('兩排的數量相差幾個？',Math.abs(a-b),g,'配對後，多出來的個數就是相差。'),
 w(`${less}排要再放幾個，才和另一排一樣多？`,Math.abs(a-b),g,'把少的補到跟多的一樣。'),
 c(`${greater}排拿走所有沒配到的圖案。兩排會怎樣？`,'一樣多',g,'留下的圖案都能一一配成對。','甲較多','乙較多'),
 w(`${less}排增加到和另一排一樣多後，再加 1 個。現在有幾個？`,Math.max(a,b)+1,g,'先補到一樣多，再往下數 1 個。')];
};
const place=(lo,hi,step=1)=>v=>{
 const a=set(v,lo,hi-Math.max(3*step,hi===30?1:10)), p=10*Math.floor(a/10), h=Math.floor(a/100);
 const digits=[['百位',h],['十位',Math.floor(a/10)%10],['個位',a%10]];
 const data=hi>100?cards(...digits):cards(...digits.slice(1));
 const card=hi<=30?{kind:'firstPlace',bundles:p/10,ones:a%10}:data;
 return [
  n(hi===30?'整捆和散根合起來，有幾根？':'把各位上的數量合起來，是多少？',a,card,hi===30?'一捆算 10 根，先數整捆，再加沒有綁起來的根數。':hi<=100?'先數幾個十，再加幾個一。':'把百、十、個各自代表的數量合起來。'),
  w(`從 ${a} 開始，每次多 ${step}，第二個空格是多少？`,a+2*step,path(a,'□','□',a+3*step),'從第一個數連續往後數兩次。'),
  w(`${a} 再添${hi===30?'一根':'一個十'}，是多少？`,a+(hi===30?1:10),card,hi===30?'添一根就比原來多 1。':'增加一個十，數值就增加 10。'),
  sign(`在 ${a} 和 ${a+1+v%2} 之間填哪個符號？`,a,a+1+v%2,'先比最高位，相同才往下一位。',path(a,'□',a+1+v%2)),
  w('從圖中的數拿掉全部個位的小物，剩多少？',p,card,'只拿掉個位的量，其餘位值不動。')];
};
const add=(teen=false,flip=false)=>v=>{
 const a=teen?set(v,7,9):set(v,3,6), b=teen?set(v+1,4,9):set(v+1,2,10-a), total=a+b;
 const g=groups([a,b],v%3), fill=10-a;
 return [
  n(teen?'先把第一盤湊成 10，兩盤共有幾個？':'看兩盤，合起來有幾個？',total,g,teen?`先從第二盤搬 ${fill} 個湊成 10，再加剩下的。`:'把兩盤的數量合起來。'),
  w(`有 ${a} 張貼紙，又拿到 ${b} 張。現在有幾張？`,total,g,'「又拿到」讓原有數量增加。'),
  w(`兩盒共 ${total} 張，左盒有 ${a} 張。加法算式 ${a}＋□＝${total}，□填幾？`,b,cards(['左盒',a],['兩盒',total]),'從已知的一盒往上數到全部。'),
  c(`${a}＋${b} 和 ${b}＋${a}，哪一句對？`,'兩個算式的和一樣',g,'把兩組交換位置，全部的數沒有改變。','第一個和比較大','第二個和比較大'),
  flip&&teen?w(`心算 ${a}＋${b} 時，先把 ${a} 湊成 10。第二個加數還剩幾個沒用？`,b-fill,cards(['先算',a+'＋'+fill],['原加數',b]),'用第二個加數減去搬去湊十的部分。'):
       w(`同樣兩盤，把第二盤少放 1 個。合起來有幾個？`,total-1,g,'其中一盤少 1，合起來也少 1。')];
};
const take=(teen=false,mix=false)=>v=>{
 const a=set(v,teen?12:6,teen?18:10), b=set(v,2,teen?8:5), d=a-b;
 const g=groups([a],v%3,undefined,b), values=cards(['原來',a],['移走',b],['剩下','？']);
 return [
  n('畫叉的都拿掉，沒畫叉的有幾個？',d,g,'只數留下來的圖案。'),
  w(`原有 ${a} 張卡，送出 ${b} 張，還有幾張？`,d,values,'從原來的張數扣掉送出的張數。'),
  w(`原有 ${a} 枝筆，現在剩 ${d} 枝。送出了幾枝？`,b,cards(['原有',a],['剩下',d]),'從原來的數扣掉剩下的數，才是送掉的數。'),
  c(`現在有 ${d} 張，再收到 ${b} 張。應用哪個算式算現在的總數？`,`${d}＋${b}`,cards(['原有',d],['收到',b]),'「再收到」是合起來。',`${d}－${b}`,`${a}－${b}`),
  mix?w(`想把 ${d} 張補回 ${a} 張，已先補 1 張。還要補幾張？`,b-1,values,'先求總共要補幾張，再扣掉已補的 1 張。'):
      w(`心算 ${a}－${b}。如果少拿走 1 個，會留下幾個？`,d+1,g,'拿走的少 1，留下來的就多 1。')];
};
const shape=(mode=0)=>v=>{
 const order=Array.from({length:4},(_,i)=>(i+v)%4), target=v%4;
 const name=['三角形','正方形','長方形','圓形'], features=['三條直邊','四條等長的直邊','四個角、長和寬不同','沒有直邊也沒有角'];
 const g={kind:'firstShapes',order,angle:8+7*v}, label=k=>nums[order.indexOf(k)];
 const card=label(target), others=[...nums].filter(x=>x!==card);
 return [
  c(`哪一張圖卡是${name[target]}？`,card,g,'轉方向之後，形狀的特徵不變。',...others),
  c(`哪一張圖卡的特徵是「${features[(target+1)%4]}」？`,label((target+1)%4),g,'沿著圖形一圈，檢查直邊和角。',...[...nums].filter(x=>x!==label((target+1)%4))),
  w(`${label(0)}卡和${label(1)}卡的直邊合起來有幾條？`,7,g,'三角形有 3 條，正方形有 4 條。'),
  c(`把${card}卡轉半圈後，哪個敘述對？`,'還是同一種形狀',g,'轉動會改變方向，邊長和角不會改變。','少了一個角','邊變長了'),
  mode===2?c(`手指沿${label(3)}卡的周界走一圈，走的是哪裡？`,'沿著外邊',g,'周界就是圖形最外面圍起來的線。','穿過裡面','停在圓心'):
  w(`如果移走${label(3)}卡，還剩幾張有直邊的圖卡？`,3,g,'剩下的三種形狀都有直邊。')];
};
const solids=(rectOnly=false)=>v=>{
 const order=Array.from({length:3},(_,i)=>(v+(v%2?2:1)*i)%3), g={kind:'earlySolids',order};
 const l=i=>nums[order.indexOf(i)], answer=i=>[...nums.slice(0,3)].filter(a=>a!==l(i));
 const faces=cards(['長盒',v%2?'鞋盒':'餅乾盒'],['方盒',v%2?'方積木':'骰子']);
 if(rectOnly)return [
  c('哪個物品最像長方體？',l(2),g,'鞋盒有平的面，像長方體。',...answer(2)),
  w('長方體盒子翻過去，平平的面仍有幾個？',6,faces,'轉動不會改變面數；上、下、前、後、左、右共 6 個。'),
  w(`拿 ${2+v%3} 個正方體，每個各選一個面印章，共印幾次？`,2+v%3,faces,'每個正方體印 1 次。'),
  c('長方體和正方體，哪個頂點數比較多？','一樣多',faces,'兩種形體都有 8 個頂點。','長方體','正方體'),
  c('方盒每一面都一樣大又是正方形。最適合叫什麼？','正方體',faces,'正方體的每個面都是同樣大的正方形。','球','圓柱')];
 return [
  c('哪個物品放在桌上，最容易往各個方向滾？',l(0),g,'球沒有平的面，可以往各個方向滾。',...answer(0)),
  c('哪個物品有平平的圓面，也有彎彎的面？',l(1),g,'罐子有圓形平面和彎彎的側面。',...answer(1)),
  c('想疊兩個一樣的物品，哪一種有上下平面而且不會滾？',l(2),g,'鞋盒上下都是平面，也沒有圓弧側面。',...answer(2)),
  c(`把${l(1)}物品放倒，能沿著彎彎的面滾動嗎？`,'能',g,'罐子倒下後可沿曲面滾動。','不能'),
  c(v%2?'找出有平面，放倒也不會滾的物品。':'哪個物品的表面全是平的？',l(2),g,'鞋盒的面都是平面。',...answer(2))];
};
const time=(half=false,second=false,elapsed=false)=>v=>{
 const h=1+v%9, m=second?10+v%7*5:half?30:0, x=h*60+m;
 const show=mins=>second?clock(mins):`${Math.floor(mins/60)} 點${mins%60?'半':''}`;
 const delta=second?5+5*(v%3):30;
 if(elapsed){
  const span={kind:'time',start:clock(x),end:clock(x+delta)};
  return [
   n('看時間線，從起點到終點經過幾分鐘？',delta,span,'從起點每次數 5 分鐘，到終點為止。'),
   w(`活動延長 5 分鐘。這次一共經過幾分鐘？`,delta+5,span,'原本經過的時間再加 5 分鐘。'),
   A(`從起點開始，提早 5 分鐘結束，是幾時幾分？`,clock(x+delta-5),[clock(x+delta),clock(x+delta+5)],'在終點往回數 5 分鐘。',span),
   c('如果兩個時刻一起往後移 5 分鐘，間隔會怎樣？','不變',span,'起點、終點移動同樣多，兩者的距離不變。','多 5 分鐘','少 5 分鐘'),
   w(`活動從 ${clock(x)} 開始，休息 5 分鐘再繼續做 ${delta} 分鐘，共經過幾分鐘？`,delta+5,cards(['休息','5 分'],['活動',delta+' 分']),'兩段經過的時間加起來。')];
 }
 const image=clk(h,m);
 return [
  c('看鐘面，現在是什麼時刻？',show(x),image,'先找短針，再從 12 開始讀長針。',show(x+delta),show(x+60)),
  A(`讓鐘面上的時間往後走到下一個整點，應記成什麼時刻？`,show((h+1)*60),[show(x),show((h+2)*60),show((h+1)*60+30)],'從現在的時刻往後找，下一個整點是下一小時。',image),
  c(`同一天上午，圖上的時刻和 ${show(x+delta)} 相比，誰先？`,'鐘面上的時刻',image,'從鐘面的時刻往後走，才會到題目說的另一個時刻。','題目說的另一個時刻','同時'),
  c(`長針在圖上的位置。只看長針，能知道是幾時嗎？`,'不能',image,'長針表示分鐘，還要看短針才知道小時。','能'),
  A(`鐘面上的時刻再往後走${second?delta+'分鐘':'半小時'}，會到什麼時刻？`,show(x+delta),[show(x),show(x+delta+60)],'沿時間向後走，跨過整點時小時要換到下一個。',image)];
};
const measure=(mode=0)=>v=>{
 const a=set(v,4,8), b=1+v%3, start=1+v%3, end=start+a, both=strip(a,b);
 const len=mode===2?ruler(start,end):strip(a);
 return [
  n(mode===2?'線段沒有從尺的 0 開始。它長幾公分？':'看方格量一量。這一段長幾格？',a,len,mode===2?'終點刻度減起點刻度。':'數兩端之間占了幾個格子。'),
  w(mode===2?`線段從 ${start} 公分刻度開始。把終點往右移 ${b} 公分，線段長幾公分？`:'把兩段紙帶接起來，一共幾格？',a+b,mode===2?len:both,'原長再加接長的部分。'),
  w(mode===2?`要從 ${start} 的刻度畫 ${b} 公分長的線，終點刻度是多少？`:'照圖剪掉右邊那段，左邊還剩幾格？',mode===2?start+b:a,mode===2?ruler(start,end):both,mode===2?'從起點刻度加上要畫的長度。':'右邊那段剪掉了，數一數左邊留下幾格。'),
  c(mode===2?`量這條線時，有人把終點 ${end} 直接當長度。哪一步漏了？`:'用小紙片量桌邊，哪種排法正確？',mode===2?'減去起點刻度':'排緊、不重疊',len,'量的是兩端之間的距離。',mode===2?'加上起點刻度':'留空隙',mode===2?'改讀尺的最末端':'疊起來'),
  w(mode===2?`要讓線段長度不變，起點右移 ${b} 公分，終點應到哪個刻度？`:'兩段接起來後，還要補幾格才會長一格？',mode===2?end+b:1,mode===2?len:both,'兩個端點一起移動同樣多，長度不變；補一格只會長一格。')];
};
const calendar=(long=false)=>v=>{
 const d=8+v%8, add=2+v%3, g={kind:'earlyCalendar',today:d};
 return [
  n('圈圈是今天。昨天是幾日？',d-1,g,'昨天在今天的前一格。'),
  w(`從圈出的日期往後 ${add} 天，是幾日？`,d+add,g,'手指往後走，每走一格算 1 天。'),
  w('上個星期的同一天是幾日？',d-7,g,'在同一欄往上一列，差 7 天。'),
  c(`從 ${d} 日辦到 ${d+add} 日，開始和結束那天都算在內。計數要從哪一天開始？`,`${d} 日`,g,'活動第一天也包含在天數裡。',`${d+1} 日`,`${d+add} 日`),
  long?w(`美術課連續上 ${1+v%3} 年又 ${add} 個月，共幾個月？`,(1+v%3)*12+add,cards(['1 年','12 個月'],['加上',add+' 個月']),'一年有 12 個月，先算整年再加其他月份。'):
      w(`從 ${d} 日到 ${d+add} 日每天打勾，頭尾都算。要打幾個勾？`,add+1,g,'從起日開始數，終日也算一次。')];
};
const money=(hundred=false,pay=false)=>v=>{
 const a=set(v,2,5), b=v%4+1, unit=hundred?100:10, small=hundred?10:1;
 const amount=a*unit+b*small, g=coins(...Array(a).fill(unit),...Array(b).fill(small));
 return [
  n('看圖，這些錢合起來幾元？',amount,g,'先數大面額，再加上小面額。'),
  w(hundred?`拿走一張 ${unit} 元紙鈔，還剩幾元？`:`拿走一枚 ${unit} 元硬幣，還剩幾元？`,amount-unit,g,'從總金額扣掉拿走的面額。'),
  w(hundred?`把圖中一張 ${unit} 元紙鈔換成 ${small} 元硬幣。可以換幾枚？`:`把圖中一枚 ${unit} 元硬幣換成 ${small} 元硬幣。可以換幾枚？`,unit/small,g,'換錢時總金額不能變。'),
  c(`買 ${amount+small} 元的東西，圖裡的錢夠不夠？`,'不夠',g,'持有的總額比價錢少。','夠','剛好'),
  w(pay?`拿圖上的錢買 ${amount-small} 元的東西。會剩幾元？`:hundred?`再補一張 ${unit} 元紙鈔和一枚 ${small} 元硬幣。共幾元？`:`再補一枚 ${unit} 元和一枚 ${small} 元硬幣。共幾元？`,
    pay?small:amount+unit+small,g,pay?'先合出持有的錢，再減掉價錢。':'把增加的兩個面額都加進去。')];
};
const columns=(minus=false,large=false,estimate=false)=>v=>{
 const a=(large?235:24)+3*v, b=(large?137:17)+v, total=minus?a-b:a+b, g=box(a,b,!minus);
 const op=minus?'－':'＋', rev=minus?'＋':'－', value=estimate?(Math.round(a/100)-Math.round(b/100))*100:total;
 return [
  n(estimate?'把兩個數各估成最接近的整百，再相減。大約相差多少？':'看直式，答案是多少？',value,estimate?cards(['第一箱',a],['第二箱',b]):g,
    estimate?'各自找到較近的整百，再把兩個整百數相減。':'個位對個位、十位對十位。'),
  w(minus?`有 ${a} 張入場券，已用 ${b} 張。還有幾張？`:`上午收到 ${a} 張卡，下午收到 ${b} 張。合起來幾張？`,total,cards(['先有',a],['改變',b]),minus?'用總數減掉用掉的。':'用加法把兩段的張數合起來。'),
  w(`${a} ${op} □＝${total}，空格填幾？`,b,path(a,op,'□','＝',total),'找出原來的量和算完的量差多少。'),
  c(`用哪個算式檢查 ${a} ${op} ${b}＝${total}？`,`${total} ${rev} ${b}`,g,'用相反的運算算回原來的數。',`${total} ${op} ${b}`,`${total} ${rev} ${a}`),
  w(`算完才發現第二個數要多 1。正確答案是多少？`,total+(minus?-1:1),g,minus?'減掉的數多 1，答案少 1。':'加的數多 1，答案也多 1。')];
};
const classify=v=>{
 const a=set(v,3,6),b=set(v+1,2,5),d=2+v%3;
 const g={kind:'earlyGroups',values:[a+b+d],mixed:[a,b,d],icon:0};
 const t=table(['圖案','蘋果','種子','星星'],['個數',a,b,d]);
 return [
  n('只數蘋果，不數別的。蘋果有幾個？',a,g,'按圖案分類，只記蘋果。'),
  w('看統計表，種子和星星合起來有幾個？',b+d,t,'把這兩類的個數合起來。'),
  w('看圖，把所有種類都記上。總共要記幾次？',a+b+d,g,'每個圖案只記一次。'),
  c('同一顆種子在表上記了兩次，應該怎麼修正？','種子少記 1 次',t,'每一顆只能記一次，多的記號要擦掉。','蘋果多記 1 次','種子再記 1 次'),
  w('如果再放 2 顆星星，表裡星星要改寫成幾個？',d+2,t,'只改星星那一格，原有個數加 2。')];
};
const mass=(weight=false)=>v=>{
 const a=3+v%5,b=1+v%3, big=v%2?'甲':'乙', small=v%2?'乙':'甲';
 const data=v%2?[a+b,a]:[a,a+b];
 const g=weight?cards(['甲',data[0]+' 個'],['乙',data[1]+' 個']):groups(data,5,['甲壺','乙壺']);
 const objects=weight?'同樣重的積木':'同樣大的小杯';
 const balance={kind:'earlyBalance',leftLow:v%2};
 return [
  c(weight?'用同樣重的積木量過，哪個物品較重？':'兩個壺倒滿同樣的小杯，哪個壺裝得多？',big,g,`需要較多${objects}的那個比較${weight?'重':'大'}。`,small,'一樣'),
  w(`${big}比${small}多用幾${weight?'個積木':'杯水'}？`,b,g,'用較大的數減較小的數。'),
  w(`兩個物品的測量結果合起來是幾${weight?'個積木':'杯水'}？`,a*2+b,g,'把甲、乙的數量合起來。'),
  c(weight?'天平往下的一邊，哪個物品較重？':'甲用大杯量、乙用小杯量。只比杯數能知道哪壺容量大嗎？',weight?big:'不能',weight?balance:g,
    weight?'天平較低的一邊較重。':'比較容量時，兩邊必須用同樣大的杯子。',weight?small:'能'),
  w(`把${small}的測量數量增加到和${big}相同，還要再加幾${weight?'個積木':'杯水'}？`,b,g,'從較小的量補到較大的量。')];
};
const twoSteps=(mode=0)=>v=>{
 const a=set(v,24,39), b=set(v,4,9), d=set(v+1,2,7), plus=mode===0||v%2;
 const change=plus?b:-b, total=a+change-d, g=cards(['原有',a],[plus?'放進':'送出',b],['再送出',d]);
 return [
  n('照圖做完第一步，先有幾張？',a+change,g,'先看第一個變化是增加還是減少。'),
  w('照圖做完兩步，最後剩幾張？',total,g,'先算第一步的結果，再減去第二次送出的數。'),
  w(`活動後剩 ${total} 張。送出最後一批之前有幾張？`,a+change,g,'把最後送出的量加回去，回到前一步。'),
  c('如果第二步沒有送出，改成送進，最後會比原本多還是少？','多',g,'原本扣掉的改成加進來，最後的量會增加。','少','一樣'),
  w('第二次比圖上多送出 1 張。最後還有幾張？',total-1,g,'只改第二步，多送出 1 張就少剩 1 張。')];
};
const times=(factor)=>v=>{
 const a=factor===-1?v%2:factor, b=set(v,2,8), p=a*b, g=groups(b<=4&&a<=8?Array(b).fill(a):[a,a,a],v%3);
 const all=b<=4&&a<=8?g:cards(['每盒',a],['盒數',b],['合計','？']);
 const sample=cards(['每份',a],['份數',b+1]);
 return [
  n(`每盒 ${a} 個，有 ${b} 盒。共有幾個？`,p,all,'每一盒一樣多，用每盒個數乘盒數。'),
  w(`再添一盒，每盒還是 ${a} 個。合起來幾個？`,a*(b+1),sample,'組數多一組，總數多一個「每盒的個數」。'),
  w(`兩張訂單分別有 ${b} 盒和 1 盒，每盒 ${a} 個。大單比小單多幾個？`,a*(b-1),all,'盒數相差幾盒，就相差幾個同樣大小的組。'),
  c(`${a}＋${a}…連加 ${b} 次。要改用乘法，哪個算式符合題意？`,`${a}×${b}`,all,'每組有相同的量，乘號後面記組數。',`${a}＋${b}`,`${a}×${b+1}`),
  w(`原有 ${b} 盒，每盒 ${a} 個。拿走兩盒，還有幾個？`,a*(b-2),all,'先算還有幾盒，再用每盒個數乘盒數。')];
};
const meters=(use=false)=>v=>{
 const a=2+v%5,b=30+v%12*5,d=80-v%12*2;
 const g=cards(['甲繩',a+' 公尺'],['乙繩',b+' 公分']);
 return [
  n(use?'把甲、乙兩段相接，共幾公分？':'1 公尺等於幾公分？',use?a*100+b:100,g,'先用每公尺等於 100 公分，把單位統一。'),
  w(`${a} 公尺和 ${b} 公分相比，長的比短的多幾公分？`,a*100-b,g,'先把甲繩換成公分，再相減。'),
  w(`甲繩剪掉 ${d} 公分，還剩幾公分？`,a*100-d,cards(['甲繩',a+' 公尺'],['剪下',d+' 公分']),'先換成公分，再扣掉剪掉的長度。'),
  c(`要寫出教室門的高度約 ${a>3?2:a}，哪個單位最合理？`,'公尺',g,'門的高度適合用公尺表示。','公分','公克'),
  w(`把甲繩再接 ${100-b} 公分和乙繩，合起來正好幾公尺？`,a+1,g,'兩段短繩合起來是 100 公分，也就是 1 公尺。')];
};
const groupSteps=(before=false)=>v=>{
 const a=4+v%4,b=3+v%4,d=2+v%2;
 const g=cards(['每盤',a],['盤數',b],['變動',d]);
 return [
  n(before?'每盤先放圖上那麼多，再各添指定的數量。一盤現在有幾個？':'各盤一樣多，還沒有增減時，全部有幾個？',before?a+d:a*b,g,'先讀每盤、盤數和每次改變的量。'),
  w(before?`${b} 盤原有每盤 ${a} 個，每盤再放 ${d} 個。共有幾個？`:`${b} 盤各有 ${a} 個，盤外另有 ${d} 個。共有幾個？`,before?(a+d)*b:a*b+d,g,before?'先加出一盤的個數，再乘盤數。':'先乘出盤內總數，再加盤外的。'),
  w(before?`每盤先吃掉 ${d} 個，${b} 盤共剩幾個？`:`所有盤共有 ${a*b} 個，全部只送出 ${d} 個，還剩幾個？`,before?(a-d)*b:a*b-d,g,before?'先減出每盤剩下的數，再乘盤數。':'全部只扣一次。'),
  c(`每盤各拿走 ${d} 個，想算剩下的總量。第一步可先算什麼？`,'一盤還剩幾個',g,'「各」是每盤都要做同樣的改變。','盤數加果子數','只從全部減一次'),
  w(`原來有 ${b} 盤，每盤 ${a} 個。另加一盤，這盤只放 ${d} 個。新的總數是多少？`,a*b+d,g,'原來每盤一樣多，另加的一盤按實際個數算。')];
};
const share=(byPeople=false)=>v=>{
 const a=3+v%4,b=2+v%3,total=a*b, g=groups([total],v%3);
 return [
  n(byPeople?`平分給 ${b} 人，每人幾個？`:`每袋裝 ${a} 個，可以裝幾袋？`,byPeople?a:b,g,byPeople?'輪流分給每人一個，再數每人得到多少。':'每袋圈出相同數量，再數袋數。'),
  w(byPeople?`多出 ${b} 個也平均分，每人會再分到幾個？`:`裝好後又拿來 ${a} 個，可再裝滿幾袋？`,1,g,'新拿來的數量正好能多分一輪或裝一袋。'),
  w(`要分圖上的量再多 1 個，按原方法分完，會剩幾個無法分？`,1,cards(['原量',total],[byPeople?'人數':'每袋',byPeople?b:a],['多出',1]),'原來剛好分完，多 1 個不足以再分一輪或裝一袋。'),
  c(byPeople?`圖上這些要平分給 ${b} 人，哪個做法公平？`:`要每袋裝 ${a} 個，哪個方法正確？`,byPeople?'每次每人先拿 1 個':`每數到 ${a} 個就裝一袋`,g,'要讓每人拿到相同量，或讓每袋裝相同量。','先給一人全部','每袋都放不同數量'),
  w(byPeople?`現在有 ${b} 人，每人 ${a} 個。每人各送回 1 個，一共送回幾個？`:`有 ${b} 袋，每袋 ${a} 個。拆開一袋，還有幾袋沒有拆？`,byPeople?b:b-1,g,'每人送回一個就數人數；拆一袋就少一個完整的袋。')];
};
const fraction=(compare=false)=>v=>{
 const a=2+v%6,b=a+1,order=v%2?[a,b]:[b,a], p={kind:'earlyFraction',parts:order};
 return [
  c('看甲條。塗色的一份是幾分之一？','1/'+order[0],p,'先數整條被平分成幾份，再看塗了其中一份。','1/'+(order[0]+1),'1/'+(order[0]+2)),
  A('寫出乙條塗色的一份是幾分之一。','1/'+order[1],['1/'+(order[1]+1),'1/'+(order[1]+2)],'分母是平分的總份數。',p),
  c('兩條一樣長，哪一條塗色的部分比較長？',v%2?'甲':'乙',p,'整條一樣長，分成的份數越少，一份越大。',v%2?'乙':'甲','一樣長'),
  c('如果切成大小不同的幾塊，可以把其中一塊叫作幾分之一嗎？','不行，必須平分',p,'先有一樣大的各份，才可用單位分數表示。','可以，只要數總塊數'),
  compare?w(`兩條各和原來一樣長，分別改分成 ${a+1}、${b+1} 等份。較大的一份所屬的紙條分了幾份？`,a+1,p,'相同的整體分較少份，每份較大。'):
    w('甲條要取塗色那樣大的一份給每人，最多分給幾個人？',order[0],p,'一條有幾個等份，就能一人拿一份分給幾人。')];
};
const area=(perimeter=false)=>v=>{
 const a=2+v%4,b=2+v%3, g={kind:'earlyGrid',sizes:[[a,b],[a+1,b]]};
 const p={kind:'earlyGrid',sizes:[[a,a]],perimeter:true};
 return [
  n(perimeter?'正方形每邊如圖，繞外邊一圈有幾公分？':'甲占幾個小方格？',perimeter?4*a:a*b,perimeter?p:g,perimeter?'把四條同樣長的邊加起來。':'每個方格只數一次。'),
  w(perimeter?'沿圖的正方形只走三邊，走幾公分？':'乙比甲多蓋住幾格？',perimeter?3*a:b,perimeter?p:g,perimeter?'走三段一樣長的邊。':'乙多出一欄，數那欄的格子。'),
  c(perimeter?'正方形裡面的小方格要算進周長嗎？':'兩塊面使用相同大小的小方格量，哪一塊比較大？',perimeter?'不用':'乙',perimeter?p:g,perimeter?'周長只數圍在外面的長度。':'同大小的方格，用得越多，面越大。',perimeter?'要':'甲',perimeter?'只算中間一格':'一樣大'),
  c(perimeter?'沿著外邊走一圈，哪裡不會走到？':'甲圖用大方格量，乙圖用小方格量。只比格數公平嗎？',perimeter?'圖形正中央':'不公平',perimeter?p:g,'比周長走外邊；比面的大小時要使用相同大小的單位。',perimeter?'外邊的頂點':'公平'),
  w(perimeter?`每邊加長 1 公分，新的周長幾公分？`:'乙去掉最右一欄，現在占幾格？',perimeter?4*(a+1):a*b,perimeter?p:g,perimeter?'四條邊每條都長 1 公分。':'去掉多出的一欄後，剩下和甲一樣多。')];
};
const verifySum=v=>{
 const a=24+2*v,b=13+v,total=a+b,g=cards(['一部分',a],['另一部分',b],['全部',total]);
 return [
  n('看兩個部分，全部有多少？',total,g,'兩個部分合起來等於全部。'),
  w(`全部有 ${total}，拿掉 ${a}，還剩多少？`,b,g,'用全部減掉已知的部分。'),
  w(`${a}＋□＝${total}。□可以用減法算出來，填多少？`,b,g,'減去已知部分，就是另一部分。'),
  sign(`${total}－${a} 和 ${b+v%2} 比較，填什麼符號？`,b,b+v%2,'先求出減法的答案，再比較。',g),
  c(`用哪個算式驗算 ${total}－${a}＝${b}？`,`${b}＋${a}`,g,'用剩下的部分加回拿走的部分，應該等於全部。',`${b}－${a}`,`${total}＋${a}`)];
};
register(1,[
 [earlyCount(1,5),earlyCount(6,10),zero],[lengths(),lengths(true)],[parts(),parts(true)],[order,howMany],
 [place(12,30),place(13,30)],[add(),add(false,true)],[shape(),solids()],[take(),take(false,true)],[time(),time(true)]
],[
 [place(34,100,5),place(38,100),place(44,100,10)],[add(true),add(true,true)],[measure(),measure(1)],
 [take(true),take(true,true)],[shape(),solids()],[calendar(),calendar()],[money(),money(false,true)],
 [columns(),columns(true)],[classify,classify]
]);
register(2,[
 [place(123,300,10),place(137,300)],[columns(),columns(true),verifySum],[measure(2),measure(2)],
 [verifySum,verifySum],[mass(),mass()],[twoSteps(),twoSteps(1)],[times(2),times(5),times(4),times(8)],
 [time(false,true),time(false,true,true)],[times(3),times(6),times(7),times(9)],[shape(2),area(true)]
],[
 [place(320,1000,10),money(true,true)],[columns(false,true),columns(true,true,true)],[meters(),meters(true)],
 [calendar(),calendar(true)],[times(-1),times(10)],[mass(true),mass(true)],
 [groupSteps(),groupSteps(true)],[share(),share(true)],[fraction(),fraction(true)],[area(),solids(true)]
]);
// 南一習作的分合、配對、圈月曆和列式題型。
const {extendWorksheets,extended}=bank;
extendWorksheets(1,{
 u3:{
  review:extended(2,'兩盤合起來要放 10 顆。照圖先擺好，再畫出右盤缺的數。如果左盤改放 4 顆，右盤要改成幾顆？',
   '右盤先補 4 顆，改放 6 顆','6 和 4 合成 10。左盤改成 4 顆，4 和 6 合成 10。',{kind:'firstParts',whole:10,left:6}),
  section:extended(2,'甲盤有 3 顆，乙盤有 5 顆。兩盤各加 1 顆後共有幾顆？畫出加完後的兩盤。',
   '10 顆','甲變成 4 顆，乙變成 6 顆。4 和 6 合成 10。',groups([3,5],1,['甲盤','乙盤']))
 },
 u4:{review:extended(2,'先把兩排圖案一個對一個連起來。從甲排移 1 個到乙排後，兩排會一樣多嗎？各有幾個？',
   '一樣多，各 5 個','原來甲有 6 個、乙有 4 個。甲少 1，乙多 1，就各有 5 個。',pair(6,4))},
 u6:{
  review:extended(1,'先數兩盤。右盤後來又放了 2 顆。畫出新添的 2 顆，寫出全部有幾顆的算式。',
   '3＋6＝9 顆','右盤 4 顆再加 2 顆是 6 顆，和左盤 3 顆合起來是 9 顆。',groups([3,4],1)),
  section:extended(1,'桌上有 4 顆星。小熊說再拿 3 顆就會有 8 顆。畫畫看，再寫出實際有幾顆、還差幾顆。',
   '7 顆，還差 1 顆','4＋3＝7，從 7 再添 1 就是 8。',groups([4],2))
 },
 u9:{review:extended(2,'同一天上午，做點心是從 8 點到 8 點半，讀書是從 9 點到 10 點。哪一件花比較久？在格子畫兩段線比較。',
   '讀書','做點心只走半個鐘面，讀書的長針走一整圈。',table(['活動','開始','結束'],['做點心','8 點','8 點半'],['讀書','9 點','10 點']))}
},{
 u3:{review:extended(2,'彩帶由兩段接成。左段剪去 2 格後，剩下的整條有幾格？畫線記下剪掉的地方。',
   '7 格','左段原有 5 格，剪掉 2 格剩 3 格，再接右段 4 格，共 7 格。',strip(5,4))},
 u6:{review:extended(2,'圈起來的是第一次上陶藝課的日期。以後每星期同一天上課。找出第 2 次和第 3 次是幾日。',
   '12 日和 19 日','同一星期幾在月曆的同一欄，每往下一列就是一星期。',{kind:'earlyCalendar',today:5})},
 u7:{review:extended(2,'一張書籤 16 元。用圖中的錢付剛好，圈出要用的錢。寫出付錢的算式和沒用掉的錢。',
   '10＋5＋1＝16 元，剩 2 元','用 10 元、5 元和一枚 1 元，留下兩枚 1 元。',coins(10,5,1,1,1))},
 u9:{review:extended(2,'今天又借出 2 本繪本和 1 本圖鑑。先把兩格改成新數量，再寫出兩類合起來有幾本。',
   '繪本 9 本、圖鑑 6 本，共 15 本','7＋2＝9，5＋1＝6，再合起來是 15。',table(['種類','繪本','圖鑑'],['原本借出',7,5]))}
});
extendWorksheets(2,{
 u3:{review:extended(2,'第一段在尺上從 3 公分到 9 公分，第二段長 4 公分。把兩段首尾接好，總長幾公分？寫算式。',
   '10 公分','先用 9－3＝6 求第一段，再用 6＋4＝10。',ruler(3,9))},
 u5:{review:extended(2,'用同一小杯量兩壺水。甲拿出 2 杯，全部倒進乙。乙有足夠空間。現在誰的水多？多幾杯？',
   '乙多 2 杯','甲原有 6 杯，變成 4 杯。乙原有 4 杯，變成 6 杯。',groups([6,4],5,['甲壺','乙壺']))},
 u6:{review:extended(2,'美勞室借出兩盒色筆後還有幾枝？先算共借出幾枝，再用算式求剩下的數量。',
   '借出 22 枝，剩 25 枝','13＋9＝22，47－22＝25。',cards(['原有','47 枝'],['第一盒','13 枝'],['第二盒','9 枝']))},
 u8:{review:extended(2,'看時間表。第一場和第二場各用了幾分鐘？寫出哪一場較久、久幾分鐘。',
   '第一場 25 分鐘，第二場 35 分鐘，第二場多 10 分鐘','跨 10 點時，先從 9:45 數到 10:00，再加 10 分鐘。第二場從 10:20 到 10:55。',table(['場次','開始','結束'],['第一場','9:45','10:10'],['第二場','10:20','10:55']))}
},{
 u3:{review:extended(2,'剪下 85 公分後，把另一段 40 公分的繩子接上去，不重疊。新繩全長幾公分？',
   '155 公分','2 公尺是 200 公分。200－85＝115，再加 40 是 155 公分。',cards(['原繩','2 公尺'],['剪下','85 公分'],['接上','40 公分']))},
 u7:{review:extended(2,'每盒原有 8 塊餅乾，每盒都先取走 2 塊。一共有 5 盒。先寫出每盒剩幾塊，再算 5 盒共有幾塊。',
   '每盒 6 塊，共 30 塊','每盒都要減，8－2＝6，再算 6×5＝30。',cards(['每盒','8 塊'],['每盒取走','2 塊'],['盒數','5 盒']))},
 u8:{review:extended(2,'先把 18 顆平均分給 3 人，再把另外的 6 顆也平均分給這 3 人。每人第一次分到幾顆？每人最後共有幾顆？',
   '先分到 6 顆，最後有 8 顆','18 顆分三份，每份 6 顆。6 顆分三份，每人再得 2 顆。',cards(['第一次','18 顆'],['第二次','6 顆'],['人數','3 人']))},
 u9:{review:extended(2,'兩條餅乾一樣長，各塗 1 份。哪條塗的部分較大？要讓這一份變小，整條應分成更多份還是更少份？',
   '甲較大，整條要分成更多份','甲的一份是 1/3，乙的一份是 1/6。整體相同時，分得越多份，每一份越小。',{kind:'earlyFraction',parts:[3,6]})}
});
})(typeof module !== 'undefined' && module.exports ? require('./practice-bank') : window.CoursePracticeBank);
