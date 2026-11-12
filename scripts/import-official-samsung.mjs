import fs from 'node:fs/promises';
import * as cheerio from 'cheerio';
import {mergeSamsungVerifiedRecords,samsungCoverageReport,validSamsungRecord} from '../samsung-spec-coverage.js';
const root=new URL('../public/data/',import.meta.url);
const catalog=JSON.parse(await fs.readFile(new URL('catalog.json',root),'utf8'));
const devices=catalog.filter(p=>p.brand==='Samsung');
const previous=JSON.parse(await fs.readFile(new URL('official-samsung.json',root),'utf8').catch(()=>'{}'));
const previousState=JSON.parse(await fs.readFile(new URL('samsung-import-state.json',root),'utf8').catch(()=>'{}'));
const getNumber=(name,fallback,max)=>Math.min(max,Math.max(1,Number(process.argv.find(v=>v.startsWith('--'+name+'='))?.split('=')[1])||fallback));
const maxPerRun=getNumber('max',18,80);
const regionsPerRun=getNumber('regions',3,12);
const clean=x=>String(x||'').replace(/[\u00a0\u200b]/g,' ').replace(/\s+/g,' ').trim();
const slug=x=>String(x||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function fetchText(url,attempts=3){
 for(let i=0;i<attempts;i++){
  try{
   const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; SpecVerse published specification checker)','Accept':'text/html,application/xml'},signal:AbortSignal.timeout(18000)});
   if(!r.ok)throw Error('HTTP '+r.status);
   return {url:r.url,text:await r.text()};
  }catch(e){if(i===attempts-1)throw e;await wait((i+1)*1200)}
 }
}
const allSites=['pk','sg','uk','in','my','ph','id','au','ae','th','vn','za'];
const regionOffset=Math.max(0,Number(previousState.regionOffset)||0)%allSites.length;
const sites=Array.from({length:regionsPerRun},(_,i)=>allSites[(regionOffset+i)%allSites.length]);
// Prefer missing records: do not repeatedly download already authoritative data.
const incomplete=devices.filter(p=>!validSamsungRecord(previous[p.id]));
const offset=Math.max(0,Number(previousState.offset)||0)%Math.max(1,incomplete.length);
const selected=Array.from({length:Math.min(maxPerRun,incomplete.length)},(_,i)=>incomplete[(offset+i)%incomplete.length]);
console.log('Samsung catalog',devices.length,'existing official records',devices.length-incomplete.length,
 'target models',selected.length,'regions',sites.join(', '));
