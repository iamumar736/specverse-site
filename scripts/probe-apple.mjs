import * as cheerio from 'cheerio';
const base='https://support.apple.com/en-us/108044';
const html=await (await fetch(base)).text();const $=cheerio.load(html);
const specLinks=[];
$('a').each((_,el)=>{const label=$(el).text().replace(/\s+/g,' ').trim();if(/tech specs for iPhone/i.test(label)){specLinks.push({label,href:$(el).attr('href')})}});
console.log('Spec-links total',specLinks.length);
console.log('Links',JSON.stringify(specLinks.slice(0,65)));
for(const url of ['https://support.apple.com/en-us/111831','https://support.apple.com/en-us/125090','https://support.apple.com/en-us/148588']){
 const page=cheerio.load(await (await fetch(url)).text());
 const heads=page('h3.gb-header').map((_,el)=>({label:page(el).text().replace(/\s+/g,' ').trim(),parent:page(el).parent().prop('tagName'),lines:page(el).parent().find('p.gb-paragraph').map((_,p)=>page(p).text().replace(/\s+/g,' ').trim()).get().slice(0,5)})).get();
 console.log('Page',url,'headings-count',heads.length,'headings',JSON.stringify(heads.slice(0,27)));
}


for(const url of [
 'https://www.samsung.com/uk/smartphones/galaxy-a/galaxy-a55-5g-awesome-lemon-128gb-sm-a556bzyaeub/',
 'https://www.samsung.com/pk/smartphones/galaxy-a/galaxy-a55-5g-awesome-navy-256gb-sm-a556ezkwpkd/',
 'https://www.samsung.com/pk/smartphones/galaxy-s24-ultra/',
 'https://www.samsung.com/uk/sitemap.xml'
]){
 try{
  const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Accept':'text/html'},signal:AbortSignal.timeout(18000)});
  const html=await r.text();
  console.log('SamsungURL',url,'status',r.status,'bytes',html.length,'title',cheerio.load(html)('title').text());
  for(const key of ['Size (Main_Display)','Rear Camera - Resolution','Specifications','\"productSpecifications\"','product-specs','specs-list','data-modelcode']){
   const pos=html.toLowerCase().indexOf(key.toLowerCase());
   console.log('SamsungTerm',key,'position',pos,'snippet',html.slice(Math.max(0,pos-150),Math.max(0,pos)+280).replace(/\s+/g,' ').slice(0,430));
  }
 }catch(e){console.warn('SamsungFETCHERR',url,String(e))}
}

for(const loc of ['https://www.samsung.com/uk/sitemap.xml','https://www.samsung.com/pk/sitemap.xml']){
 try{
  const page=await (await fetch(loc)).text();const links=[...page.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1]);
  console.log('SAMSUNGSITEMAP',loc,links.length,JSON.stringify(links.slice(0,30)));
  for(const sub of links.filter(x=>/b2c|product|smartphone|mobile/.test(x)).slice(0,3)){
    const response=await fetch(sub);const text=await response.text();
    const entries=[...text.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1]);
    console.log('SAMSUNGSUBMAP',sub,response.status,text.length,entries.length,JSON.stringify(entries.filter(x=>/galaxy-a55|galaxy-a01|galaxy-s24-ultra/i.test(x)).slice(0,15)),JSON.stringify(entries.slice(0,4)));
  }
 }catch(e){console.log('SAMSUNGSMERR',loc,e.message)}
}