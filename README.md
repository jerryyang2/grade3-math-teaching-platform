# 慢慢把數學玩懂｜115 學年度南一版一至六年級

同一個學期選單提供一至六年級、十二學期的南一版課程。參照 115 學年度課程計畫確認單元範圍，網站的例題、圖像、操作活動與引導文字為自編教材。

[公開課程計畫查詢入口](https://www.curriculum.chc.edu.tw/)

## 本機使用

雙擊 `index.html` 開啟學期選單，也可在專案根目錄執行下列指令，然後開啟 `http://127.0.0.1:8000/`。三年級兩學期各自保存該瀏覽器的學習紀錄。

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

- 三上入口為 `upper/index.html`，保留九個單元、27 個小節、270 題與 36 份學習單。三下入口為 `lower.html`。兩頁頂端皆可回學期選單。
- 三下備課指引逐單元列出數學與特需學習策略的學習內容、學習表現及觀察方式，可直接開啟隨堂診斷。
- 教師可記錄核心概念、學習策略、換題表現，以及學生的表達方式與提示。教師觀察與線上作答分開儲存，可匯出，也可在 IEP 草稿帶入同代號同單元的最近一回合。
- 隨堂練習、分組搶答、森林拔河運動會與學習單使用同一份三下題庫。數學島有 10 座島，每座島選 3 個小節任務。
- 三下課程含 10 個單元、38 個小節，共 380 題。原版其餘遊戲作為先備或跨年級補充。
- 朗讀使用裝置語音。中文字型與部分補充遊戲的外部資源需要網路。
- 四上與四下共用 `grade4/index.html`，由 `?term=upper` 或 `?term=lower` 選擇學期；兩學期各 10 個單元。備課沿用 `grade4/curriculum.js`，隨堂練習及 A4 學習單依同一單元範圍自編，四年級練習不寫入三年級學生紀錄。
- 一、二、五、六年級由 `courses/index.html?grade=1&term=upper` 這類網址選課。依計畫順序涵蓋 72 個單元；每單元含教師動手活動、重點、隨堂練習與 A4 單元總複習。
- 一上依南一 115 上課本與習作目次及題型自編，分為 9 個單元、19 個小節。190 道固定題含基礎、應用和辨錯；每個小節另可連續抽取圖像題。教具、兩人合作闖關與九座島嶼沿用同一套單元目標。學習單為 28 份，每份 10 題兩頁。使用 `npm run worksheets:grade4:pdf -- --first-upper` 重建一上彙整本。[南一 NaniBox 教材入口](https://box3.nani.com.tw/resource)
- 十二學期的隨堂練習與學習單預覽使用本機字嗨注音標楷。學習單為 A4 雙欄，題卡有小節與題型、答題欄、計算格和題圖。可選單元與練習範圍，並可選擇一般字型；一、二、四、五、六年級的題圖也可改成黑白。
- 十二學期都有備課、課堂、教具、練習、分組搶答、遊戲、數學島、學習單、課程調整和觀察入口。三年級保留原有的上課流程；其他學期使用各自的單元題庫與共同工具。作答及代幣按年級與學期分開留在同一瀏覽器。

三下的本機課堂名單存放在 Git 排除的 `private/student-names.js`，供首頁角色、代幣存摺及補充加法遊戲載入。只有 Git 檔案的副本會顯示代號。

## GitHub Pages 發布

[原網站](https://jerryyang2.github.io/grade3-math-toolkit/)由 `grade3-math-toolkit` 的 `pages.yml` 工作流程發布。工作流程取用 `grade3-math-teaching-platform` 儲存庫中已審查的新版來源，驗證後發布到原網址。公開頁面使用匿名教室標示，並排除本機學生名單、PDF、暫存與 Cloudflare 登入程式。

每次更新來源後，須接著執行網站發布並確認 Actions 成功，最後比對線上頁面與新版資產。只推送來源不會觸發另一個儲存庫的工作流程。

```sh
gh workflow run pages.yml --repo jerryyang2/grade3-math-toolkit --ref main
```

## Cloudflare Pages 發布

整學年公開版使用獨立專案 `dapi-math-classroom-115`，包含一至六年級上下學期課程和網頁列印功能。部署指令只打包已納入 Git 的網站資產和 Cloudflare 登入程式，網站使用學生代號。密碼驗證使用 Pages 專案的加密環境變數 `CLASSROOM_AUTH`。學期選單和課程頁提供登出按鈕，登出會清除瀏覽器的登入狀態。

```sh
site_dir=$(npm run cloudflare:prepare --silent)
npx wrangler pages deploy "$site_dir" --project-name dapi-math-classroom-115 --branch main
```

## 教材與 PDF

一、二、四、五、六年級的 92 個單元共提供 1,655 道課堂練習和 191 份獨立學習單。題型對照南一 115 上與 114 下的課本和習作，參考範圍見[題型參照與自編範圍](docs/math-practice-sources.md)。課堂、分組搶答和遊戲共用新版題庫；學習單依同一單元目標另編讀圖、填答、運算及推理題。

三下單元、課綱對照與隨堂診斷來源為 `js/data.js`；網頁備課指引及教師手冊共用這份資料。題目與已知條件圖像由 `js/grade3-lower-problems.js` 和 `js/worksheet-diagrams.js` 提供。網站的學習單預覽與本機彙整本共用 A4 分頁，三下每份 10 題、兩頁，每頁 5 題。

`output/pdf/` 存放三下教師手冊和 48 份學習單的彙整本。教師手冊每單元含教學重點與一頁可紙本記錄的隨堂診斷。重製需要 Node.js、Python 的 reportlab、pypdf、pdfplumber，以及可嵌入的 BiauKaiTC。題圖轉檔另需 Node.js 的 sharp。可用 `WORKSHEET_PDF_PYTHON`、`WORKSHEET_PDF_NODE_MODULES` 和 `BIAUKAI_TTF` 指定本機環境。

```sh
npm run worksheets:pdf
npm run worksheets:pdf:check
npm run teacher:pdf
node upper/scripts/sync-worksheet-pdf.cjs --check
```

三上彙整本由三上的網頁資料產生，放在 `upper/output/pdf/`。兩套彙整本都留在本機。

修改可見文字後，可用 `npm ci` 安裝工具，執行 `npm run i18n:extract`、更新英文對照，再跑 `npm run i18n:build` 與 `npm run i18n:check`。

四上提供 48 份（10 份單元總複習、38 份小節專練），四下提供 52 份（10 份單元總複習、42 份小節專練）。一、二、四、五、六年級學習單題型由 `courses/practice-*.js` 提供，含讀圖、填答、運算、情境應用和辨錯。每份 A4 兩頁、每頁 5 題，可在網頁切換範圍，並在預覽中查看教師解答。本機可用 Chrome、Playwright 和 Python 的 pypdf 重新產生彙整本：

```sh
npm run worksheets:grade4:pdf
npm run worksheets:grade4:pdf -- --all  # 一、二、四、五、六年級十冊
node scripts/worksheets/check-course-practice.cjs
node scripts/check-content-consistency.cjs
```

## 教材核對進度

目前已建立十二學期題目與可見文字的盤點，針對取得的課本、習作進行文字檢索、數字替換後的句型比對及疑似相近內容覆核。三上已同步參賽版的 46 題風險修訂，並更新對應題圖、英文對照與朗讀。其餘新增修訂包含紙帶起點、零的題圖、時刻比較、紙鈔量詞與分數逆推條件。一下一共 242 頁、二上一共 264 頁、二下一共 262 頁參考書另完成圖像總覽及共用題型覆核，並釐清數到 100、長度及日期的三處提示。

這是階段性的教材檢查，尚未完成十二學期的同版本逐題核對。目前下學期參考書是 114 下，網站採 115 學年度課程安排；三下「找規律」缺少同版原書，三下習作亦待補齊。未命中文字比對不代表沒有侵權風險，圖像、情境、選材及編排仍須持續核對。出版社授權正在詢問中；本專案尚未取得南一的正式授權，亦不代表南一官方教材或合作產品。原書、頁面截圖、逐題對照與授權往來僅存於本機私有資料夾，不隨網站發布。
