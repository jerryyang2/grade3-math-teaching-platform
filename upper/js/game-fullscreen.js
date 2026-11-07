/* 所有獨立遊戲共用；嵌入平台時由父層維持同一個 iframe 與作答狀態。 */
(() => {
  'use strict';
  function initialize(){
    const root=document.documentElement;
    let fallback=false,pending=false,parentFull=false,parentManaged=false;
    const messaging=window.MathEmbeddedMessaging;
    const embedded=messaging.isEmbedded();
    const nav=document.querySelector('.sp-ed-game-navbar');
    let button=nav?.querySelector('button[onclick*="requestFullscreen"]');
    if(button)button.removeAttribute('onclick');
    else if(document.querySelector('.game-header nav')){
      button=document.createElement('button');document.querySelector('.game-header nav').append(button);
      document.querySelector('.game-header a')?.addEventListener('click',e=>{if(embedded){e.preventDefault();messaging.send(parent,'close-game-modal');}});
      Object.assign(document.querySelector('.game-header').style,{position:'sticky',top:'0',zIndex:'99999'});
    }else{
      const bar=document.createElement('nav');bar.className='game-fullscreen-toolbar';bar.setAttribute('aria-label','遊戲全螢幕工具');
      bar.innerHTML='<a href="../../index.html">← 返回遊戲館</a><div><span class="game-fullscreen-note" role="status"></span><button type="button" data-game-fullscreen></button></div>';
      document.body.prepend(bar);button=bar.querySelector('button');
      bar.querySelector('a').addEventListener('click',e=>{if(embedded){e.preventDefault();messaging.send(parent,'close-game-modal');}});
    }
    button.dataset.gameFullscreen='';button.type='button';button.classList.add('game-fullscreen-button');
    if(nav){nav.style.flexShrink='0';nav.style.width='100%';nav.style.flexWrap='wrap';nav.style.gap='8px';}
    function synchronize(){
      const active=fallback||parentFull||document.fullscreenElement===root;
      button.textContent=active?'⤡ 離開遊戲全螢幕':'⛶ 遊戲全螢幕';button.setAttribute('aria-pressed',String(active));
      root.classList.toggle('game-fullscreen-fallback',fallback);
      button.hidden=parentManaged;
      button.style.display=parentManaged?'none':'';
      const duplicateBar=nav||button.closest('.game-fullscreen-toolbar');
      if(duplicateBar&&parentManaged)duplicateBar.style.display='none';
    }
    async function toggle(){
      if(pending)return;
      if(embedded){messaging.send(parent,{type:'math-game-fullscreen'});return;}
      pending=true;
      try{
        if(document.fullscreenElement===root)await document.exitFullscreen();
        else if(fallback)fallback=false;
        else try{if(!root.requestFullscreen)throw Error('Unavailable');await root.requestFullscreen();}catch(_){fallback=true;}
      }finally{pending=false;synchronize();}
    }
    button.addEventListener('click',toggle);
    document.addEventListener('fullscreenchange',synchronize);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&fallback&&!document.querySelector('dialog[open]')){fallback=false;synchronize();}});
    window.addEventListener('message',e=>{if(embedded&&messaging.isFrom(e,parent)&&e.data?.type==='math-game-fullscreen-state'){parentManaged=true;parentFull=!!e.data.active;synchronize();}});
    const style=document.createElement('style');
    style.textContent='.game-fullscreen-toolbar{display:flex;position:sticky;top:0;z-index:2147483600;flex-shrink:0;width:100%;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;padding:8px 16px;background:#fffdf6;border-bottom:1px solid #a3bba9;font:700 16px/1.4 system-ui}.game-fullscreen-toolbar>div{display:flex;align-items:center;gap:8px}.game-fullscreen-toolbar a{color:#205346}.game-fullscreen-button{min-height:44px!important;padding:8px 14px!important;border:2px solid #366b5b!important;border-radius:10px!important;background:#f3f9ed!important;color:#224b3c!important;font:800 16px/1.4 system-ui!important;cursor:pointer}.game-fullscreen-button:focus-visible{outline:3px solid #dc9c2c;outline-offset:3px}.game-fullscreen-fallback{min-height:100dvh;overflow:auto}@media print{.game-fullscreen-toolbar,.sp-ed-game-navbar{display:none!important}}';
    document.head.append(style);synchronize();
    if(embedded)messaging.send(parent,{type:'math-game-fullscreen-state-request'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize);else initialize();
})();
