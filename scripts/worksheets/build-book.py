"""將網站現有的學習單資料整理為本機專用 PDF，不修改網站。"""
from pathlib import Path
from html import escape, unescape
from functools import lru_cache
from datetime import datetime
from zoneinfo import ZoneInfo
import json, math, re, subprocess, sys
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output/pdf/慢慢把數學玩懂_三下學習單彙整_48份.pdf'
TMP = ROOT / 'tmp/pdfs'
sys.path.insert(0, str(ROOT / 'scripts'))
from pdf_fonts import register_biaukai
register_biaukai('BookKai', 'BookHei')
subprocess.run(['node', str(ROOT/'scripts/worksheets/export-data.cjs')], check=True)
SHEETS = json.loads((TMP/'worksheets.json').read_text())
W,H = A4
M = 10*mm
GAP = 6*mm
CW = (W-2*M-GAP)/2
TOP = H-M-64
BOTTOM = M+48
CAP = TOP-BOTTOM
INK = colors.HexColor('#173c30')
GRAY = colors.HexColor('#555555')
RULE = colors.HexColor('#999999')

def paragraph(text, size=14, font='BookKai', leading=None, color=colors.black):
    style = ParagraphStyle('text', fontName=font, fontSize=size, leading=leading or size*1.35,
                           wordWrap='CJK', textColor=color, allowWidows=0, allowOrphans=0)
    return Paragraph(escape(str(text).replace('➔','→')), style)

# 網站預覽與出版 PDF 使用同一份 JS 排字、座標、分頁結果。
plan=[];page=4
for sheet in SHEETS:
    layout=sheet['layout'];pages=layout['pages']
    plan.append({'sheet':sheet,'pages':pages,'start':page,'end':page+len(pages)-1,'profile':layout['profile']})
    page+=len(pages)
TOTAL=page-1

def draw_operations(operations,offset_x=0,offset_y=0):
    for op in operations:
        kind=op['type']
        if kind=='group':
            draw_operations(op['ops'],offset_x+op['x'],offset_y+op['y']);continue
        if kind=='text':
            font='BookKai' if op['font']=='kai' else 'BookHei'
            value=op['text'].replace('−', '－').replace('➔', '→');size=op['size'];actual=pdfmetrics.stringWidth(value,font,size)
            c.saveState();c.setFillColor(colors.HexColor(op.get('color','#000')))
            text=c.beginText(offset_x+op['x'],H-offset_y-op['y']);text.setFont(font,size)
            if actual>0:text.setHorizScale(op['width']/actual*100)
            text.textOut(value);c.drawText(text);c.restoreState();continue
        if kind=='diagram':
            c.drawImage(ImageReader(str(TMP/(op['id']+'.png'))),offset_x+op['x'],H-offset_y-op['y']-op['h'],width=op['w'],height=op['h'],mask='auto');continue
        c.saveState();c.setStrokeColor(colors.HexColor(op.get('stroke','#999')));c.setLineWidth(op.get('lineWidth',.5))
        if op.get('dash'):c.setDash(*op['dash'])
        if kind=='rect':c.roundRect(offset_x+op['x'],H-offset_y-op['y']-op['h'],op['w'],op['h'],op.get('rx',0),stroke=1,fill=0)
        elif kind=='line':c.line(offset_x+op['x1'],H-offset_y-op['y1'],offset_x+op['x2'],H-offset_y-op['y2'])
        c.restoreState()

OUT.parent.mkdir(parents=True,exist_ok=True)
c=canvas.Canvas(str(OUT),pagesize=A4,pageCompression=1)
c.setTitle('慢慢把數學玩懂｜三年級下學期學習單彙整')
c.setAuthor('數學教材編輯')
c.setCreator('本機學習單彙整工具')
c.setSubject('38份小節學習單與10份單元總複習，每份10題，共480題')
c.setKeywords('南一版本,三年級下學期,數學,學習單,本機彙整')

def footer(page):
    c.setFont('BookHei',8);c.setFillColor(GRAY)
    c.drawRightString(W-M,M+3,f'{page} / {TOTAL}')

def rule(y,color=RULE):
    c.setStrokeColor(color);c.setLineWidth(.55);c.line(M,y,W-M,y)

