import fs from 'node:fs/promises';
import * as cheerio from 'cheerio';
const root=new URL('../public/data/',import.meta.url);
const catalog=JSON.parse(await fs.readFile(new URL('catalog.json',root),'utf8'));
const known=catalog.filter(p=>p.brand==='Apple');
const norm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'');
const clean=s=>String(s||'').replace(/[\u200b\u00a0]/g,' ').replace(/\s+/g,' ').trim();
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const first=(lines,re)=>lines.find(x=>re.test(x));
async function fetchApple(url){
 for(let attempt=0;attempt<5;attempt++){
  try{
   const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Accept':'text/html'},redirect:'follow',signal:AbortSignal.timeout(22000)});
   if(!r.ok)throw Error('HTTP '+r.status);
   const html=await r.text();if(!html.includes('gb-header'))throw Error('Missing Apple page content');
   return {html,url:r.url};
  }catch(e){if(attempt===4)throw e;await delay((attempt+1)*2600)}
 }
}
function parsePage(page,name){
 const $=cheerio.load(page.html);const sections=new Map();
 $('h3.gb-header').each((_,h)=>{
   const label=clean($(h).text()).replace(/\d+$/,'').toLowerCase();
   const lines=$(h).parent().find('p.gb-paragraph').map((_,p)=>clean($(p).text())).get().filter(Boolean);
   if(lines.length)sections.set(label,[...(sections.get(label)||[]),...lines]);
 });
 const section=(...names)=>{for(const n of names){const found=[...sections].find(([k])=>k===n||k.startsWith(n+' '));if(found)return found[1]}return []};
 const result={};const add=(k,v)=>{if(v!==null&&v!==undefined&&v!=='')result[k]=clean(v).slice(0,1200)};
 const finish=section('finish'),sizes=section('size and weight'),dis=section('display','displays');
 const capacities=section('capacity').filter(x=>/^\d+(?:\.\d+)?\s*(?:MB|GB|TB)$/i.test(x.replace(/\s+/g,'')));
 add('storage',capacities.map(x=>x.replace(/\s+/g,'').replace(/(MB|GB|TB)$/i,' $1')).join(' / '));
 const finishColors=finish.filter(x=>!/(design|unibody|aluminum|aluminium|ceramic shield|stainless steel|titanium.*design|glass back|glass front)/i.test(x));
 if(finishColors.length&&finishColors.length<=12)add('colors',finishColors.join(', '));
 add('build',first(finish,/\bdesign\b|unibody|titanium|aluminum|stainless steel|glass back/i));
 const dim=label=>first(sizes,new RegExp('^'+label+':','i'))?.match(/\(([\d.]+)\s*mm\)/i)?.[1];
 if(dim('Height')&&dim('Width')&&dim('Depth'))add('dimensions',dim('Height')+' × '+dim('Width')+' × '+dim('Depth')+' mm');
 const weight=first(sizes,/^Weight:/i)?.match(/\(([\d,.]+)\s*grams?\)/i)?.[1];if(weight)add('weight',weight+' g');
 const displayType=first(dis,/Super Retina|Liquid Retina|Retina display|Multi-Touch display/i)||'display';
 const inches=dis.filter(x=>/inch/i.test(x)&&/display|screen|OLED/i.test(x)).map(x=>x.match(/(\d+(?:\.\d+)?)\s*[‑\-]?\s*inch/i)?.[1]).filter(Boolean);
 if(inches.length)add('screen',(name==='iPhone Duo'?inches.slice(0,2).join(' + '):inches[0])+'-inch '+displayType.replace(/ display$/i,'')+(dis.some(x=>/\bOLED\b/i.test(x))?' OLED':''));
 const res=first(dis,/pixel resolution|resolution at \d+\s*ppi/i);if(res)add('resolution',res.replace(/[‑\u2010-\u2015]/g,'-').replace(/-by-/i,' × '));
 const hz=first(dis,/\bProMotion|refresh rate/i)?.match(/(\d+)\s*Hz/i)?.[1];if(hz)add('refreshRate','Up to '+hz+' Hz');
 add('brightness',first(dis,/\bnits?\b/i));add('protection',first(dis,/fingerprint-resistant|anti-reflective|ceramic shield/i)||first(finish,/ceramic shield/i));
 add('ipRating',first(section('splash, water, and dust resistant','water resistance'),/IP\d{2}/i));
 const cpu=section('chip','processor');
 add('chip',first(cpu,/\bA\d{1,2}\s*(?:Pro|Bionic)?\s*chip/i)?.replace(/\s*chip$/i,'')||first(cpu,/A\d+ Bionic/i));
 add('cpu',first(cpu,/\bCPU\b/i));add('gpu',first(cpu,/\bGPU\b/i));
 const cam=section('camera','rear camera');const lenses=cam.filter(x=>/\d+\s*MP/i.test(x)&&/Main|Wide|Telephoto|Camera/i.test(x));
 add('camera',lenses.find(x=>/Main|Wide Camera|rear camera/i.test(x))||lenses[0]);
 add('cameraDetails',lenses.slice(1,6).map(x=>x.slice(0,210)).join('; '));
 const video=section('video recording','video capture');add('cameraVideo',video.filter(x=>/4K|1080p|720p|ProRes|cinematic|fps/i.test(x)).slice(0,5).map(x=>x.slice(0,140)).join('; '));
 const selfie=section('front camera','truedepth camera','facetime camera');
 add('selfie',selfie.find(x=>/\d+\s*MP/i.test(x)&&/camera|Center Stage|TrueDepth/i.test(x)));add('selfieVideo',selfie.find(x=>/4K.*video|1080p.*video|video recording/i.test(x)));
 const power=section('power and battery','battery');const runTime=power.filter(x=>/video playback|audio playback|typical use|up to \d+ hours/i.test(x)).slice(0,5);
 add('battery',[first(power,/rechargeable lithium|built.in battery/i),...runTime].filter(Boolean).join('; '));
 const wires=section('magsafe and wireless charging','magsafe','wireless charging');add('wirelessCharging',[...wires,...power].filter(x=>/wireless charging|MagSafe.+charging|Qi2.+charging/i.test(x)).slice(0,3).join('; '));
 const connector=section('charging and expansion','external buttons and connectors');const port=first(connector,/USB.C connector|Lightning connector|30.pin dock connector/i);
 add('usb',[port,first(connector,/USB [23]|USB-C.+Gb\/s/i)].filter(Boolean).join('; '));
 add('charging',[port,first(power,/50%.+minutes?|fast.charge/i)].filter(Boolean).join('; '));
 const radio=section('cellular and wireless','cellular');
 add('network',radio.filter(x=>/(5G|LTE|GSM\/EDGE|UMTS)/i.test(x)&&!/(Bands? n?\d|Model A\d)/i.test(x)).slice(0,4).join('; '));
 add('bands',radio.filter(x=>/(?:5G NR|FDD.LTE|TD.LTE|GSM.+MHz|UMTS.+MHz).*Bands?/i.test(x)).slice(0,4).map(x=>x.slice(0,235)).join('; '));
 add('wifi',first(radio,/Wi[\s-]*Fi\s*[4567]|802\.11/i));add('bluetooth',first(radio,/Bluetooth/i));add('nfc',first(radio,/\bNFC\b/i));
 add('gps',first(section('location','gps'),/\bGPS\b|GLONASS|Galileo/i));
 const sensors=section('sensors');add('sensors',sensors.filter(x=>/sensor|gyro|accelerometer|barometer|compass|LiDAR|Face ID|Touch ID/i.test(x)).slice(0,9).join('; '));
 const face=section('face id'),touch=section('touch id');if(face.length)add('biometrics','Face ID');else if(touch.length)add('biometrics','Touch ID'+(touch.some(x=>/side button/i.test(x))?' (side button)':''));
 add('sim',section('sim card').filter(x=>/\b(?:SIM|eSIM)\b/i.test(x)&&!/^Learn more/i.test(x)).slice(0,2).map(x=>x.slice(0,190)).join('; '));
 const audio=section('audio playback','audio'),buttons=section('external buttons and connectors');
 add('speakers',[first(buttons,/stereo speaker/i),first(audio,/spatial audio/i)].filter(Boolean).join('; '));add('jack',first(buttons,/headphone jack|3\.5.?mm/i));
 if(Object.keys(result).length<5)throw Error('Too few technical fields in source');
 return {...result,sourceUrl:page.url,dataQuality:'official-specifications',verifiedSource:'Apple Support',verifiedAt:new Date().toISOString()};
}
const directory=await fetchApple('https://support.apple.com/en-us/108044');const $=cheerio.load(directory.html);const links=new Map();
$('a').each((_,a)=>{const m=clean($(a).text()).match(/tech specs for\s+(iPhone.*)$/i);const href=$(a).attr('href');if(!m||!href)return;
 let name=m[1];if(/^iPhone SE$/i.test(name))name='iPhone SE (1st generation)';links.set(norm(name),new URL(href,'https://support.apple.com').toString());});
