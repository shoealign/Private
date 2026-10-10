
(function(root){
  "use strict";
  const WIDTHS=['매우 좁음','좁음','보통','넓음','매우 넓음'];
  const BRANDS=['Nike','adidas','ASICS','New Balance','Saucony','PUMA','HOKA','On'];
  const brandAliases={'Nike':['나이키'],'adidas':['아디다스'],'ASICS':['아식스'],'New Balance':['뉴발','뉴발란스'],'Saucony':['써코니','서코니'],'PUMA':['푸마','퓨마'],'HOKA':['호카'],'On':['온','온러닝']};
  const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize=x=>String(x??'').normalize('NFKC').toLowerCase().replace(/[\s\-_./()[\]]/g,'');
  function safeUrl(x){try{const u=new URL(x);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
  function canonical(x){try{const u=new URL(x);u.hash='';for(const k of [...u.searchParams.keys()])if(k.startsWith('utm_'))u.searchParams.delete(k);u.hostname=u.hostname.replace(/^www\./,'');if(u.hostname==='runrepeat.com')u.pathname=u.pathname.replace(/^\/(uk|es)\//,'/');return u.href.replace(/\/$/,'')}catch{return String(x||'')}}
  function sourceType(q){
    const u=String(q[2]||'').toLowerCase(),t=String(q[1]||'');
    if(!safeUrl(u))return 'other';
    if(/google\.[^/]+\/search|youtube\.com\/results|search\.naver|\/search[/?]|\/catalog\//.test(u))return 'search';
    if(/kream\.co|stockx\.com/.test(u))return 'product';
    if(/reddit\.com/.test(u))return 'community';
    if(/blog\.naver|m\.blog\.naver|tistory\.com/.test(u))return 'blog';
    if(/youtube\.com|youtu\.be/.test(u))return 'video';
    if(/공식|제조사|press|newsroom/i.test(t+' '+u))return 'official';
    if(/runrepeat\.com|believeintherun\.com|runningshoesguru\.com|doctorsofrunning\.com|roadtrailrun\.com|weartesters\.com|rtings\.com|theruntesters\.com/.test(u))return 'professional';
    return 'other';
  }
  const isReview=q=>['professional','community','blog','video'].includes(sourceType(q));
  function sources(s){const seen=new Set();return (s.quotes||[]).filter(q=>{const u=canonical(q[2]);if(!safeUrl(q[2])||seen.has(u))return false;seen.add(u);return true})}
  function sourceStats(s){const a=sources(s);const reviews=a.filter(isReview);return {all:a, reviews, professional:reviews.filter(q=>sourceType(q)==='professional'), users:reviews.filter(q=>['community','blog','video'].includes(sourceType(q))),official:a.filter(q=>sourceType(q)==='official')}}
  function matches(s,q){const text=normalize([s.name,s.brand,s.model,...(s.aliases||[]),...(brandAliases[s.brand]||[])].join(' '));const tokens=String(q||'').trim().split(/\s+/).map(normalize).filter(Boolean);return !tokens.length||tokens.every(t=>text.includes(t))||text.includes(normalize(q))}
  function money(s){const m=String(s.msrp||'').trim().match(/^([\d,]+)\s*원/);return m?Number(m[1].replace(/,/g,'')):null}
  const price=s=>money(s)!==null?money(s).toLocaleString('ko-KR')+'원':'국내 발매가 확인 중';
  const score=s=>!s.pending&&Number(s.score)>0?Number(s.score).toFixed(2):null;
  const type=s=>s.shoeType||s.catko||'유형 확인 중';
  const distance=d=>({'5k':'5K','10k':'10K',half:'하프',full:'풀'}[d]||d);
  function widthKnown(s){return Number.isInteger(s.widthLevel)&&s.widthLevel>=1&&s.widthLevel<=5&&!/확인|미정|실착|수집/.test(s.widthFeel||'')}
  const width=s=>widthKnown(s)?WIDTHS[s.widthLevel-1]:'자료 확인 중';
  function wide(s){const v=String(s.wideVersion||'');if(!v||/확인|미정|없음|미출시|없다|없음|일반핏|no wide/i.test(v))return /없음|없다|no wide/i.test(v)?'없음 (수록 자료)':'확인 중';return v}
  function retail(s){
    const direct=safeUrl(s.officialUrl||'');
    if(direct){const u=new URL(direct);if(u.pathname!=='/'&&!/\/search|\/w[/?]/.test(u.pathname)){return {url:direct,label:/\/us\/|\/en-us\/|\/en\/|\/nz\//.test(u.pathname)?'해외 공식 상품':'공식 상품 보기',note:'공식 상품 페이지 · 색상/지역/현재 재고 확인'}}}
    const fallback=safeUrl(s.officialStoreUrl||'');
    return fallback?{url:fallback,label:'공식 제품 검색',note:'공식 도메인 검색 결과 · 현재 판매 중이라는 의미는 아닙니다.'}:null;
  }
  function kream(s){const url=safeUrl(s.kreamUrl)||'https://kream.co.kr/search?keyword='+encodeURIComponent(s.name);return {url,label:/\/products\//.test(url)?'KREAM 가격 확인':'KREAM 모델 검색',direct:/\/products\//.test(url)}}
  function summary(s){const q=sourceStats(s).reviews[0];return q?q[0]:((s.pros||[])[0]||s.catko||'제품 자료 확인 중')}
  function fitSummary(s){const vals=sourceStats(s).reviews.map(q=>q[8]).filter(x=>x&&!/확인|미공개|권장|실착|미정/.test(x));const unique=[...new Set(vals)];return !unique.length?'사이즈 평가 수집 중':unique.length===1?unique[0]:'리뷰 간 의견 차이 · 실착 확인'}
  function match(s,p){
    if(!p)return null;
    let total=0,weight=0;const reasons=[],cautions=[];
    function add(n,w){total+=n*w;weight+=w}
    if(widthKnown(s)){const delta=Math.abs(s.widthLevel-Number(p.width||3));add(Math.max(0,100-30*delta),30);if(delta<=1)reasons.push('발볼 조건 근접');else cautions.push('발볼 차이 확인');}
    else cautions.push('발볼 자료 부족');
    const goal=p.goal||'daily';let g=50;
    if(goal==='race')g=s.cat==='race'?100:35;
    else if(goal==='daily')g=s.cat==='stability'||s.cat==='daily'?100:35;
    else if(goal==='speed')g=/템포|스피드|경량|나일론|Boston|EVO SL|Endorphin Speed|Rebel|Mach|Zoom Fly|Deviate Nitro [0-9]/i.test(type(s)+' '+s.name)?100:s.cat==='race'?80:50;
    else if(goal==='long')g=s.distances?.some(d=>d==='half'||d==='full')?90:45;
    add(g,30);if(g>=80)reasons.push('사용 목적 일치');
    const best=(s.distances||[]).includes(p.distance);add(best?100:(s.usableDistances||[]).includes(distance(p.distance))?65:30,20);if(best)reasons.push(distance(p.distance)+' 중심');
    const ok=(s.level||[]).includes(p.level);add(ok?100:55,20);if(!ok)cautions.push('러닝 경험 기준 확인');
    // Cadence alone does not determine SKY vs EDGE. No invented causal sizing or gait rule.
    return {value:Number((total/weight).toFixed(2)),reasons:reasons.slice(0,3),cautions};
  }
  function load(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
  function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
  function all(){return root.SHOES||[]}
  function byName(name){return all().find(s=>s.name===name||s.slug===name)}
  function comparison(){const v=load('shoelineup_compare_v1',[]);return Array.isArray(v)?[...new Set(v.map(byName).filter(Boolean).map(s=>s.name))].slice(0,3):[]}
  function saveCompare(names){save('shoelineup_compare_v1',names);root.dispatchEvent(new CustomEvent('sl:compare'));return names}
  function toggleCompare(name){let a=comparison();if(a.includes(name))a=a.filter(n=>n!==name);else if(a.length<3)a.push(name);else{toast('비교는 최대 3개까지예요. 한 제품을 빼고 추가해 주세요.');return false}saveCompare(a);return true}
  function saved(){const a=load('shoelineup_saved_v1',[]);return Array.isArray(a)?a.filter(x=>byName(x)):[]}
  function toggleSaved(name){let a=saved();a=a.includes(name)?a.filter(x=>x!==name):[...a,name];if(!save('shoelineup_saved_v1',a))toast('이 브라우저에서는 저장이 제한되어 있어요.');root.dispatchEvent(new CustomEvent('sl:saved'))}
  let timer;
  function toast(t){if(!root.document)return;let el=document.getElementById('toast');if(!el){el=document.createElement('div');el.id='toast';el.setAttribute('role','status');document.body.append(el)}el.textContent=t;el.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('show'),3500)}
  function imageError(img){if(img.dataset.failed)return;img.dataset.failed='1';img.src='/assets/'+img.dataset.slug+'.svg';img.classList.add('image-missing');img.title='실제 제품 사진을 불러오지 못했습니다.'}
  const compareUrl=names=>'/compare/?items='+names.map(n=>byName(n)?.slug).filter(Boolean).map(encodeURIComponent).join(',');
  function dock(){
    const el=document.getElementById('compareDock');if(!el)return;
    const a=comparison();el.hidden=!a.length||location.pathname.startsWith('/compare')||!!document.querySelector('.modal.on,.finder.on,.filter-sheet.on,.quick-guide-modal.on,.brand-sheet.on');
    document.body.classList.toggle('has-dock',!el.hidden);
    el.innerHTML=a.length?`<div class="dock-inner"><div class="dock-selection"><b>비교 ${a.length}<span>/3</span></b><div class="dock-items">${a.map(n=>{const s=byName(n);return `<button class="dock-item" data-remove-compare="${escape(n)}" aria-label="${escape(n)} 비교에서 빼기"><img src="${escape(s.img)}" alt="" data-slug="${s.slug}" onerror="SL.imageError(this)"><span class="remove-cross">×</span></button>`}).join('')}</div></div><div class="dock-actions"><button class="btn light" data-clear-compare>초기화</button><a class="btn ${a.length<2?'disabled':''}" href="${compareUrl(a)}" ${a.length<2?'aria-disabled="true" tabindex="-1"':''}>${a.length<2?'1개 더 선택':'비교하기 →'}</a></div></div>`:'';
  }
  const labels={professional:'전문 리뷰',community:'Reddit·커뮤니티',blog:'블로그',video:'영상 리뷰',official:'공식 자료',product:'판매처',search:'검색 링크',other:'기타 자료'};
  const api={WIDTHS,BRANDS,escape,normalize,safeUrl,canonical,sourceType,isReview,sources,sourceStats,matches,money,price,score,type,distance,widthKnown,width,wide,retail,kream,summary,fitSummary,match,load,save,byName,comparison,saveCompare,toggleCompare,saved,toggleSaved,toast,imageError,compareUrl,dock,labels};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.SL=api;
  if(root.document){
    document.addEventListener('click',e=>{
      let b=e.target.closest('[data-compare]');if(b){e.preventDefault();e.stopPropagation();toggleCompare(b.dataset.compare)}
      b=e.target.closest('[data-save]');if(b){e.preventDefault();e.stopPropagation();toggleSaved(b.dataset.save)}
      b=e.target.closest('[data-remove-compare]');if(b){saveCompare(comparison().filter(n=>n!==b.dataset.removeCompare))}
      if(e.target.closest('[data-clear-compare]'))saveCompare([]);
      if(e.target.closest('[aria-disabled="true"]'))e.preventDefault();
    });
    root.addEventListener('sl:compare',dock);
    root.addEventListener('storage',e=>{if(e.key==='shoelineup_compare_v1'||e.key===null){dock();root.dispatchEvent(new CustomEvent('sl:compare-refresh'))}});
    document.addEventListener('DOMContentLoaded',dock);
  }
})(typeof window==='undefined'?globalThis:window);
