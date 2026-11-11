import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=name=>JSON.parse(fs.readFileSync(new URL('../public/data/'+name,import.meta.url),'utf8'));
test('OPPO and vivo overlays contain exact model manufacturer records',()=>{
 for(const [brand,file,host] of [['OPPO','official-oppo.json','www.oppo.com'],['Vivo','official-vivo.json','www.vivo.com']]){
  const data=read(file);
  assert.ok(Object.keys(data).length>=10,brand+' has insufficient verified records');
  for(const [id,p] of Object.entries(data)){
   assert.equal(new URL(p.sourceUrl).hostname,host,id);
   assert.equal(p.dataQuality,'official-specifications-regional-variant',id);
   assert.ok(Object.keys(p).length>=10,id+' has too few populated fields');
   assert.ok(p.screen||p.chip||p.camera||p.battery,id+' missing core hardware specs');
   assert.ok(p.variantDetails.includes('region'),id+' missing regional disclaimer');
  }
 }
});
test('coverage reports include verified and unverified models',()=>{
 const coverage=read('oppo-vivo-verification-coverage.json');
 for(const brand of ['OPPO','Vivo']){
  assert.ok(coverage[brand].total>=300);
  assert.equal(coverage[brand].total,coverage[brand].verified+coverage[brand].unverified.length);
 }
});
