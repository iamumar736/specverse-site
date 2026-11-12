import fs from 'node:fs/promises';

// Read-only reporting of the data that was actually published. Do not count a
// discovered model identity as a verified specification profile.
const root=new URL('../public/data/',import.meta.url);
const read=async(name,fallback)=>JSON.parse(await fs.readFile(new URL(name,root),'utf8')
  .catch(()=>JSON.stringify(fallback)));
const catalog=await read('catalog.json',[]);
const status=await read('status.json',{});
const validation=await read('validation.json',{});
const samsungCoverage=await read('samsung-verification-coverage.json',{});
const oppoVivoCoverage=await read('oppo-vivo-verification-coverage.json',{});
const sources={
  Apple:await read('official-apple.json',{}),
  Samsung:await read('official-samsung.json',{}),
  OPPO:await read('official-oppo.json',{}),
  Vivo:await read('official-vivo.json',{})
};
const specKeys=['screen','resolution','chip','cpu','camera','selfie','battery','charging','ram','storage','dimensions','weight','network','wifi','bluetooth'];
const catalogIds=new Set(catalog.map(p=>p.id));
const modelCounts={};
for(const phone of catalog)modelCounts[phone.brand]=(modelCounts[phone.brand]||0)+1;
const officialCoverage={};
let verifiedUnique=new Set();
for(const [brand,records] of Object.entries(sources)){
  const ids=Object.keys(records).filter(id=>{
    const row=records[id];
    if(!catalogIds.has(id)||!row?.dataQuality?.startsWith('official-specifications')||!row.sourceUrl)return false;
    try{
      const host=new URL(row.sourceUrl).hostname;
      return brand==='Apple'?host==='support.apple.com':
        brand==='Samsung'?['news.samsung.com','www.samsung.com'].includes(host):
        brand==='OPPO'?['www.oppo.com','oppo.com'].includes(host):
        ['www.vivo.com','vivo.com'].includes(host);
    }catch{return false}
  });
  ids.forEach(id=>verifiedUnique.add(id));
  officialCoverage[brand]={tracked:modelCounts[brand]||0,sourceVerified:ids.length};
}
const incomplete=catalog.filter(p=>!specKeys.some(k=>p[k]!==undefined&&p[k]!==null&&p[k]!==''));
const generatedAt=new Date().toISOString();
const health={
  generatedAt,
  mode:'automatic',
  catalog:{total:catalog.length,brands:Object.keys(modelCounts).length,
    withManufacturerSources:verifiedUnique.size,
    withoutKnownTechnicalFields:incomplete.length},
  officialCoverage,
  manufacturerChecks:{
    samsungMissing:samsungCoverage.missing??samsungCoverage.unverified?.length??null,
    oppoMissing:oppoVivoCoverage.OPPO?.unverified?.length??null,
    vivoMissing:oppoVivoCoverage.Vivo?.unverified?.length??null
  },
  lastCatalogCheck:status.lastChecked||null,
  verifiedFeedConfigured:Boolean(status.feedConfigured),
  priceNote:'Current market prices require separately licensed retailer sources; no auto-generated exchange-rate prices.',
  sourceNote:'Manufacturer verified entries and publicly discovered identities have different confidence levels. Missing specs remain unavailable.',
  catalogValidationErrors:validation.errors?.length||0
};
if(!Array.isArray(catalog)||catalog.length<100||health.catalogValidationErrors)
  throw Error('Unsafe catalog health: missing models or validation errors');
status.automation={
  mode:'scheduled',lastReport:generatedAt,
  verifiedModels:verifiedUnique.size,
  incompleteModels:incomplete.length,
  pricesAutoUpdated:Boolean(status.feedConfigured)
};
await fs.writeFile(new URL('status.json',root),JSON.stringify(status,null,2)+'\n');
await fs.writeFile(new URL('automation-health.json',root),JSON.stringify(health,null,2)+'\n');
console.log('Automation coverage',JSON.stringify({models:catalog.length,verified:verifiedUnique.size,
  incomplete:incomplete.length,Apple:officialCoverage.Apple.sourceVerified,
  Samsung:officialCoverage.Samsung.sourceVerified,
  OPPO:officialCoverage.OPPO.sourceVerified,Vivo:officialCoverage.Vivo.sourceVerified}));
