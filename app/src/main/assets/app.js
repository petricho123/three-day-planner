'use strict';
const P=Planner,$=s=>document.querySelector(s),KEY='three-day-planner-v1';
let state=null,index=0,routineEdit=false,dayEdit=[false,false,false],opened=[true,false,false],archive=null,archiveIndex=0,editorAction=null,lastToday=P.dateKey();
function toast(t){$('#toast').textContent=t;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch(e){toast('저장하지 못했습니다. 앱을 닫기 전에 저장 공간을 확인해주세요.');return false;}}
function node(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function button(text,fn,cls){const b=node('button',text,cls);b.type='button';b.onclick=fn;return b;}
function pretty(date){const [y,m,d]=date.split('-');const day=new Date(Number(y),Number(m)-1,Number(d));return Number(m)+'.'+Number(d)+' '+['일','월','화','수','목','금','토'][day.getDay()];}
function edit(title,value,action){editorAction=action;$('#editor-title').textContent=title;$('#editor-input').value=value;$('#editor').showModal();$('#editor-input').focus();}
function source(){return archive?{start:archive.start,cycles:archive.cycles}:state;}
function current(){return source().cycles[index];}
function check(checked,name,action){const l=node('label',undefined,'check'),i=document.createElement('input');i.type='checkbox';i.checked=checked;i.disabled=!!archive;i.setAttribute('aria-label',name);i.onchange=()=>{action(i.checked);save();render();};l.append(i);return l;}
function render(){
 if(!state)return;
 const src=source();if(!archive)P.ensureCycle(state,index);const c=current();
 const start=P.addDate(src.start,index*3),dates=[0,1,2].map(n=>P.addDate(start,n));
 const day=dates.indexOf(P.dateKey());
 $('#cycle-title').textContent=(archive?'보관 기록 · ':'')+(index+1)+'번째 작심삼일';
 $('#cycle-date').textContent=pretty(dates[0])+' — '+pretty(dates[2]);
 const archiveKeys=Object.keys(src.cycles).map(Number).sort((a,b)=>a-b);
 $('#previous').disabled=archive?archiveKeys.indexOf(index)<=0:index===0;
 $('#next').disabled=archive?archiveKeys.indexOf(index)===archiveKeys.length-1:false;
 $('#reset-button').disabled=!!archive;
 const main=$('#planner');main.replaceChildren();
 const panel=node('section',undefined,'panel'),heading=node('div',undefined,'routine-heading');
 const count=day<0?'3일 함께 보기':'오늘 '+c.routines.filter(r=>r.checks[day]).length+'/'+c.routines.length+' 완료';
 const fold=button('',()=>{c.folded=!c.folded;if(!archive)save();render();});fold.setAttribute('aria-expanded',String(!c.folded));fold.append(node('strong','이번 3일 루틴 '+(c.folded?'⌄':'⌃')),node('span',count,'mini'));heading.append(fold);
 if(!archive)heading.append(button(routineEdit?'완료':'편집',()=>{routineEdit=!routineEdit;if(routineEdit)c.folded=false;render();},'edit'));
 panel.append(heading);
 if(!c.folded){
  if(routineEdit){c.routines.forEach(r=>{const row=node('div',undefined,'routine-row');row.append(node('span',r.name),button('수정',()=>edit('루틴 수정',r.name,value=>{r.name=value;})),button('삭제',()=>{c.routines=c.routines.filter(x=>x.id!==r.id);save();render();},'danger'));panel.append(row);});}
  else if(c.routines.length){const table=document.createElement('table'),head=table.createTHead().insertRow();['반복할 일',...dates.map(d=>pretty(d).split(' ')[0])].forEach(t=>head.append(node('th',t)));const body=table.createTBody();c.routines.forEach(r=>{const row=body.insertRow();row.insertCell().textContent=r.name;dates.forEach((d,di)=>row.insertCell().append(check(r.checks[di],r.name+' '+pretty(d),v=>r.checks[di]=v)));});panel.append(table);}
  else panel.append(node('div','이번 3일에 반복할 일을 추가해보세요.','empty'));
  if(!archive)panel.append(button('＋ 루틴 추가',()=>edit('루틴 추가','',value=>{c.routines.push({id:P.id(),name:value,checks:[false,false,false]});}),'add'));
 }
 main.append(panel);
 dates.forEach((date,di)=>{
  const card=node('details',undefined,'panel');card.open=opened[di];card.ontoggle=()=>opened[di]=card.open;
  const summary=document.createElement('summary'),title=node('span',(di+1)+'일차 · '+pretty(date));if(date===P.dateKey())title.append(node('span','오늘','badge'));
  summary.append(title,node('span',c.days[di].filter(t=>t.done).length+'/'+c.days[di].length+' 완료','mini'));card.append(summary);
  c.days[di].forEach(t=>{const row=node('div',undefined,'task'),label=document.createElement('label'),box=document.createElement('input');box.type='checkbox';box.checked=t.done;box.disabled=!!archive;box.onchange=()=>{t.done=box.checked;save();render();};label.append(box,node('span',t.name));row.append(label);if(dayEdit[di]&&!archive)row.append(button('수정',()=>edit('계획 수정',t.name,value=>t.name=value)),button('삭제',()=>{c.days[di]=c.days[di].filter(x=>x.id!==t.id);save();render();},'danger'));card.append(row);});
  if(!c.days[di].length)card.append(node('div','아직 작성한 계획이 없어요.','empty'));
  if(!archive){const tools=node('div',undefined,'day-tools');tools.append(button(dayEdit[di]?'완료':'편집',()=>{dayEdit[di]=!dayEdit[di];render();},'edit'));card.append(button('＋ 계획 추가',()=>edit((di+1)+'일차 계획 추가','',value=>c.days[di].push({id:P.id(),name:value,done:false})),'add'),tools);}
  main.append(card);
 });
 $('#context').textContent=archive?'리셋 이전 기록 · 읽기 전용':day>=0?'오늘 · '+(day+1)+'일차':P.serial(start)>P.serial(P.dateKey())?'다음 작심을 미리 계획해보세요.':'지난 작심의 기록';
}
function goToday(){archive=null;index=P.cycleIndex(state,P.dateKey());const c=P.ensureCycle(state,index);const d=P.serial(P.dateKey())-P.serial(P.addDate(state.start,index*3));opened=[0,1,2].map(n=>n===d);if(!opened.includes(true))opened[0]=true;routineEdit=false;dayEdit=[false,false,false];save();render();}
$('#previous').onclick=()=>{if(archive){const keys=Object.keys(archive.cycles).map(Number).sort((a,b)=>a-b);index=keys[keys.indexOf(index)-1];}else index--;routineEdit=false;dayEdit=[false,false,false];opened=[true,false,false];render();if(!archive)save();};
$('#next').onclick=()=>{if(archive){const keys=Object.keys(archive.cycles).map(Number).sort((a,b)=>a-b);index=keys[keys.indexOf(index)+1];}else index++;routineEdit=false;dayEdit=[false,false,false];opened=[true,false,false];render();if(!archive)save();};
$('#menu-button').onclick=()=>{const m=$('#menu');m.hidden=!m.hidden;$('#menu-button').setAttribute('aria-expanded',String(!m.hidden));};
$('#today-button').onclick=()=>{$('#menu').hidden=true;goToday();};
$('#reset-button').onclick=()=>{$('#menu').hidden=true;$('#confirm').showModal();};
$('#cancel-reset').onclick=()=>$('#confirm').close();
$('#confirm-reset').onclick=()=>{state=P.reset(state,P.dateKey());$('#confirm').close();goToday();toast('오늘부터 새로운 작심삼일을 시작합니다.');};
$('#editor-form').onsubmit=e=>{e.preventDefault();const value=$('#editor-input').value.trim();if(!value){$('#editor-input').setCustomValidity('내용을 입력해주세요.');$('#editor-input').reportValidity();return;}editorAction(value);save();$('#editor').close();render();};
$('#editor-input').oninput=()=>$('#editor-input').setCustomValidity('');
$('#cancel-editor').onclick=()=>$('#editor').close();
window.closeEditor=()=>{const dialog=document.querySelector('dialog[open]');if(dialog&&dialog.id!=='start')dialog.close();else if(!$('#menu').hidden)$('#menu').hidden=true;else toast('홈 버튼으로 앱을 나갈 수 있어요.');};
$('#history-button').onclick=()=>{const list=$('#history-list');list.replaceChildren();if(!state.archives.length)list.append(node('p','보관된 기록이 없습니다.'));[...state.archives].reverse().forEach(a=>{list.append(button(a.start+' 시작 · '+a.resetAt+' 리셋',()=>{archive=JSON.parse(JSON.stringify(a));const keys=Object.keys(a.cycles).map(Number).sort((a,b)=>a-b);if(!keys.length)return;index=keys[0];routineEdit=false;dayEdit=[false,false,false];opened=[true,false,false];$('#history').close();render();},'history-entry'));});$('#menu').hidden=true;$('#history').showModal();};
$('#close-history').onclick=()=>$('#history').close();
$('#start-date').value=P.dateKey();
$('#start').addEventListener('cancel',e=>e.preventDefault());
$('#start-form').onsubmit=e=>{e.preventDefault();state=P.create($('#start-date').value);P.ensureCycle(state,0);if(save()){$('#start').close();goToday();}};
window.refreshToday=()=>{const today=P.dateKey();if(state&&today!==lastToday){lastToday=today;goToday();}};
setInterval(window.refreshToday,30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)window.refreshToday();});
try{const raw=localStorage.getItem(KEY);if(raw){state=P.parse(raw);goToday();}else $('#start').showModal();}catch(e){toast('저장 데이터를 읽을 수 없습니다. 기존 데이터 보호를 위해 초기화하지 않았습니다.');$('#planner').append(node('p','앱을 다시 실행해주세요. 문제가 계속되면 데이터를 지우기 전에 지원을 요청해주세요.'));}
