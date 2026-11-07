const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

function loadDeck(storage = new Map()) {
  const window = {localStorage:{getItem:key=>storage.get(key) || null, setItem:(key,value)=>storage.set(key,value)}};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'js/battle-question-deck.js'), 'utf8'), {window});
  return window.MathBattleDeck;
}
const storage = new Map();
let api = loadDeck(storage);
const fixtures = Array.from({length:24}, (_,i)=>({text:'有 '+i+' 個物品，分成不同組。', choices:[i,i+1]}));
let deck = api.create('reload');
const first = deck.draw(fixtures, 10);
first.forEach(question=>deck.markShown(question));
api = loadDeck(storage);
deck = api.create('reload');
assert.ok(deck.draw(fixtures, 10).every(question=>!first.some(old=>api.keyOf(old)===api.keyOf(question))), '重新整理後重出上一回合');
assert.equal(deck.draw([fixtures[0], {...fixtures[0], choices:[999,0]}], 10).length, 1, '換選項仍是同一題');
const partial = api.create('partial');
const reserved = partial.draw(fixtures, 10);
partial.markShown(reserved[0]);
assert.ok(partial.draw(fixtures, 10).every(question=>api.keyOf(question)!==api.keyOf(reserved[0])), '重抽時又出剛顯示的題目');
assert.equal(storage.size, 2, '抽到但尚未顯示的題目不應寫入紀錄');
const sharedScope = api.create('shared-scope');
const scoped = sharedScope.draw(fixtures.slice(0,12), 10);
scoped.forEach(question=>sharedScope.markShown(question));
assert.ok(sharedScope.draw(fixtures, 10).every(question=>!scoped.some(old=>api.keyOf(old)===api.keyOf(question))), '切換範圍後應沿用已出題紀錄');
storage.set('math-battle-deck-v1:broken', '{bad json');
assert.equal(api.create('broken').draw(fixtures, 10).length, 10, '舊紀錄損壞應仍可出題');
const deniedWindow = {localStorage:{getItem(){throw Error('denied');}, setItem(){throw Error('denied');}}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/battle-question-deck.js'), 'utf8'), {window:deniedWindow});
const fallback = deniedWindow.MathBattleDeck.create('blocked-storage');
const remembered = fallback.draw(fixtures, 1)[0];
fallback.markShown(remembered);
assert.ok(fallback.draw(fixtures, 10).every(question=>api.keyOf(question)!==api.keyOf(remembered)));

function checkPool(pool, scope) {
  const keys = new Set(pool.map(api.keyOf));
  assert.ok(keys.size >= 10, scope+' 題庫不足十題');
  for (const item of pool) {
    const question = typeof item.question==='object' ? item.question : item;
    const options = question.choices || question.options;
    const answer = question.choices ? question.answer : options[question.answerIndex];
    assert.ok(options.length>=2 && options.length<=4 && options.filter(value=>value===answer).length===1, scope+' 選項或答案錯誤');
    assert.ok(!/undefined|NaN|Infinity/.test(question.text || question.question), scope+' 題幹不完整');
  }
  const sampler = api.create(scope);
  let cycle = new Set(), last;
  for (let round=0;round<4;round++) {
    const questions = sampler.draw(pool, 10);
    assert.equal(questions.length, 10);
    assert.equal(new Set(questions.map(api.keyOf)).size, 10, scope+' 同回合重複');
    assert.notEqual(api.keyOf(questions[0]), last, scope+' 跨回合連續重複');
    for (const question of questions) {
      const key = api.keyOf(question);
      if (cycle.has(key)) {
        assert.equal(cycle.size, keys.size, scope+' 題庫未用完就重複');
        cycle = new Set();
      }
      cycle.add(key);
      sampler.markShown(question);
      last = key;
    }
  }
  return keys.size;
}

const kit = require('../courses/curriculum-core');
const bank = require('../courses/practice-bank');
for (const grade of [1,2,5,6]) require('../courses/grade'+grade);
kit.catalog[4] = require('../grade4/curriculum');
for (const file of ['early','grade4','senior','upper']) require('../courses/practice-'+file);
let scopes = 0, questions = 0;
for (const [grade,terms] of Object.entries(kit.catalog)) for (const [term,units] of Object.entries(terms)) {
  bank.prepare(Number(grade), term, units);
  for (const unit of units) {
    const all = unit.sections.flatMap(section=>section.battleQuestions.map(question=>({section,question})));
    checkPool(all, grade+'-'+term+'-'+unit.id);
    scopes++;
    for (const section of unit.sections) {
      questions += checkPool(section.battleQuestions, grade+'-'+term+'-'+section.id);
      scopes++;
    }
  }
}
const variants = require('../js/grade3-worksheet-variants');
for (const [term,dataPath,battlePath,dataName] of [
  ['lower','js/data.js','js/battle.js','NANI_G3S2_DATA'],
  ['upper','upper/js/data.js','upper/js/battle.js','NANI_G3S1_DATA']
]) {
  const data = require(path.join(root, dataPath));
  const window = {[dataName]:data, WorksheetQuestionVariants:variants, MathBattleDeck:api};
  vm.runInNewContext(fs.readFileSync(path.join(root, battlePath), 'utf8'), {window});
  const arena = window.MathBattleArena;
  for (const unit of data.units) for (const section of [null,...unit.sections]) {
    arena.prepareQuestions(unit.id, section?.id || 'all', 10000);
    const pool = Array.from(arena.questions);
    const size = checkPool(pool, '3-'+term+'-'+(section?.id || unit.id));
    if (section) {
      assert.ok(size>10, '三年級小節應加入不同情境與概念題');
      questions += size;
    }
    scopes++;
  }
}
console.log('PASS: 十二學期 '+scopes+' 個單元／小節範圍，共 '+questions+' 道可用搶答題。');
console.log('PASS: 四回合循環、同題去重、跨範圍紀錄、重新整理及儲存受限情形。');
