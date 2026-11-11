import * as cheerio from 'cheerio';
for(const url of [
 'https://www.samsung.com/in/business/smartphones/galaxy-s/galaxy-s24-ultra-sm-s928bzkcins/',
 'https://www.samsung.com/in/smartphones/galaxy-s/galaxy-s24-onyx-black-128gb-sm-s921ezkiins/',
 'https://www.samsung.com/pk/smartphones/galaxy-a/galaxy-a55-5g-awesome-navy-256gb-sm-a556ezkwpkd/'
]){
 const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}});const html=await r.text();const $=cheerio.load(html);
 console.log('SOURCE',url,'http',r.status,'length',html.length,'title',$('title').text(),'pdd32',$('.pdd32-product-spec__content-item').length);
 for(const term of ['Size (Main Display)','Rear Camera - Resolution','CPU Speed','pdd32-product-spec','Specifications']){
  const i=html.indexOf(term);console.log('TERM',term,i,html.slice(Math.max(0,i-170),Math.max(0,i)+350).replace(/\s+/g,' ').slice(0,520))
 }
 const names=['.pdd32-product-spec__content-item','.pdd23-product-spec__content-item','[class*="spec__content-item"]','[class*="specification"]'];
 console.log('SELECTORS',names.map(n=>[n,$(n).length]));
}
