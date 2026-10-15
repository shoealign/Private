'use strict';
/**
 * Automatically create optimized transparent WebP cutouts for BALBOLL.
 * Reads source images from assets/shoe-photo-input or, when network access is
 * available, the original image URLs in assets/shoes.json. Does not alter
 * canonical images or ratings. A manifest is used only for successful cuts.
 */
const fs=require('node:fs');
const path=require('node:path');
const sharp=require('sharp');
const {normalizePhoto}=require('./photo-cutout.cjs');
const root=path.resolve(__dirname,'..');
const inDir=path.join(root,'assets','shoe-photo-input');
const outDir=path.join(root,'assets','shoe-cutouts');
const reportFile=path.join(root,'assets','shoe-photo-report.json');
const manifestFile=path.join(outDir,'manifest.json');
const shoes=JSON.parse(fs.readFileSync(path.join(root,'assets','shoes.json'),'utf8'));
const allowRemote=process.env.BALBOLL_IMAGE_FETCH!=='0';
const timeout=Math.max(2000,Number(process.env.BALBOLL_IMAGE_TIMEOUT_MS||11000));
fs.mkdirSync(outDir,{recursive:true});

function localImage(slug){for(const ext of ['webp','png','jpg','jpeg','avif']){
 const p=path.join(inDir,slug+'.'+ext);if(fs.existsSync(p))return p;
 }return null;
}
function urls(s){return [s.imageOriginal,s.img,...(s.imageAlternates||[])]
 .filter((x,i,a)=>x&&a.indexOf(x)===i&&/^https:\/\//i.test(x));}
async function fetchImage(url){
 const u=new URL(url);
 if(u.username||u.password||u.hostname==='localhost'||u.hostname.endsWith('.local')||/^(?:127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname))throw new Error('Blocked image host');
 const r=await fetch(url,{signal:AbortSignal.timeout(timeout),redirect:'follow',headers:{'user-agent':'Mozilla/5.0 (compatible; BALBOLLImageBuilder/1.0)','accept':'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8'}});
 if(!r.ok)throw new Error('HTTP '+r.status);
 const type=r.headers.get('content-type')||'';
 if(!type.startsWith('image/')&&!type.includes('octet-stream'))throw new Error('not an image response');
 const claimed=Number(r.headers.get('content-length')||0);
 if(claimed>14000000)throw new Error('image too large');
 const a=await r.arrayBuffer();if(a.byteLength>14000000)throw new Error('image too large');
 const b=Buffer.from(a);
 const info=await sharp(b,{limitInputPixels:30000000}).metadata();
 if((info.width||0)<300||(info.height||0)<200)throw new Error('image resolution too low');
 return b;
}
async function processOne(s){
 const dest=path.join(outDir,s.slug+'.webp');
 if(fs.existsSync(dest)){
   try{const m=await sharp(dest).metadata();if(m.width===1200&&m.height===780){return {slug:s.slug,status:'cached',image:'/assets/shoe-cutouts/'+s.slug+'.webp',original:s.imageOriginal||s.img}}}catch{}
 }
 const local=localImage(s.slug);
 const sources=local?[{type:'user-file',path:local},...(allowRemote?urls(s).map(url=>({type:'remote',url})):[])]:
    (allowRemote?urls(s).map(url=>({type:'remote',url})):[]);
 let error='no source';
 for(const candidate of sources){
   try{
     const binary=candidate.type==='user-file'?fs.readFileSync(candidate.path):await fetchImage(candidate.url);
     const result=await normalizePhoto(binary);
     if(!result.image){error=result.why;continue;}
     fs.writeFileSync(dest,result.image);
     return {slug:s.slug,status:result.kind,source:candidate.type,original:candidate.url||s.imageOriginal||s.img,image:'/assets/shoe-cutouts/'+s.slug+'.webp',bytes:result.image.length};
   }catch(e){error=String(e.message||e).slice(0,150)}
 }
 return {slug:s.slug,status:'original-photo',reason:error};
}
async function main(){
 const concurrency=5,results=new Array(shoes.length);let cursor=0;
 await Promise.all(Array.from({length:Math.min(concurrency,shoes.length)},async()=>{
   while(cursor<shoes.length){const id=cursor++;results[id]=await processOne(shoes[id]);}
 }));
 const manifest={};for(const x of results)if(x.image)manifest[x.slug]={src:x.image,kind:x.status,original:x.original};
 fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n');
 const byStatus={};for(const x of results)byStatus[x.status]=(byStatus[x.status]||0)+1;
 const report={version:'v14',processedAt:new Date().toISOString(),total:shoes.length,results,byStatus};
 fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');
 console.log('[BALBOLL photos] '+Object.entries(byStatus).map(([k,v])=>k+'='+v).join(' / '));
 if(Object.keys(manifest).length===0)console.warn('[BALBOLL photos] No original photo was available to create a cutout in this environment. Original image URLs will be displayed.');
}
main().catch(e=>{console.error('[BALBOLL photos]',e);process.exitCode=1});
