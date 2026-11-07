"""Build the teacher guide from the same lesson data used by the site."""
from html import escape
import json
from pathlib import Path
import subprocess
import sys

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts'))
from pdf_fonts import register_biaukai

register_biaukai('GuideKai')
data = json.loads(subprocess.check_output(
    ['node', '-e', "console.log(JSON.stringify(require('./js/data.js')))"], cwd=ROOT))
output = ROOT / 'output/pdf/慢慢把數學玩懂_三下教師手冊.pdf'
output.parent.mkdir(parents=True, exist_ok=True)
pdf = canvas.Canvas(str(output), pagesize=A4)
pdf.setTitle('慢慢把數學玩懂｜三下教師手冊')
pdf.setAuthor('數學教材編輯')
pdf.setSubject('115 學年度南一版三下第六冊教師手冊')
width, height = A4
left = 46
green = colors.HexColor('#254d3e')
pale = colors.HexColor('#e8f0e7')
units = data['units']
total = len(units) * 2 + 1
sources = data['curriculumSources']


def block(text, y, size=13, color=green):
    style = ParagraphStyle('guide', fontName='GuideKai', fontSize=size,
                           leading=size * 1.38, wordWrap='CJK', textColor=color)
    item = Paragraph(escape(text), style)
    _, used = item.wrap(width - 2 * left, height)
    item.drawOn(pdf, left, y - used)
    return y - used


def finish(page):
    pdf.setStrokeColor(green)
    pdf.line(left, 43, width - left, 43)
    pdf.setFont('GuideKai', 10)
    pdf.drawRightString(width - left, 27, f'{page} / {total}')
    pdf.showPage()


pdf.bookmarkPage('cover')
pdf.addOutlineEntry('封面與目錄', 'cover', 0)
pdf.setFillColor(pale)
pdf.roundRect(left - 10, height - 211, width - 2 * left + 20, 162, 13, fill=1, stroke=0)
block('115 學年度南一版國小三下第六冊', height - 75, 15)
block('慢慢把數學玩懂', height - 112, 32)
block('教師手冊', height - 165, 23)
y = block('教學前先做短診斷，再視需要提供圖像、朗讀、實物操作或逐步提示。', height - 242)
for label, url in [
    ('課程計畫與各週進度', data['meta']['source']),
    ('數學領域課綱', sources['math']),
    ('特殊需求領域課綱：學習策略', sources['special'] + '#page=45'),
    ('特殊教育課程實施規範', sources['implementation']),
    ('特殊教育課程教材教法及評量實施辦法', sources['assessment']),
]:
    y = block(label + '（點擊開啟）', y - 4, 11)
    pdf.linkURL(url, (left, y, width - left, y + 15), relative=0)
y = block('單元目錄', y - 28, 19) - 12
for unit in units:
    row = f'{unit["number"]:02d}   {unit["title"]}'
    pdf.setFillColor(pale if unit['number'] % 2 else colors.white)
    pdf.rect(left - 2, y - 22, width - 2 * left + 4, 24, fill=1, stroke=0)
    block(row, y, 14)
    pdf.setFillColor(green)
    pdf.setFont('GuideKai', 12)
    pdf.drawRightString(width - left - 4, y - 13, f'{unit["number"] * 2}–{unit["number"] * 2 + 1}')
    pdf.linkRect('', unit['id'], (left, y - 22, width - left, y + 2), relative=0, thickness=0)
    y -= 26
finish(1)

