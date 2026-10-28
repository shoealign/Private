(()=>{
  const header=document.getElementById('catalogHeaderSearch');
  const field=document.getElementById('catalogSearch');
  const form=document.getElementById('catalogHeaderForm');
  const clear=document.getElementById('catalogHeaderClear');
  const counter=document.getElementById('catalogVisibleCount');
  if(!header||!field)return;
  field.closest('.catalog-search-wrap')?.classList.add('kr-inline-search');
  const update=()=>{field.value=header.value;field.dispatchEvent(new Event('input',{bubbles:true}));};
  header.addEventListener('input',update);
  form?.addEventListener('submit',e=>{e.preventDefault();update();document.getElementById('catalogGrid')?.scrollIntoView({behavior:'smooth'});});
  clear?.addEventListener('click',()=>{header.value='';update();header.focus();});
  const grid=document.getElementById('catalogGrid');
  if(grid&&counter){
    const sync=()=>{const n=grid.querySelectorAll('.catalog-card').length;counter.textContent=n+'개 모델';};
    new MutationObserver(sync).observe(grid,{childList:true});sync();
  }
})();
