#!/usr/bin/env node
// 僅產生本機 PDF；所有輸出均在 Git 排除的目錄中。
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const sources=require('./worksheets/sources.json');
const pdf=path.join(root,'output/pdf/慢慢把數學玩懂_三上學習單彙整_36份.pdf');
const reportFile=path.join(root,'Codex/worksheet-book-verification.json');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function run(command,args){const r=spawnSync(command,args,{cwd:root,stdio:'inherit'});if(r.status!==0)throw Error('學習單 PDF 同步未通過，請修正後再推送。');}
function fresh(){
  if(!fs.existsSync(pdf)||!fs.existsSync(reportFile))return false;
  const r=JSON.parse(fs.readFileSync(reportFile,'utf8'));
  if(r.status!=='PASS'||r.pdf_sha256!==hash(fs.readFileSync(pdf)))return false;
  // The bilingual display catalog exceeds Node's default 1 MiB output buffer.
  return sources.every(file=>r.source_sha256?.[file]===hash(fs.readFileSync(path.join(root,file))));
}
try{
  const data=require('../js/data.js'),figures=require('../js/worksheet-diagrams.js');
  const unreviewed=figures.audit(data.practiceBank).filter(item=>!item.reviewed);
  if(unreviewed.length)throw Error('下列題目變更後需重新檢查圖像：'+unreviewed.map(item=>item.id).join('、'));
  if(process.argv.includes('--check')&&fresh()){
    console.log('學習單 PDF 已與目前來源同步；本機 PDF 維持 Git 排除。');process.exit(0);
  }
  const candidates=[process.env.WORKSHEET_PDF_PYTHON,path.join(root,'Codex/pdf-venv/bin/python'),path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3'),'python3'].filter(Boolean);
  const python=candidates.find(binary=>spawnSync(binary,['-c','import reportlab,pypdf'],{stdio:'ignore'}).status===0);
  if(!python)throw Error('本機 PDF 需要 Python 的 reportlab 與 pypdf，請設定 WORKSHEET_PDF_PYTHON。');
  fs.mkdirSync(path.dirname(reportFile),{recursive:true});
  run(python,['scripts/worksheets/build-book.py']);
  run(python,['scripts/worksheets/verify-book.py']);
  if(!fresh())throw Error('來源或 PDF 在製作後又被修改，請重新執行同步。');
  console.log('已更新並驗證本機學習單 PDF；未加入 Git 或網站下載。');
}catch(error){console.error(error.message);process.exitCode=1;}
