
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const V=require('./views.cjs');
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
const shoes=JSON.parse(fs.readFileSync(path.join(root,'assets/shoes.json'),'utf8'));
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

save('methodology/index.html',page('점수·데이터 안내','BALBOLL 점수와 리뷰 출처, 평가 기준을 안내합니다.','/methodology/','methodology-body.html',['core.js']));
save('privacy/index.html',page('브라우저 저장 안내','사이트 데이터 처리 안내입니다.','/privacy/','privacy-body.html',['core.js','privacy.js']));
for(const s of shoes)save('shoes/'+s.slug+'/index.html',V.detail(s,shoes));
const urls=['/reviews/','/request/','/admin/', '/','/methodology/','/privacy/',...shoes.map(s=>'/shoes/'+s.slug+'/')];
save('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(u=>'<url><loc>'+config.siteUrl.replace(/\/$/,'')+u+'</loc></url>').join('')+'</urlset>');
save('robots.txt','User-agent: *\nAllow: /\nSitemap: '+config.siteUrl.replace(/\/$/,'')+'/sitemap.xml\n');
// BALBOLL review enhancement: source-based reviews live in Supabase, never fabricate scores.
for(const rel of ['index.html',...shoes.map(s=>'shoes/'+s.slug+'/index.html')]){
 const target=path.join(root,rel);let html=fs.readFileSync(target,'utf8');
 html=html.replace('</head>','<link rel="stylesheet" href="/assets/runficial.css"><link rel="stylesheet" href="/assets/balboll.css"></head>');
 html=html.replace('</body>','<script src="/assets/balboll-ui.js"></script></body>');
 if(rel.startsWith('shoes/'))html=html.replace('</body>','<script src="/assets/balboll-detail.js"></script></body>');fs.writeFileSync(target,html);
}
const out=path.join(root,'public');fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
for(const name of ['index.html','assets','shoes','methodology','privacy','reviews','request','admin','sitemap.xml','robots.txt'])fs.cpSync(path.join(root,name),path.join(out,name),{recursive:true});
console.log('Built '+shoes.length+' product pages plus main and data-policy pages. No external dependencies.');
