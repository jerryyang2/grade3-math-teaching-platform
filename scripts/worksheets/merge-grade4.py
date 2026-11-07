"""核對每份的題數與 A4 分頁，分學期合併，建立可跳轉的目錄書籤。"""
import json
import re
import sys
import unicodedata
from pathlib import Path

from pypdf import PdfReader, PdfWriter

output = Path(sys.argv[1])
for term in json.load(sys.stdin):
    label, expected, manifest = term['label'], term['expected'], term['entries']
    if len(manifest) != expected:
        raise ValueError(f'{label} 應有 {expected} 份')
    writer = PdfWriter()
    parents = {}
    for item in manifest:
        reader = PdfReader(item['file'])
        location = f"{label} {item['unit']} {item['title']}"
        if len(reader.pages) != 2:
            raise ValueError(f'{location} 不是兩頁')
        for number, page in enumerate(reader.pages):
            if abs(float(page.mediabox.width) - 595.3) > 2 or abs(float(page.mediabox.height) - 841.9) > 2:
                raise ValueError(f'{location} 不是 A4')
            text = page.extract_text()
            # Chromium 的部分中文字型會以等形部首碼位輸出「長」與「目」。
            normalized = re.sub(r'\s+', '', unicodedata.normalize('NFKC', text)).translate(str.maketrans({'⻑':'長', '⺫':'目'}))
            if '115年大埤國小學習教室' not in normalized:
                raise ValueError(f'{location} 第 {number + 1} 頁缺少學習教室頁首')
            if number == 1 and not all(label in normalized for label in [
                '個別化支持紀錄', '學習內容:題意簡化、圖像提示', '學習歷程:計算對齊、分段引導',
                '學習環境:減少干擾、安心練習', '學習評量:延長時間、報讀題目'
            ]):
                raise ValueError(f'{location} 第二頁缺少個別化支持紀錄表')
            if [int(n) for n in re.findall(r'第\s*(\d+)\s*題', text)] != list(range(number * 5 + 1, number * 5 + 6)):
                raise ValueError(f'{location} 的某頁不是五題')
        start = len(writer.pages)
        for page in reader.pages:
            writer.add_page(page)
        if item['unit'] not in parents:
            parents[item['unit']] = writer.add_outline_item(item['unit'], start)
        writer.add_outline_item(item['title'], start, parent=parents[item['unit']])
    writer.add_metadata({'/Title': f'慢慢把數學玩懂｜{label}學習單彙整', '/Author': ''})
    path = output / f'慢慢把數學玩懂_{label}學習單彙整_{expected}份.pdf'
    draft = path.with_suffix('.tmp')
    with draft.open('wb') as file:
        writer.write(file)
    if len(PdfReader(draft).pages) != 2 * expected:
        draft.unlink()
        raise ValueError(f'{label} 彙整本頁數不符')
    draft.replace(path)
    print(f'{label} PASS: {expected} 份 / {expected * 2} 頁，每頁 5 題')
