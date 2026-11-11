import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync(new URL('../public/data/official-apple.json',import.meta.url),'utf8'));
test('every iPhone entry has a specific verified official Apple specs page',()=>{
 const keys=Object.keys(data);
 assert.equal(keys.length,55);
 for(const [id,p] of Object.entries(data)){
  assert.equal(p.dataQuality,'official-specifications',id);
  assert.equal(new URL(p.sourceUrl).hostname,'support.apple.com',id);
  assert.ok(Object.keys(p).length>=8,id+' has incomplete extracted spec count');
  assert.ok(p.storage||p.screen||p.camera,id+' has no technical facts');
  assert.ok(!/samsung\.com/i.test(p.sourceUrl));
 }
});
test('5G-capable modern iPhones do not accidentally show only 3G and older models are distinct',()=>{
 for(const id of ['apple-iphone-18-pro','apple-iphone-17-pro','apple-iphone-16','apple-iphone-15','apple-iphone-13']){
  assert.match(data[id].network,/5G/,id);
 }
 assert.ok(!/5G/.test(data['apple-iphone-11'].network||''));
 assert.match(data['apple-iphone-18-pro'].sourceUrl,/support\.apple\.com/);
});
