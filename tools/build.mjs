
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const V=require('./views.cjs');
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
const shoes=JSON.parse(fs.readFileSync(path.join(root,'assets/shoes.json'),'utf8'));
// V14: consume only cutouts actually generated during photo preparation.
// Remote source URLs and image attribution remain intact as fallback.
const photoManifestFile=path.join(root,'assets/shoe-cutouts/manifest.json');
const photoManifest=fs.existsSync(photoManifestFile)?JSON.parse(fs.readFileSync(photoManifestFile,'utf8')):{};
for(const s of shoes){
 const asset=photoManifest[s.slug];
 if(asset?.src&&asset.src==='/assets/shoe-cutouts/'+s.slug+'.webp'&&fs.existsSync(path.join(root,'assets/shoe-cutouts',s.slug+'.webp'))){
  const prior=s.imageOriginal||s.img;
  s.imageOriginal=prior;
  s.imageAlternates=[s.img,...(s.imageAlternates||[])].filter((x,i,a)=>x&&a.indexOf(x)===i);
  s.img=asset.src;
  s.photoCutout=true;
 }
}

if(!Array.isArray(shoes)||!shoes.length)throw new Error('shoes.json must contain a non-empty array');
const slugs=new Set(),names=new Set();
for(const s of shoes){if(!/^[a-z0-9-]+$/.test(s.slug)||slugs.has(s.slug)||names.has(s.name))throw new Error('Invalid or duplicate model: '+s.name);slugs.add(s.slug);names.add(s.name)}
const json=JSON.stringify(shoes).replace(/</g,'\\u003c');
fs.writeFileSync(path.join(root,'assets/shoes.js'),'window.SHOES='+json+';\n');
function save(rel,html){const file=path.join(root,rel);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html.replaceAll('https://shoealign.vercel.app',config.siteUrl.replace(/\/$/,'')))}
function page(title,description,url,template,scripts,home=false){
 const body=fs.readFileSync(path.join(root,'tools',template),'utf8').replace('<!-- SITE_FOOTER -->',V.footer());
 return '<!doctype html><html lang="ko">'+V.head(title,description,url)+'<body>'+V.header(home)+body+scripts.map(x=>'<script src="/assets/'+x+'?v='+config.version+'"></script>').join('')+'</body></html>';
}
save('index.html',page('러닝화 평점과 장단점','러닝화 5개 항목 평점과 장점, 단점, 발볼을 한눈에 확인하세요.','/','home-body.html',['shoes.js','core.js','main.js'],true));

// Category catalogs use their own dataset; running scores are never reused as walking or hiking scores.
for(const [key,label] of [['hiking','등산화'],['walking','워킹화']]){
 process.env.BALBOLL_CATEGORY=key;
 save(key+'/index.html',page(label+' 제품 정보',label+' 공개 자료 기반 신발 정보','/'+key+'/',key+'-body.html',['category-collection.js','category.js','kr-catalog.js']));
 delete process.env.BALBOLL_CATEGORY;
}
save('methodology/index.html',page('점수·데이터 안내','BALBOLL 점수와 리뷰 출처, 평가 기준을 안내합니다.','/methodology/','methodology-body.html',['core.js']));
save('privacy/index.html',page('브라우저 저장 안내','사이트 데이터 처리 안내입니다.','/privacy/','privacy-body.html',['core.js','privacy.js']));
for(const s of shoes)save('shoes/'+s.slug+'/index.html',V.detail(s,shoes));
const urls=['/reviews/','/request/','/admin/','/hiking/','/walking/', '/', '/methodology/','/privacy/',...shoes.map(s=>'/shoes/'+s.slug+'/')];
save('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(u=>'<url><loc>'+config.siteUrl.replace(/\/$/,'')+u+'</loc></url>').join('')+'</urlset>');
save('robots.txt','User-agent: *\nAllow: /\nSitemap: '+config.siteUrl.replace(/\/$/,'')+'/sitemap.xml\n');
// BALBOLL review enhancement: source-based reviews live in Supabase, never fabricate scores.
for(const rel of ['index.html',...shoes.map(s=>'shoes/'+s.slug+'/index.html')]){
 const target=path.join(root,rel);let html=fs.readFileSync(target,'utf8');
 html=html.replace('</head>','<link rel="stylesheet" href="/assets/runficial.css"><link rel="stylesheet" href="/assets/balboll.css?v='+config.version+'"></head>');
 html=html.replace('</body>','<script src="/assets/balboll-ui.js"></script></body>');
 if(rel.startsWith('shoes/'))html=html.replace('</body>','<script src="/assets/balboll-detail.js"></script></body>');fs.writeFileSync(target,html);
}
// V44 final layout stylesheet applies consistently to all categories on every build.
for(const rel of ['index.html','hiking/index.html','walking/index.html']){
 const target=path.join(root,rel);let html=fs.readFileSync(target,'utf8');
 html=html.replace('</head>','<link rel="stylesheet" href="/assets/v44-layout.css?v=44"><link rel="stylesheet" href="/assets/v45-compact.css?v=45"><link rel="stylesheet" href="/assets/v46-dense.css?v=46"></head>');
 fs.writeFileSync(target,html);
}
const out=path.join(root,'public');fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
for(const name of ['index.html','assets','shoes','hiking','walking','methodology','privacy','reviews','request','admin','sitemap.xml','robots.txt','favicon.ico'])fs.cpSync(path.join(root,name),path.join(out,name),{recursive:true});
console.log('Built '+shoes.length+' product pages plus main and data-policy pages. Photo cutouts: '+Object.keys(photoManifest).length+'.');
