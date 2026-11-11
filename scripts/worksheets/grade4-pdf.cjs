// 網頁和 PDF 使用相同的列印預覽，不另維護教材副本。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname,'../..');
const runtime = path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies');
const source = require('../../grade4/curriculum.js');
const early = process.argv.includes('--early');
const first = process.argv.includes('--first-upper');
const extra = process.argv.includes('--expanded');
const all = process.argv.includes('--all');
const kit = require('../../courses/curriculum-core.js');
const counts = {1:[28,9],2:[10,10],4:[48,52],5:[10,10],6:[8,6]};
const grades = all ? [1,2,4,5,6] : early ? [1,2] : first ? [1] : extra ? [1,2,5,6] : [4];
for(const grade of grades.filter(grade=>grade!==4)) require('../../courses/grade'+grade+'.js');
const bundledPlaywright = path.join(runtime,'node/node_modules/playwright');
const playwright = require(process.env.WORKSHEET_PLAYWRIGHT || (fs.existsSync(bundledPlaywright) ? bundledPlaywright : 'playwright'));
const python = [process.env.WORKSHEET_PDF_PYTHON, path.join(runtime,'python/bin/python3'),'python3']
  .filter(Boolean).find(candidate => spawnSync(candidate,['-c','import pypdf, pdfplumber, reportlab'],{stdio:'ignore'}).status === 0);

(async () => {
  if (!python) throw Error('請安裝 Python 的 pypdf、pdfplumber、reportlab，或設定 WORKSHEET_PDF_PYTHON。');
  const font = spawnSync(python,[path.join(root,'scripts/pdf_fonts.py')],{encoding:'utf8'});
  if(font.status!==0) throw Error('標楷體準備失敗：'+font.stderr);
  const fontUrl = pathToFileURL(font.stdout.trim()).href;
  const tempRoot = path.join(root,'tmp/pdfs');
  const out = path.join(root,'output/pdf');
  fs.mkdirSync(tempRoot,{recursive:true});
  fs.mkdirSync(out,{recursive:true});
  const temp = fs.mkdtempSync(path.join(tempRoot,'course-'));
  const manifest = [];
  try {
    const browser = await playwright.chromium.launch({channel:'chrome'});
    try {
      const page = await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
      page.setDefaultTimeout(12000);
      for (const grade of grades) for (const [term,units] of Object.entries(grade===4?source:kit.catalog[grade])) {
        if(first && term!=='upper') continue;
        const url = pathToFileURL(path.join(root,grade===4?'grade4/index.html':'courses/index.html'));
        if(grade!==4)url.searchParams.set('grade',grade);
        url.searchParams.set('term',term);
        const termIndex=term==='upper'?0:1;
        const label='一二三四五六'[grade-1]+(termIndex?'下':'上');
        const entries=[];
        manifest.push({label,expected:counts[grade][termIndex],entries});
        const errors=[];
        const onError=error=>errors.push(error.message);
        page.on('pageerror',onError);
        await page.goto(url.href,{waitUntil:'domcontentloaded'});
        page.off('pageerror',onError);
        assert.deepEqual(errors,[],label+' 課程載入失敗');
        assert.ok(await page.evaluate(async()=>{
          await document.fonts.load('16px "Zihi Reading"','看圖數一數');
          return document.querySelector('#question').textContent.length>0 &&
            getComputedStyle(document.querySelector('#question')).fontFamily.startsWith('"Zihi Reading"') &&
            [...document.fonts].some(font=>font.family.includes('Zihi Reading')&&font.status==='loaded');
        }),label+' 課堂未載入字嗨注音標楷');
        // Only local PDF output uses the private, validated BiauKaiTC font.
        await page.addStyleTag({content:`
          @font-face { font-family:"Local Worksheet BiauKai"; src:url("${fontUrl}") format("truetype"); font-weight:400; }
          @media print { #worksheet #worksheet-pages, #worksheet #worksheet-pages * {
            font-family:"Local Worksheet BiauKai" !important; font-weight:400 !important; font-style:normal !important;
          } }
        `});
        for (const unit of units) {
          await page.locator('#unit-list [data-unit='+unit.id+']').click();
          await page.locator('#worksheet-open').click();
          await page.locator('#worksheet-zihi').uncheck();
          const scopes=unit.sections.filter(section=>section.questions.length===10);
          for (const [id,title] of [['all','單元總複習'],...scopes.map(section=>[section.id,section.title])]) {
            await page.locator('#worksheet-scope').selectOption(id);
            await page.evaluate(()=>document.fonts.ready);
            await page.emulateMedia({media:'print'});
            assert.ok(await page.evaluate(async()=>{
              await document.fonts.load('16px "Local Worksheet BiauKai"','看圖數一數');
              return document.fonts.check('16px "Local Worksheet BiauKai"','看圖數一數') &&
                getComputedStyle(document.querySelector('.worksheet-prompt')).fontFamily.includes('Local Worksheet BiauKai');
            }),label+' PDF 未載入標楷體');
            const pages=await page.locator('.worksheet-sheet').evaluateAll(sheets=>sheets.map(sheet=>{
              const area=sheet.getBoundingClientRect();
              const support=sheet.querySelector('.worksheet-support');
              const contentBottom=support?support.getBoundingClientRect().top-parseFloat(getComputedStyle(support).marginTop):area.bottom;
              return {
                questions:sheet.querySelectorAll('.worksheet-card').length,
                figures:sheet.querySelectorAll('.worksheet-card figure').length,
                written:sheet.querySelectorAll('.worksheet-card:not([data-answer-format="choice"])').length,
                bottomGaps:[...sheet.querySelectorAll('.worksheet-column')].map(column=>contentBottom-column.lastElementChild.getBoundingClientRect().bottom),
                support:support?.querySelectorAll('input[type=checkbox]').length||0,
                footerOverflow:support?support.getBoundingClientRect().bottom-area.bottom:0,
                overflow:[...sheet.querySelectorAll('.worksheet-card')].some(card=>card.scrollHeight>card.clientHeight+2)
              };
            }));
            assert.deepEqual(pages.map(p=>p.questions),[5,5]);
            assert.deepEqual(pages.map(p=>p.support),[0,4]);
            assert.ok(pages.every(p=>p.figures>=(grade<=2?4:0)),`${label} ${unit.title} ${title} 缺少題圖：${JSON.stringify(pages)}`);
            assert.ok(pages.every(p=>p.written>0),`${label} ${unit.title} ${title} 缺少紙筆題`);
            assert.ok(pages.every(page=>page.bottomGaps.every(gap=>Math.abs(gap)<3)&&page.footerOverflow<2&&!page.overflow),label+' '+unit.title+' '+title+' 題框未平均填滿或內容溢出');
            const file = path.join(temp,grade+'-'+term+'-'+unit.id+'-'+id+'.pdf');
            await page.pdf({path:file,preferCSSPageSize:true,printBackground:true});
            entries.push({file,unit:unit.title,title});
            await page.emulateMedia({media:'screen'});
          }
          await page.keyboard.press('Escape');
        }
      }
    } finally {
      await browser.close();
    }
    const result = spawnSync(python,[path.join(__dirname,'merge-grade4.py'),out],{input:JSON.stringify(manifest),stdio:['pipe','inherit','inherit']});
    if (result.status !== 0) throw Error('學習單 PDF 分頁驗證未通過。');
  } finally {
    fs.rmSync(temp,{force:true,recursive:true});
  }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
