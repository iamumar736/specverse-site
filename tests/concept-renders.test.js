import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {conceptRenderVariant,conceptRenderFor,CONCEPT_RENDER_ASSETS} from '../concept-renders.js';
import {isUsablePhonePhoto} from '../photo-source-policy.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const expected={
  island:{brand:'Apple',name:'iPhone 17 Pro'},
  rings:{brand:'Samsung',name:'Galaxy S25 Ultra'},
  visor:{brand:'Google',name:'Pixel 10 Pro'},
  fold:{brand:'Samsung',name:'Galaxy Z Fold7'},
  dual:{brand:'Itel',name:'A80'}
};

test('the site commits five real compressed WebP concept image assets, not old vector placeholders',()=>{
  assert.deepEqual(Object.keys(CONCEPT_RENDER_ASSETS).sort(),Object.keys(expected).sort());
  for(const name of Object.keys(expected)){
    const path=CONCEPT_RENDER_ASSETS[name];
    assert.equal(path,'/concept-renders/'+name+'.webp');
    const disk=new URL('../public'+path,import.meta.url);
    const data=readFileSync(disk);
    assert.equal(data.toString('ascii',0,4),'RIFF',name);
    assert.equal(data.toString('ascii',8,12),'WEBP',name);
    assert.ok(data.length>1500&&data.length<25000,'compact original artwork '+name);
    assert.equal(conceptRenderVariant(expected[name]),name);
    assert.equal(conceptRenderFor(expected[name]),path);
  }
});

test('variant selection distinguishes camera designs and major form factors',()=>{
  assert.equal(conceptRenderVariant({brand:'Apple',name:'iPhone 17'}),'dual');
  assert.equal(conceptRenderVariant({brand:'Apple',name:'iPhone 17 Pro Max'}),'island');
  assert.equal(conceptRenderVariant({brand:'Samsung',name:'Galaxy A56'}),'rings');
  assert.equal(conceptRenderVariant({brand:'Google',name:'Pixel 9a'}),'visor');
  assert.equal(conceptRenderVariant({brand:'Google',name:'Pixel Fold'}),'fold');
  assert.equal(conceptRenderVariant({brand:'Tecno',name:'CAMON 40 Premier 5G'}),'island');
  assert.equal(conceptRenderVariant({brand:'Xiaomi',name:'Xiaomi 14'}),'island');
  assert.equal(conceptRenderVariant({brand:'OPPO',name:'A60'}),'dual');
  assert.equal(conceptRenderVariant({brand:'Infinix',name:'HOT 50'}),'dual');
  assert.ok(CONCEPT_RENDER_ASSETS[conceptRenderVariant({brand:'Unknown',name:'Unknown'})]);
});

test('new studio images appear only after actual device photo selection fails',()=>{
  const app=read('src.jsx');
  const art=read('PhonePlaceholderArt.jsx');
  assert.match(app,/const preferred=selectUsablePhonePhoto\(candidates\)/);
  assert.match(app,/<PhonePlaceholderArt phone=\{p\}\/>/);
  assert.match(art,/import \{conceptRenderFor,conceptRenderVariant\}/);
  assert.match(art,/className="studio-concept-art__image"/);
  assert.match(art,/onError=\{\(\)=>setFailed\(true\)\}/);
  assert.match(art,/actual device appearance not verified/);
  assert.match(art,/Studio illustration/);
  assert.match(art,/modern-phone-art__camera-group/);
  assert.ok(isUsablePhonePhoto('/device-visuals/verified-phone.webp'));
});

test('render CSS is low-motion, responsive and does not open WebGL canvases for cards',()=>{
  const style=read('elegance.css');
  const art=read('PhonePlaceholderArt.jsx');
  assert.match(style,/\.studio-concept-art__image/);
  assert.match(style,/\.detail-art \.studio-concept-art__image/);
  assert.match(style,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(style,/\.studio-concept-art__image\{transition:none!important;transform:none!important\}/);
  assert.doesNotMatch(art,/Canvas|three|WebGL|Math\.random/);
});
