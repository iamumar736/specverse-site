/** Best-effort, source-attributed phone model discovery. No fabricated specifications. */
import fs from 'node:fs/promises';
const output=new URL('../public/data/discovered.json',import.meta.url);
const endpoint='https://query.wikidata.org/sparql';
// Query manufacturer-scoped subsets to avoid a single unbounded Wikidata query.
const brandNames=['Xiaomi','OPPO','Vivo','Google','OnePlus','Huawei','Honor','Realme','Motorola','Nothing','Infinix','Tecno','itel','POCO','Redmi','iQOO','ASUS','Sony','Nokia','HMD','ZTE','Nubia','RedMagic','Lenovo','TCL','Alcatel','Sharp','Meizu','Blackview','Ulefone','Doogee','Oukitel','Cubot','Fairphone','Unihertz','CAT','AGM','Lava','Micromax','LG','BlackBerry','HTC','Microsoft','Sony Ericsson','Palm','Essential','Gionee','LeEco','Panasonic'];
const queries=[
  'SELECT DISTINCT ?item ?itemLabel ?manufacturerLabel ?date WHERE { ?item wdt:P31/wdt:P279* wd:Q19723451. OPTIONAL { ?item wdt:P176 ?manufacturer. } OPTIONAL { ?item wdt:P577 ?date. } SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } } LIMIT 3000'
];
const rows=[];
let errors=[];
for(const query of queries){
  for(let attempt=0;attempt<2;attempt++){
    try{
      const res=await fetch(endpoint+'?format=json&query='+encodeURIComponent(query),{
        headers:{Accept:'application/sparql-results+json','User-Agent':'SpecVerse/1.1 (phone catalog; GitHub iamumar736/specverse-site)'},
        signal:AbortSignal.timeout(60000)
      });
      if(!res.ok)throw new Error('HTTP '+res.status);
      const json=await res.json();
      rows.push(...(json.results?.bindings||[]));
      console.log('Wikidata returned '+(json.results?.bindings?.length||0)+' records');
      break;
    }catch(e){errors.push(String(e));console.warn('Wikidata attempt failed:',String(e));}
  }
  if(rows.length)break;
}
const devices=new Map();
for(const r of rows){
  const name=r.itemLabel?.value?.trim(),item=r.item?.value;
  const known=['Samsung','Apple',...brandNames];
  const rawBrand=r.manufacturerLabel?.value?.trim(); const brand=known.find(b=>b.toLowerCase()===rawBrand?.toLowerCase())||known.find(b=>name?.toLowerCase().startsWith(b.toLowerCase()+' '))||null;
  if(!name||!brand||!/^https:\/\/www\.wikidata\.org\/entity\/Q\d+$/.test(item||'')||/^Q\d+$/.test(name)||/^Q\d+$/.test(brand))continue;
  const year=Number((r.date?.value||'').slice(0,4))||null;
  const id='wd-'+item.split('/').pop().toLowerCase();
  devices.set(id,{id,name,brand,year,sourceUrl:item,sourceName:'Wikidata',dataQuality:'discovered-unverified'});
}
await fs.mkdir(new URL('../public/data/',import.meta.url),{recursive:true});
if(devices.size){
  const existing=await fs.readFile(output,'utf8').then(JSON.parse).catch(()=>[]);
  for(const d of existing)if(d?.id&&!devices.has(d.id))devices.set(d.id,d);
  await fs.writeFile(output,JSON.stringify([...devices.values()],null,2)+'\n');
  console.log('Saved '+devices.size+' discovered models');
}else{
  console.warn('No models discovered; preserving existing catalog. '+errors.join(' | ').slice(0,400));
  if(errors.length)process.exitCode=1;
}
