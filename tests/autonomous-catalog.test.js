import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {hasUsableOfficialRecord,preserveOfficialSpecs,
  sourceIsOfficial,compareCoverage} from '../official-spec-preservation.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const apple=(extra={})=>({
  sourceUrl:'https://support.apple.com/en-us/111111',
  verifiedSource:'Apple Support',
  dataQuality:'official-specifications',
  screen:'6.1-inch OLED',battery:'Video playback up to 20 h',
  camera:'48 MP',storage:'128 GB',...extra
});
const vivo=(extra={})=>({
  sourceUrl:'https://www.vivo.com/en/products/param/v40',
  verifiedSource:'Vivo EN',
  dataQuality:'official-specifications-regional-variant',
  screen:'6.67-inch AMOLED',camera:'50 MP',ram:'8 GB',battery:'5500 mAh',...extra
});
test('preserve previous source-backed details when websites fail or return incomplete data',()=>{
  const old={'apple-iphone-example':apple()};
  assert.deepEqual(preserveOfficialSpecs(old,{},'Apple'),old);
  assert.deepEqual(preserveOfficialSpecs(old,{'apple-iphone-example':apple({camera:'',battery:''})},'Apple'),old);
  const next=apple({refreshRate:'120 Hz'});
  assert.deepEqual(preserveOfficialSpecs(old,{'apple-iphone-example':next},'Apple'),{'apple-iphone-example':next});
});
test('reject fake manufacturer hosts and records without enough technical facts',()=>{
  assert.equal(sourceIsOfficial({sourceUrl:'https://support.apple.com.bad.invalid/id'},'Apple'),false);
  assert.equal(sourceIsOfficial({sourceUrl:'https://www.oppo.com/pk/smartphones/'},'OPPO'),true);
  assert.equal(sourceIsOfficial({sourceUrl:'http://www.vivo.com/product'},'Vivo'),false);
  assert.equal(hasUsableOfficialRecord(vivo(),'Vivo'),true);
  assert.equal(hasUsableOfficialRecord(vivo({sourceUrl:'https://vivo.com.attacker.invalid'}),'Vivo'),false);
  assert.deepEqual(compareCoverage({a:1},{a:1,b:2}),{before:1,after:2,newModels:1});
});
test('new OPPO/vivo imports are bounded and never discard existing accepted files',()=>{
  const source=read('scripts/import-official-oppo-vivo.mjs');
  assert.match(source,/const maxPerBrand=Math\.max/);
  assert.match(source,/selected=Array\.from/);
  assert.match(source,/preserveOfficialSpecs\(previous\[brand\],results\[brand\],brand\)/);
  assert.match(source,/oppo-vivo-import-state\.json/);
});
test('Apple auto-discovers new iPhones only from linked manufacturer spec pages',()=>{
  const source=read('scripts/import-official-apple.mjs');
  assert.match(source,/const newPhones=\[\.\.\.links\.values\(\)\]/);
  assert.match(source,/phone\.newIdentity/);
  assert.match(source,/parsePage\(page,phone\.name\)/);
  assert.match(source,/preserveOfficialSpecs\(previous,output,'Apple'\)/);
});
test('all spec workflows run automatically, serialize data writes, and create failure issues',()=>{
  const names=[
    '.github/workflows/daily-update.yml',
    '.github/workflows/import-official-apple.yml',
    '.github/workflows/import-official-samsung.yml',
    '.github/workflows/import-official-oppo-vivo.yml',
    '.github/workflows/device-visuals.yml'
  ];
  for(const name of names){
    const body=read(name);
    assert.match(body,/schedule:/,name+' has no cron schedule');
    assert.match(body,/workflow_dispatch:/,name+' has no manual fallback');
    assert.match(body,/group: specverse-data-publication/,name+' not serialized');
    assert.match(body,/cancel-in-progress: false/,name+' cancels running imports');
  }
  assert.match(read('.github/workflows/catalog-failure-alerts.yml'),/github\.rest\.issues\.create/);
  assert.match(read('scripts/publish-data.sh'),/git rebase origin\/main/);
  assert.match(read('scripts/publish-data.sh'),/git push origin HEAD:main/);
});
test('catalog loss safety and source quality monitoring are present on the homepage',()=>{
  assert.match(read('scripts/update-data.mjs'),/all\.length<Math\.floor\(existing\.length\*\.9\)/);
  assert.match(read('scripts/report-catalog-health.mjs'),/automation-health\.json/);
  assert.match(read('src.jsx'),/automatic-update-note/);
  assert.match(read('.github/workflows/daily-update.yml'),/report-catalog-health\.mjs/);
});
