
'use strict';
const $=id=>document.getElementById(id),E=SL.escape;
let onlyDiff=false;
const qp=new URLSearchParams(location.search).get('items');
if(qp!==null){
 const names=[...new Set(qp.split(',').map(x=>SL.byName(x)).filter(Boolean).map(s=>s.name))].slice(0,3);
 SL.save('shoelineup_compare_v1',names);
}
function chosen(){return SL.comparison().map(SL.byName).filter(Boolean)}
function updateUrl(){history.replaceState(null,'',SL.compareUrl(SL.comparison()))}
const rowDefs=[
 ['기본 정보',null],
 ['신발 유형',s=>SL.type(s)],
 ['BEST 거리',s=>(s.distanceko||[]).join(' · ')||'확인 중'],
 ['러닝 경험',s=>(s.levelko||[]).join(' · ')||'확인 중'],
 ['주행 스타일',s=>s.runningStyle||s.catko||'확인 중'],
 ['핏 · 옵션',null],
 ['표준 발볼',s=>SL.width(s)],
 ['와이드 옵션',s=>SL.wide(s)],
 ['사이즈 의견',s=>SL.fitSummary(s)],
 ['점수 · 자료',null],
 ['LINEUP SCORE',s=>SL.score(s)?SL.score(s)+' / 5.00':'평가 자료 수집 중'],
 ['수록 전문 리뷰',s=>SL.sourceStats(s).professional.length+'건'],
 ['수록 사용자 경험',s=>SL.sourceStats(s).users.length+'건'],
 ['공식 자료',s=>SL.sourceStats(s).official.length+'건'],
 ['구매 정보',null],
 ['국내 발매가',s=>SL.price(s)],
 ['수록 출시 정보',s=>(s.releaseLabel||'출시 정보')+' · '+(s.release||'확인 중')],
];
function headerCell(s){return `<th scope="col"><div class="compare-product"><button class="remove-product" data-remove-compare="${E(s.name)}" aria-label="${E(s.name)} 비교에서 빼기">×</button><small>${E(s.brand)}</small><img src="${E(s.img)}" alt="${E(s.name)}" data-slug="${s.slug}" onerror="SL.imageError(this)"><b title="${E(s.name)}">${E(s.name.replace(s.brand+' ',''))}</b><a class="btn light" href="/shoes/${s.slug}/">상세 보기 →</a></div></th>`}
function render(){
 const a=chosen();updateUrl();$('compareCount').textContent=a.length+' / 3';$('onlyDifferences').disabled=a.length<2;
 $('addShoe').disabled=a.length>=3;
 $('compareInfo').textContent=a.length<2?'제품을 2개 이상 선택하면 차이점을 비교할 수 있어요.':'같은 행에서 차이를 보세요. 색이 있는 행은 수록값이 서로 다릅니다.';
 if(a.length<2){
  $('compareTable').innerHTML=`<div class="empty-state"><h2>${a.length?'한 켤레만 더 골라주세요':'비교할 러닝화를 골라주세요'}</h2><p>로그인 없이 최대 3개까지 비교할 수 있어요.</p>${a.map(s=>`<span class="chip">${E(s.name)}</span>`).join('')}<div style="margin-top:16px"><a class="btn light" href="/">전체 라인업에서 고르기</a></div></div>`;
 }else{
 let lastSection=null,rows='',differenceCount=0;
 for(const [label,fn] of rowDefs){
   if(!fn){lastSection=label;continue}
   const vals=a.map(fn),different=new Set(vals).size>1;
   if(different)differenceCount++;
   if(onlyDiff&&!different)continue;
   if(lastSection){rows+=`<tr class="section-row"><th colspan="${a.length+1}">${lastSection}</th></tr>`;lastSection=null}
   rows+=`<tr class="${different?'row-different':''}"><th scope="row">${E(label)}</th>${vals.map(v=>`<td class="${label==='LINEUP SCORE'&&/^\d/.test(v)?'num':''}">${E(v)}</td>`).join('')}</tr>`;
 }
 rows+=`<tr><th scope="row">가격·원문 확인</th>${a.map(s=>{const k=SL.kream(s),o=SL.retail(s);return `<td><div class="buy-cell"><a class="btn" target="_blank" rel="noopener noreferrer" href="${E(k.url)}">KREAM ${k.direct?'가격 확인':'모델 검색'} ↗</a>${o?`<a class="btn light" target="_blank" rel="noopener noreferrer" href="${E(o.url)}">${o.label} ↗</a>`:''}<a class="btn light" href="/shoes/${s.slug}/#sources">리뷰 원문 보기</a></div></td>`}).join('')}</tr>`;
 $('compareTable').innerHTML=`<p class="muted" style="margin-bottom:10px">서로 다른 항목 ${differenceCount}개 · 가격은 실시간이 아닌 수록 발매가입니다.</p><div class="compare-scroll"><table class="compare-table" style="--product-count:${a.length}"><colgroup><col class="label-col">${a.map(()=>'<col>').join('')}</colgroup><thead><tr><th scope="col">비교 기준</th>${a.map(headerCell).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
 }
 if(!$('addPanel').hidden)renderResults();
}
function renderResults(){
 const q=$('addSearch').value,a=SL.comparison();
 const results=window.SHOES.filter(s=>SL.matches(s,q)&&!a.includes(s.name)).slice(0,10);
 $('addResults').innerHTML=results.map(s=>`<div class="add-result"><img src="${E(s.img)}" alt="" data-slug="${s.slug}" onerror="SL.imageError(this)"><span>${E(s.name)}</span><button class="btn light" data-compare="${E(s.name)}" ${a.length>=3?'disabled':''}>추가</button></div>`).join('')||'<p class="muted" style="padding:20px 0">검색 결과가 없어요.</p>';
}
$('onlyDifferences').onchange=e=>{onlyDiff=e.target.checked;render()};
$('addShoe').onclick=()=>{$('addPanel').hidden=!$('addPanel').hidden;if(!$('addPanel').hidden){renderResults();$('addSearch').focus()}};
$('addSearch').oninput=renderResults;
$('shareCompare').onclick=async()=>{
 if(chosen().length<2){SL.toast('공유할 제품을 2개 이상 골라주세요.');return}
 const url=location.origin+SL.compareUrl(SL.comparison());
 try{await navigator.clipboard.writeText(url);SL.toast('비교 링크를 복사했어요. 이 주소로 같은 제품을 볼 수 있어요.')}
 catch{const el=$('shareLink');el.hidden=false;el.value=url;el.select();SL.toast('아래 주소를 복사해 주세요.')}
};
window.addEventListener('sl:compare',render);
window.addEventListener('sl:compare-refresh',render);
render();if(chosen().length<2){$('addPanel').hidden=false;renderResults()}
