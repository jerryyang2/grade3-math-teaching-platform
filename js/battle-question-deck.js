/* 分組搶答共用選題紀錄，只記錄題目，不記錄學生資料。 */
(function (root) {
  'use strict';
  const memory = new Map();
  const questionOf = item => typeof item.question === 'object' ? item.question : item;
  const normalize = value => String(value || '').normalize('NFKC').replace(/\s+/g, ' ').trim();
  const familyOf = item => normalize(questionOf(item).text || questionOf(item).question)
    .replace(/\d+(?:[.,]\d+)*/g, '#').replace(/[\s，。、：？！；]/g, '');
  function keyOf(item) {
    const question = questionOf(item);
    const content = JSON.stringify([normalize(question.text || question.question), question.visual || null]);
    let first = 2166136261, second = 5381;
    for (const character of content) {
      const code = character.codePointAt(0);
      first = Math.imul(first ^ code, 16777619);
      second = Math.imul(second, 33) ^ code;
    }
    return (first >>> 0).toString(16).padStart(8, '0') + (second >>> 0).toString(16).padStart(8, '0');
  }
  function create(namespace) {
    const storageKey = 'math-battle-deck-v1:' + namespace;
    function read() {
      let state = memory.get(storageKey) || {clock:0, seen:{}, lastFamily:''};
      try {
        const saved = JSON.parse(root.localStorage.getItem(storageKey));
        if (saved && Number.isSafeInteger(saved.clock) && saved.clock >= 0 &&
            saved.seen && typeof saved.seen === 'object' && !Array.isArray(saved.seen)) state = saved;
      } catch (_) {}
      memory.set(storageKey, state);
      return state;
    }
    function previous(state, key) {
      const entry = state.seen[key];
      return entry && Number.isSafeInteger(entry.count) && entry.count > 0 &&
        Number.isSafeInteger(entry.last) && entry.last > 0 ? entry : {count:0, last:0};
    }
    return {
      draw(items, count = 10) {
        const state = read();
        const unique = new Map(items.map(item => [keyOf(item), item]));
        const pool = [...unique].map(([key, item]) => ({key, item, family:familyOf(item), ...previous(state, key)}));
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        const selected = [], families = new Map();
        const recentWindow = Math.min(10, Math.max(1, Math.floor(pool.length / 2)));
        const score = item => [item.count,
          Number(item.last > 0 && item.last > state.clock - recentWindow),
          families.get(item.family) || 0,
          Number(selected.length === 0 && item.family === state.lastFamily)];
        const target = Math.min(pool.length, Math.max(0, Math.floor(Number(count) || 0)));
        while (selected.length < target) {
          let best = 0;
          for (let i = 1; i < pool.length; i++) {
            const candidate = score(pool[i]), current = score(pool[best]);
            const difference = candidate.findIndex((value, index) => value !== current[index]);
            if (difference >= 0 && candidate[difference] < current[difference]) best = i;
          }
          const [next] = pool.splice(best, 1);
          selected.push(next.item);
          families.set(next.family, (families.get(next.family) || 0) + 1);
        }
        return selected;
      },
      markShown(item) {
        if (!item) return;
        const state = read(), key = keyOf(item);
        state.clock++;
        state.seen[key] = {count:previous(state, key).count + 1, last:state.clock};
        state.lastFamily = familyOf(item);
        memory.set(storageKey, state);
        try { root.localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_) {}
      }
    };
  }
  const api = {create, keyOf};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MathBattleDeck = api;
})(typeof window === 'undefined' ? globalThis : window);
