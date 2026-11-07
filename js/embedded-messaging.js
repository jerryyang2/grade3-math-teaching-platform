/* Browser-local pages have opaque origins, even when both files belong to this site. */
(() => {
  'use strict';
  const localFile = location.protocol === 'file:';
  window.MathEmbeddedMessaging = Object.freeze({
    isEmbedded() {
      if (window.parent === window) return false;
      if (localFile) return true;
      try { return window.parent.location.origin === location.origin; } catch (_) { return false; }
    },
    send(target, data) {
      target?.postMessage(data, localFile ? '*' : location.origin);
    },
    isFrom(event, target) {
      return Boolean(target) && event.source === target && event.origin === (localFile ? 'null' : location.origin);
    }
  });
})();
