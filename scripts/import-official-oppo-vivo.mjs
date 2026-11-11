import fs from 'node:fs/promises';
import * as cheerio from 'cheerio';
const dir=new URL('../public/data/',import.meta.url);
const catalog=JSON.parse(await fs.readFile(new URL('catalog.json',dir),'utf8'));
const clean=s=>String(s??'').replace(/[\u00a0\u200b]/g,' ').replace(/\s+/g,' ').trim();
const norm=s=>clean(s).toLowerCase().normalize('NFKD').replace(/^(?:oppo|vivo)\s+/i,'').replace(/[^a-z0-9]/g,'');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const models={OPPO:catalog.filter(p=>p.brand==='OPPO'),Vivo:catalog.filter(p=>p.brand==='Vivo')};
const index={};
for(const brand of Object.keys(models)){
 index[brand]=new Map();
 for(const p of models[brand]){const key=norm(p.name);if(!index[brand].has(key))index[brand].set(key,[]);index[brand].get(key).push(p)}
}
async function request(url){
 for(let attempt=0;attempt<3;attempt++){
  try{
   const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Accept':'text/html,application/xml'},signal:AbortSignal.timeout(16000)});
   if(!r.ok)throw Error('HTTP '+r.status);
   return {url:r.url,html:await r.text()};
  }catch(e){if(attempt===2)throw e;await sleep(500+attempt*900)}
 }
}
function specData(page,brand){
 const $=cheerio.load(page.html),values=new Map();
 if(brand==='OPPO'){
  $('.item-right-list').each((_,e)=>{
   const label=clean($(e).find('p.key').first().text());
   const value=clean($(e).find('p.value').first().text());
   if(label&&value&&!values.has(label.toLowerCase()))values.set(label.toLowerCase(),value);
  });
 }else{
  $('.attr-item').each((_,e)=>{
   const label=clean($(e).find('.attr-item-name').first().text());
   const value=clean($(e).find('.attr-item-text').first().text());
   if(label&&value&&!values.has(label.toLowerCase()))values.set(label.toLowerCase(),value);
  });
 }
 const get=(...keys)=>{for(const k of keys){const v=values.get(k.toLowerCase());if(v)return v}return null};
 const out={};const put=(k,v)=>{if(v!==null&&v!==undefined&&clean(v))out[k]=clean(v).slice(0,850)};
 if(brand==='OPPO'){
  const title=clean($('title').first().text()).split(/\s+(?:Spec(?:ifications?)?|Specs)\s*\|/i)[0].replace(/\s*\|\s*OPPO.*$/i,'').trim();
  const h=$('h1').map((_,x)=>clean($(x).text())).get().find(x=>/^OPPO\s+/i.test(x));
  const name=h||title;
  put('colors',get('Colour','Color','Colours'));
  const height=get('Height'),width=get('Width'),thick=get('Thickness');
  if(height&&width&&thick)put('dimensions',height+' × '+width+' × '+thick);
  put('weight',get('Weight'));
  const storage=get('RAM and ROM Capacities','RAM & ROM Capacities','Memory','RAM and ROM');
  if(storage){put('storage',storage);const m=storage.match(/(\d+)\s*GB\s*(?:RAM\s*)?\+\s*(\d+)\s*GB/i);if(m){put('ram',m[1]+' GB (regional configuration)');put('storage',m[2]+' GB (regional configuration)')}}
  put('ramType',get('RAM Type'));put('storageType',get('ROM Specifications','ROM Type'));
  put('cardSlot',get('Phone Storage Card','External Memory'));
  const display=get('Size');if(display&&/^\d+(?:\.\d+)?/.test(display))put('screen',display+(get('Panel')?' '+get('Panel'):''));
  put('resolution',get('Resolution'));put('refreshRate',get('Refresh Rate'));
  put('brightness',get('Brightness'));put('pixelDensity',get('Pixel Density'));
  put('chip',get('SoC','Processor'));put('cpu',get('CPU','CPU Speed'));put('gpu',get('GPU','GPU Model'));
  const bat=get('Battery');if(bat)put('battery',bat);put('charging',get('Fast Charge','Fast Charge Support'));
  put('camera',get('Rear'));put('selfie',get('Front'));put('cameraVideo',get('Video'));
  put('biometrics',[get('Fingerprint'),get('Facial Recognition')].filter(Boolean).join('; '));
  put('sensors',get('Sensors'));put('sim',get('SIM Card Type'));put('bands',get('Frequency Band'));
  put('wifi',get('WLAN'));put('bluetooth',get('Bluetooth® Version','Bluetooth Version'));
  put('usb',get('USB Interface'));put('jack',get('Earphone Jack'));put('nfc',get('NFC'));
  put('gps',get('GNSS'));put('os',get('Operating System'));put('ipRating',get('Water and Dust Resistance'));
  return {name,values,out};
 }
 const name=clean($('.product-name,h1').first().text())||clean($('title').first().text()).replace(/^vivo\s+/i,'').split(/[-|]/)[0].trim();
 put('colors',get('Color','Colour'));put('ipRating',get('Ingress Protection Rating'));
 put('build',get('Material','Back Cover Material'));
 put('os',[get('Operating System'),get('Android Version')].filter(Boolean).join('; '));
 put('chip',get('Processor'));put('cpu',[get('CPU Core Count'),get('CPU Clock Speed')].filter(Boolean).join('; '));
 const mem=get('RAM & ROM','RAM+ROM','RAM&ROM');if(mem){
  put('storage',mem);
  const pairs=[...mem.matchAll(/(\d+)\s*GB\s*\+\s*(\d+)\s*GB/gi)];
  if(pairs.length){put('ram',[...new Set(pairs.map(m=>m[1]+' GB'))].join(' / ')+' (regional configurations)');put('storage',[...new Set(pairs.map(m=>m[2]+' GB'))].join(' / ')+' (regional configurations)')}
 }
 put('ram',out.ram||get('RAM'));put('storage',out.storage||get('Storage'));
 put('ramType',get('RAM Type'));put('storageType',get('ROM Type'));put('cardSlot',get('Expandable ROM Capacity'));
 put('battery',get('Battery'));put('charging',get('Charging Power','Fast Charging'));put('wirelessCharging',/wireless/i.test(get('Charging Power')||'')?get('Charging Power'):null);
 put('dimensions',get('Dimensions'));put('weight',get('Weight'));put('build',get('Back Cover Material'));
 put('biometrics',get('Fingerprint Sensor Type'));
 const sz=get('Size','Screen','Screen Size'),type=get('Type');if(sz&&/^\d/.test(sz))put('screen',sz.slice(0,100)+(type?' '+type:''));
 put('resolution',get('Resolution'));put('refreshRate',get('Refresh Rate'));
 put('brightness',get('Local Peak Brightness','Peak Brightness'));
 put('pixelDensity',get('Pixel Density'));
 const camera=get('Camera');if(camera){
  const rear=camera.match(/Rear\s*([^/]+)/i),front=camera.match(/Front\s*([^/]+)/i);
  put('camera',rear?rear[1]:camera);if(front)put('selfie',front[1]);
 }
 put('cameraDetails',get('Aperture'));
 put('sim',get('Card Slot'));put('network',(get('5G','5G SA','5G NSA')?'5G, ':'')+'4G LTE, 3G, 2G (regional support)');
 put('bands',[get('5G','5G SA','5G NSA'),get('4G FDD-LTE','4G FDD_LTE'),get('4G TD-LTE','4G TDD_LTE')].filter(Boolean).join('; '));
 put('wifi',get('Wi-Fi'));put('bluetooth',get('Bluetooth'));put('usb',get('USB'));put('nfc',get('NFC'));
 put('gps',get('Location','GPS'));put('sensors',[get('Accelerometer'),get('Gyroscope'),get('Proximity Sensor')].filter(Boolean).join('; '));
 return {name,values,out};
}
const locations={OPPO:['https://www.oppo.com/pk/sitemap.xml','https://www.oppo.com/en/sitemap.xml'],Vivo:['https://www.vivo.com/pk/sitemap.xml','https://www.vivo.com/en/sitemap.xml']};
const results={OPPO:{},Vivo:{}},unverified={};
for(const brand of ['OPPO','Vivo']){
 const candidates=[];
 for(const site of locations[brand]){
  try{
   const xml=(await request(site)).html;
   const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1].replace(/&amp;/g,'&'));
   const filtered=urls.filter(u=>brand==='OPPO'?/\/smartphones\/[^?#]+\/specs\/?(?:\?|$)/i.test(u):/\/products\/param\/[^/?#]+/i.test(u));
   candidates.push(...filtered);
   console.log(brand,'sitemap',site,'spec URLs',filtered.length);
  }catch(e){console.warn('Sitemap error',site,e.message)}
 }
 const urls=[...new Set(candidates)];
 console.log(brand,'unique source pages',urls.length,'catalog models',models[brand].length);
 let matched=0,failed=0;
 for(let start=0;start<urls.length;start+=5){
  const batch=urls.slice(start,start+5);
  await Promise.all(batch.map(async url=>{
   try{
    const page=await request(url);
    const parsed=specData(page,brand);
    if(parsed.values.size<7||Object.keys(parsed.out).length<6)return;
    // Match exact manufacturer product names; no cross-model or fuzzy guessing.
    const candidates=[parsed.name,clean(cheerio.load(page.html)('title').text()).split(/[|–]/)[0].replace(/\s+spec(?:s|ifications?)?.*$/i,'')];
    let modelsFound=[];
    for(const name of candidates){
      const exact=index[brand].get(norm(name));
      if(exact?.length){modelsFound=exact;break}
    }
    if(modelsFound.length!==1)return;
    const p=modelsFound[0],prior=results[brand][p.id];
    const locale=new URL(page.url).pathname.split('/')[1].toUpperCase();
    const item={...parsed.out,sourceUrl:page.url,verifiedSource:brand+' '+locale,dataQuality:'official-specifications-regional-variant',verifiedAt:new Date().toISOString(),variantDetails:'Specifications from '+brand+' '+locale+'; hardware, memory, networks and software can differ by region.'};
    if(!prior||Object.keys(item).length>Object.keys(prior).length){results[brand][p.id]=item;matched++}
   }catch(e){failed++;console.warn('SOURCE ERROR',brand,url,e.message)}
  }));
  if(start%50===0)console.log(brand,'scanned',start+batch.length,'of',urls.length,'matched',Object.keys(results[brand]).length,'failed',failed);
  await sleep(200);
 }
 const found=Object.keys(results[brand]);
 unverified[brand]={total:models[brand].length,verified:found.length,unverified:models[brand].filter(p=>!results[brand][p.id]).map(p=>p.name),sources:locations[brand]};
 console.log('FINAL',brand,found.length,'of',models[brand].length);
}
await fs.writeFile(new URL('official-oppo.json',dir),JSON.stringify(results.OPPO,null,2)+'\n');
await fs.writeFile(new URL('official-vivo.json',dir),JSON.stringify(results.Vivo,null,2)+'\n');
await fs.writeFile(new URL('oppo-vivo-verification-coverage.json',dir),JSON.stringify(unverified,null,2)+'\n');
if(Object.keys(results.OPPO).length<10||Object.keys(results.Vivo).length<10)throw Error('Manufacturer match coverage too low: OPPO '+Object.keys(results.OPPO).length+' Vivo '+Object.keys(results.Vivo).length);
