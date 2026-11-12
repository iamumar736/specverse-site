// Editorial "Top 40" discovery is an explainable selection, NOT a benchmark
// ranking or a manufacturer endorsement. Never fabricate scores, prices or specs.
export const TOP_MODEL_COUNT=40;

const PRIORITY_BRANDS=[
  'Apple','Samsung','Google','Xiaomi','OnePlus','OPPO','Vivo','Honor',
  'Huawei','Motorola','Nothing','Realme','POCO','iQOO','Redmi','Sony',
  'Asus','Infinix','Tecno'
];
const normalized=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

export function phoneFeatureScore(phone,currentYear=new Date().getFullYear()){
  const name=normalized(phone?.name);
  const brand=String(phone?.brand||'');
  const year=Number(phone?.year);
  const reasonableYear=Number.isInteger(year)&&year>=2000&&year<=currentYear+1?year:0;
  const recency=reasonableYear?Math.max(0,reasonableYear-(currentYear-5))*28:0;
  let tier=0;
  if(/\b(?:ultra|pro max|fold|ultimate|porsche design)\b/.test(name))tier=132;
  else if(/\b(?:pro|plus|edge|flip|max)\b/.test(name))tier=99;
  else if(/\b(?:fe|5g)\b/.test(name))tier=28;
  // A broad flagship-family hint, not a made-up performance measurement.
  if(/\b(?:iphone \d+|pixel \d+|galaxy s\d+|galaxy z fold\d+|galaxy z flip\d+|xiaomi \d+|oneplus \d+|find x\d+|magic\d+|xperia 1|razr \d+|nothing phone \d+)\b/.test(name))tier+=42;
  const priority=PRIORITY_BRANDS.indexOf(brand);
  const brandValue=priority===-1?0:Math.max(0,22-priority);
  const sourceValue=String(phone?.dataQuality||'').startsWith('official-specifications')?11:0;
  const specValue=['screen','chip','camera','battery'].filter(key=>Boolean(phone?.[key])).length*2;
  return recency+tier+brandValue+sourceValue+specValue;
}

/**
 * Select representative modern and premium models from different brands.
 * 1st pass max 5 devices/brand; 2nd max 8; 3rd no cap if the catalog is small.
 * The website can show all 40 without swiping through a hidden carousel.
 */
export function selectTopModels(catalog,limit=TOP_MODEL_COUNT,currentYear=new Date().getFullYear()){
  if(!Array.isArray(catalog)||limit<=0)return [];
  const seen=new Set();
  const ranked=catalog.filter(phone=>{
    if(!phone?.id||!phone?.name||!phone?.brand||seen.has(phone.id))return false;
    seen.add(phone.id);
    return true;
  }).sort((a,b)=>{
    const difference=phoneFeatureScore(b,currentYear)-phoneFeatureScore(a,currentYear);
    if(difference)return difference;
    const yearDiff=(Number(b.year)||0)-(Number(a.year)||0);
    return yearDiff||a.name.localeCompare(b.name)||a.id.localeCompare(b.id);
  });
  const chosen=[],selectedIds=new Set(),counts=new Map();
  const desired=Math.min(limit,ranked.length);
  for(const cap of [5,8,Infinity]){
    for(const phone of ranked){
      if(chosen.length>=desired)break;
      if(selectedIds.has(phone.id)||(counts.get(phone.brand)||0)>=cap)continue;
      chosen.push(phone);
      selectedIds.add(phone.id);
      counts.set(phone.brand,(counts.get(phone.brand)||0)+1);
    }
    if(chosen.length>=desired)break;
  }
  return chosen;
}
