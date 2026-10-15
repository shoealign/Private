'use strict';
/**
 * BALBOLL product-photo normalization.
 * Conservative edge-connected background removal for uniform studio photos.
 * No invented shoe pixels: source image is always kept intact where extraction is uncertain.
 */
const sharp = require('sharp');
const CANVAS_W = 1200;
const CANVAS_H = 780;
const SOURCE_MAX = 1250;

function median(a){a.sort((x,y)=>x-y);return a[Math.floor(a.length/2)]??0;}
function clamp(n,lo,hi){return Math.max(lo,Math.min(hi,n));}

async function normalizePhoto(input,options={}) {
  const {data,info}=await sharp(input,{limitInputPixels:30000000}).rotate()
    .resize({width:SOURCE_MAX,height:SOURCE_MAX,fit:'inside',withoutEnlargement:true})
    .ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const w=info.width,h=info.height,pixels=w*h;
  if(w<140||h<140)throw new Error('원본 이미지 해상도가 너무 작습니다');
  const px=(x,y)=>((y*w+x)*4);
  const corners=[];
  const offsets=[.005,.02,.05,.08,.92,.95,.98,.995];
  for(const fy of offsets)for(const fx of offsets){
    if(fy>.08&&fy<.92&&fx>.08&&fx<.92)continue;
    const j=px(Math.min(w-1,Math.floor(fx*w)),Math.min(h-1,Math.floor(fy*h)));
    corners.push([data[j],data[j+1],data[j+2]]);
  }
  const bg=[0,1,2].map(c=>median(corners.map(p=>p[c])));
  const deviations=[0,1,2].map(c=>median(corners.map(p=>Math.abs(p[c]-bg[c]))));
  const nearBG=([r,g,b])=>Math.max(Math.abs(r-bg[0]),Math.abs(g-bg[1]),Math.abs(b-bg[2]));
  const bgSampleCoverage=corners.filter(c=>nearBG(c)<42).length/corners.length;
  let preExisting=0;
  for(let y=0;y<h;y+=8)for(let x=0;x<w;x+=8)if(data[px(x,y)+3]<220)preExisting++;
  const alreadyTransparent=preExisting/Math.ceil(w/8)/Math.ceil(h/8)>.08;
  const flat=deviations.every(x=>x<19)&&bgSampleCoverage>.83;
  const pixelsOut=Buffer.from(data);
  let kind='unaltered',cleared=0;
  if(alreadyTransparent){kind='original-transparent'}
  else if(flat){
    // Seed only at the image border. A foreground-shaped dark patch is never
    // removed just because it shares a similar color with some background pixels.
    const queue=new Int32Array(pixels);
    const marks=new Uint8Array(pixels);let head=0,tail=0;
    const acceptable=(id)=>{
      const j=id*4;
      const dr=data[j]-bg[0],dg=data[j+1]-bg[1],db=data[j+2]-bg[2];
      return Math.max(Math.abs(dr),Math.abs(dg),Math.abs(db))<=51 &&
        (dr*dr+dg*dg+db*db)<=78*78;
    };
    const add=(id)=>{if(!marks[id]&&acceptable(id)){marks[id]=1;queue[tail++]=id;}};
    for(let x=0;x<w;x++){add(x);add((h-1)*w+x)}
    for(let y=0;y<h;y++){add(y*w);add(y*w+w-1)}
    while(head<tail){const id=queue[head++],x=id%w;
      if(x>0)add(id-1);
      if(x<w-1)add(id+1);
      if(id>=w)add(id-w);
      if(id<pixels-w)add(id+w);
    }
    if(tail>=pixels*.06 && tail<=pixels*.92){
      // Feathering at the edge of the mask; preserve subtle shadows instead
      // of turning them into a hard/aliased contour.
      for(let id=0;id<pixels;id++){
        if(!marks[id])continue;
        const j=id*4;
        const dr=data[j]-bg[0],dg=data[j+1]-bg[1],db=data[j+2]-bg[2];
        const d=Math.sqrt(dr*dr+dg*dg+db*db);
        const alpha=d<=21?0:Math.round(255*clamp((d-21)/49,0,1));
        pixelsOut[j+3]=Math.min(pixelsOut[j+3],alpha);
      }
      cleared=tail;
      kind='studio-cutout';
    }
  }
  if(kind==='unaltered')return {kind,why:flat?'foreground detection failed':'image background is not sufficiently uniform',background:bg,dimensions:[w,h]};
  let left=w,top=h,right=-1,bottom=-1,opaque=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const j=px(x,y);
    if(pixelsOut[j+3]<100)continue;
    opaque++;left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
  }
  if(opaque<pixels*.012||right<left)return {kind:'unaltered',why:'foreground detection too small',background:bg};
  const bw=right-left+1,bh=bottom-top+1;
  // Avoid a negligible crop; it usually signals that a backdrop is still present.
  if(kind==='studio-cutout'&&bw/w>.985&&bh/h>.985)return {kind:'unaltered',why:'foreground too close to borders',background:bg};
  const cropPadding=Math.max(8,Math.floor(Math.max(bw,bh)*.025));
  const cropLeft=clamp(left-cropPadding,0,w-1),cropTop=clamp(top-cropPadding,0,h-1);
  const cropRight=clamp(right+cropPadding,0,w-1),cropBottom=clamp(bottom+cropPadding,0,h-1);
  const source=await sharp(pixelsOut,{raw:{width:w,height:h,channels:4}})
    .extract({left:cropLeft,top:cropTop,width:cropRight-cropLeft+1,height:cropBottom-cropTop+1})
    .resize({width:1130,height:655,fit:'inside',withoutEnlargement:false})
    .webp({quality:91,effort:4,alphaQuality:100}).toBuffer();
  const {width:fw,height:fh}=await sharp(source).metadata();
  const leftOut=Math.max(0,Math.round((CANVAS_W-fw)/2));
  const topOut=Math.max(0,Math.round((CANVAS_H-fh)/2));
  const image=await sharp({create:{width:CANVAS_W,height:CANVAS_H,channels:4,background:{r:255,g:255,b:255,alpha:0}}})
    .composite([{input:source,left:leftOut,top:topOut}])
    .webp({quality:90,effort:5,alphaQuality:100}).toBuffer();
  return {kind,image,background:bg,cleared,dimensions:[w,h],output:[CANVAS_W,CANVAS_H]};
}
module.exports={normalizePhoto};
