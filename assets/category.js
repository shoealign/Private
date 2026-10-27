(()=>{
'use strict';
const root=document.querySelector('[data-catalog]');if(!root)return;
const kind=root.dataset.catalog,items=window.CATEGORY_CATALOG?.[kind]||[];
const input=document.getElementById('catalogSearch'),select=document.getElementById('catalogFilter'),grid=document.getElementById('catalogGrid'),counter=document.getElementById('catalogCount'),reset=document.getElementById('catalogReset');
if(!input||!select||!grid)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tags=[...new Set(items.map(x=>x.tag).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ko'));
tags.forEach(tag=>{const o=document.createElement('option');o.value=tag;o.textContent=tag;select.append(o)});
const fallback='<div class="catalog-visual"><svg viewBox="0 0 90 55" fill="none" aria-hidden="true"><path d="M8 36c11 1 20-8 31-20 6-7 12-3 17 5l10 10 14 3c5 1 7 5 4 9H9c-6-1-7-4-1-7z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg><small>사진 준비 중</small></div>';
const isImage=u=>typeof u==='string'&&(/^https:\/\//.test(u)||u.startsWith('/assets/'));
function photo(x){return isImage(x.image)?`<div class="catalog-photo-wrap"><img class="catalog-photo" src="${esc(x.image)}" alt="${esc(x.brand+' '+x.model)}" loading="lazy" decoding="async" referrerpolicy="no-referrer"><div class="catalog-photo-fallback" hidden>${fallback}</div></div>`:fallback}
function validMetrics(x){return Object.entries(x.metrics||{}).filter(([k,v])=>Number.isFinite(Number(v))&&Number(v)>=0&&Number(v)<=10)}
function total(x){let metrics=validMetrics(x);return metrics.length?metrics.reduce((sum,[,v])=>sum+Number(v)*10,0)/metrics.length:null}
function render(){
 const q=input.value.trim().toLocaleLowerCase(),f=select.value;
 const subset=items.map((x,i)=>({...x,order:i+1})).filter(x=>(x.brand+' '+x.model+' '+x.tag).toLocaleLowerCase().includes(q)&&(f==='all'||x.tag===f));
 counter.textContent=subset.length+'개 모델';reset.hidden=!(q||f!=='all');
 grid.innerHTML=subset.map(x=>{
  const metrics=validMetrics(x),score=total(x);
  const axes=metrics.length?`<div class="catalog-axes">${metrics.map(([name,value])=>{const v=Number(value)*10;return `<div class="catalog-axis"><span>${esc(name)}</span><div class="catalog-track"><i style="width:${v}%"></i></div><b>${v}</b></div>`}).join('')}</div>`:'';
  const url=typeof x.source==='string'&&/^https:\/\//.test(x.source)?x.source:'#';
  return `<article class="catalog-card"><div class="catalog-card-top"><span class="catalog-index">${x.order}</span>${photo(x)}</div><div class="catalog-card-body"><span class="catalog-brand">${esc(x.brand)}</span><h2 class="catalog-name">${esc(x.model)}</h2><div class="catalog-score-line"><div class="catalog-score">${score!==null?score.toFixed(1):'—'}</div><span class="catalog-score-max">/ 100</span></div><div class="catalog-tag">${esc(x.tag)}</div>${axes}${score===null?'<p class="catalog-awaiting">개별 성능 점수 확인 중</p>':''}<a class="catalog-source" href="${esc(url)}" target="_blank" rel="noopener noreferrer">출처 보기 ↗</a></div></article>`;
 }).join('')||'<div class="catalog-empty"><b>검색 결과가 없어요.</b><button type="button" id="catalogEmptyReset">전체 보기</button></div>';
 grid.querySelectorAll('img.catalog-photo').forEach(img=>{img.addEventListener('error',()=>{img.hidden=true;img.nextElementSibling.hidden=false},{once:true})});
 document.getElementById('catalogEmptyReset')?.addEventListener('click',()=>{input.value='';select.value='all';render()});
}
input.addEventListener('input',render);document.getElementById('catalogSearchForm')?.addEventListener('submit',e=>e.preventDefault());document.getElementById('catalogClear')?.addEventListener('click',()=>{input.value='';render();input.focus()});
select.addEventListener('change',render);reset.addEventListener('click',()=>{input.value='';select.value='all';render()});document.getElementById('catalogFilterButton')?.addEventListener('click',()=>select.focus());render();
})();