const output={},failed=[];
console.log('Catalog iPhones',known.length,'Apple tech-spec links',links.size);
for(let i=0;i<known.length;i++){
 const phone=known[i],url=links.get(norm(phone.name));if(!url){failed.push(phone.name+' (no link)');continue;}
 try{
  const page=await fetchApple(url),doc=cheerio.load(page.html),title=clean(doc('title').first().text());
  if(!/(?:tech specs|technical specifications)/i.test(title))throw Error('Unexpected page title '+title);
  const pageModel=title.split(/\s*[-–]\s*(?:Tech Specs|Technical Specifications)/i)[0].trim();
  if(norm(pageModel)!==norm(phone.name)&&!(phone.name==='iPhone SE (1st generation)'&&norm(pageModel)==='iphonese'))throw Error('Model mismatch '+title);
  output[phone.id]=parsePage(page,phone.name);
  console.log('Apple',i+1+'/'+known.length,phone.name,'fields',Object.keys(output[phone.id]).length);
 }catch(e){failed.push(phone.name+': '+e.message);console.warn('ERROR',phone.name,e.message)}
 await delay(750);
}
await fs.writeFile(new URL('official-apple.json',root),JSON.stringify(output,null,2)+'\n');
console.log('Apple verified',Object.keys(output).length,'out of',known.length,'failures',JSON.stringify(failed));
if(Object.keys(output).length<35)throw Error('Apple sources did not provide enough verified entries');