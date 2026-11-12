import {SAMSUNG_ARCHIVE_SPECS,validateSamsungArchiveEntry} from './samsung-archive-specs.js';

const normalize=value=>String(value||'').toLowerCase().normalize('NFKD')
  .replace(/[^a-z0-9]+/g,' ').trim();

export function isSamsungOfficialSource(urlString){
  try{
    const url=new URL(urlString);
    return url.protocol==='https:'&&
      (url.hostname==='www.samsung.com'||url.hostname==='news.samsung.com');
  }catch{return false}
}
export function validSamsungRecord(record){
  return record&&typeof record==='object'&&!Array.isArray(record)&&
    isSamsungOfficialSource(record.sourceUrl)&&
    ['official-specifications-regional-variant',
      'official-specifications-samsung-newsroom'].includes(record.dataQuality)&&
    Boolean(record.verifiedSource)&&
    Object.keys(record).filter(k=>![
      'sourceUrl','dataQuality','verifiedSource','verifiedAt',
      'variantDetails','sourceKind','models'
    ].includes(k)).length>=4;
}
export function samsungCatalogModels(catalog){
  return (Array.isArray(catalog)?catalog:[]).filter(p=>
    p?.brand==='Samsung'&&typeof p.id==='string'&&
    typeof p.name==='string'&&p.name.length>3);
}
/**
 * Archive entries are exact model-name matches, never inferred from series.
 * A newer product-specific spec record beats a global launch summary.
 * Incomplete updates and upstream outages never erase proven past coverage.
 */
export function mergeSamsungVerifiedRecords(catalog,existing={},newRecords={}){
  const samsung=samsungCatalogModels(catalog);
  const output={};
  for(const p of samsung){
    const archive=SAMSUNG_ARCHIVE_SPECS[p.id];
    if(archive&&validateSamsungArchiveEntry(p.id,archive)&&
       normalize(archive._modelName)===normalize(p.name)){
      const {_modelName,...record}=archive;
      output[p.id]={...record};
    }
    if(validSamsungRecord(existing[p.id]))output[p.id]=existing[p.id];
    const current=newRecords[p.id];
    if(validSamsungRecord(current)){
      const previous=output[p.id];
      // Use the fresh source if it has the same source URL or enough detail
      // to replace an older record without silently discarding specifications.
      if(!previous||current.sourceUrl===previous.sourceUrl||
         Object.keys(current).length>=Object.keys(previous).length){
        output[p.id]=current;
      }
    }
  }
  return output;
}
export function samsungCoverageReport(catalog,records,meta={}){
  const samsung=samsungCatalogModels(catalog);
  const source=records||{};
  const verified=samsung.filter(p=>validSamsungRecord(source[p.id]));
  const missing=samsung.filter(p=>!validSamsungRecord(source[p.id]));
  return {
    checkedAt:new Date().toISOString(),
    total:samsung.length,
    verified:verified.length,
    regionalOfficial:verified.filter(p=>source[p.id].dataQuality==='official-specifications-regional-variant').length,
    newsroomOfficial:verified.filter(p=>source[p.id].dataQuality==='official-specifications-samsung-newsroom').length,
    missing:missing.length,
    unverified:missing.map(p=>({id:p.id,name:p.name,reason:'No matching Samsung source with adequate technical fields'})),
    source:'Samsung country-level specification pages and Samsung Newsroom',
    notes:'Full historical Samsung coverage is not guaranteed; unknown fields remain unavailable. Markets and SKU variants differ.',
    ...meta
  };
}
