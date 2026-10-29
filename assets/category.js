(()=>{
'use strict';
const root=document.querySelector('[data-catalog]');if(!root)return;
const kind=root.dataset.catalog,items=(window.CATEGORY_CATALOG||{})[kind]||[];
const grid=document.getElementById('catalogGrid'),input=document.getElementById('catalogSearch'),filter=document.getElementById('catalogFilter');
const headerSearch=document.getElementById('catalogHeaderSearch'),headerClear=document.getElementById('catalogHeaderClear');
const count=document.getElementById('catalogVisibleCount');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val=n=>Number.isInteger(n)?''+n:Number(n).toFixed(1);
const num=x=>typeof x==='number'&&Number.isFinite(x)?x:null;
const tags=[...new Set(items.map(x=>x.tag).filter(Boolean))];
for(const tag of tags){let o=document.createElement('option');o.value=tag;o.textContent=tag;filter.append(o)}
const score=x=>num(x.runrepeatScore)??num(x.editorialScore);
const rank=items.slice().sort((a,b)=>(score(b)??-1)-(score(a)??-1));
function imgTag(x){let url=x.image||'',alt=escape(x.brand+' '+x.model);return url?`<img src="${escape(url)}" alt="${alt}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='/assets/shoe-placeholder.svg';this.classList.add('is-placeholder')">`:`<img class="is-placeholder" src="/assets/shoe-placeholder.svg" alt="${alt} 제품 사진 확인 중" loading="lazy">`}
function axes(x){if(!x.metrics)return `<p class="catalog-awaiting">세부 항목 데이터 확인 중</p>`;
return `<div class="balboll-card-metrics">${Object.entries(x.metrics).map(([label,v])=>{let n=Math.min(100,Math.max(0,Number(v)*10));let c=n>=90?'excellent':n>=80?'good':'fair';return `<div class="metric score-${c}"><span>${escape(label)}</span><div class="balboll-mini-track" role="meter" aria-label="${escape(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${n}"><i style="width:${n}%"></i></div><b>${val(n)}</b></div>`}).join('')}</div>`}
function card(x){const s=score(x),known=s!==null,grade=known?(s>=90?'excellent':s>=80?'good':s>=70?'fair':'low'):'unrated',basis=x.runrepeatScore!=null?'RunRepeat 평점':x.editorialScore!=null?'참고 평가 환산':'점수 확인 중';
const type=x.tag||kind;const title=x.brand+' '+x.model;
return `<article class="product-card balboll-card catalog-unified-card v44-card score-${grade}"><div class="card-photo catalog-photo"><span class="catalog-score-badge v44-score-badge score-${grade}" aria-label="종합점수 ${known?val(s):'미확인'}">${known?val(s):'—'}</span>${imgTag(x)}</div><div class="card-main"><h2 class="v44-fullname" title="${escape(title)}">${escape(title)}</h2><div class="v44-usage">${escape(type)}</div>${axes(x)}<a class="balboll-detail-link" href="${escape(x.runrepeatUrl||x.source||'#')}" target="_blank" rel="noopener noreferrer">평가 근거 보기 ↗</a></div></article>`}

function render(){let q=(input?.value||'').trim().toLowerCase(),f=filter?.value||'all';let found=rank.filter(x=>[x.brand,x.model,x.tag].join(' ').toLowerCase().includes(q)&&(f==='all'||x.tag===f));grid.innerHTML=found.map(card).join('')||'<div class="catalog-empty">조건에 맞는 신발이 없습니다. 검색어와 필터를 확인해 주세요.</div>';if(count)count.textContent=found.length+'개 모델';}
input?.addEventListener('input',()=>{if(headerSearch&&headerSearch.value!==input.value)headerSearch.value=input.value;render()});
filter?.addEventListener('change',render);
document.getElementById('catalogFilterTrigger')?.addEventListener('click',()=>{ if(filter?.showPicker){try{filter.showPicker()}catch(e){filter.focus()}}else{filter?.focus()} });
headerSearch?.addEventListener('input',()=>{if(input)input.value=headerSearch.value;render()});
headerClear?.addEventListener('click',()=>{if(headerSearch)headerSearch.value='';if(input)input.value='';render();headerSearch?.focus()});
document.getElementById('catalogHeaderForm')?.addEventListener('submit',e=>{e.preventDefault();render()});
render();
})();
