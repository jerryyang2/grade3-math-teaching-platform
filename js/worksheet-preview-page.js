/* 兩個三年級課程共用預覽入口；題單資料只在目前瀏覽器的分頁之間交接。 */
(async () => {
  'use strict';
  const error=document.getElementById('worksheet-error');
  const button=document.getElementById('worksheet-print');
  const params=new URLSearchParams(location.hash.slice(1));
  const id=params.get('id');
  const dir=params.get('term')==='upper'?'upper/':'';
  const back=document.getElementById('worksheet-back');
  back.href=dir?'upper/index.html':'lower.html';
  back.addEventListener('click',event=>{
    if(!window.opener||window.opener.closed||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    window.opener.focus();
    window.close();
  });

  try {
    if(!id||!/^[\da-f-]{36}$/i.test(id)) throw Error('invalid worksheet reference');
    const key='math-worksheet:'+id;
    const payload=sessionStorage.getItem(key);
    if(!payload) throw Error('missing worksheet');
    document.getElementById('worksheet-payload').textContent=payload;
    const {sheet,settings}=JSON.parse(payload);
    document.body.classList.toggle('ws-zihi',Boolean(settings.withZihi));
    document.title='數學學習單 - '+sheet.unitTitle+' - '+sheet.title;
    for(const path of ['i18n-en.js?v=rights-review-20261111','i18n.js','worksheet-font-metrics.js',
      'worksheet-layout.js?v=worksheet-space-20261107','worksheet-preview.js']){
      await new Promise((resolve,reject)=>{
        const script=document.createElement('script');
        script.src=dir+'js/'+path;
        script.onload=resolve;
        script.onerror=reject;
        document.head.append(script);
      });
    }
    await document.fonts.ready;
    button.disabled=!error.hidden;
  } catch (_) {
    error.hidden=false;
    error.textContent='學習單預覽無法載入，請回課程重新選擇學習單。';
  }
})();
