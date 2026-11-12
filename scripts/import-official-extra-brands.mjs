import fs from 'node:fs/promises';
import * as cheerio from 'cheerio';
import {EXTRA_BRAND_FILES,EXTRA_BRAND_SEEDS,materializeManufacturerSeeds,
  exactBrandModelName} from '../official-extra-brand-seeds.js';
import {preserveOfficialSpecs,hasUsableOfficialRecord,sourceIsOfficial} from '../official-spec-preservation.js';

const dir=new URL('../public/data/',import.meta.url);
const read=async(file,fallback)=>JSON.parse(await fs.readFile(new URL(file,dir),'utf8')
  .catch(()=>JSON.stringify(fallback)));
const catalog=await read('catalog.json',[]);
const state=await read('extra-brands-import-state.json',{});
const maxPerBrand=Math.min(30,Math.max(1,Number(process.argv.find(v=>v.startsWith('--max='))?.split('=')[1])||8));
const REGION_SOURCES={
  Xiaomi:['https://www.mi.com/global/product/','https://www.mi.com/pk/product/'],
  Infinix:['https://wap.az.infinixmobility.com/specs/','https://wap.iq.infinixmobility.com/specs/'],
  Tecno:['https://www.tecno-mobile.com/phones/tech-specs/techspecs/',
    'https://www.tecno-mobile.com/pak/phones/tech-specs/techspecs/'],
  Itel:['https://www.itel-life.com/products/phone/']
};
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const slug=value=>clean(value).toLowerCase().normalize('NFKD')
  .replace(/\+/g,'-plus-').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const escapeRegExp=s=>s.replace(/[.*+?^\x24{}()|[\]\\]/g,'\\$&');
