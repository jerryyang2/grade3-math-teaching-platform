const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const entries = new Set([
  'index.html', 'materials.html', 'lower.html', 'worksheet-preview.html', 'favicon.svg', 'upper/index.html', 'upper/favicon.svg',
  'grade4/index.html', 'grade4/classroom.css', 'grade4/classroom.js', 'grade4/curriculum.js',
  'courses/arcade.js', 'courses/arcade.css', 'courses/tug-data.js', 'courses/classroom-figures.js',
  'courses/index.html', 'courses/curriculum-core.js', 'courses/grade1.js', 'courses/grade1-upper.js', 'courses/grade1-upper-draw.js', 'courses/grade1-upper-tools.js', 'courses/grade2.js',
  'courses/grade5.js', 'courses/grade6.js',
  'courses/practice-bank.js', 'courses/practice-early.js', 'courses/practice-grade4.js', 'courses/practice-upper.js', 'courses/practice-senior.js', 'courses/worksheet-figures.js',
  'courses/island-scene.html', 'courses/island-scene.css',
  'courses/island-scene-data.js', 'courses/island-scene.js', 'courses/early-learning.js', 'courses/early-figures.js', 'courses/teaching.js', 'courses/teaching-tools.js', 'courses/teaching-games.js', 'courses/teaching.css',
]);
const assets = /^(?:upper\/)?(?:assets|audio|css|games|islands|js)\/.+\.(?:html|css|js|svg|webp|mp3|txt|woff2)$/;
const excluded = /(?:^|\/)(?:private|student-data|exports|backups|output|tmp|Codex)(?:\/|$)/;
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0');
const publishable = tracked.filter(file => !excluded.test(file) && (entries.has(file) || assets.test(file)));

const logoutForm = '<form class="classroom-session" method="post" action="/_classroom/logout"><button type="submit" translate="no">登出 / Sign out</button></form>';
const sessionPlacements = new Map([
  ['index.html', '<main class="semester-menu">'],
  ['lower.html', '<div class="semester-return">'],
  ['upper/index.html', '<div class="semester-return">'],
  ['grade4/index.html', '<nav class="classroom-nav" aria-label="學期導覽">'],
  ['courses/index.html', '<nav class="classroom-nav" aria-label="學期導覽">'],
]);

const staging = path.join(root, '_site');
fs.mkdirSync(staging, { recursive: true });
if (fs.realpathSync(staging) !== fs.realpathSync(root) + path.sep + '_site') {
  throw Error('部署目錄必須位於本機專案內。');
}
const destination = fs.mkdtempSync(path.join(staging, 'cloudflare-pages-'));

try {
  if (publishable.length > 20000) throw Error('超過 Cloudflare Pages 檔案數限制。');
  for (const entry of entries) if (!publishable.includes(entry)) throw Error('缺少網頁入口：' + entry);

  for (const file of publishable) {
    const source = path.join(root, file);
    const stat = fs.lstatSync(source);
    if (!stat.isFile() || stat.size > 25 * 1024 * 1024 || fs.realpathSync(source) !== path.join(fs.realpathSync(root), file)) {
      throw Error('網站資產不是一般檔案或超過大小限制：' + file);
    }
    const target = path.join(destination, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (file.endsWith('.html')) {
      let html = fs.readFileSync(source, 'utf8').replace(/^\s*<script src="(?:\.\.\/)*private\/student-names\.js"><\/script>\r?\n/gm, '');
      const placement = sessionPlacements.get(file);
      if (placement) {
        if (!html.includes(placement)) throw Error('缺少登出按鈕的放置位置：' + file);
        html = html.replace(placement, placement + logoutForm)
          .replace('</head>', '  <link rel="stylesheet" href="/classroom-session.css">\n</head>');
      }
      fs.writeFileSync(target, html);
    } else {
      fs.copyFileSync(source, target);
    }
  }
  for (const file of ['_worker.js', '_routes.json', 'classroom-session.css']) {
    fs.copyFileSync(path.join(root, 'cloudflare', file), path.join(destination, file));
  }
} catch (error) {
  fs.rmSync(destination, { recursive: true });
  throw error;
}

console.log(path.relative(root, destination));
