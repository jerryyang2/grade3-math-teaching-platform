/* 首頁的五位布偶夥伴，沿用各學期的學生代號。 */
(function () {
  'use strict';
  const tips = {
    lion: '先數清楚，再往前走！',
    bear: '一步一步，我陪你慢慢想。',
    panda: '停一下，檢查剛剛的步驟。',
    fox: '找到重要的數字了嗎？',
    rabbit: '說說你的方法，讓大家也聽懂！'
  };
  document.addEventListener('DOMContentLoaded', () => {
    const garden = document.getElementById('animal-garden');
    if (!garden) return;
    const speech = document.getElementById('storybook-speech');
    const roster = () => garden.closest('.course-welcome')
      ? window.ClassroomRoster
      : window.StudentBank?.getStudents() || window.ClassroomRoster;
    function render() {
      const focused = document.activeElement?.closest('.animal-friend')?.dataset.animal;
      garden.replaceChildren(...roster().map(({animal,name}) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `animal-friend animal-${animal}`;
        button.dataset.animal = animal;
        button.setAttribute('aria-label', `聽${name}的小提醒`);
        const portrait = document.createElement('span');
        portrait.className = 'plush-portrait adventure-portrait';
        portrait.dataset.portrait = animal;
        portrait.setAttribute('aria-hidden','true');
        const label = document.createElement('span');
        label.className = 'plush-name';
        label.translate = false;
        label.textContent = name;
        button.append(portrait,label);
        return button;
      }));
      if (focused) garden.querySelector(`[data-animal="${focused}"]`)?.focus();
    }
    render();
    document.addEventListener('student-bank-renamed', render);
    garden.addEventListener('click', event => {
      const friend = event.target.closest('[data-animal]');
      if (!friend) return;
      const student = roster().find(item=>item.animal===friend.dataset.animal);
      if (!student) return;
      garden.querySelectorAll('.is-cheering').forEach(item => item.classList.remove('is-cheering'));
      friend.classList.add('is-cheering');
      const tip = tips[student.animal];
      const name = document.createElement('span');
      name.translate = false;
      name.textContent = student.name;
      speech.replaceChildren(name, '：', tip);
      if(window.spEdAudio?.speak) window.spEdAudio.speak(tip);
      else if('speechSynthesis' in window){
        const voice=new SpeechSynthesisUtterance(tip);
        voice.lang='zh-TW';
        speechSynthesis.cancel();
        speechSynthesis.speak(voice);
      }
    });
    garden.addEventListener('animationend', event => {
      if (event.animationName === 'semester-friend-cheer') event.target.closest('.animal-friend')?.classList.remove('is-cheering');
    });
    const gather = document.getElementById('storybook-greet');
    gather?.addEventListener('click', () => {
      const assembled = garden.classList.toggle('is-gathered');
      gather.setAttribute('aria-pressed', String(assembled));
      gather.querySelector('span').textContent = assembled ? '自由探索' : '夥伴集合';
      speech.textContent = assembled ? '動物小隊集合完畢！慢慢把數學玩懂。' : '出發！點點小動物，聽聽牠們的小提醒。';
    });
  });
})();
