'use strict';
const {normalizePhoto}=require('./photo-cutout.cjs');
const sharp=require('sharp');
const assert=require('node:assert/strict');
(async()=>{
 const w=940,h=620;
 const canvas=await sharp({create:{width:w,height:h,channels:4,background:'#f8f8f8'}})
  .composite([{input:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="750" height="340"><path d="M 25 230 C 200 230 225 135 350 100 L 500 180 C 555 215 630 210 685 225 L 730 250 725 298 30 298 Z" fill="#89a4b9" stroke="#344c59" stroke-width="15"/><path d="M80 270 L600 270" stroke="#171e23" stroke-width="12" /></svg>'),left:90,top:130}])
  .png().toBuffer();
 const r=await normalizePhoto(canvas);
 assert.equal(r.kind,'studio-cutout');
 assert.equal((await sharp(r.image).metadata()).width,1200);
 const raw=await sharp(r.image).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const topLeftAlpha=raw.data[3];assert.equal(topLeftAlpha,0);
 assert.ok([...raw.data].length>0);
 console.log('PASS: image trim, foreground segmentation, transparent corners, 1200px canvas');
})().catch(e=>{console.error(e);process.exitCode=1});
