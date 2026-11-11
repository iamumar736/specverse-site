import fs from 'node:fs/promises';
import * as cheerio from 'cheerio';
const root=new URL('../public/data/',import.meta.url);
const catalog=JSON.parse(await fs.readFile(new URL('catalog.json',root),'utf8'));
const devices=catalog.filter(p=>p.brand==='Samsung');
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
const sites=['pk','sg','uk','in'];
const candidates=[];
for(const site of sites){
 try{
  const xml=(await fetchText('https://www.samsung.com/'+site+'/im-sitemap.xml')).text;
  const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1].replace(/&amp;/g,'&'));
  const phones=urls.filter(url=>{
   const u=new URL(url);
   return u.pathname.includes('/smartphones/')&&/\/galaxy-(?:[a-z0-9-]+)\//i.test(u.pathname)
     &&!/\/(?:buy|reviews|compare|accessories|upgrade|features|how-to|business|trade-in)\//i.test(u.pathname)
     &&!/\.(?:jpg|png|svg|webp)$/i.test(u.pathname);
  });
  candidates.push(...phones.map(url=>({url,site})));
  console.log('Samsung sitemap',site,urls.length,'smartphone pages',phones.length);
 }catch(e){console.warn('Sitemap unavailable',site,e.message)}
}
const available=new Map();
function eligible(p,url){
 const path=new URL(url).pathname.toLowerCase();
 const exact=slug(p.name);
 if(!path.includes(exact))return false;
 const suffix=path.slice(path.indexOf(exact)+exact.length);
 if(suffix&&!/^[-/]/.test(suffix))return false;
 if(!/\b5g\b/i.test(p.name)&&/^-5g(?:[-/]|$)/.test(suffix)&&!/\b(?:a55|a56|a35|a36)\b/i.test(p.name))return false;
 if(p.name==='Galaxy S'&&!/galaxy-s[-/]/.test(path))return false;
 return true;
}
for(const p of devices){
 const choices=candidates.filter(c=>eligible(p,c.url)).sort((a,b)=>{
  const rank=c=>sites.indexOf(c.site)*10+(c.url.includes('-sm-')?0:4)+(!c.url.endsWith('/')?1:0);
  return rank(a)-rank(b)||a.url.length-b.url.length;
 }).slice(0,3);
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
 $('.pdd32-product-spec__content-item').each((_,item)=>{
  const el=$(item);
  const label=clean(el.find('.pdd32-product-spec__content-item-title').first().text());
  const value=clean(el.find('.pdd32-product-spec__content-item-desc').first().text());
  if(label&&value&&!data.has(label.toLowerCase()))data.set(label.toLowerCase(),value);
 });
 if(data.size<9)throw Error('No embedded Samsung specification table');
 const output={};const put=(k,value)=>{if(value!==null&&value!==undefined&&String(value).trim())output[k]=clean(value).slice(0,850)};
 const displaySize=get(data,'Size (Main_Display)','Size (Main Display)');
 const displayTech=get(data,'Technology (Main Display)','Technology (Main_Display)');
 const inch=displaySize?.match(/(\d+(?:\.\d+)?)\s*["″]/)?.[1];
 if(inch)put('screen',inch+'-inch '+(displayTech||'display'));
 put('resolution',get(data,'Resolution (Main Display)','Resolution (Main_Display)'));
 put('refreshRate',get(data,'Max Refresh Rate (Main Display)','Max Refresh Rate (Main_Display)'));
 put('brightness',get(data,'Peak Brightness (Main Display)','Brightness (Main Display)'));
 put('cpu',[get(data,'CPU Type'),get(data,'CPU Speed')].filter(Boolean).join('; '));
 const rear=get(data,'Rear Camera - Resolution (Multiple)','Rear Camera - Resolution','Rear Camera Resolution');
 put('camera',rear);
 put('cameraDetails',[get(data,'Rear Camera - F Number (Multiple)'),get(data,'Rear Camera - OIS'),get(data,'Rear Camera Zoom')].filter(Boolean).join('; '));
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
 put('jack',get(data,'Earjack','Earjack Interface'));
 put('sensors',get(data,'Sensors'));
 if(/fingerprint/i.test(output.sensors||''))put('biometrics','Fingerprint sensor (see sensor list)');
 put('os',get(data,'OS','Operating System'));
 put('ipRating',get(data,'Water and Dust Resistance (IP Rating)','IP Rating'));
 put('speakers',get(data,'Stereo Support','Stereo Speakers'));
 if(Object.keys(output).length<8)throw Error('Insufficient Samsung numeric specifications');
 const code=page.url.match(/sm-[a-z0-9]+/i)?.[0].toUpperCase()||null;
 if(code)output.variantDetails=site.toUpperCase()+' product configuration '+code+'; storage, RAM, chipset and network bands can vary by region.';
 output.sourceUrl=page.url;
 output.dataQuality='official-specifications-regional-variant';
 output.verifiedSource='Samsung '+site.toUpperCase();
 output.verifiedAt=new Date().toISOString();
 return output;
}
const verified={},failed=[];
for(let i=0;i<devices.length;i++){
 const p=devices[i],urls=available.get(p.id);
 if(!urls.length){failed.push(p.name+': no matching official product URL');continue}
 let saved=false;
 for(const candidate of urls){
  try{
   const html=await fetchText(candidate.url,2);
   verified[p.id]=parseSamsung(html,p,candidate.site);
   console.log('Samsung',i+1+'/'+devices.length,p.name,'fields',Object.keys(verified[p.id]).length,'from',candidate.site);
   saved=true;break;
  }catch(e){console.warn('Samsung source skipped',p.name,candidate.site,e.message)}
  await wait(250);
 }
 if(!saved)failed.push(p.name+': source pages do not expose verified specs');
 await wait(320);
}
await fs.writeFile(new URL('official-samsung.json',root),JSON.stringify(verified,null,2)+'\n');
await fs.writeFile(new URL('samsung-verification-coverage.json',root),JSON.stringify({total:devices.length,verified:Object.keys(verified).length,unverified:failed,source:'Official Samsung country-level product pages',notes:'Market and SKU-specific specs are not universal for every region.'},null,2)+'\n');
console.log('Samsung verified',Object.keys(verified).length,'of',devices.length,'unverified',failed.length);
if(Object.keys(verified).length<5)throw Error('Fewer than five Samsung models verified; refusing to publish');
