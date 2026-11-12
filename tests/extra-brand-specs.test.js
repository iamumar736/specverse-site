import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {EXTRA_BRAND_SEEDS,EXTRA_BRAND_FILES,materializeManufacturerSeeds,exactBrandModelName} from '../official-extra-brand-seeds.js';
import {sourceIsOfficial,hasUsableOfficialRecord,preserveOfficialSpecs} from '../official-spec-preservation.js';
import {mergeOfficialSpecs} from '../manufacturer-specs.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('fifteen manufacturer-confirmed reference profiles across four brands are source-linked',()=>{
 assert.equal(EXTRA_BRAND_SEEDS.length,15);
 for(const brand of ['Xiaomi','Infinix','Tecno','Itel']){
  assert.ok(EXTRA_BRAND_SEEDS.filter(seed=>seed.brand===brand).length>=2,brand);
  assert.match(EXTRA_BRAND_FILES[brand],/^official-[a-z]+\.json$/);
 }
 for(const seed of EXTRA_BRAND_SEEDS){
  assert.ok(sourceIsOfficial({sourceUrl:seed.url},seed.brand),seed.name);
  assert.ok(Object.keys(seed.specs).length>=6,seed.name+' missing real hardware fields');
 }
});

test('never copy regional specifications to similarly named Pro/5G/Ultra models',()=>{
 const phones=[
  {id:'itel-a80',brand:'Itel',name:'A80'},
  {id:'itel-a80-5g',brand:'Itel',name:'A80 5G'},
  {id:'tecno-camon-40',brand:'Tecno',name:'TECNO CAMON 40'},
  {id:'tecno-camon-40-pro',brand:'Tecno',name:'CAMON 40 Pro'},
  {id:'infinix-hot-50',brand:'Infinix',name:'Infinix HOT 50'},
  {id:'infinix-hot-50-5g',brand:'Infinix',name:'HOT 50 5G'},
  {id:'xiaomi-redmi-note14',brand:'Xiaomi',name:'REDMI Note 14 Pro 5G'},
  {id:'xiaomi-redmi-note14-plus',brand:'Xiaomi',name:'REDMI Note 14 Pro+ 5G'}
 ];
 const data=materializeManufacturerSeeds(phones);
 assert.ok(data.Itel['itel-a80']);
 assert.equal(data.Itel['itel-a80-5g'],undefined);
 assert.ok(data.Tecno['tecno-camon-40']);
 assert.equal(data.Tecno['tecno-camon-40-pro'],undefined);
 assert.ok(data.Infinix['infinix-hot-50']);
 assert.equal(data.Infinix['infinix-hot-50-5g'],undefined);
 assert.ok(data.Xiaomi['xiaomi-redmi-note14']);
 assert.equal(data.Xiaomi['xiaomi-redmi-note14-plus'],undefined);
 assert.equal(exactBrandModelName('Tecno','TECNO CAMON 40'),exactBrandModelName('Tecno','Camon 40'));
 const merged=mergeOfficialSpecs(phones);
 assert.equal(merged[0].battery,'5000 mAh');
 assert.ok(merged[0].sourceUrl.includes('itel-life.com'));
 assert.equal(merged[1].sourceUrl,undefined);
 assert.equal(merged[3].sourceUrl,undefined);
});

test('multiple exact catalog identities are rejected rather than randomly matched',()=>{
 const a={id:'a',brand:'Itel',name:'A80'};
 const b={id:'b',brand:'Itel',name:'itel A80'};
 const data=materializeManufacturerSeeds([a,b]);
 assert.equal(Object.keys(data.Itel).length,0);
});

test('daily manufacturer jobs preserve verified data across upstream outages',()=>{
 const seed=EXTRA_BRAND_SEEDS.find(item=>item.brand==='Xiaomi');
 const prev={a:{...seed.specs,sourceUrl:seed.url,verifiedSource:'Xiaomi Global',
   dataQuality:'official-specifications-launch-reference',variantDetails:'Regional variant'}};
 assert.ok(hasUsableOfficialRecord(prev.a,'Xiaomi'));
 assert.deepEqual(preserveOfficialSpecs(prev,{},'Xiaomi'),prev);
 assert.equal(sourceIsOfficial({sourceUrl:'https://mi.com.fake.invalid/specs'},'Xiaomi'),false);
 assert.equal(sourceIsOfficial({sourceUrl:'https://wap.az.infinixmobility.com/specs/hot-50'},'Infinix'),true);
 assert.equal(sourceIsOfficial({sourceUrl:'https://www.tecno-mobile.com/phones/tech-specs/'},'Tecno'),true);
 assert.equal(sourceIsOfficial({sourceUrl:'https://www.itel-life.com/products/phone/a-series'},'Itel'),true);
});

test('source checker is daily, bounded, non-destructive and publishes coverage',()=>{
 const script=read('scripts/import-official-extra-brands.mjs');
 const workflow=read('.github/workflows/import-official-extra-brands.yml');
 assert.match(script,/materializeManufacturerSeeds\(catalog\)/);
 assert.match(script,/\.sort\(\(a,b\)=>\(Number\(b\.year\)\|\|0\)/);
 assert.match(script,/preserveOfficialSpecs\(base,fresh,brand\)/);
 assert.match(script,/exactBrandModelName\(brand,parsed\.name\)/);
 assert.match(script,/Object\.keys\(parsed\.out\)\.length<5/);
 assert.match(script,/extra-brands-import-state\.json/);
 assert.match(workflow,/schedule:/);
 assert.match(workflow,/workflow_dispatch:/);
 assert.match(workflow,/group: specverse-data-publication/);
 assert.match(workflow,/--max=8/);
 assert.doesNotMatch(workflow,/public\/data\/status\.json/);
 assert.doesNotMatch(workflow,/public\/data\/automation-health\.json/);
 assert.match(read('.github/workflows/daily-update.yml'),/report-catalog-health\.mjs/);
 const target=fileURLToPath(new URL('../scripts/import-official-extra-brands.mjs',import.meta.url));
 const run=spawnSync(process.execPath,['--check',target],{encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);
});

test('server and browser catalogs fetch and display all additional manufacturer overlays',()=>{
 const app=read('src.jsx');
 const updater=read('scripts/update-data.mjs');
 const health=read('scripts/report-catalog-health.mjs');
 for(const brand of ['xiaomi','infinix','tecno','itel']){
  assert.ok(app.includes("official-"+brand+".json"),brand+' UI import missing');
  assert.ok(updater.includes("EXTRA_BRAND_FILES"),brand+' importer wiring missing');
  assert.ok(health.includes("official-"+brand+".json"),brand+' coverage missing');
 }
 assert.match(read('manufacturer-specs.js'),/materializeManufacturerSeeds/);
 assert.match(app,/mergeOfficialSpecs\(data,\.\.\.overlays\)/);
});
