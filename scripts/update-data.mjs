import fs from 'node:fs/promises';
import {phones as starter} from '../phones.js';
import {materializeManufacturerSeeds,EXTRA_BRAND_FILES} from '../official-extra-brand-seeds.js';
const dir=new URL('../public/data/',import.meta.url);
await fs.mkdir(dir,{recursive:true});
const read=async(name,fallback)=>JSON.parse(await fs.readFile(new URL(name,dir),'utf8').catch(()=>JSON.stringify(fallback)));
const existing=await read('catalog.json',[]),previousPrices=await read('prices.json',{}),discovered=await read('discovered.json',[]),imported=await read('imported.json',[]),legacy=await read('legacy-models.json',[]);
const manufacturerApple=await read('official-apple.json',{}),manufacturerSamsung=await read('official-samsung.json',{}),manufacturerOppo=await read('official-oppo.json',{}),manufacturerVivo=await read('official-vivo.json',{});
const extraOfficial=Object.fromEntries(await Promise.all(
  Object.entries(EXTRA_BRAND_FILES).map(async ([brand,file])=>[brand,await read(file,{})])
));
const catalog=new Map();
const quality={discovered:0,verified:0};
const cleanValue=d=>Object.fromEntries(Object.entries(d).filter(([k,v])=>!['__proto__','constructor','prototype'].includes(k)&&v!==null&&v!==undefined&&v!==''));
const norm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'');
const nameKey=d=>{
 const brand=norm(d.brand);
 const n=norm(d.name);
 return brand+'|'+(n.startsWith(brand)&&n.length>brand.length?n.slice(brand.length):n);
};
// The existing curated catalog always has final precedence over imported open data.
// Merge by marketing identity, not ID, so model-number variants do not multiply listings.
const byName=new Map();
const importedIDs=new Set(imported.map(d=>d.id));
const safeExisting=existing.filter(d=>d.dataQuality!=='open-data-identity-category-inferred'||importedIDs.has(d.id));
for(const d of [...discovered,...imported,...legacy,...starter,...safeExisting]){
 if(!d?.id||!d?.name||!d?.brand)continue;
 const k=nameKey(d),old=byName.get(k)||{};
 byName.set(k,{...old,...cleanValue(d)});
}
const seeds=materializeManufacturerSeeds([...byName.values()]);
for(const d of byName.values()){
  const extraSource=d.brand==='Xiaomi'||['Redmi','POCO'].includes(d.brand)?'Xiaomi':d.brand;
  const seeded=seeds[extraSource]?.[d.id]||{};
  const verified=d.brand==='Apple'?manufacturerApple[d.id]:
    d.brand==='Samsung'?manufacturerSamsung[d.id]:
    d.brand==='OPPO'?manufacturerOppo[d.id]:
    d.brand==='Vivo'?manufacturerVivo[d.id]:
    extraOfficial[extraSource]?.[d.id];
  const overlay={...seeded,...verified};
  catalog.set(d.id,Object.keys(overlay).length?{...d,...overlay,id:d.id,name:d.name,brand:d.brand,image:d.image}:d);
}
const prices={...previousPrices};const now=new Date().toISOString();
const sources=(process.env.SPECVERSE_FEED_URLS||process.env.SPECVERSE_FEED_URL||'').split(',').map(x=>x.trim()).filter(Boolean);
const results=[];
const slug=s=>s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
for(const source of sources){
 try{
  const url=new URL(source);if(url.protocol!=='https:')throw Error('HTTPS required');
  const response=await fetch(url,{headers:process.env.SPECVERSE_FEED_TOKEN?{Authorization:`Bearer ${process.env.SPECVERSE_FEED_TOKEN}`}:{},signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw Error(`HTTP ${response.status}`);
  const payload=await response.json();let deviceCount=0,priceCount=0;
  for(const d of Array.isArray(payload.devices)?payload.devices:[]){
   if(typeof d.brand!=='string'||typeof d.name!=='string'||!/^https:\/\//.test(d.sourceUrl||''))continue;
   const id=d.id||slug(`${d.brand}-${d.name}`),old=catalog.get(id)||{};
   const clean=Object.fromEntries(Object.entries(d).filter(([k,v])=>!['__proto__','constructor','prototype'].includes(k)&&v!==null&&v!==''&&v!==undefined));
   catalog.set(id,{...old,...clean,id,verifiedAt:now});deviceCount++;
  }
  for(const p of Array.isArray(payload.prices)?payload.prices:[]){
   if(!catalog.has(p.deviceId)||!['USD','PKR'].includes(p.currency)||!Number.isFinite(Number(p.amount))||Number(p.amount)<=0||!/^https:\/\//.test(p.sourceUrl||''))continue;
   prices[p.deviceId]??={};prices[p.deviceId][p.currency]={amount:Number(p.amount),currency:p.currency,sourceUrl:p.sourceUrl,ptaStatus:p.currency==='PKR'?(p.ptaStatus||'Unspecified'):undefined,updatedAt:now};priceCount++;
  }
  results.push({source:url.hostname,ok:true,deviceCount,priceCount});
 }catch(err){results.push({source,ok:false,error:String(err.message).slice(0,180)});console.error(`Feed failed: ${source}: ${err.message}`)}
}
const all=[...catalog.values()].sort((a,b)=>(b.year||0)-(a.year||0)||a.name.localeCompare(b.name));
if(existing.length>=200&&all.length<Math.floor(existing.length*.9)){
  throw Error('Catalog shrank from '+existing.length+' to '+all.length+
    ' (>10% decrease). Refusing automatic overwrite until data source is investigated.');
}

await fs.writeFile(new URL('catalog.json',dir),JSON.stringify(all,null,2)+'\n');
await fs.writeFile(new URL('prices.json',dir),JSON.stringify(prices,null,2)+'\n');
await fs.writeFile(new URL('status.json',dir),JSON.stringify({lastChecked:now,deviceCount:all.length,discoveredCount:all.filter(d=>d.dataQuality==='discovered-unverified').length,feedConfigured:sources.length>0,importedCount:imported.length,curatedLegacyCount:legacy.length,brandCount:new Set(all.map(d=>d.brand)).size,providers:results},null,2)+'\n');
console.log(`Catalog ${all.length} devices; ${results.filter(r=>r.ok).length}/${sources.length} feeds succeeded`);
