(()=>{
'use strict';
const root=document.querySelector('[data-catalog]');if(!root)return;
const kind=root.dataset.catalog,items=window.CATEGORY_CATALOG?.[kind]||[];
const input=document.getElementById('catalogSearch'),select=document.getElementById('catalogFilter'),grid=document.getElementById('catalogGrid'),counter=document.getElementById('catalogCount'),reset=document.getElementById('catalogReset');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tags=[...new Set(items.map(x=>x.tag).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ko'));tags.forEach(tag=>{const o=document.createElement('option');o.value=tag;o.textContent=tag;select.append(o)});
const picture=`<div class="catalog-visual" aria-hidden="true"><svg viewBox="0 0 90 55" fill="none"><path d="M8 36c11 1 20-8 31-20 6-7 12-3 17 5l10 10 14 3c5 1 7 5 4 9H9c-6-1-7-4-1-7z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M5 45h81M27 27l8 7m1-16 8 8m0-12 9 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><small>이미지 준비 중</small></div>`;
function render(){
 const q=input.value.trim().toLocaleLowerCase(),f=select.value;
 const subset=items.map((x,i)=>({...x,order:i+1})).filter(x=>(x.brand+' '+x.model+' '+x.tag).toLocaleLowerCase().includes(q)&&(f==='all'||x.tag===f));
 counter.textContent=subset.length+' / '+items.length+'개 모델';reset.hidden=!(q||f!=='all');
 grid.innerHTML=subset.map(x=>{
 const metrics=x.metrics&&Object.entries(x.metrics).filter(([k,v])=>Number.isFinite(Number(v))&&Number(v)>=0&&Number(v)<=10);
 const axes=metrics&&metrics.length?`<div class="catalog-axes">${metrics.map(([name,value])=>`<div class="catalog-axis"><span>${esc(name)}</span><meter min="0" max="10" value="${Number(value)}" aria-label="${esc(name)} ${Number(value)} / 10"></meter><b>${Number(value)}</b></div>`).join('')}</div>`:'<p class="catalog-no-score">수록된 개별 성능 점수 없음</p>';
 const url=typeof x.source==='string'&&/^https:\/\//.test(x.source)?x.source:'#';
 return `<article class="catalog-card"><div class="catalog-card-top"><span class="catalog-index" aria-label="수록 ${x.order}번">${x.order}</span>${picture}</div><div class="catalog-card-body"><span class="catalog-brand">${esc(x.brand)}</span><h2 class="catalog-name">${esc(x.model)}</h2><span class="catalog-tag">${esc(x.tag)}</span>${axes}<div class="catalog-foot"><small>${metrics&&metrics.length?'수록 평가 / 10':'자료 확인용'}</small><a class="catalog-source" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(x.brand+' '+x.model)} 자료 확인">출처 보기 ↗</a></div></div></article>`;
 }).join('')||'<div class="catalog-empty"><b>조건에 맞는 신발이 없어요.</b><p>검색어를 줄이거나 필터를 초기화해 보세요.</p><button type="button" id="catalogEmptyReset">전체 보기</button></div>';
 document.getElementById('catalogEmptyReset')?.addEventListener('click',()=>{input.value='';select.value='all';render();input.focus()});
}
input.addEventListener('input',render);select.addEventListener('change',render);reset.addEventListener('click',()=>{input.value='';select.value='all';render();input.focus()});render();
})();
