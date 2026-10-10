
'use strict';
const s=SL.byName(document.body.dataset.shoe);
function sync(){
 document.querySelectorAll('[data-compare]').forEach(b=>{const on=SL.comparison().includes(b.dataset.compare);b.textContent=on?'✓ 비교 담김':'+ 비교 담기';b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on)});
 document.querySelectorAll('[data-save]').forEach(b=>{const on=SL.saved().includes(b.dataset.save);b.textContent=on?'♥ 관심 저장됨':'♡ 관심';b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on)});
 SL.dock();
}
document.querySelectorAll('[data-source-filter]').forEach(b=>b.addEventListener('click',()=>{
 document.querySelectorAll('[data-source-filter]').forEach(x=>x.classList.toggle('active',x===b));
 document.querySelectorAll('[data-source-type]').forEach(x=>x.hidden=b.dataset.sourceFilter!=='all'&&x.dataset.sourceType!==b.dataset.sourceFilter);
}));
const p=SL.load('shoelineup_profile_v2',null),el=document.getElementById('detailMatch');
if(s&&p&&el){
 const m=SL.match(s,p);el.hidden=false;el.className='card-match';el.innerHTML=`내 조건 MATCH <strong>${m.value.toFixed(2)} / 100</strong><small>${SL.escape(m.reasons.join(' · '))} · 조건 일치 점수, 착화 확률 아님</small>`;
}
window.addEventListener('sl:compare',sync);window.addEventListener('sl:compare-refresh',sync);window.addEventListener('sl:saved',sync);sync();