def cover():
    c.bookmarkPage('cover');c.addOutlineEntry('封面','cover',0)
    c.setFillColor(INK);c.rect(M,H-46*mm,6*mm,31*mm,fill=1,stroke=0)
    c.setFont('BookHei',12);c.drawString(M+12*mm,H-24*mm,'115 學年度南一版三年級下學期')
    c.setFont('BookHei',29);c.drawString(M,H-82*mm,'慢慢把數學玩懂')
    c.setFont('BookHei',21);c.drawString(M,H-115*mm,'學習單彙整本')
    c.setStrokeColor(INK);c.setLineWidth(1.5);c.line(M,H-125*mm,W-M,H-125*mm)
    c.setFont('BookHei',14);c.drawString(M,H-144*mm,'10 個單元  /  38 份小節卷  /  10 份總複習')
    c.setFont('BookHei',12);c.drawString(M,H-158*mm,'共 48 份學習單，每份 10 題，共 480 題。')
    instructions=[
        '每單元先收錄各小節學習單，再收錄單元總複習。',
        '總複習涵蓋該單元各小節；學生姓名與日期皆留白。',
        'A4 直式雙欄，四邊各 1 公分，每題保留三排計算格。',
        '每份兩頁，每頁五題；頁碼範圍標示於目錄。',
        '示意圖不按實物比例繪製，請依題目的已知條件作答。',
        '列印建議：A4、實際大小或 100%，勿再增加印表機縮放。']
    y=H-181*mm
    for text in instructions:
        p=paragraph(text,11,'BookHei',17);p.wrap(W-2*M,100);p.drawOn(c,M,y-p.height);y-=p.height+7
    c.setFillColor(GRAY);c.setFont('BookHei',10)
    c.drawString(M,M+34,'整理日期：'+datetime.now(ZoneInfo('Asia/Taipei')).strftime('%Y-%m-%d'))
    footer(1);c.showPage()

def toc(unit_numbers,page):
    c.bookmarkPage('toc'+str(page))
    if page==2:c.addOutlineEntry('目錄','toc2',0)
    c.setFillColor(INK);c.setFont('BookHei',22);c.drawString(M,H-M-24,'學習單目錄')
    rule(H-M-37);y=H-M-64
    for number in unit_numbers:
        rows=[p for p in plan if p['sheet']['unitNumber']==number]
        unit=rows[0]['sheet']
        c.setFillColor(INK);c.setFont('BookHei',13)
        c.drawString(M,y,f'第 {number} 單元　{unit["unitTitle"]}');y-=24
        for p in rows:
            label=p['sheet']['title'];c.setFont('BookHei',10.5);c.setFillColor(colors.black)
            c.drawString(M+4*mm,y,label)
            pages=f'{p["start"]}' if p['start']==p['end'] else f'{p["start"]}-{p["end"]}'
            c.drawRightString(W-M,y,pages)
            c.linkRect('',p['sheet']['id'],(M,y-3,W-M,y+12),relative=0,thickness=0)
            y-=19
        y-=11
    if y<M+30:raise ValueError('Contents overflow')
    footer(page);c.showPage()

cover();toc(range(1,6),2);toc(range(6,11),3)
manifest={'worksheets':len(SHEETS),'questions':sum(len(sheet['problems']) for sheet in SHEETS),'pages':TOTAL,'sheets':[],'layout':{'size':'A4','margin_mm':10,'columns':2,'question_pt':[13,14],'options_pt':[11,12]}}
current=4;seen_units=set()
for item in plan:
    sheet=item['sheet'];c.bookmarkPage(sheet['id'])
    if sheet['unitId'] not in seen_units:
        key='unit-'+sheet['unitId'];c.bookmarkPage(key)
        c.addOutlineEntry(f'第 {sheet["unitNumber"]} 單元：{sheet["unitTitle"]}',key,0,closed=False)
        seen_units.add(sheet['unitId'])
    c.addOutlineEntry(sheet['title'],sheet['id'],1,closed=False)
    record={'id':sheet['id'],'title':sheet['title'],'start':current,'end':item['end'],'profile':item['profile'],'questions':[]}
    for part,layout_page in enumerate(item['pages'],1):
        draw_operations(layout_page['ops'])
        # 書籍頁碼取代單張頁碼，題目與版型本身完全相同。
        c.setFillColor(colors.white);c.rect(W-M-50,M,50,12,fill=1,stroke=0)
        c.setFont('BookHei',8);c.setFillColor(GRAY);c.drawRightString(W-M,M+3,f'{current} / {TOTAL}')
        for bounds in layout_page['questions']:
            bounds={**bounds,'page':current};record['questions'].append(bounds)
            if bounds['bottom']<H-layout_page.get('bottom',H-BOTTOM)-0.01:raise ValueError('Question below margin')
        c.showPage();current+=1
    manifest['sheets'].append(record)
assert current-1==TOTAL
c.save()
manifest['over_two_pages']=[{'id':p['sheet']['id'],'unit':p['sheet']['unitNumber'],'title':p['sheet']['title'],'pages':len(p['pages'])} for p in plan if len(p['pages'])>2]
(ROOT/'Codex/worksheet-book-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps({'pdf':str(OUT),'pages':TOTAL,'worksheets':len(SHEETS),'questions':sum(len(sheet['problems']) for sheet in SHEETS),'bytes':OUT.stat().st_size},ensure_ascii=False))
