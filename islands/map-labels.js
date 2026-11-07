/* 名稱跟隨投影後的岸線下緣，旋轉或縮放後也不覆蓋島上地標。 */
(function(root){
'use strict';
function belowIsland(project,center,width,height,labelWidth,labelHeight){
 const points=[];
 for(let i=0;i<32;i++){const a=i*Math.PI/16;points.push(project(center[0]+Math.cos(a)*8.1,-.99,center[1]+Math.sin(a)*6.9));}
 points.push(project(center[0]-1,.08,center[1]+9.3),project(center[0]+1,.08,center[1]+9.3));
 const anchor=project(center[0],0,center[1]),bottom=Math.max(...points.map(p=>p.y)),half=labelWidth/2+5;
 const y=Math.ceil(bottom)+4;
 return {x:Math.max(half,Math.min(width-half,Math.round(anchor.x))),y,visible:Math.abs(anchor.z)<1&&anchor.x>-labelWidth/2&&anchor.x<width+labelWidth/2&&y>=0&&y+labelHeight<=height-3};
}
function separateLabels(anchors,height){
 const placed=[];
 for(const anchor of anchors.filter(Boolean).sort((a,b)=>a.y-b.y)){
  const neighbors=placed.filter(other=>Math.abs(anchor.x-other.x)<(anchor.width+other.width)/2+2);
  for(const other of neighbors.sort((a,b)=>a.y-b.y)){
   if(anchor.y<other.y+other.height+2&&anchor.y+anchor.height+2>other.y){
    anchor.y=other.y+other.height+2;
   }
  }
  anchor.visible=anchor.y+anchor.height<=height-3;
  if(anchor.visible)placed.push(anchor);
 }
}
const api={belowIsland,separateLabels};if(typeof module!=='undefined')module.exports=api;else root.MathIslandMapLabels=api;
})(typeof window!=='undefined'?window:globalThis);
