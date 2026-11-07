/* 將各學期的課堂練習轉成森林拔河的題庫格式。 */
(() => {
  'use strict';
  const courseRoot = new URL('./', document.currentScript.src);
  const sources = {
    1: ['grade1-upper.js', 'grade1-upper-draw.js', 'grade1.js'],
    2: ['grade2.js'],
    4: ['../grade4/curriculum.js'],
    5: ['grade5.js'],
    6: ['grade6.js']
  };

  function load(path) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL(path, courseRoot);
      script.onload = resolve;
      script.onerror = () => reject(new Error(path));
      document.head.append(script);
    });
  }

  async function open(grade, term) {
    await Promise.all(['curriculum-core.js', 'practice-bank.js', 'worksheet-figures.js', 'classroom-figures.js'].map(load));
    for (const path of sources[grade]) await load(path);
    if (grade <= 2) {
      await Promise.all(['early-figures.js', 'practice-early.js'].map(load));
    } else if (grade === 4) {
      await load('practice-grade4.js');
    } else {
      await Promise.all(['practice-senior.js', 'practice-upper.js'].map(load));
    }

    const catalog = grade === 4 ? window.Grade4Math : window.MathCourseKit.catalog[grade];
    const units = catalog[term];
    window.CoursePracticeBank.prepare(grade, term, units);
    const levels = {guided: 1, apply: 2, reason: 3};
    const practiceBank = units.flatMap(unit => unit.sections.flatMap(section => section.questions.map(question => ({
      id: question.id,
      unitId: unit.id,
      sectionId: section.id,
      sectionTitle: section.title,
      level: levels[question.level],
      question: question.text.replace('點一下', '看圖，找出'),
      options: question.choices,
      answerIndex: question.choices.indexOf(question.answer),
      hint: section.tip,
      visual: question.visual
    }))));
    return {
      data: {units: units.map((unit, index) => ({...unit, number: index + 1})), practiceBank},
      draw: question => window.ClassroomFigures.draw(question.visual)
    };
  }

  window.CourseTugData = {
    open,
    supports: grade => Object.hasOwn(sources, grade),
    title: (grade, term) => '一二三四五六'[grade - 1] + (term === 'upper' ? '上數學' : '下數學')
  };
})();
