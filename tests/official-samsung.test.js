import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SAMSUNG_ARCHIVE_SPECS,validateSamsungArchiveEntry} from '../samsung-archive-specs.js';
import {isSamsungOfficialSource,validSamsungRecord,
  mergeSamsungVerifiedRecords,samsungCoverageReport} from '../samsung-spec-coverage.js';

const data=JSON.parse(fs.readFileSync(new URL('../public/data/official-samsung.json',import.meta.url),'utf8'));
const coverage=JSON.parse(fs.readFileSync(new URL('../public/data/samsung-verification-coverage.json',import.meta.url),'utf8'));

test('Samsung catalog covers both regional product pages and model-specific archived launch specs',()=>{
  const ids=Object.keys(data);
  assert.ok(ids.length>=94,'At least 94 individually sourced Samsung models');
  assert.equal(coverage.verified,ids.length);
  assert.equal(coverage.total,184);
  assert.equal(coverage.verified+coverage.missing,coverage.total);
  for(const [id,record] of Object.entries(data)){
    assert.ok(isSamsungOfficialSource(record.sourceUrl),id+' not Samsung-owned');
    assert.ok(validSamsungRecord(record),id+' has insufficient technical source evidence');
    assert.ok(record.variantDetails||record.sourceUrl.includes('/smartphones/'),id+' needs variant caveat');
  }
});

test('all 21 newsroom models have distinct official source and meaningful data',()=>{
  assert.equal(Object.keys(SAMSUNG_ARCHIVE_SPECS).length,21);
  for(const [id,entry] of Object.entries(SAMSUNG_ARCHIVE_SPECS)){
    assert.ok(validateSamsungArchiveEntry(id,entry),id);
    assert.ok(data[id],id+' not integrated into published specs');
    assert.equal(data[id].sourceUrl,entry.sourceUrl);
    assert.ok(data[id].screen||data[id].camera||data[id].battery,id);
  }
});

test('existing regional records survive incomplete or failed future imports',()=>{
  const catalog=[
    {id:'samsung-galaxy-s24',name:'Galaxy S24',brand:'Samsung'},
    {id:'samsung-galaxy-a51',name:'Galaxy A51',brand:'Samsung'}
  ];
  const official=data['samsung-galaxy-s24'];
  assert.ok(official,'S24 regional source should exist');
  const merged=mergeSamsungVerifiedRecords(catalog,{'samsung-galaxy-s24':official},{});
  assert.equal(merged['samsung-galaxy-s24'].sourceUrl,official.sourceUrl);
  assert.equal(merged['samsung-galaxy-a51'].sourceUrl,SAMSUNG_ARCHIVE_SPECS['samsung-galaxy-a51'].sourceUrl);
  const coverage=samsungCoverageReport(catalog,merged);
  assert.equal(coverage.verified,2);
  assert.equal(coverage.missing,0);
});

test('Samsung archive never transfers a base phone profile to Pro/FE/Ultra variants',()=>{
  const catalog=[
    {id:'samsung-galaxy-s10',name:'Galaxy S10 Ultra',brand:'Samsung'},
    {id:'samsung-galaxy-a51',name:'Galaxy A51 5G',brand:'Samsung'},
    {id:'samsung-galaxy-a31',name:'Galaxy A31',brand:'Samsung'},
  ];
  const merged=mergeSamsungVerifiedRecords(catalog,{},{});
  assert.equal(merged['samsung-galaxy-s10'],undefined);
  assert.equal(merged['samsung-galaxy-a51'],undefined);
  assert.ok(merged['samsung-galaxy-a31']);
  assert.equal(isSamsungOfficialSource('https://news.samsung.com.bad-site.com/fake'),false);
  assert.equal(isSamsungOfficialSource('https://www.samsung.com/ph/smartphones/galaxy-s/'),true);
});

test('base Galaxy models never inherit FE or Ultra edition source pages',()=>{
  const base=data['samsung-galaxy-s24'];
  const fe=data['samsung-galaxy-s24-fe'];
  if(base&&fe)assert.notEqual(base.sourceUrl,fe.sourceUrl);
  if(base)assert.ok(!/galaxy-s24-(?:fe|ultra)(?:-|\/)/i.test(new URL(base.sourceUrl).pathname));
  const s25=data['samsung-galaxy-s25'];
  if(s25)assert.ok(!/galaxy-s25-(?:fe|ultra|edge)(?:-|\/)/i.test(new URL(s25.sourceUrl).pathname));
  const legacy=data['samsung-galaxy-s'];
  if(legacy)assert.ok(!/galaxy-s\d/i.test(legacy.sourceUrl));
});
