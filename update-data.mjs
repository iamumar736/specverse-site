import fs from 'node:fs/promises';
import {phones as starter} from './phones.js';
const dir=new URL('./public/data/',import.meta.url);
await fs.mkdir(dir,{recursive:true});
const read=async(name,fallback)=>JSON.parse(await fs.readFile(new URL(name,dir),'utf8').catch(()=>JSON.stringify(fallback)));
const existing=await read('catalog.json',[]),previousPrices=await read('prices.json',{}),discovered=await read('discovered.json',[]);
const catalog=new Map();
for(const d of [...starter,...existing,...discovered])if(d?.id&&d?.name&&d?.brand)catalog.set(d.id,{...catalog.get(d.id),...d});
const prices={...previousPrices};const now=new Date().toISOString();
const sources=(process.env.POCKET_FEED_URLS||process.env.POCKET_FEED_URL||'').split(',').map(x=>x.trim()).filter(Boolean);
const results=[];
const slug=s=>s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
for(const source of sources){
 try{
  const url=new URL(source);if(url.protocol!=='https:')throw Error('HTTPS required');
  const response=await fetch(url,{headers:process.env.POCKET_FEED_TOKEN?{Authorization:`Bearer ${process.env.POCKET_FEED_TOKEN}`}:{},signal:AbortSignal.timeout(25000)});
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
await fs.writeFile(new URL('catalog.json',dir),JSON.stringify(all,null,2)+'\n');
await fs.writeFile(new URL('prices.json',dir),JSON.stringify(prices,null,2)+'\n');
await fs.writeFile(new URL('status.json',dir),JSON.stringify({lastChecked:now,deviceCount:all.length,feedConfigured:sources.length>0,providers:results},null,2)+'\n');
console.log(`Catalog ${all.length} devices; ${results.filter(r=>r.ok).length}/${sources.length} feeds succeeded`);
