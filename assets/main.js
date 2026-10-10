
'use strict';
const $=id=>document.getElementById(id), E=SL.escape;
const shoes=window.SHOES;
const categories={
 all:{title:'전체 러닝화 라인업',description:'같은 점수 기준으로 정렬합니다. 미평가 제품은 점수 순에서 뒤에 표시합니다.',test:()=>true},
 beginner:{title:'입문 러너를 위한 라인업',description:'처음 고르는 데일리·안정화 중심. 고가 레이싱화가 모두에게 좋은 것은 아닙니다.',test:s=>(s.level||[]).includes('beginner')&&s.cat!=='race'},
 training:{title:'트레이닝 라인업',description:'자주 신는 일상 훈련용 모델을 모았습니다.',test:s=>s.cat!=='race'},
 speed:{title:'스피드 훈련 라인업',description:'템포·인터벌 용도로 수록된 모델을 모았습니다.',test:s=>/템포|스피드|Boston|EVO SL|Endorphin Speed|Rebel|Mach|Zoom Fly|Deviate Nitro [0-9]/i.test(s.catko+' '+s.name)},
 long:{title:'장거리 라인업',description:'하프·풀·롱런 중심으로 분류한 모델입니다. 훈련/레이스 용도를 함께 확인하세요.',test:s=>(s.distances||[]).some(d=>['half','full'].includes(d))},
 advanced:{title:'숙련 러너 라인업',description:'숙련 러너용으로 분류된 모델입니다. 점수는 성능 보증이 아닙니다.',test:s=>(s.level||[]).includes('advanced')},
 race:{title:'레이스 라인업',description:'대회·기록 도전 용도로 분류된 모델입니다.',test:s=>s.cat==='race'}
};
const base={brand:'all',cat:'all',level:'all',distance:'all',widthfilter:'all',budget:'all'};
let profile=SL.load('shoelineup_profile_v2',null);
if(!profile||!['male','female'].includes(profile.gender))profile=null;
let state={...base,rankcat:'all',q:'',sort:profile?'match':'score',savedOnly:false,matchMode:!!profile,limit:24};
const oldState=SL.load('shoelineup_view_v2',null);
if(oldState&&sessionStorage.getItem('sl:return')){for(const k of ['rankcat','q','sort','brand','cat','level','distance','widthfilter','budget','savedOnly','limit'])if(oldState[k]!==undefined)state[k]=oldState[k];sessionStorage.removeItem('sl:return')}
if(state.sort==='match'&&!profile)state.sort='score';
const urlQuery=new URLSearchParams(location.search).get('q');if(urlQuery)state.q=urlQuery;
$('search').value=state.q;$('sort').value=state.sort;
let draft={...base},guideBrand='all',guidePurpose='all',lastFocus=null;
function modal(id,on){
 const el=$(id);if(!el)return;
 if(on){lastFocus=document.activeElement;el.classList.add('on');el.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(()=>el.querySelector('button,input,select,a')?.focus(),30)}
 else{el.classList.remove('on');el.setAttribute('aria-hidden','true');if(!document.querySelector('.on[role="dialog"]'))document.body.style.overflow='';lastFocus?.focus()}
 SL.dock();
}
function reset(){state={...state,...base,rankcat:'all',q:'',savedOnly:false,limit:24};$('search').value='';render()}
function saveView(){SL.save('shoelineup_view_v2',state)}
const scoreVal=s=>SL.score(s)===null?-1:Number(s.score);
function released(s){const x=String(s.release||'').match(/20\d{2}(?:[-.]\d{1,2})?(?:[-.]\d{1,2})?/);if(!x)return -Infinity;const t=Date.parse(x[0].replace(/\./g,'-'));return Number.isFinite(t)?t:-Infinity}
function list(){
 const saved=SL.saved();
 const arr=shoes.filter(s=>(state.matchMode||categories[state.rankcat]?.test(s))&&
 (!state.savedOnly||saved.includes(s.name))&&(state.brand==='all'||s.brand===state.brand)&&
 (state.cat==='all'||s.cat===state.cat)&&(state.level==='all'||s.level?.includes(state.level))&&
 (state.distance==='all'||s.distances?.includes(state.distance))&&SL.matches(s,state.q)&&
 (state.widthfilter==='all'||(SL.widthKnown(s)&&(state.widthfilter==='narrow'?s.widthLevel<=2:state.widthfilter==='normal'?s.widthLevel===3:s.widthLevel>=4)))&&
 (state.budget==='all'||SL.money(s)!==null&&SL.money(s)<=Number(state.budget)));
 arr.sort((a,b)=>{
  let n=0;
  if(state.sort==='match'&&profile)n=SL.match(b,profile).value-SL.match(a,profile).value;
  else if(state.sort==='reviews')n=SL.sourceStats(b).reviews.length-SL.sourceStats(a).reviews.length;
  else if(state.sort==='price'){const x=SL.money(a)??Infinity,y=SL.money(b)??Infinity;n=x===y?0:x-y}
  else if(state.sort==='latest'){const x=released(a),y=released(b);n=x===y?0:y-x}
  else n=scoreVal(b)-scoreVal(a);
  return n||scoreVal(b)-scoreVal(a)||a.name.localeCompare(b.name);
 });
 return arr;
}
function card(s,i){
 const score=SL.score(s),st=SL.sourceStats(s),fit=state.matchMode&&profile?SL.match(s,profile):null,o=SL.retail(s),k=SL.kream(s);
 const short=s.name.replace(new RegExp('^'+s.brand+'\\s*','i'),'');
 const ranked=state.sort!=='score'||score;
 return `<article class="product-card" data-product="${s.slug}"><a class="card-photo" href="/shoes/${s.slug}/" aria-label="${E(s.name)} 상세"><span class="line-badge ${i<3&&ranked?'top':''}"><small>LINE</small><strong>${ranked?String(i+1).padStart(2,'0'):'—'}</strong></span><img src="${E(s.img)}" alt="${E(s.name)}" loading="lazy" decoding="async" data-slug="${s.slug}" onerror="SL.imageError(this)"></a><div class="card-main"><div class="card-brand">${E(s.brand)}</div><h3 class="card-title"><a href="/shoes/${s.slug}/">${E(short)}</a></h3><div class="card-facts"><span class="chip dark">BEST ${E((s.distanceko||[]).join(' · '))}</span><span class="chip">발볼 ${E(SL.width(s))}</span><span class="chip">${E(SL.type(s))}</span></div>
 <div class="card-score"><div><strong class="${score?'':'pending'}">${score||'평가 자료 수집 중'}</strong><span class="score-caption">${score?'LINEUP SCORE · 참고':'숫자를 임의로 채우지 않았어요'}</span></div><a class="source-count" href="/shoes/${s.slug}/#sources">수록 리뷰 ${st.reviews.length}<small>전문 ${st.professional.length} · 사용자 ${st.users.length}</small></a></div>
 ${fit?`<div class="card-match">MATCH <strong>${fit.value.toFixed(2)} / 100</strong><small>${E(fit.reasons.join(' · ')||'자료 확인 필요')}${fit.cautions.length?' · '+E(fit.cautions[0]):''}</small></div>`:''}
 <div class="card-bottom"><div class="card-price"><span>국내 발매가</span><b class="${SL.money(s)===null?'pending-price':''}">${E(SL.price(s))}</b></div>
 <div class="card-outlinks">${o?`<a href="${E(o.url)}" target="_blank" rel="noopener noreferrer">${E(o.label)} ↗</a>`:'<span></span>'}<a href="${E(k.url)}" target="_blank" rel="noopener noreferrer">KREAM ${k.direct?'확인':'검색'} ↗</a></div>
 <div class="card-actions"><button class="btn light ${SL.saved().includes(s.name)?'selected':''}" data-save="${E(s.name)}" aria-pressed="${SL.saved().includes(s.name)}">${SL.saved().includes(s.name)?'♥ 관심 저장됨':'♡ 관심'}</button><button class="btn light ${SL.comparison().includes(s.name)?'selected':''}" data-compare="${E(s.name)}" aria-pressed="${SL.comparison().includes(s.name)}">${SL.comparison().includes(s.name)?'✓ 비교 담김':'+ 비교 담기'}</button></div></div></div></article>`;
}
function updateTags(){
 const label={brand:state.brand,cat:{daily:'데일리/트레이닝',race:'레이싱',stability:'안정화'}[state.cat],level:{beginner:'입문',intermediate:'중급',advanced:'숙련'}[state.level],distance:SL.distance(state.distance),widthfilter:{narrow:'발볼 좁음',normal:'발볼 보통',wide:'발볼 넓음'}[state.widthfilter],budget:(Number(state.budget)/10000)+'만 원 이하'};
 const active=Object.keys(base).filter(k=>state[k]!=='all');$('filterCount').hidden=!active.length;$('filterCount').textContent=active.length;
 $('activeFilterBar').innerHTML=active.map(k=>`<button class="filter-tag" data-reset-filter="${k}">${E(label[k]||state[k])}<span>×</span></button>`).join('');
}
function render(){
 const arr=list();$('grid').innerHTML=arr.slice(0,state.limit).map(card).join('')||`<div class="empty-state"><h3>조건에 맞는 러닝화가 없어요.</h3><p>검색어나 필터를 하나 줄여보세요.</p><button class="btn light" id="emptyReset">검색·필터 초기화</button></div>`;
 $('resultCount').textContent=arr.length+'개 모델';$('rankTitle').textContent=state.matchMode?'내 조건에 맞는 라인업':categories[state.rankcat].title;
 $('rankDesc').textContent=state.matchMode?'발볼 30% · 용도 30% · 거리 20% · 경험 20% 조건 일치 점수입니다.':categories[state.rankcat].description;
 $('loadMore').hidden=arr.length<=state.limit;$('loadMore').textContent=`${Math.min(24,arr.length-state.limit)}개 더 보기`;
 $('matchBanner').hidden=!state.matchMode||!profile;
 if(profile)$('matchBannerDesc').textContent=`${profile.gender==='male'?'남성':'여성'} · 발볼 ${SL.WIDTHS[Number(profile.width)-1]} · ${SL.distance(profile.distance)} · ${ {daily:'데일리',speed:'스피드',long:'장거리',race:'대회'}[profile.goal]}`;
 $('matchSortOption').disabled=!profile;$('sort').value=state.sort;
 $('savedCount').textContent=SL.saved().length;$('showAll').classList.toggle('active',!state.savedOnly);$('showSaved').classList.toggle('active',state.savedOnly);
 document.querySelectorAll('[data-rankcat]').forEach(b=>{const on=b.dataset.rankcat===state.rankcat;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on)});
 updateTags();SL.dock();saveView();
}
function syncSelectionButtons(){
 document.querySelectorAll('[data-compare]').forEach(b=>{const on=SL.comparison().includes(b.dataset.compare);b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on);b.textContent=on?'✓ 비교 담김':'+ 비교 담기'});
 document.querySelectorAll('[data-save]').forEach(b=>{const on=SL.saved().includes(b.dataset.save);b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on);b.textContent=on?'♥ 관심 저장됨':'♡ 관심'});
 $('savedCount').textContent=SL.saved().length;
}
function scrollRank(){$('rankTabs').scrollIntoView({behavior:'smooth',block:'start'})}
$('searchForm').addEventListener('submit',e=>{e.preventDefault();scrollRank()});
$('search').oninput=e=>{state.q=e.target.value;state.limit=24;render()};
$('clearSearch').onclick=()=>{state.q='';$('search').value='';render();$('search').focus()};
$('sort').onchange=e=>{state.sort=e.target.value;state.matchMode=state.sort==='match'&&!!profile;state.limit=24;render()};
$('rankTabs').onclick=e=>{const b=e.target.closest('[data-rankcat]');if(!b)return;state.rankcat=b.dataset.rankcat;state.matchMode=false;state.sort='score';state.limit=24;render()};
$('loadMore').onclick=()=>{state.limit+=24;render()};
$('showAll').onclick=()=>{state.savedOnly=false;render()};
$('showSaved').onclick=()=>{state.savedOnly=true;render()};
$('activeFilterBar').onclick=e=>{const b=e.target.closest('[data-reset-filter]');if(b){state[b.dataset.resetFilter]='all';render()}};
$('grid').addEventListener('click',e=>{if(e.target.closest('#emptyReset'))reset()});
document.addEventListener('click',e=>{if(e.target.closest('a[href^="/shoes/"]')){saveView();sessionStorage.setItem('sl:return','1')}});
$('navRanking').onclick=()=>{state.sort='score';state.matchMode=false;render();scrollRank()};
$('navReviews').onclick=()=>{state.sort='reviews';state.matchMode=false;render();scrollRank()};
$('navBrands').onclick=()=>modal('brandSheet',true);
$('closeBrands').onclick=()=>modal('brandSheet',false);
document.querySelectorAll('[data-brandonly]').forEach(b=>b.onclick=()=>{state.brand=b.dataset.brandonly;state.limit=24;modal('brandSheet',false);render();scrollRank()});
// Filters are a draft: closing the sheet does not silently apply it.
function showDraft(){document.querySelectorAll('#filterSheet .sheet-option').forEach(b=>{const k=Object.keys(base).find(k=>b.dataset[k]!==undefined);if(k){const on=b.dataset[k]===draft[k];b.classList.toggle('active',on);b.setAttribute('aria-pressed',on)}})}
$('openFilters').onclick=()=>{draft=Object.fromEntries(Object.keys(base).map(k=>[k,state[k]]));showDraft();modal('filterSheet',true)};
$('closeFilters').onclick=()=>modal('filterSheet',false);
$('filterSheet').addEventListener('click',e=>{const b=e.target.closest('.sheet-option');if(b){const k=Object.keys(base).find(k=>b.dataset[k]!==undefined);if(k){draft[k]=b.dataset[k];showDraft()}}});
$('resetFilters').onclick=()=>{draft={...base};showDraft()};
$('applyFilters').onclick=()=>{Object.assign(state,draft,{limit:24});modal('filterSheet',false);render()};
// Recommendation flow retains the five existing grouped screens.
let step=0;
let fp={gender:null,color:null,level:null,width:3,distance:null,goal:null,pace:null,cadence:'unknown',weight:70,weekly:'10to30',shoeSize:'unknown',preference:null};
const required=[['gender','color'],['level','pace'],[],['distance','goal'],['preference']];
function finderUpdate(){
 document.querySelectorAll('.finder-step').forEach((el,i)=>el.classList.toggle('active',step===i));
 $('finderProgress').style.width=(step+1)*20+'%';$('finderBack').disabled=step===0;$('finderNext').disabled=required[step].some(k=>!fp[k]);$('finderNext').textContent=step===4?'추천 결과 보기':'다음';
 document.querySelectorAll('.finder-option').forEach(b=>{const a=fp[b.dataset.fkey]===b.dataset.value;b.classList.toggle('active',a);b.setAttribute('aria-pressed',a)});
 document.querySelectorAll('[data-width]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.width)===Number(fp.width));b.classList.toggle('filled',Number(b.dataset.width)<=Number(fp.width))});
 $('widthValue').textContent=SL.WIDTHS[fp.width-1];$('weightRange').value=fp.weight;$('weightValue').textContent=fp.weight;$('shoeSizeSelect').value=fp.shoeSize;$('weeklySelect').value=fp.weekly;
}
function openFinder(){if(profile)fp={...fp,...profile};step=0;finderUpdate();modal('finder',true)}
$('openFinder').onclick=openFinder;$('editFinder').onclick=openFinder;$('closeFinder').onclick=()=>modal('finder',false);
document.querySelectorAll('.finder-option').forEach(b=>b.onclick=()=>{fp[b.dataset.fkey]=b.dataset.value;finderUpdate()});
document.querySelectorAll('[data-width]').forEach(b=>b.onclick=()=>{fp.width=Number(b.dataset.width);finderUpdate()});
$('weightRange').oninput=e=>{fp.weight=Number(e.target.value);$('weightValue').textContent=fp.weight};
$('shoeSizeSelect').onchange=e=>fp.shoeSize=e.target.value;$('weeklySelect').onchange=e=>fp.weekly=e.target.value;
$('finderBack').onclick=()=>{if(step>0)step--;finderUpdate();document.querySelector('.finder-body').scrollTop=0};
$('finderNext').onclick=()=>{if(required[step].some(k=>!fp[k]))return;if(step<4){step++;finderUpdate();document.querySelector('.finder-body').scrollTop=0;return}
 profile={...fp};SL.save('shoelineup_profile_v2',profile);state={...state,...base,rankcat:'all',q:'',sort:'match',matchMode:true,savedOnly:false,limit:24};$('search').value='';modal('finder',false);render();scrollRank()};
$('matchReset').onclick=()=>{profile=null;SL.save('shoelineup_profile_v2',null);state.matchMode=false;state.sort='score';render()};
const purposes=[['race','레이스','기록 도전',s=>s.cat==='race'],['tempo','템포 · 스피드','빠른 훈련',s=>categories.speed.test(s)&&s.cat!=='race'],['daily','데일리 · 쿠션','편안한 일상 러닝',s=>s.cat==='daily'&&!categories.speed.test(s)],['stability','안정화','지지력 중심',s=>s.cat==='stability']];
function renderGuide(){
 $('guideBrandFilters').innerHTML=['all',...SL.BRANDS].map(b=>`<button data-guide-brand="${E(b)}" class="${b===guideBrand?'active':''}">${b==='all'?'전체 브랜드':E(b)}</button>`).join('');
 $('guidePurposeFilters').innerHTML=[['all','전체 용도'],...purposes].map(([key,label])=>`<button data-guide-purpose="${key}" class="${key===guidePurpose?'active':''}">${label}</button>`).join('');
 $('quickGuideRows').innerHTML=purposes.filter(([key])=>guidePurpose==='all'||guidePurpose===key).map(([id,title,sub,test])=>{
  const arr=shoes.filter(s=>test(s)&&(guideBrand==='all'||s.brand===guideBrand));
  return `<section class="guide-tier-row"><div class="guide-tier-label"><strong>${title}</strong><small>${sub}</small><small>${arr.length}개</small></div><div class="guide-models">${arr.map(s=>`<article class="guide-model"><a href="/shoes/${s.slug}/"><span class="guide-brand">${E(s.brand)}</span><img src="${E(s.img)}" data-slug="${s.slug}" alt="${E(s.name)}" loading="lazy" onerror="SL.imageError(this)"><b>${E(s.name.replace(s.brand+' ',''))}</b></a><button class="btn light" data-compare="${E(s.name)}">${SL.comparison().includes(s.name)?'✓ 비교 담김':'+ 비교 담기'}</button></article>`).join('')||'<p class="muted">해당 모델이 아직 없습니다.</p>'}</div></section>`;
 }).join('');
}
$('navQuickGuide').onclick=()=>{renderGuide();modal('quickGuideModal',true)};$('closeQuickGuide').onclick=()=>modal('quickGuideModal',false);$('guideBackToRank').onclick=()=>modal('quickGuideModal',false);
$('guideBrandFilters').onclick=e=>{const b=e.target.closest('[data-guide-brand]');if(b){guideBrand=b.dataset.guideBrand;renderGuide()}};
$('guidePurposeFilters').onclick=e=>{const b=e.target.closest('[data-guide-purpose]');if(b){guidePurpose=b.dataset.guidePurpose;renderGuide()}};
document.querySelectorAll('[role="dialog"]').forEach(el=>el.addEventListener('click',e=>{if(e.target===el)modal(el.id,false)}));
document.addEventListener('keydown',e=>{
 const d=document.querySelector('[role="dialog"].on');if(!d)return;
 if(e.key==='Escape')modal(d.id,false);
 if(e.key==='Tab'){const els=[...d.querySelectorAll('button:not(:disabled),a[href],input,select')].filter(x=>x.getClientRects().length);const first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}
});
window.addEventListener('sl:compare',syncSelectionButtons);window.addEventListener('sl:compare-refresh',syncSelectionButtons);
window.addEventListener('sl:saved',()=>{if(state.savedOnly)render();else syncSelectionButtons()});
render();
