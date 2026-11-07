const assert = require('node:assert/strict');
const kit = require('../../courses/curriculum-core');
const bank = require('../../courses/practice-bank');
for (const grade of [1,2,5,6]) require('../../courses/grade'+grade);
kit.catalog[4] = require('../../grade4/curriculum');
for (const file of ['early','grade4','senior','upper']) require('../../courses/practice-'+file);

const key = q=>q.text+'|'+JSON.stringify(q.visual);
const stem = text=>text.normalize('NFKC').replace(/\d+(?:[.,]\d+)*/g,'#').replace(/[\s，。、：？！；]/g,'');
const totals={units:0,practice:0,worksheets:0};
for (const [grade,terms] of Object.entries(kit.catalog)) {
  for (const [term,units] of Object.entries(terms)) {
    const previous = new Set(units.flatMap(u=>u.sections.flatMap(s=>s.questions.map(key))));
    const activeIds = new Set();
    bank.prepare(Number(grade),term,units);
    for (const unit of units) {
      const where=grade+' '+term+' '+unit.title;
      const practice=unit.sections.flatMap(s=>s.questions);
      const classroom=new Set(practice.map(key));
      assert.equal(classroom.size,practice.length,where+' 課堂重複');
      for (const q of practice) {
        assert.ok(!previous.has(key(q))&&q.id.startsWith('practice2-')&&!activeIds.has(q.id),where+' 沿用舊題或 ID：'+q.text);
        assert.ok(q.choices.length>=2&&q.choices.length<=4&&q.choices.filter(a=>a===q.answer).length===1,where+' 選項不符：'+q.text);
        activeIds.add(q.id);
      }
      for (const section of unit.sections) {
        assert.deepEqual(new Set(section.questions.map(q=>q.level)),new Set(['guided','apply','reason']),where+' 小節難度層次');
      }
      const sheets=[unit.worksheet,...unit.sections.map(s=>s.worksheet).filter(Boolean)];
      assert.deepEqual(new Set(unit.worksheet.map(q=>q.section)),new Set(unit.sections.map((_,i)=>i+1)),where+' 複習範圍');
      for (const [scope,sheet] of sheets.entries()) {
        assert.equal(sheet.length,10,where+' 學習單題數');
        assert.equal(new Set(sheet.map(key)).size,10,where+' 學習單重複');
        assert.ok(new Set(sheet.map(q=>stem(q.text))).size>=9,where+' 只換數字的題幹太多');
        assert.ok(sheet.filter(q=>q.visual).length>=2,where+' 缺少題圖（範圍 '+scope+'）');
        for (const q of sheet) {
          assert.ok(q.reason&&q.answer!==undefined&&!/undefined|NaN|Infinity/.test(q.text+' '+q.answer),where+' 解答不完整：'+q.text);
          assert.ok(!classroom.has(key(q)),where+' 課堂與學習單撞題：'+q.text);
          if(q.format!=='write') assert.equal(q.choices.filter(a=>a===q.answer).length,1,q.text);
        }
        for (const page of [sheet.slice(0,5),sheet.slice(5)]) {
          assert.ok(page.some(q=>q.format!=='choice'),where+' 缺少書寫題');
          if(Number(grade)<=2) assert.ok(page.filter(q=>q.visual).length>=4,where+' 缺少題圖');
        }
      }
      totals.units++;
      totals.practice+=practice.length;
      totals.worksheets+=sheets.length;
    }
  }
}
assert.deepEqual(totals,{units:92,practice:1655,worksheets:191});
console.log('PASS: 92 個單元、1,655 道課堂練習、191 份獨立學習單。');

const grade3 = require('../../js/grade3-worksheet-variants');
let grade3Sheets = 0;
const authoredGrade3 = new Set();
for(const [file,term] of [['../../upper/js/data','upper'],['../../js/data','lower']]) {
  const data = require(file);
  for(const unit of data.units) for(const section of [null,...unit.sections]) {
    const sheet = grade3.getWorksheet(data,unit.id,section?.id,term);
    assert.equal(sheet.problems.length,10);
    assert.equal(new Set(sheet.problems.map(q=>q.id)).size,10);
    if(!section) assert.deepEqual(new Set(sheet.problems.map(q=>q.sectionId)),new Set(unit.sections.map(s=>s.id)));
    assert.ok(new Set(sheet.problems.map(q=>stem(q.question))).size>=9,term+' '+(section?.id||unit.id));
    for(const q of sheet.problems) {
      assert.ok(q.question && q.solutionSpeech);
      if(q.id.startsWith('ws3-')) authoredGrade3.add(q.id);
      assert.ok(q.options.length===0 || q.options.length===4);
      if(q.options.length) assert.ok(q.options[q.answerIndex]!==undefined);
      else assert.ok(q.answer);
    }
    grade3Sheets++;
  }
}
assert.equal(grade3Sheets,84);
assert.equal(authoredGrade3.size,206);
console.log('PASS: 十二學期共 275 份學習單，去除數值後每份至少九個不同題幹。');