const labels=[
  'Processor','Storage & RAM','Dimensions','Display','Rear camera','Front camera',
  'Battery & Charging','Operating System','Camera','Camera Capacity','Battery Capacity',
  'Color','Operating System','Network','Dimension','Resolution','Memory','Connectivity',
  'Sensor','Loudspeaker','RAM','ROM','Size','Weight','Model','Platform','Chipset',
  'CPU','GPU','Rear','Front','Battery','Charging','Charging Power',
  'System','Front Camera','Rear Camera','Performance Parameters'
];
function segment(text,head,next){
  const pattern=new RegExp('(?:^|\\s)'+escapeRegExp(head)+'\\s+(.{1,380}?)\\s+(?='+
    next.map(escapeRegExp).join('|')+'\\s|$)','i');
  return clean(text.match(pattern)?.[1]||'').slice(0,220);
}
function extract(page,brand){
  const $=cheerio.load(page);
  $('script,style,noscript,nav,footer,header').remove();
  const txt=clean($('body').text()).slice(0,65000);
  const sections={};
  for(const label of labels){
    const next=labels.filter(other=>other.toLowerCase()!==label.toLowerCase());
    const value=segment(txt,label,next);
    if(value&&!sections[label.toLowerCase()])sections[label.toLowerCase()]=value;
  }
  // Some manufacturer pages present straightforward label/value adjacent DOM nodes.
  $('h2,h3,h4,dt,.spec-title,.attr-item-name').each((_,el)=>{
    const label=clean($(el).text()).replace(/[:：]$/,'').toLowerCase();
    if(!label||!labels.some(v=>v.toLowerCase()===label))return;
    const value=clean($(el).next().text()||$(el).parent().next().text());
    if(value&&value.length<260)sections[label]=value;
  });
  const get=(...names)=>names.map(v=>sections[v.toLowerCase()]).find(Boolean)||'';
  const out={};const put=(name,value)=>{const v=clean(value);if(v&&v.length<260)out[name]=v};
  const title=clean($('title').first().text());
  const h1=clean($('h1').first().text());
  let name=(h1||title).replace(/\s+(?:tech(?:nical)?\s+)?spec(?:s|ifications?)?.*$/i,'')
    .replace(/\s*[-|]\s*(?:Xiaomi|TECNO|Infinix|itel).*$/i,'').trim();
  if(brand==='Xiaomi'){
    name=clean(title).split(/\s+specs?\b/i)[0]||name;
    put('chip',get('Processor'));
    const memory=get('Storage & RAM');
    const memoryPairs=[...memory.matchAll(/(\d+)\s*(?:GB)?\s*\+\s*(\d+)\s*GB/gi)];
    if(memoryPairs.length){
      put('ram',[...new Set(memoryPairs.map(m=>m[1]+' GB'))].join(' / '));
      put('storage',[...new Set(memoryPairs.map(m=>m[2]+' GB'))].join(' / '));
    }
    const display=get('Display');
    put('screen',display.split(/Refresh rate|Resolution|Brightness/i)[0].slice(0,115));
    put('refreshRate',display.match(/Refresh rate:\s*(?:up to\s*)?\d+\s*Hz/i)?.[0]);
    put('resolution',display.match(/Resolution:\s*\d+\s*[×*x]\s*\d+/i)?.[0]);
    put('camera',get('Rear camera').split(/Rear camera (?:photography|video)/i)[0].slice(0,170));
    put('selfie',get('Front camera').split(/Front camera (?:video|features)/i)[0].slice(0,95));
    const charging=get('Battery & Charging');
    put('battery',charging.match(/\d{4,5}\s*mAh/i)?.[0]);
    put('charging',charging.match(/\d{2,3}\s*W\s*(?:HyperCharge|turbo charging|charging)?/i)?.[0]);
    put('os',get('Operating System'));
  }else if(brand==='Tecno'){
    put('chip',get('Processor'));
    put('screen',get('Display'));put('resolution',get('Resolution'));
    const cameras=get('Camera');
    put('camera',cameras.match(/Rear:\s*(.*?)(?=Front:|$)/i)?.[1]||cameras.slice(0,150));
    put('selfie',cameras.match(/Front:\s*(.*?)(?=Rear:|$)/i)?.[1]);
    put('battery',get('Battery Capacity').match(/\d{4,5}\s*mAh/i)?.[0]);
    put('charging',get('Battery Capacity').match(/\d{2,3}\s*W\s*[A-Za-z ]{0,20}/)?.[0]);
    put('dimensions',get('Dimension'));put('os',get('Operating System'));
    put('storage',get('Memory').slice(0,150));
  }else if(brand==='Itel'){
    put('screen',get('Display'));put('resolution',get('Resolution'));
    put('chip',get('Processor'));put('battery',get('Battery Capacity'));
    put('charging',get('Charge','Charging'));
    put('camera',get('Rear Camera'));put('selfie',get('Front Camera'));
    put('storage',get('Memory').slice(0,160));put('os',get('System','Operating System'));
  }else{
    put('chip',get('CHIPSET','Processor'));
    put('cpu',get('CPU'));put('gpu',get('GPU'));
    put('screen',get('SIZE','Display'));put('resolution',get('Resolution'));
    put('camera',get('Rear','Camera').slice(0,150));
    put('selfie',get('Front'));
    put('battery',get('Capacity','Battery').match(/\d{4,5}\s*mAh/i)?.[0]);
    put('charging',get('Charging').slice(0,90));
    put('ram',get('RAM'));put('storage',get('ROM'));
    put('os',get('Operating System'));
  }
  return {name,out};
}
function isCatalogBrand(phone,brand){
  const candidate=phone?.brand?.toLowerCase();
  return candidate===brand.toLowerCase()||
    (brand==='Xiaomi'&&['poco','redmi'].includes(candidate));
}
function candidateUrls(phone,brand){
  const raw=String(phone.name||'').replace(new RegExp('^'+brand+'\\s+','i'),'');
  const nameSlug=slug(raw);
  if(!nameSlug||nameSlug.length>78)return [];
  if(brand==='Itel'){
    const series=/^a\d|^a-series/.test(nameSlug)?'a-series':
      /^s\d|^super/.test(nameSlug)?'s-series':
      /^(power|p\d)/.test(nameSlug)?'p-series':null;
    return series?['https://www.itel-life.com/products/phone/'+series+'/'+nameSlug+'/spec']:[];
  }
  return REGION_SOURCES[brand].map(base=>base+nameSlug+(brand==='Xiaomi'?'/specs/':''));
}
const boot=materializeManufacturerSeeds(catalog);
const report={},nextState={};
for(const brand of Object.keys(EXTRA_BRAND_FILES)){
  const filename=EXTRA_BRAND_FILES[brand];
  const old=await read(filename,{});
  const base=preserveOfficialSpecs(boot[brand],old,brand);
  const tracked=catalog.filter(p=>isCatalogBrand(p,brand)&&p.id&&p.name);
  const missing=tracked.filter(p=>!hasUsableOfficialRecord(base[p.id],brand))
    .sort((a,b)=>(Number(b.year)||0)-(Number(a.year)||0)||
      String(a.name).localeCompare(String(b.name)));
  const offset=Math.max(0,Number(state[brand]?.offset)||0)%Math.max(1,missing.length);
  const selected=Array.from({length:Math.min(maxPerBrand,missing.length)},(_,i)=>missing[(offset+i)%missing.length]);
  const fresh={};
  let checked=0,failed=0;
  for(const device of selected){
    const possible=candidateUrls(device,brand);
    for(const url of possible){
      try{
        const response=await fetch(url,{signal:AbortSignal.timeout(12000),
          headers:{'User-Agent':'Mozilla/5.0 (compatible; SpecVerse/1.0; model specs)' }});
        if(!response.ok)throw Error('HTTP '+response.status);
        const finalUrl=response.url;
        if(!sourceIsOfficial({sourceUrl:finalUrl},brand))throw Error('Non-manufacturer redirect');
        const parsed=extract(await response.text(),brand);
        if(exactBrandModelName(brand,parsed.name)!==exactBrandModelName(brand,device.name))continue;
        if(Object.keys(parsed.out).length<5)continue;
        const locale=brand==='Xiaomi'?new URL(finalUrl).pathname.split('/')[1]||'global':'reference';
        fresh[device.id]={
          ...parsed.out,sourceUrl:finalUrl,
          verifiedSource:brand+' official '+locale,
          dataQuality:'official-specifications-regional-variant',
          verifiedAt:new Date().toISOString(),
          variantDetails:'Specifications from '+brand+' product page. Memory, camera configurations, radio bands and other technical data may differ by region.'
        };
        checked++;break;
      }catch(error){failed++;}
    }
    await sleep(120);
  }
  const merged=preserveOfficialSpecs(base,fresh,brand);
  await fs.writeFile(new URL(filename,dir),JSON.stringify(merged,null,2)+'\n');
  nextState[brand]={offset:missing.length?(offset+selected.length)%missing.length:0,
    lastChecked:new Date().toISOString(),attempted:selected.length};
  report[brand]={total:tracked.length,verified:tracked.filter(p=>hasUsableOfficialRecord(merged[p.id],brand)).length,
    checkedThisRun:selected.length,addedThisRun:checked,failedRequests:failed,
    missing:tracked.filter(p=>!hasUsableOfficialRecord(merged[p.id],brand)).map(p=>p.name),
    note:'Official regional/reference launch profiles only; missing hardware fields are not guessed.'};
  console.log(brand,JSON.stringify({tracked:tracked.length,verified:report[brand].verified,selected:selected.length,added:checked}));
}
await fs.writeFile(new URL('extra-brands-import-state.json',dir),JSON.stringify(nextState,null,2)+'\n');
await fs.writeFile(new URL('extra-brands-verification-coverage.json',dir),JSON.stringify(report,null,2)+'\n');
if(!catalog.length)throw Error('Catalog unavailable: refusing incomplete manufacturer import');
