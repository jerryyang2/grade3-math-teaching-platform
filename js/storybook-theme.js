/* 手繪視覺層：只處理圖示、插畫互動與選單，不改變教學或作答資料。 */
(function () {
  'use strict';
  const outlines = {
    book: '<path d="M10 16Q22 10 32 18Q44 10 54 16L52 49Q41 44 32 51Q21 44 11 49Z" fill="#f6dc91"/><path d="M32 18V51M17 24l9 1M17 32l9 1M39 24l8-1M39 32l8-1"/>',
    case: '<path d="M11 22l42-1 2 29-45 1Z" fill="#cbd9bc"/><path d="M23 22l1-10 17 1 1 9M11 32q21 7 43-1M29 32v9h8v-9"/>',
    pencil: '<path d="M14 43L40 12l11 10-27 31-14 3Z" fill="#edc86f"/><path d="M14 43l10 10M34 19l11 10M17 45l24-27M10 56l4-13"/>',
    flag: '<path d="M15 54l3-44M19 13q10-8 19 0t15-1l-1 22q-8 7-17 0t-17 1" fill="#e9b0a0"/><path d="M10 55h17"/>',
    star: '<path d="M32 7l8 15 17 3-13 13 2 19-16-9-17 8 4-19L5 23l19-2Z" fill="#f0d47e"/>',
    leaf: '<path d="M13 49C1 25 25 9 54 10c2 30-17 52-41 39Z" fill="#c2d2af"/><path d="M12 53l30-31M24 41l-2-14M31 33l14-2"/>',
    u1:'<path d="M11 32h42"/><circle cx="32" cy="19" r="4"/><circle cx="32" cy="45" r="4"/>',
    u2:'<circle cx="12" cy="32" r="7" fill="#d9a989"/><rect x="25" y="25" width="14" height="14" fill="#a7c6d4"/><circle cx="52" cy="32" r="7" fill="#d9a989"/>',
    u3:'<circle cx="32" cy="32" r="24" fill="#f6e4ae"/><path d="M32 15v17l12 7"/>',
    u4:'<rect x="8" y="18" width="18" height="28" rx="4" fill="#e4ae91"/><path d="M28 32h12m-5-5 5 5-5 5"/><rect x="42" y="18" width="14" height="28" rx="4" fill="#c3d4a4"/>',
    u5:'<path d="M10 10h44v44H10zM25 10v44m14-44v44M10 25h44M10 39h44" fill="#c6dbbd"/>',
    u6:'<path d="M18 25h28l8 29H10zM18 25l-5-12h38l-5 12" fill="#e6cc8b"/><circle cx="32" cy="38" r="9" fill="#fff4da"/><path d="M32 38l5-5"/>',
    u7:'<circle cx="32" cy="32" r="24" fill="#f4dea1"/><path d="M32 8v48M8 32h48"/><path d="M32 8a24 24 0 0 1 24 24H32z" fill="#dba486"/>',
    u8:'<path d="M9 23h46l-8-8m8 8-8 8M55 42H9l8-8m-8 8 8 8" fill="none"/>',
    u9:'<rect x="7" y="16" width="50" height="34" rx="3" fill="#ece3bb"/><path d="M17 25h5v14m19-14h8l-5 6 5 2v6h-8"/><circle cx="32" cy="39" r="2"/>',
    u10:'<path d="M9 12h46v41H9zM9 24h46M9 38h46M26 12v41M40 12v41" fill="#c6d9dc"/>',
    chart: '<path d="M11 10l-1 43 46 1M19 42l10-14 10 5 13-16"/><circle cx="29" cy="28" r="4" fill="#e7b196"/><circle cx="52" cy="17" r="4" fill="#bfd2b1"/>',

  };
  outlines.print = '<path d="M18 24V9h28v15M18 47H9V25h46v22h-9M18 38h28v17H18zM43 31h5M24 44h16M24 49h16"/>';
  function icon(name) {
    return `<svg class="sketch-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${outlines[name] || outlines.book}</svg>`;
  }
  window.StorybookTheme = { icon };
  document.addEventListener('DOMContentLoaded', () => {
    const map = { prep:'pencil', units:'book', sandbox:'case', practice:'pencil', battle:'flag', arcade:'star', guide:'leaf', iep:'chart' };
    document.querySelectorAll('.nav-tab').forEach(button => {
      const label = button.textContent.trim();
      const title = label.replace(/^\S+\s+/, '');
      button.setAttribute('aria-label', label);
      button.innerHTML = `${icon(button.id === 'btn-nav-worksheet' ? 'print' : map[button.dataset.tab])}<span>${title}</span>`;
    });
    const settings = document.getElementById('display-settings');
    document.addEventListener('click', event => {
      if (settings?.open && !settings.contains(event.target)) settings.open = false;
    });
    settings?.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        settings.open = false;
        settings.querySelector('summary').focus();
      }
    });
  });
})();
