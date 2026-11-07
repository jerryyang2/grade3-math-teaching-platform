/* 以按下時的攝影機投影拖曳位移；平視時使用垂直平面，避免地平線射線失效。 */
(function(root){
'use strict';
function panTarget(T,camera,origin,start,current){
 const direction=camera.getWorldDirection(new T.Vector3()),level=Math.abs(direction.y)<.2;
 const plane=level?new T.Plane().setFromNormalAndCoplanarPoint(direction,new T.Vector3(origin.x,origin.y,origin.z)):new T.Plane(new T.Vector3(0,1,0),0),ray=new T.Raycaster();
 function hit(point){ray.setFromCamera(new T.Vector2(point.x,point.y),camera);return ray.ray.intersectPlane(plane,new T.Vector3());}
 const a=hit(start),b=hit(current);if(!a||!b)return {x:origin.x,y:origin.y,z:origin.z};
 return {x:Math.max(-70,Math.min(70,origin.x+a.x-b.x)),y:level?Math.max(1.8,Math.min(12,origin.y+a.y-b.y)):origin.y,z:Math.max(-70,Math.min(70,origin.z+a.z-b.z))};
}
function preset(mode,following=false,aspect=1.3){
 if(!['bird','top','eye'].includes(mode))return null;
 return {phi:mode==='top'?.025:mode==='eye'?Math.PI/2:.52,theta:mode==='eye'?.45:.28,y:mode==='eye'?2.8:following?1:0,distance:mode==='eye'?(following?16:18):following?(mode==='top'?45:39):mode==='top'?(aspect<1.15?180:150):(aspect<1.15?155:135)};
}
function overviewFrame(preset,aspect,coordinates,landing,fov){
 const corners=coordinates.flatMap(([x,z])=>[
  [x-8.2,0,z-7],[x+8.2,0,z-7],[x-8.2,0,z+9.5],[x+8.2,0,z+9.5]
 ]);
 for(const dx of [-1,1])for(const dz of [-1,1]){
  corners.push([landing.position.x+dx*landing.width/2,0,landing.position.z+dz*landing.depth/2]);
 }
 const xs=corners.map(point=>point[0]),zs=corners.map(point=>point[2]);
 const x=(Math.min(...xs)+Math.max(...xs))/2,z=(Math.min(...zs)+Math.max(...zs))/2;
 const sinTheta=Math.sin(preset.theta),cosTheta=Math.cos(preset.theta);
 const sinPhi=Math.sin(preset.phi),cosPhi=Math.cos(preset.phi);
 const halfHeight=Math.tan(fov*Math.PI/360),halfWidth=halfHeight*(aspect||1);
 // Keep space around the projected shore for island labels and controls.
 const distance=Math.max(...corners.map(([px,,pz])=>{
  const dx=px-x,dz=pz-z,depth=dx*sinTheta+dz*cosTheta;
  const across=dx*cosTheta-dz*sinTheta;
  return depth*sinPhi+Math.max(Math.abs(across)/(halfWidth*.94),Math.abs(depth*cosPhi)/(halfHeight*.88));
 }));
 return {x,z,distance};
}
function zoomDistance(distance,factor,mode){return Math.max(mode==='eye'?10:22,Math.min(mode==='eye'?60:Math.max(240,distance),distance*factor));}
const api={panTarget,preset,overviewFrame,zoomDistance};if(typeof module!=='undefined')module.exports=api;else root.MathIslandMapCamera=api;
})(typeof window!=='undefined'?window:globalThis);
