// Sorting and navigation shared by the brand directory and phone search.
export const FEATURED_BRANDS=[
  'Apple','Samsung','Xiaomi','OPPO','Vivo','Google','OnePlus',
  'Huawei','Honor','Realme','Motorola','Nothing','Infinix','Tecno',
  'Itel','Redmi','POCO','iQOO'
];
const squish=s=>String(s??'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,' ').trim();
const yearOf=p=>{
  const explicit=Number(p?.year);
  if(Number.isInteger(explicit)&&explicit>=1990&&explicit<=2100)return explicit;
  const found=String(p?.released||p?.announced||'').match(/\b(?:19|20)\d{2}\b/);
  return found?Number(found[0]):0;
};
const priceOf=(p,prices)=>{
  const values=prices?.[p.id];
  for(const currency of ['PKR','USD']){
    const amount=Number(values?.[currency]?.amount);
    if(Number.isFinite(amount)&&amount>0&&values?.[currency]?.sourceUrl)return {currency,amount};
  }
  return null;
};
const premiumTier=p=>{
  const name=squish(p?.name);
  if(/\b(?:ultra|pro max|fold|porsche|ultimate)\b/.test(name))return 5;
  if(/[+＋]/.test(String(p?.name))||/\b(?:pro|edge|plus)\b/.test(name))return 4;
  if(/\b(?:max|fe|flip|5g)\b/.test(name))return 2;
  return 1;
};
const generation=p=>{
  const n=squish(p?.name);
  // Compare generations only within the same product family.
  // This avoids treating e.g. Galaxy S25 as newer than Galaxy Z Fold7.
  const match=n.match(/(?:^| )(iphone|pixel|galaxy s|galaxy z fold|galaxy z flip|galaxy note|oneplus|redmi note|reno|xiaomi|nothing phone)\s*(\d{1,2})(?=\b|[a-z])/);
  return match?{family:match[1],number:Number(match[2])}:null;
};
export function orderedBrands(catalog){
  const available=[...new Set(catalog.map(p=>p.brand).filter(Boolean))];
  const head=FEATURED_BRANDS.filter(b=>available.includes(b));
  const tail=available.filter(b=>!FEATURED_BRANDS.includes(b)).sort((a,b)=>a.localeCompare(b));
  return [...head,...tail];
}
export function searchScore(p,query){
  const q=squish(query);if(!q)return 0;
  const name=squish(p.name),brand=squish(p.brand),combined=squish(p.brand+' '+p.name),chip=squish(p.chip);
  if(name===q||combined===q)return 5;
  if(name.startsWith(q)||combined.startsWith(q))return 4;
  if(name.includes(q)||combined.includes(q))return 3;
  if(brand.includes(q))return 2;
  if(q.split(' ').every(token=>combined.includes(token)))return 2;
  if(chip.includes(q))return 1;
  return -1;
}
export function comparePhones(a,b,prices={},mode='premium',query=''){
  if(mode==='az')return a.name.localeCompare(b.name);
  if(mode==='brand'){
    const positions=FEATURED_BRANDS;
    const ia=positions.indexOf(a.brand),ib=positions.indexOf(b.brand);
    const diff=(ia<0?1000:ia)-(ib<0?1000:ib);
    if(diff)return diff;
    const brand=a.brand.localeCompare(b.brand);if(brand)return brand;
  }
  if(query){
    const relevance=searchScore(b,query)-searchScore(a,query);
    if(relevance)return relevance;
  }
  const pa=priceOf(a,prices),pb=priceOf(b,prices);
  // With search results, show priced models before unpriced ones.
  // Compare actual prices only within the SAME currency; never infer a conversion.
  if(query || mode==='price'){
    if(pa&&!pb)return -1;
    if(pb&&!pa)return 1;
    if(pa&&pb&&pa.currency===pb.currency&&pa.amount!==pb.amount)return pb.amount-pa.amount;
  }
  const sameBrand=a.brand===b.brand;
  const ga=generation(a),gb=generation(b);
  // Series numbering gives a reliable relative order even for imported
  // records with no release year attached.
  if(sameBrand&&ga&&gb&&ga.family===gb.family&&ga.number!==gb.number)return gb.number-ga.number;
  const yearDiff=yearOf(b)-yearOf(a);
  if(yearDiff)return yearDiff;
  // Never convert currencies or invent prices for missing feeds.
  if(pa&&pb&&pa.currency===pb.currency&&pa.amount!==pb.amount)return pb.amount-pa.amount;
  const tier=premiumTier(b)-premiumTier(a);if(tier)return tier;
  if(mode==='brand'&&!sameBrand)return a.brand.localeCompare(b.brand);
  return a.name.localeCompare(b.name);
}
export function brandGroups(catalog,prices={},previewSize=4,mode='premium'){
  const list=orderedBrands(catalog),map=new Map(list.map(b=>[b,[]]));
  for(const phone of catalog){if(map.has(phone.brand))map.get(phone.brand).push(phone)}
  return list.map(brand=>({
    brand,count:map.get(brand).length,
    phones:map.get(brand).sort((a,b)=>comparePhones(a,b,prices,mode)).slice(0,previewSize)
  }));
}
