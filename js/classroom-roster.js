/* 依穩定的學生 ID 保留代幣與學習紀錄。姓名可由本機名單提供。 */
window.ClassroomRoster = Object.freeze([
  {id:1, animal:'lion', avatar:'🦁', label:'學生 A', stars:3},
  {id:3, animal:'bear', avatar:'🐻', label:'學生 C', stars:3},
  {id:2, animal:'panda', avatar:'🐼', label:'學生 B', stars:4},
  {id:4, animal:'fox', avatar:'🦊', label:'學生 D', stars:2},
  {id:5, animal:'rabbit', avatar:'🐰', label:'學生 E', stars:5}
].map(({label,...student})=>Object.freeze({
  ...student, name:window.ClassroomStudentNames?.[student.id] || label
})));
