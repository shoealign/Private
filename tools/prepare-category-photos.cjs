'use strict';
/* Run optionally on a machine with network access: npm run photos:categories */
const fs=require('node:fs');const path=require('node:path');const sharp=require('sharp');
const {normalizePhoto}=require('./photo-cutout.cjs');
const root=path.join(__dirname,'..'),file=path.join(root,'assets/category-collection.json');
const data=JSON.parse(fs.readFileSync(file,'utf8'));
const target=path.join(root,'assets/category-cutouts');fs.mkdirSync(target,{recursive:true});
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
async function processOne(kind,x){const name=slug(kind+'-'+x.brand+'-'+x.model),dest=path.join(target,name+'.webp');
 if(fs.existsSync(dest)){x.image='/assets/category-cutouts/'+name+'.webp';return 'cached'}
 let source;
 const local=path.join(root,'assets/category-photo-input',name+'.jpg');
 try {if(fs.existsSync(local))source=fs.readFileSync(local);else{
   const u=new URL(x.image);if(u.protocol!=='https:'||u.hostname==='localhost')throw Error('invalid remote URL');
   const r=await fetch(u,{signal:AbortSignal.timeout(8000),headers:{'user-agent':'Mozilla/5.0','accept':'image/webp,image/png,image/jpeg,image/*'}});
   if(!r.ok||!String(r.headers.get('content-type')).startsWith('image/'))throw Error('image unavailable');
   const arr=await r.arrayBuffer();if(arr.byteLength>12e6)throw Error('image too large');source=Buffer.from(arr);
  }
  const m=await sharp(source).metadata();if(m.width<300||m.height<200)throw Error('low resolution');
  const out=await normalizePhoto(source);if(!out.image)return 'background not safely removable';
  fs.writeFileSync(dest,out.image);x.image='/assets/category-cutouts/'+name+'.webp';x.imageStatus='local-cutout';return 'converted';
 }catch(err){return 'unchanged: '+String(err.message||err).slice(0,90)}
}
(async()=>{let ok=0;for(const [kind,items] of Object.entries(data)){for(const x of items){const result=await processOne(kind,x);if(result==='converted'||result==='cached')ok++;console.log(kind,x.model,result)}}
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');fs.writeFileSync(path.join(root,'assets/category-collection.js'),'window.CATEGORY_CATALOG='+JSON.stringify(data)+';\n');
console.log('Local category photos:',ok,'/',Object.values(data).flat().length);
})().catch(e=>{console.error(e);process.exitCode=1});
