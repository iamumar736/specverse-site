/** Enrich discovered Wikidata models with conservative, unit-aware claims. */
import fs from 'node:fs/promises';
const dir=new URL('../public/data/',import.meta.url);
const file=new URL('discovered.json',dir);
const devices=JSON.parse(await fs.readFile(file,'utf8').catch(()=>'[]'));
const ids=devices.map(d=>d.id?.match(/^wd-(q\d+)$/i)?.[1]?.toUpperCase()).filter(Boolean);
const byId=new Map(devices.map(d=>[d.id?.slice(3).toUpperCase(),d]));
const now=new Date().toISOString();
let enriched=0,errors=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
for(let i=0;i<ids.length;i+=40){
 const batch=ids.slice(i,i+40);
 try{
  const url='https://www.wikidata.org/w/api.php?action=wbgetentities&ids='+batch.join('%7C')+'&props=claims&format=json&origin=*';
  const res=await fetch(url,{headers:{'User-Agent':'SpecVerse/1.2 (https://github.com/iamumar736/specverse-site; open device catalog)'},signal:AbortSignal.timeout(25000)});
  if(!res.ok)throw Error('Wikidata API '+res.status);
  const payload=await res.json();
  for(const [qid,entity] of Object.entries(payload.entities||{})){
   const d=byId.get(qid);if(!d||!entity.claims)continue;
   const first=prop=>entity.claims[prop]?.find(c=>c.rank!=='deprecated'&&c.mainsnak?.snaktype==='value')?.mainsnak?.datavalue?.value;
   const date=first('P577');if(!d.year&&date?.time){const y=Number(date.time.slice(1,5));if(y>=1990&&y<=new Date().getUTCFullYear()+2)d.year=y;}
   const mass=first('P2067');
   if(!d.weight&&mass?.amount&&mass.unit==='http://www.wikidata.org/entity/Q41803'){
    const g=Number(mass.amount);if(g>30&&g<1000)d.weight=g+' g';
   }
   const screen=first('P2049'); // Width is NOT screen diagonal: intentionally not imported.
   if(d.year||d.weight){d.fieldSources??={};if(d.weight)d.fieldSources.weight={url:'https://www.wikidata.org/wiki/'+qid,checkedAt:now};enriched++;}
  }
 }catch(e){errors++;console.warn('Wikidata enrichment batch failed:',String(e));}
 await sleep(400);
}
if(enriched)await fs.writeFile(file,JSON.stringify(devices,null,2)+'\n');
console.log('Wikidata enriched '+enriched+' records; failed batches '+errors);
