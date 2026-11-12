// Conservative gates for automatically published, animated device photos.
// These verify identity and reuse rights, not the physical geometry of a device.
const variantWords=new Set(['pro','max','ultra','plus','mini','fe','lite','edge','note','fold','flip','se','air']);
export const IMAGE_EXTENSIONS=new Set(['.jpg','.jpeg','.png','.webp']);

export function normal(text){
  return String(text??'').normalize('NFKD').toLowerCase()
    .replace(/&amp;/g,'&').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
}
export function modelMatches(name,fileName){
  const model=normal(name);
  const file=normal(String(fileName||'').replace(/\.[a-z0-9]{2,5}$/i,'').replace(/^file:/i,''));
  if(model.length<8||!file)return false;
  const pos=(' '+file+' ').indexOf(' '+model+' ');
  if(pos<0)return false;
  const before=file.slice(0,pos).trim().split(' ').filter(Boolean);
  const tail=file.slice(pos+model.length).trim().split(' ').filter(Boolean);
  // Prevent a base iPhone/Pixel/Galaxy model inheriting Pro/Max/Fold/etc images.
  // A longer product model may have additional metadata (color, camera angle).
  if(tail.length && variantWords.has(tail[0])&&!model.split(' ').includes(tail[0]))return false;
  // Reject covers, cases, mockups and speculative fan renders.
  if(/\b(?:case|cover|protector|concept|mockup|rumor|render|leak|prototype|fake|dummy)\b/.test(file))return false;
  if(before.includes('case')||before.includes('cover'))return false;
  return true;
}
export function eligibleLicense(meta={}){
  const raw=String(meta.LicenseUrl?.value||'').replace(/&amp;/g,'&').trim();
  if(!raw)return false;
  let url;
  try{url=new URL(raw)}catch{return false}
  if(url.protocol!=='https:'||url.hostname!=='creativecommons.org')return false;
  const path=url.pathname.toLowerCase().replace(/\/$/,'');
  // Allow redistribution and derivative animation, including commercial use.
  // Exclude NC, ND, unknown, copyrighted and unrecognized license variants.
  return /^\/licenses\/(?:by|by-sa)\/(?:[234]\.0)$/.test(path)||
    /^\/publicdomain\/(?:zero|mark)\/1\.0$/.test(path);
}
export function licensedDetails(meta={}){
  if(!eligibleLicense(meta))return null;
  const noHtml=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|amp|quot|lt|gt);/gi,' ').replace(/\s+/g,' ').trim().slice(0,240);
  return {
    licenseUrl:String(meta.LicenseUrl.value),
    license:noHtml(meta.LicenseShortName?.value||'Creative Commons'),
    author:noHtml(meta.Artist?.value||'See source file attribution')
  };
}
const sites={
  Apple:['apple.com','support.apple.com'],
  Samsung:['samsung.com'],
  OPPO:['oppo.com'],
  Vivo:['vivo.com'],
  Google:['google.com'],
  OnePlus:['oneplus.com'],
  Xiaomi:['mi.com','xiaomi.com']
};
export function isOfficialBrandUrl(brand,urlString){
  try{
    const url=new URL(urlString);
    const domains=sites[brand]||[];
    return url.protocol==='https:'&&domains.some(host=>url.hostname===host||url.hostname.endsWith('.'+host));
  }catch{return false}
}
export function isCommonsMediaUrl(urlString){
  try{
    const url=new URL(urlString);
    return url.protocol==='https:'&&url.hostname==='upload.wikimedia.org'&&
      url.pathname.includes('/wikipedia/commons/');
  }catch{return false}
}
export function isSafeLocalImage(path){
  return /^\/(?:iphone-images|device-visuals)\/[a-z0-9][a-z0-9-]*\.(?:svg|jpg|jpeg|png|webp)$/i.test(String(path||''));
}
export function safeImageEntry(phone,record){
  return Boolean(phone?.id&&record?.id===phone.id&&
    modelMatches(phone.name,record.file)&&
    isSafeLocalImage(record.local)&&
    record.source?.startsWith('https://commons.wikimedia.org/wiki/File:'));
}
