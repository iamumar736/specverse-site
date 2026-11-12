/**
 * Automated, conservative device image verification + lightweight motion publication.
 * Run in GitHub Actions on a schedule. No AI-generated physical geometry is inferred.
 *
 * Source gates:
 *  1) Manufacturer specifications previously imported with verifiedSource/sourceUrl
 *  2) An exact model-matching Wikimedia Commons file, checked online via Imageinfo
 *  3) An explicit commercially reusable derivative-friendly Commons license
 *  4) A real local image (curated file) or a validated raster downloaded to /public
 *
 * Without all four, leave the existing product image untouched.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  modelMatches,licensedDetails,isOfficialBrandUrl,isCommonsMediaUrl,
  isSafeLocalImage,safeImageEntry,IMAGE_EXTENSIONS
} from '../device-image-verification.js';

const repoRoot=fileURLToPath(new URL('../',import.meta.url));
const rootFile=name=>path.join(repoRoot,name);
const readJson=async(file,fallback)=>JSON.parse(await fs.readFile(rootFile(file),'utf8').catch(()=>{
  if(fallback!==undefined)return JSON.stringify(fallback);
  throw new Error('Missing '+file);
}));
const loadCatalog=()=>readJson('public/data/catalog.json',[]);
const manifestPath='public/data/animated-device-images.json';
const mediaDirectory=rootFile('public/device-visuals');
const maxArg=process.argv.find(a=>a.startsWith('--max='));
const maxChecks=Math.max(1,Math.min(30,Number(maxArg?.split('=')[1]||12)));
const client='SpecVerseDeviceVisuals/1.0 (https://github.com/iamumar736/specverse-site)';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const log=(...args)=>console.log('[device-visuals]',...args);

async function fetchWithTimeout(url,options={}){
  const response=await fetch(url,{
    ...options,
    signal:AbortSignal.timeout(18000),
    headers:{'User-Agent':client,'Accept':'application/json,image/*',...(options.headers||{})}
  });
  if(!response.ok)throw new Error('HTTP '+response.status+' for '+new URL(url).hostname);
  return response;
}

async function commonsInfo(file){
  const url=new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({
    action:'query',format:'json',formatversion:'2',
    prop:'imageinfo',iiprop:'url|extmetadata|size|mime',
    iiurlwidth:'720',titles:'File:'+file
  }).forEach(([key,value])=>url.searchParams.set(key,value));
  const result=await (await fetchWithTimeout(url)).json();
  return result?.query?.pages?.find(p=>p.imageinfo?.length)||null;
}

async function commonsSearch(phone){
  // Only search for files when the manufacturer-source record is already known.
  const url=new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({
    action:'query',format:'json',formatversion:'2',
    generator:'search',gsrsearch:'"'+phone.brand+' '+phone.name+'"',
    gsrnamespace:'6',gsrlimit:'9',
    prop:'imageinfo',iiprop:'url|extmetadata|size|mime',iiurlwidth:'720'
  }).forEach(([key,value])=>url.searchParams.set(key,value));
  const result=await (await fetchWithTimeout(url)).json();
  return result?.query?.pages||[];
}

function validateCommonsPage(phone,page,{allowSvg=false}={}){
  const info=page?.imageinfo?.[0];
  const filename=String(page?.title||'').replace(/^File:/i,'');
  if(!info||!modelMatches(phone.name,filename))return null;
  const license=licensedDetails(info.extmetadata);
  if(!license)return null;
  const suffix=path.extname(filename).toLowerCase();
  if(!IMAGE_EXTENSIONS.has(suffix)&&!(allowSvg&&suffix==='.svg'))return null;
  if(!info.url||!isCommonsMediaUrl(info.url))return null;
  if(info.size>8_000_000||info.size<150)return null;
  const width=Number(info.width||0),height=Number(info.height||0);
  if(width<130||height<130||width>12000||height>12000)return null;
  return {filename,license,info,suffix,
    source:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(filename.replaceAll(' ','_'))};
}
function manufacturerEvidence(phone,overlays){
  const matches=overlays.map(x=>x[phone.id]).filter(Boolean);
  return matches.find(item=>
    /^official-specifications/i.test(String(item.dataQuality||''))&&
    item.verifiedAt&&item.verifiedSource&&
    isOfficialBrandUrl(phone.brand,item.sourceUrl))||null;
}
const safeSegment=value=>String(value||'').replace(/[^a-z0-9-]/gi,'').slice(0,100);

async function publishedMedia(phone,candidate,curated){
  if(curated){
    if(!isSafeLocalImage(curated.local))return null;
    const file=rootFile('public'+curated.local);
    const stat=await fs.stat(file).catch(()=>null);
    if(!stat||stat.size<150)return null;
    return curated.local;
  }
  // No SVG from automatic discovery: raster only, prevent script-capable SVG.
  const url=candidate.info.thumburl||candidate.info.url;
  if(!isCommonsMediaUrl(url))return null;
  const extension=candidate.suffix==='.jpeg'?'.jpg':candidate.suffix;
  if(!IMAGE_EXTENSIONS.has(extension))return null;
  await fs.mkdir(mediaDirectory,{recursive:true});
  const image='/device-visuals/'+safeSegment(phone.id)+extension;
  if(!isSafeLocalImage(image))return null;
  const target=rootFile('public'+image);
  const prior=await fs.stat(target).catch(()=>null);
  if(prior?.size>150&&prior.size<4_500_000)return image;
  const buffer=Buffer.from(await (await fetchWithTimeout(url,{headers:{Accept:'image/*'}})).arrayBuffer());
  if(buffer.length<150||buffer.length>4_500_000)return null;
  const jpg=buffer[0]===255&&buffer[1]===216;
  const png=buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const webp=buffer.subarray(0,4).toString()==='RIFF'&&buffer.subarray(8,12).toString()==='WEBP';
  if(!(extension==='.jpg'&&jpg||extension==='.png'&&png||extension==='.webp'&&webp))return null;
  await fs.writeFile(target,buffer);
  return image;
}

function escapeHtml(str){
  return String(str||'').replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
}
function creditsHtml(devices){
  const list=Object.values(devices).sort((a,b)=>a.name.localeCompare(b.name))
    .map(item=>`<li><strong>${escapeHtml(item.name)}</strong>:
      <a href="${escapeHtml(item.source)}">image file / author ${escapeHtml(item.author)}</a>;
      <a href="${escapeHtml(item.licenseUrl)}">${escapeHtml(item.license)}</a>.
      Visual motion added by SpecVerse; image may have been resized.
    </li>`).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Device image credits | SpecVerse</title>
<style>body{font:16px/1.6 system-ui;background:#0c1020;color:#f1f1ff;max-width:850px;padding:28px;margin:auto}a{color:#b6a8ff}li{margin:15px 0}</style></head><body>
<h1>Device image credits</h1>
<p>Source images are licensed third-party photographs or illustrations, not
manufacturers’ press assets. Automated checks match the model name, manufacturer
catalog identity and reuse license. They do not certify every physical detail.
Animations are 2D CSS motion of the original picture, not reconstructed 3D models.</p>
<ol>${list}</ol><p><a href="/">Back to SpecVerse</a></p></body></html>\n`;
}

async function main(){
  const catalog=await loadCatalog();
  if(!Array.isArray(catalog)||!catalog.length)throw Error('Catalog unavailable');
  const [apple,samsung,oppo,vivo,sourceIndex,old]=await Promise.all([
    readJson('public/data/official-apple.json',{}),
    readJson('public/data/official-samsung.json',{}),
    readJson('public/data/official-oppo.json',{}),
    readJson('public/data/official-vivo.json',{}),
    readJson('public/iphone-images/SOURCES.json',{images:[]}),
    readJson(manifestPath,{version:1,nextOffset:0,devices:{}})
  ]);
  const official=[apple,samsung,oppo,vivo];
  const knownImages=new Map((sourceIndex.images||[]).map(x=>[x.id,x]));
  const eligible=catalog.filter(phone=>manufacturerEvidence(phone,official));
  const catalogIds=new Set(catalog.map(x=>x.id));
  const next={version:1,updatedAt:new Date().toISOString(),
    nextOffset:0,devices:{},statistics:{eligible:eligible.length,checked:0,accepted:0,skipped:0}};
  // Previously verified files are never silently replaced with generic art.
  for(const [id,entry] of Object.entries(old.devices||{})){
    if(catalogIds.has(id)&&isSafeLocalImage(entry.image)&&entry.source?.startsWith('https://commons.wikimedia.org/wiki/File:')){
      const exists=await fs.stat(rootFile('public'+entry.image)).catch(()=>null);
      if(exists?.size>=150)next.devices[id]=entry;
    }
  }
  if(!eligible.length)log('No authoritative model records found. Existing images remain.');
  const begin=(Number(old.nextOffset)||0)%Math.max(1,eligible.length);
  for(let index=0;index<Math.min(maxChecks,eligible.length);index++){
    const phone=eligible[(begin+index)%eligible.length];
    const evidence=manufacturerEvidence(phone,official);
    next.statistics.checked++;
    try{
      const curated=knownImages.get(phone.id);
      let candidates=[];
      if(curated&&safeImageEntry(phone,curated)){
        const page=await commonsInfo(curated.file);
        if(page)candidates=[{page,curated}];
      }else{
        candidates=(await commonsSearch(phone)).map(page=>({page,curated:null}));
      }
      let accepted=false;
      for(const {page,curated:record} of candidates){
        const candidate=validateCommonsPage(phone,page,{allowSvg:Boolean(record)});
        if(!candidate)continue;
        const image=await publishedMedia(phone,candidate,record);
        if(!image)continue;
        next.devices[phone.id]={
          id:phone.id,name:phone.name,brand:phone.brand,image,
          source:candidate.source,
          author:candidate.license.author,
          license:candidate.license.license,
          licenseUrl:candidate.license.licenseUrl,
          manufacturerSource:evidence.sourceUrl,
          sourceVerifiedAt:new Date().toISOString(),
          verification:'model-name + manufacturer-source + Commons-license',
          motion:'gentle-float'
        };
        accepted=true;next.statistics.accepted++;
        log('Accepted model-matched, licensed illustration for',phone.name);
        break;
      }
      if(!accepted){
        next.statistics.skipped++;
        // A previously accepted item remains visible until a fully documented
        // replacement is available; a mismatched image is never published.
        log('No automatically acceptable image for',phone.name);
      }
    }catch(error){
      next.statistics.skipped++;
      log('Source unavailable for',phone.name,error.message);
    }
    // Courtesy delay: avoid hammering Commons with dozens of concurrent calls.
    await sleep(600);
  }
  next.nextOffset=eligible.length?(begin+Math.min(maxChecks,eligible.length))%eligible.length:0;
  await fs.mkdir(rootFile('public/data'),{recursive:true});
  await fs.writeFile(rootFile(manifestPath),JSON.stringify(next,null,2)+'\n');
  await fs.writeFile(rootFile('public/device-image-credits.html'),creditsHtml(next.devices));
  log('Published verified images',Object.keys(next.devices).length,'of',catalog.length,
    '; reviewed',next.statistics.checked,'; next offset',next.nextOffset);
}
await main();
