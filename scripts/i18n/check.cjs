const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {inventory,sources}=require('./extract.cjs');
const catalog=require('../../js/i18n-en.js');
const {create}=require('../../js/i18n.js');
const data=require('../../js/data.js');
const root=path.resolve(__dirname,'../..');
const missing=inventory().filter(({source})=>!(source in catalog));
assert.equal(missing.length,0,`Missing display translations: ${missing.slice(0,8).map(x=>x.source).join(' | ')}`);
for(const [source,target]of Object.entries(catalog)) {
  assert.equal(typeof target,'string');
  assert.deepEqual((target.match(/⟦[^⟧]*⟧/g)||[]).sort(),(source.match(/⟦[^⟧]*⟧/g)||[]).sort(),`Damaged template: ${source}`);
}
const i18n=create(catalog);i18n.setLanguage('en');
for(const problem of data.practiceBank) {
  for(const source of [problem.question,...problem.options,problem.hint,problem.speechText,problem.solutionSpeech,...(problem.stepScaffolds||[])].filter(Boolean))assert.doesNotMatch(i18n.t(source),/[\u3400-\u9fff]/u,problem.id);
  assert.equal(new Set(problem.options.map(v=>i18n.t(v))).size,problem.options.length,`Duplicate English choices: ${problem.id}`);
}
const pages=sources().filter(p=>p.endsWith('.html'));
for(const page of pages){const html=fs.readFileSync(path.join(root,page),'utf8');assert.match(html,/src="[^\"]*js\/i18n-en\.js/);assert.match(html,/src="[^\"]*js\/i18n\.js/);assert.match(html,/href="[^\"]*css\/i18n\.css/);}
const variants=require('../../js/grade3-worksheet-variants.js');
let worksheetQuestions=0;
for(const term of ['lower','upper']) {
  const base=term==='lower'?'../..':'../../upper';
  const semesterData=require(base+'/js/data.js');
  const semesterCatalog=require(base+'/js/i18n-en.js');
  const semesterI18n=require(base+'/js/i18n.js').create(semesterCatalog);
  const diagrams=require(base+'/js/worksheet-diagrams.js');
  const layout=require(base+'/js/worksheet-layout.js');
  semesterI18n.setLanguage('en');
  for(const unit of semesterData.units) for(const section of [...unit.sections,null]) {
    const sheet=variants.getWorksheet(semesterData,unit.id,section?.id||'',term);
    for(const problem of sheet.problems) {
      const strings=[problem.question,...problem.options,problem.answer,problem.hint,problem.taskKind,problem.solutionSpeech].filter(Boolean);
      for(const source of strings) {
        const target=semesterI18n.t(source);
        assert.doesNotMatch(target,/[\u3400-\u9fff]/u,`${term} ${problem.id}: ${source}`);
        assert.doesNotMatch(target,/⟦[^⟧]*⟧/u,`${term} ${problem.id}: unresolved template`);
        const remainder=source.match(/^(\d+)\s*餘\s*(\d+)$/);
        if(remainder) assert.equal(target,`${remainder[1]} remainder ${remainder[2]}`,`${term} ${problem.id}: remainder terminology`);
      }
      assert.equal(new Set(problem.options.map(value=>semesterI18n.t(value))).size,problem.options.length,`${term} ${problem.id}: duplicate English choices`);
      worksheetQuestions++;
    }
    const printable={
      id:section?.id||unit.id+'_review',unitNumber:unit.number,unitTitle:unit.title,
      title:section?.title||'單元總複習',review:!section,
      problems:sheet.problems.map(problem=>({
        ...problem,question:semesterI18n.t(problem.question),options:problem.options.map(value=>semesterI18n.t(value)),
        sectionTitle:problem.sectionTitle||unit.sections.find(item=>item.id===problem.sectionId)?.title||'',
        svg:diagrams.render(problem.worksheetSource||problem).match(/<svg[\s\S]*?<\/svg>/)?.[0]||''
      }))
    };
    const plan=layout.plan(printable,{language:'en',t:value=>semesterI18n.t(value)});
    assert.equal(plan.pages.length,2,`${term} ${printable.id}: English page count`);
    for(const page of plan.pages) {
      assert.equal(page.questions.length,5,`${term} ${printable.id}: English questions per page`);
      for(const question of page.questions) assert.ok(question.bottom>=layout.constants.M-.1,`${term} ${question.id}: English page overflow`);
    }
  }
}
console.log(JSON.stringify({translations:Object.keys(catalog).length,questions:data.practiceBank.length,worksheetQuestions,pages:pages.length,coverage:'PASS'}));
