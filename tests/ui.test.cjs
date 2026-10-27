const {JSDOM}=require('jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const base=require('node:path').join(__dirname,'../app/src/main/assets/');
const dom=new JSDOM(fs.readFileSync(base+'index.html','utf8'),{url:'https://planner.local/',runScripts:'outside-only'}),w=dom.window,d=w.document;
w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
w.eval(fs.readFileSync(base+'core.js','utf8'));w.eval(fs.readFileSync(base+'app.js','utf8'));
const q=s=>d.querySelector(s),click=s=>q(s).click(),submit=s=>q(s).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
function saveEdit(value){q('#editor-input').value=value;submit('#editor-form');}
q('#start-date').value='2026-10-27';submit('#start-form');click('.routine-heading + .empty + .add');saveEdit('운동');
assert.equal(d.querySelectorAll('table input').length,3);let checkbox=q('table input');checkbox.checked=true;checkbox.dispatchEvent(new w.Event('change'));
click('details .add');saveEdit('신경계 공부');assert.equal(q('details .task span').textContent,'신경계 공부');
click('#next');assert.equal(q('table input').checked,false);click('.routine-heading .edit');click('.routine-row button');saveEdit('독서');click('#previous');assert.equal(q('table td').textContent,'운동');assert.equal(q('table input').checked,true);
click('details .day-tools button');click('details .task .danger');assert.equal(d.querySelectorAll('details .task').length,0);
click('#reset-button');click('#cancel-reset');assert.equal(d.querySelectorAll('table input').length,3);click('#reset-button');click('#confirm-reset');assert.equal(d.querySelectorAll('table input').length,0);
click('#history-button');click('.history-entry');assert.equal(q('table td').textContent,'운동');assert.equal(q('table input').disabled,true);
click('#today-button');const stored=JSON.parse(w.localStorage.getItem('three-day-planner-v1'));assert.equal(stored.archives.length,1);assert.equal(stored.start,w.Planner.dateKey());
assert.equal(stored.archives[0].cycles[1].routines[0].name,'독서');
console.log('DOM interaction checks passed: setup/add/check/edit/delete/copy/reset/cancel/archive/persistence');w.close();
