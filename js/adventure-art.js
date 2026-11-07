/* 同一套布偶圖供課堂、遊戲與群島共用。 */
(function () {
  'use strict';
  const animals = { lion:'🦁', bear:'🐻', panda:'🐼', fox:'🦊', rabbit:'🐰' };
  const extras = ['cat','owl','hedgehog','duck','otter','squirrel','deer','giraffe','dinosaur','dolphin','beaver','frog','raccoon','tiger'];
  const emoji = {...animals,cat:'🐱',owl:'🦉',hedgehog:'🦔',duck:'🦆',otter:'🦦',squirrel:'🐿',deer:'🦌',giraffe:'🦒',dinosaur:'🦖',dolphin:'🐬',beaver:'🦫',frog:'🐸',raccoon:'🦝',tiger:'🐯'};
  const names = [
    [/獅/,'lion'],[/熊貓/,'panda'],[/小熊|布布熊/,'bear'],[/狐/,'fox'],[/兔/,'rabbit'],
    [/貓頭鷹/,'owl'],[/貓/,'cat'],[/刺蝟/,'hedgehog'],[/鴨/,'duck'],[/獺/,'otter'],
    [/松鼠/,'squirrel'],[/小鹿|梅花鹿/,'deer'],[/長頸鹿/,'giraffe'],[/恐龍/,'dinosaur'],
    [/海豚/,'dolphin'],[/河狸/,'beaver'],[/蛙/,'frog'],[/浣熊/,'raccoon'],[/虎/,'tiger']
  ];
  const asset = new URL('../assets/animals/', document.currentScript.src);
  const images = new Map();
  function portrait(animal) {
    if (!Object.hasOwn(emoji, animal)) return '';
    const index = extras.indexOf(animal);
    const atlas = index < 0 ? '' :
      ' data-portrait-atlas style="--portrait-position:' + index % 4 / 3 * 100 + '% ' + Math.floor(index / 4) / 3 * 100 + '%"';
    return '<span class="adventure-portrait" data-portrait="' + animal + '"' + atlas + ' aria-hidden="true"></span>';
  }
  function animalForName(name) {
    return names.find(([pattern]) => pattern.test(name))?.[1];
  }
  function loadImage(file) {
    if (!images.has(file)) {
      images.set(file, new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = new URL(file, asset).href;
      }));
    }
    return images.get(file);
  }
  async function paintPortrait(canvas, animal) {
    const index = extras.indexOf(animal);
    const rabbit = animal === 'rabbit';
    const file = index >= 0 ? 'plush-island-friends.webp' : rabbit ? 'plush-rabbit.webp' : 'plush-friends.webp';
    const image = await loadImage(file);
    const columns = index >= 0 ? 4 : rabbit ? 1 : 2;
    const tile = index >= 0 ? index : rabbit ? 0 : Object.keys(animals).indexOf(animal);
    const sw = image.width / columns, sh = image.height / columns;
    const ctx = canvas.getContext('2d'), size = canvas.width, center = size / 2;
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, 2 * Math.PI);
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#e8def3';
    ctx.fillRect(0, 0, size, size);
    const padding = rabbit ? size * .05 : 0;
    ctx.drawImage(image, sw * (tile % columns), sh * Math.floor(tile / columns), sw, sh,
      padding, padding, size - 2 * padding, size - 2 * padding);
    ctx.restore();
    ctx.strokeStyle = '#fffdf5';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  window.AdventureArt = {
    portrait, animalForName, paintPortrait,
    forAvatar: avatar => portrait(Object.keys(emoji).find(animal => typeof avatar === 'string' && emoji[animal] === avatar.replace(/\uFE0F/g,''))),
    cheer: () => '<div class="adventure-cheer" aria-hidden="true">' + Object.keys(animals).map(portrait).join('') + '</div>'
  };
})();
