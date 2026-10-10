
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
save('index.html',page('러닝화 랭킹 · 나만의 라인업','러닝화를 용도와 발볼로 찾고, 최대 3개 제품을 사진·핏·리뷰·발매가로 비교하세요.','/','home-body.html',['shoes.js','core.js','main.js'],true));
save('compare/index.html',page('러닝화 비교','선택한 러닝화의 발볼, 용도, 리뷰와 구매처를 같은 표에서 비교하세요.','/compare/','compare-body.html',['shoes.js','core.js','compare.js']));
save('methodology/index.html',page('점수·데이터 안내','LINEUP SCORE와 MATCH, 리뷰 집계, 가격·출시 정보의 기준과 한계를 안내합니다.','/methodology/','methodology-body.html',['core.js']));
save('privacy/index.html',page('브라우저 저장 안내','로그인 없이 관심 신발과 비교 제품을 브라우저에 저장합니다.','/privacy/','privacy-body.html',['core.js','privacy.js']));
for(const s of shoes)save('shoes/'+s.slug+'/index.html',V.detail(s,shoes));
const urls=['/','/compare/','/methodology/','/privacy/',...shoes.map(s=>'/shoes/'+s.slug+'/')];
save('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(u=>'<url><loc>'+config.siteUrl.replace(/\/$/,'')+u+'</loc></url>').join('')+'</urlset>');
save('robots.txt','User-agent: *\nAllow: /\nSitemap: '+config.siteUrl.replace(/\/$/,'')+'/sitemap.xml\n');
const out=path.join(root,'public');fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
for(const name of ['index.html','assets','shoes','compare','methodology','privacy','sitemap.xml','robots.txt'])fs.cpSync(path.join(root,name),path.join(out,name),{recursive:true});
console.log('Built '+shoes.length+' product pages plus main, compare and data-policy pages. No external dependencies.');