const candidates=[];
for(const site of sites){
 const maps=['https://www.samsung.com/'+site+'/im-sitemap.xml'];
 if(['pk','in','uk','sg','my','ae','au'].includes(site))maps.push('https://www.samsung.com/'+site+'/business/b2b-sitemap.xml');
 for(const location of maps){
  try{
   const xml=(await fetchText(location)).text;
   let urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1].replace(/&amp;/g,'&'));
   const submaps=urls.filter(u=>/sitemap\.xml(?:\?|$)/.test(u));
   if(submaps.length&&submaps.length<20){
    for(const sub of submaps){
     try{const next=(await fetchText(sub,2)).text;urls.push(...[...next.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1].replace(/&amp;/g,'&')))}
     catch(e){console.warn('Samsung submap unavailable',sub,e.message)}
    }
   }
   const phones=urls.filter(url=>{
    const u=new URL(url);
    return u.pathname.includes('/smartphones/')&&/\/galaxy-(?:[a-z0-9-]+)\//i.test(u.pathname)
      &&!/\/(?:buy|reviews|compare|accessories|upgrade|features|how-to|trade-in)\//i.test(u.pathname)
      &&!/\.(?:jpg|png|svg|webp)$/i.test(u.pathname);
   });
   candidates.push(...phones.map(url=>({url,site})));
   console.log('Samsung sitemap',site,location,urls.length,'smartphone pages',phones.length);
  }catch(e){console.warn('Sitemap unavailable',location,e.message)}
 }
}
const available=new Map();
function eligible(p,url){
 const path=new URL(url).pathname.toLowerCase();
 const productSlug=path.split('/').filter(Boolean).at(-1)||'';
 const exact=slug(p.name);
 if(!productSlug.startsWith(exact))return false;
 const suffix=productSlug.slice(exact.length);
 if(suffix&&!/^[-/]/.test(suffix))return false;
 // A base Galaxy S24 must never inherit specs from S24 Ultra, FE or Plus.
 const variantSuffix=suffix.match(/^-(ultra|plus|fe|edge|lite|max|pro|5g)(?:[-/]|$)/);
 if(variantSuffix&&!(variantSuffix[1]==='5g'&&/^Galaxy A(?:35|36|55|56)$/i.test(p.name)))return false;
 if(!/\b5g\b/i.test(p.name)&&/^-5g(?:[-/]|$)/.test(suffix)&&!/\b(?:a55|a56|a35|a36)\b/i.test(p.name))return false;
 if(p.name==='Galaxy S'&&!/galaxy-s[-/]/.test(path))return false;
 return true;
}
for(const p of selected){
 const choices=candidates.filter(c=>eligible(p,c.url)).sort((a,b)=>{
  const rank=c=>sites.indexOf(c.site)*10+(c.url.includes('-sm-')?0:4)+(!c.url.endsWith('/')?1:0);
  return rank(a)-rank(b)||a.url.length-b.url.length;
 }).filter((c,i,all)=>all.findIndex(x=>x.site===c.site)===i).slice(0,8);
 available.set(p.id,choices);
}
console.log('Samsung exact name-URL matches',devices.filter(p=>available.get(p.id).length>0).length,'of',devices.length);
const get=(data,...keys)=>{
 for(const key of keys){const found=data.get(key.toLowerCase());if(found)return found}
 return null;
};
function parseSamsung(page,p,site){
 const $=cheerio.load(page.text);const title=clean($('title').first().text());
 if(!/galaxy/i.test(title)||!/samsung/i.test(title))throw Error('Nonproduct Samsung response');
 const data=new Map();
 $('.pdd32-product-spec__content-item, .spec-highlight__item').each((_,item)=>{
  const el=$(item);
  const label=clean(el.find('.pdd32-product-spec__content-item-title, .spec-highlight__title').first().text());
  const value=clean(el.find('.pdd32-product-spec__content-item-desc, .spec-highlight__value').first().text());
  if(label&&value&&!data.has(label.toLowerCase()))data.set(label.toLowerCase(),value);
 });
 if(data.size<9)throw Error('No embedded Samsung specification table');
 const output={};const put=(k,value)=>{if(value!==null&&value!==undefined&&String(value).trim())output[k]=clean(value).slice(0,850)};
 const displaySize=get(data,'Size (Main_Display)','Size (Main Display)');
 const displayTech=get(data,'Technology (Main Display)','Technology (Main_Display)');
 const inches=displaySize?.match(/(\d+(?:\.\d+)?)\s*["″]/)?.[1];
 const cm=displaySize?.match(/(\d+(?:\.\d+)?)\s*cm\b/i)?.[1];
 const inch=inches||(cm?(Number(cm)/2.54).toFixed(1):null);
 if(inch)put('screen',inch+'-inch '+(displayTech||'display')+(cm&&!inches?' (from official cm measurement)':''));
 put('resolution',get(data,'Resolution (Main Display)','Resolution (Main_Display)'));
 put('refreshRate',get(data,'Max Refresh Rate (Main Display)','Max Refresh Rate (Main_Display)'));
 put('brightness',get(data,'Peak Brightness (Main Display)','Brightness (Main Display)'));
 put('cpu',[get(data,'CPU Type'),get(data,'CPU Speed')].filter(Boolean).join('; '));
 const rear=get(data,'Rear Camera - Resolution (Multiple)','Rear Camera - Resolution','Rear Camera Resolution');
 put('camera',rear);
 put('cameraDetails',[get(data,'Rear Camera - F Number (Multiple)')?'Apertures: '+get(data,'Rear Camera - F Number (Multiple)'):null,get(data,'Rear Camera - OIS')?'OIS: '+get(data,'Rear Camera - OIS'):null,get(data,'Rear Camera Zoom')?'Zoom: '+get(data,'Rear Camera Zoom'):null].filter(Boolean).join('; '));
 put('cameraVideo',get(data,'Video Recording Resolution','Video Recording'));
 put('selfie',get(data,'Front Camera - Resolution','Front Camera Resolution'));
 put('selfieVideo',get(data,'Front Camera - Video Recording','Front Camera Video'));
 put('ram',get(data,'Memory_(GB)','Memory (GB)','RAM (GB)')?get(data,'Memory_(GB)','Memory (GB)','RAM (GB)')+' GB (regional model)':null);
 put('storage',get(data,'Storage (GB)','ROM (GB)')?get(data,'Storage (GB)','ROM (GB)')+' GB (regional model)':null);
 put('cardSlot',get(data,'External Storage Support','Memory Card Support'));
 const battery=get(data,'Battery Capacity (mAh, Typical)','Battery Capacity (mAh)','Standard Battery Capacity','Battery Capacity (mAh, Rated)');
 if(battery)put('battery',battery+' mAh');
 put('dimensions',get(data,'Dimension (HxWxD, mm)','Dimension (HxWxD,mm)','Dimension (HxWxD)')?get(data,'Dimension (HxWxD, mm)','Dimension (HxWxD,mm)','Dimension (HxWxD)')+' mm (HxWxD)':null);
 const weight=get(data,'Weight (g)','Weight');
 if(weight)put('weight',weight+' g');
 put('sim',[get(data,'Number of SIM'),get(data,'SIM size'),get(data,'SIM Slot Type')].filter(Boolean).join('; '));
 put('network',get(data,'Infra','Network/Bearer'));
 put('bands',[get(data,'5G FDD Sub6'),get(data,'5G TDD Sub6'),get(data,'4G FDD LTE'),get(data,'4G TDD LTE')].filter(Boolean).join('; '));
 put('wifi',get(data,'Wi-Fi','WiFi'));
 put('bluetooth',get(data,'Bluetooth Version','Bluetooth'));
 put('nfc',get(data,'NFC','NFC Support'));
 put('gps',get(data,'Location Technology','GPS'));
 put('usb',[get(data,'USB Interface'),get(data,'USB Version')].filter(Boolean).join('; '));
 const earjack=get(data,'Earjack','Earjack Interface');put('jack',/usb\s*(?:type[- ]?c|-c)/i.test(earjack||'')?'USB-C headset port (no dedicated 3.5 mm jack)':earjack);
 put('sensors',get(data,'Sensors'));
 if(/fingerprint/i.test(output.sensors||''))put('biometrics','Fingerprint sensor (see sensor list)');
 put('os',get(data,'OS','Operating System'));
 put('ipRating',get(data,'Water and Dust Resistance (IP Rating)','IP Rating'));
 const stereo=get(data,'Stereo Support','Stereo Speakers');if(stereo)put('speakers','Stereo support: '+stereo);
 put('charging',get(data,'Fast Charging','Super Fast Charging','Wired Charging'));
 put('wirelessCharging',get(data,'Wireless Charging','Wireless PowerShare'));
 put('colors',get(data,'Color','Colour','Colors','Colours'));
 if(Object.keys(output).length<8)throw Error('Insufficient Samsung numeric specifications');
 const code=page.url.match(/sm-[a-z0-9]+/i)?.[0].toUpperCase()||null;
 if(code){output.models=code;output.variantDetails=site.toUpperCase()+' product configuration '+code+'; storage, RAM, chipset and network bands can vary by region.';}
 output.sourceUrl=page.url;
 output.dataQuality='official-specifications-regional-variant';
 output.verifiedSource='Samsung '+site.toUpperCase();
 output.verifiedAt=new Date().toISOString();
 return output;
}
const verified={},failed=[];
for(let i=0;i<selected.length;i++){
 const p=selected[i],urls=available.get(p.id);
 if(!urls.length){failed.push(p.name+': no matching official product URL');continue}
 let saved=false;
 for(const candidate of urls){
  try{
   const html=await fetchText(candidate.url,2);
   verified[p.id]=parseSamsung(html,p,candidate.site);
   console.log('Samsung',i+1+'/'+selected.length,p.name,'fields',Object.keys(verified[p.id]).length,'from',candidate.site);
   saved=true;break;
  }catch(e){console.warn('Samsung source skipped',p.name,candidate.site,e.message)}
  await wait(250);
 }
 if(!saved)failed.push(p.name+': source pages do not expose verified specs');
 await wait(320);
}
const merged=mergeSamsungVerifiedRecords(devices,previous,verified);
const coverage=samsungCoverageReport(devices,merged,{
  checkedThisRun:selected.length,
  newlyVerified:Object.keys(merged).filter(id=>!validSamsungRecord(previous[id])).length,
  regionsScanned:sites,
  source:'Exact-model Samsung country product pages and Samsung Newsroom archive'
});
const state={
  offset:incomplete.length?(offset+selected.length)%incomplete.length:0,
  regionOffset:(regionOffset+regionsPerRun)%allSites.length,
  lastChecked:new Date().toISOString(),
  checkedThisRun:selected.length
};
await fs.writeFile(new URL('official-samsung.json',root),JSON.stringify(merged,null,2)+'\n');
await fs.writeFile(new URL('samsung-verification-coverage.json',root),JSON.stringify(coverage,null,2)+'\n');
await fs.writeFile(new URL('samsung-import-state.json',root),JSON.stringify(state,null,2)+'\n');
console.log('Samsung verified',coverage.verified,'of',coverage.total,
  'new',coverage.newlyVerified,'unverified',coverage.missing);
// Missing or blocked upstream sources do NOT erase previously verified specs.
if(coverage.verified<5)throw Error('Insufficient Samsung official coverage; refusing to publish');