for unit, iep in zip(units, data['iepObjectives']):
    pdf.bookmarkPage(unit['id'])
    pdf.addOutlineEntry(f'第 {unit["number"]} 單元 {unit["title"]}', unit['id'], 0)
    y = block(f'單元 {unit["number"]:02d}  ／  {unit["curriculumCode"]}', height - 48, 12)
    y = block(unit['title'], y - 6, 27)
    y = block(unit['goal'], y - 9, 14)
    y = block('  ／  '.join(unit['subtopics']), y - 8, 11)
    parts = [
        ('課前檢核', unit['prerequisite']['diagnosticCheck']),
        ('材料與示範', unit['materials'] + '。' + unit['model']),
        ('課堂提問與參考答法', unit['ask'] + ' ' + unit['answer']),
        ('從操作到算式', ' → '.join(unit['steps'])),
        ('常見迷思與引導', unit['error'][1] + ' ' + unit['error'][2]),
        ('IEP 觀察目標草案', iep['goal'] + ' ' + iep['criteria']),
    ]
    for title, body in parts:
        y = block(title, y - 12, 14)
        y = block(body, y - 3, 12, colors.HexColor('#252c29'))
    assert y > 56, f'Guide content overflow: {unit["id"]}'
    finish(unit['number'] * 2)

    diagnostic = unit['diagnostic']
    indicator = diagnostic['indicator']
    pdf.bookmarkPage(unit['id'] + '-diagnosis')
    pdf.addOutlineEntry('課綱與隨堂診斷', unit['id'] + '-diagnosis', 1)
    y = block(f'單元 {unit["number"]:02d} ／ {unit["title"]}', height - 48, 12)
    y = block('課綱對照與隨堂診斷', y - 6, 25)
    y = block(f'數學學習內容：{unit["curriculumCode"]}；學習表現：{diagnostic["mathPerformance"]}', y - 10, 12)
    y = block(f'學習策略：{indicator["code"]} {indicator["title"]}；{indicator["contentCode"]} {indicator["content"]}', y - 6, 12)
    pdf.linkURL(sources['special'] + f'#page={indicator["page"]}', (left, y, width - left, y + 16), relative=0)
    y = block('依基線與 IEP 選用。可用口述、指認、操作或紙筆；報讀與延時可照常提供，解題提示另記。', y - 12, 12)
    for index, task in enumerate(diagnostic['tasks'], 1):
        y = block(f'{index}. {task["label"]}', y - 12, 14)
        y = block(task['prompt'], y - 3, 12)
        y = block('觀察：' + task['evidence'], y - 4, 12)
        y = block('結果：□ 獨立完成　□ 提示後完成　□ 待再教　□ 未觀察', y - 4, 10)
    y = block('依結果安排下一步', y - 14, 14)
    y = block('待再教：' + diagnostic['reteach'], y - 4, 12)
    y = block('提示後完成：減少解題提示，再用同概念的另一題確認。獨立完成：另選情境再看一次；未觀察項目可另安排。', y - 4, 12)
    y = block('日期：＿＿＿＿　學生代號：＿＿＿＿　評量調整／提示：＿＿＿＿＿＿＿＿', y - 16, 10)
    y = block('學生怎麼回答或操作？下次要保留哪一種支持？', y - 22, 13)
    pdf.setStrokeColor(colors.HexColor('#a1b7a9'))
    for offset in (24, 48, 72):
        pdf.line(left, y - offset, width - left, y - offset)
    assert y - 72 > 56, f'Diagnostic content overflow: {unit["id"]}'
    finish(unit['number'] * 2 + 1)

pdf.save()
book = PdfReader(output)
assert len(book.pages) == total
assert len(book.outline) == 1 + len(units) * 2
assert len(book.pages[0]['/Annots']) == len(units) + 5
for unit in units:
    page = unit['number'] * 2 - 1
    text = ''.join(book.pages[page].extract_text().split())
    assert unit['title'] in text and all(section['title'].split(' ', 1)[1].replace(' ', '') in text for section in unit['sections'])
    assert 'IEP觀察目標草案' in text
    diagnostic = ''.join(book.pages[page + 1].extract_text().split())
    assert unit['diagnostic']['indicator']['code'] in diagnostic
    assert unit['diagnostic']['indicator']['contentCode'] in diagnostic
    assert all(''.join(task['prompt'].split()) in diagnostic for task in unit['diagnostic']['tasks'])
    assert book.get_destination_page_number(book.outline[2 * unit['number'] - 1]) == page
    assert book.get_destination_page_number(book.outline[2 * unit['number']][0]) == page + 1
assert '/Users/' not in str(book.metadata)
print(f'PASS：{output.name}，{total} 頁、{len(units)} 個單元目錄跳頁與 30 項課綱觀察')
