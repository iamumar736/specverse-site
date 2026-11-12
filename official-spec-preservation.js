// Guardrail for scheduled manufacturer scrapers.
// A failed source must not erase already accepted specifications.
// When a different regional variant is encountered, publish the more complete
// record rather than mixing RAM, radio bands or storage across variants.
const META=new Set(['sourceUrl','dataQuality','verifiedSource','verifiedAt','sourceKind','variantDetails','models']);
const technicalCount=record=>Object.entries(record||{}).filter(([key,value])=>
  !META.has(key)&&value!==null&&value!==undefined&&String(value).trim()!=='').length;

export function sourceIsOfficial(record,brand){
  try{
    const u=new URL(record?.sourceUrl);
    if(u.protocol!=='https:')return false;
    const hosts={
      Apple:['support.apple.com'],
      Samsung:['www.samsung.com','news.samsung.com'],
      OPPO:['www.oppo.com','oppo.com'],
      Vivo:['www.vivo.com','vivo.com'],
      Xiaomi:['www.mi.com','mi.com'],
      Infinix:['wap.az.infinixmobility.com','wap.iq.infinixmobility.com',
        'wap.ru.infinixmobility.com','pk.infinixmobility.com','www.infinixmobility.com',
        'wap.pk.infinixmobility.com','wap.infinixmobility.com'],
      Tecno:['www.tecno-mobile.com','tecno-mobile.com'],
      Itel:['www.itel-life.com','itel-life.com']
    };
    return (hosts[brand]||[]).includes(u.hostname);
  }catch{return false}
}
export function hasUsableOfficialRecord(record,brand){
  return Boolean(record&&typeof record==='object'&&!Array.isArray(record)&&
    sourceIsOfficial(record,brand)&&
    typeof record.verifiedSource==='string'&&
    typeof record.dataQuality==='string'&&record.dataQuality.startsWith('official-specifications')&&
    technicalCount(record)>=4);
}
export function preserveOfficialSpecs(previous={},fresh={},brand){
  const merged={};
  for(const [id,oldRecord] of Object.entries(previous||{})){
    if(hasUsableOfficialRecord(oldRecord,brand))merged[id]=oldRecord;
  }
  for(const [id,next] of Object.entries(fresh||{})){
    if(!hasUsableOfficialRecord(next,brand))continue;
    const older=merged[id];
    if(!older){merged[id]=next;continue;}
    // A page with fewer useful values must not downgrade source coverage.
    if(technicalCount(next)<technicalCount(older))continue;
    // The whole source record moves atomically: don't mix variant-specific fields.
    merged[id]=next;
  }
  return merged;
}
export function compareCoverage(previous,fresh){
  const before=Object.keys(previous||{}).length,after=Object.keys(fresh||{}).length;
  return {before,after,newModels:Object.keys(fresh||{}).filter(id=>!previous?.[id]).length};
}
