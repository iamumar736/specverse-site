/** Optional public discovery: Wikidata entries typed as smartphone (Q22645).
 * Wikidata is not a comprehensive device/specifications provider. Records are
 * only imported when they include a manufacturer and an English label.
 * Wikimedia Commons image URLs require their own licensing review before use.
 */
import fs from 'node:fs/promises';
const query=`SELECT ?item ?itemLabel ?manufacturerLabel ?date WHERE {
  ?item wdt:P31/wdt:P279* wd:Q22645; wdt:P176 ?manufacturer.
  OPTIONAL { ?item wdt:P577 ?date. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 2500`;
const endpoint='https://query.wikidata.org/sparql';
const response=await fetch(`${endpoint}?query=${encodeURIComponent(query)}&format=json`,{
 headers:{Accept:'application/sparql-results+json','User-Agent':'SpecVersePhoneExplorer/1.0 (educational phone catalog)'},
 signal:AbortSignal.timeout(45000)
});
if(!response.ok)throw new Error(`Wikidata query failed: ${response.status}`);
const payload=await response.json();
const entries=[];
for(const row of payload.results?.bindings||[]){
 const name=row.itemLabel?.value,brand=row.manufacturerLabel?.value,item=row.item?.value;
 if(!name||!brand||!/^https:\/\/www\.wikidata\.org\/entity\/Q\d+$/.test(item||'')||/^Q\d+$/.test(name)||/^Q\d+$/.test(brand))continue;
 const year=Number((row.date?.value||'').slice(0,4))||null;
 entries.push({id:`wd-${item.split('/').pop().toLowerCase()}`,brand,name,year,sourceUrl:item,sourceName:'Wikidata',verifiedAt:new Date().toISOString()});
}
const path=new URL('../public/data/discovered.json',import.meta.url);
await fs.mkdir(new URL('../public/data/',import.meta.url),{recursive:true});
await fs.writeFile(path,JSON.stringify(entries,null,2)+'\n');
console.log(`Discovered ${entries.length} Wikidata entries (specs require verification)`);
