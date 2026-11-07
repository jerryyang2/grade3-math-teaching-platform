/* 教師可調整的十單元五步教案；題目與島嶼範例引用網站共用資料。 */
(function (root) {
  'use strict';
  function build(unit, data, curriculum, steps) {
    const transfer = data.practiceBank.filter(q=>q.unitId===unit.id).at(-1);
    const p = {
      focus:unit.goal,materials:unit.materials,question:unit.ask,expected:unit.answer,
      model:unit.model,retry:unit.error[2],observe:unit.accommodations.assessment,
      transfer:transfer.question,transferAnswer:transfer.solutionSpeech,
      arcade:`選森林拔河運動會的「${unit.title}」，先選已教過的小節，再共同完成一題。`
    };
    const example = data.practiceBank.find(q=>q.unitId===unit.id);
    const island = curriculum.islands.find(i=>i.id===unit.id);
    const mission = curriculum.task(unit.id,0);
    const common = { focus:p.focus, materials:p.materials, question:p.question, expected:p.expected, support:p.retry, observe:p.observe };
    const content = {
      units:{ ...common,
        teacher:['先用本單元的先備檢核確認起點，再示範一題。',p.model,'請學生操作或指認同一概念，再把圖像連到數學符號。'],
        prerequisite:unit.prerequisite.diagnosticCheck,
        activity:unit.cra.concrete,
        student:p.model,
        pacing:'2 分鐘先備檢核 → 5 分鐘教師示範 → 6 分鐘共同操作 → 3 分鐘說明與檢查。',
        assessment:'觀察一次操作及一次說明；不只看最後答案。尚未理解時保留材料，縮小數值或減少步驟。'
      },
      practice:{ ...common,
        teacher:['在隨堂練習確認本單元或已教過的小節，選學生代號與支持程度。','先讀題、找已知與要問的量，再操作或畫圖；每題完成後才看回饋。','以 2～3 題為起點；需要時減題，最後保留一題相近但不同的題目觀察獨立表現。'],
        student:example.question, question:'先用自己的方式表示題意，再說出或指出解題的關鍵一步。',
        expected:example.options[example.answerIndex], support:example.hint, practiceId:example.id, sectionId:example.sectionId,
        pacing:'1 分鐘設定與讀題 → 5 分鐘逐題作答及回饋 → 2 分鐘換題檢核。',
        assessment:'分開記錄首次作答、提示後完成與獨立作答。口述、指認或操作可作補充證據；查看解答後不算首次獨立答對。'
      },
      battle:{ ...common,
        teacher:['在分組搶答確認單元與題型，只選已教過的範圍；先分配操作、說明與檢查角色。','每人先想，再由小組討論並送出答案；用短回合，時間到可提前結束，不要求跑完整輪。','請兩隊各說一個方法並輪替角色。若競速造成負擔，可回到隨堂練習採輪流合作。'],
        student:p.transfer, question:'請指出你用到的圖像、材料或關係，說明為什麼這樣做。', expected:p.transferAnswer,
        pacing:'1 分鐘角色與規則 → 4 分鐘短回合與說明 → 1 分鐘核對方法。',
        assessment:'觀察每位學生是否參與及能否說明方法；團隊分數與搶答速度不當作個人概念達成標準。'
      },
      arcade:{ ...common,
        teacher:[p.arcade,'教師先試一題，確認題型、數值與本課目標相符；示範操作後才交給學生。','只進行一個短挑戰；請學生把遊戲中的操作對應回本課算理。沒有適合的題型就改用課堂教具。'],
        student:p.transfer, question:'請指出你用到的圖像、材料或關係，說明為什麼這樣做。', expected:p.transferAnswer,
        pacing:'1 分鐘確認題型及示範 → 3 分鐘短挑戰 → 1 分鐘說出數學方法。',
        assessment:'分開觀察操作熟悉度與數學理解。過關或得分不能取代本單元的操作與口述檢核。'
      },
      islands:{ ...common,
        teacher:[`前往「${island.name}」，先示範走到島上與選取任務；已開始的任務可接續，不必重設進度。`,`示例任務：「${island.missions[0]}」。${island.tip}`,'讓學生完成一個任務或其中一個步驟，再請他連回今天的解題方法；不要求五分鐘完成整座島。'],
        student:mission.prompt, question:island.say, expected:curriculum.solution(mission), mission:0,
        pacing:'1 分鐘登島與讀題 → 3 分鐘操作任務 → 1 分鐘回顧或口述離堂檢核。',
        assessment:'觀察任務操作、關鍵步驟及求助情形；證書與完成進度作為鼓勵，另以實際表現確認理解。'
      }
    };
    return steps.map(([id,title,time,minutes])=>({id,title,time,minutes,...content[id]}));
  }
  const api = {build};
  if (typeof module!=='undefined' && module.exports) module.exports=api; else root.MathLessonPlans=api;
})(typeof window!=='undefined'?window:globalThis);
