import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const records=JSON.parse(fs.readFileSync(new URL('../public/data/official-samsung.json',import.meta.url),'utf8'));
test('Samsung import contains source-verified regional specs, not guessed placeholder values',()=>{
  assert.ok(Object.keys(records).length>=20,'At least 20 models must be source verified');
  for(const [id,p] of Object.entries(records)){
    assert.equal(new URL(p.sourceUrl).hostname,'www.samsung.com',id);
    assert.equal(p.dataQuality,'official-specifications-regional-variant',id);
    assert.ok(Object.keys(p).length>=14,id+' has too few verified fields');
    assert.ok(p.screen||p.camera||p.battery,id+' must have technical details');
    assert.ok(p.variantDetails||p.sourceUrl.includes('/smartphones/'),id);
  }
});
test('base Galaxy models never inherit FE/Ultra edition specifications',()=>{
  const base=records['samsung-galaxy-s24'];
  const fe=records['samsung-galaxy-s24-fe'];
  if(base&&fe)assert.notEqual(base.sourceUrl,fe.sourceUrl);
  if(base)assert.ok(!/galaxy-s24-(?:fe|ultra)(?:-|\/)/i.test(new URL(base.sourceUrl).pathname));
  const s25=records['samsung-galaxy-s25'];
  if(s25)assert.ok(!/galaxy-s25-(?:fe|ultra|edge)(?:-|\/)/i.test(new URL(s25.sourceUrl).pathname));
  const legacy=records['samsung-galaxy-s'];
  if(legacy)assert.ok(!/galaxy-s\d/i.test(legacy.sourceUrl));
});
