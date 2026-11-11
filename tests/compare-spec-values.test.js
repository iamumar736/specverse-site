import test from 'node:test';
import assert from 'node:assert/strict';
import {compareSpecValues} from '../compare-spec-values.js';

const as=(key,values)=>compareSpecValues(values.map(value=>({[key]:value})),key);

test('higher measured RAM is green and lower measured RAM red',()=>{
  assert.deepEqual(as('ram',['12 GB','8 GB']),['advantage','disadvantage']);
  assert.deepEqual(as('ram',['8 GB','8 GB']),[null,null]);
  assert.deepEqual(as('ram',['12 GB','8 GB',null]),['advantage','disadvantage',null]);
});

test('only the highest and lowest of three devices are highlighted',()=>{
  assert.deepEqual(as('refreshRate',['60 Hz','90 Hz','120 Hz']),['disadvantage',null,'advantage']);
  assert.deepEqual(as('refreshRate',['120 Hz','60 Hz','120 Hz']),['advantage','disadvantage','advantage']);
});

test('less weight is favorable, and battery capacity is not assumed from video runtime',()=>{
  assert.deepEqual(as('weight',['211 g','199 g','249 g']),[null,'advantage','disadvantage']);
  assert.deepEqual(as('battery',['5000 mAh','4492 mAh','up to 27 hours video playback']),['advantage','disadvantage',null]);
});

test('avoid comparing ambiguous capacity ranges and multiple storage variants',()=>{
  assert.deepEqual(as('ram',['8/12 GB','12 GB']),[null,null]);
  assert.deepEqual(as('storage',['256 GB / 512 GB','256 GB']),[null,null]);
  assert.deepEqual(as('storage',['512 GB','1 TB']),['disadvantage','advantage']);
  assert.deepEqual(as('storage',['128–512 GB','256 GB']),[null,null]);
  assert.deepEqual(as('ram',['8 GB (Apple specification for 8 GB variant)','6 GB']),[null,null]);
});

test('adapter power and region-dependent ratings do not count as wired charging speed',()=>{
  assert.deepEqual(as('charging',['USB-C; up to 50% in 15 minutes with 60W+ adapter','25 W wired']),[null,null]);
  assert.deepEqual(as('charging',['45 W wired','25 W wired','100 W wired (region-dependent)']),['advantage','disadvantage',null]);
});

test('compare like-for-like typical brightness, pixel density and cellular generation',()=>{
  assert.deepEqual(as('brightness',['1000 nits typical; 3000 nits outdoor peak','500 nits typical']),['advantage','disadvantage']);
  assert.deepEqual(as('brightness',['2000 nits peak','1000 nits typical']),[null,null]);
  assert.deepEqual(as('resolution',['2622 × 1206 pixels (460 ppi)','1136 × 640 pixels (326 ppi)']),['advantage','disadvantage']);
  assert.deepEqual(as('network',['5G sub-6 GHz and mmWave; LTE','GSM/EDGE; UMTS/HSDPA']),['advantage','disadvantage']);
});

test('subjective or unverified spec categories remain neutral',()=>{
  assert.deepEqual(as('camera',['200 MP main','48 MP main']),[null,null]);
  assert.deepEqual(as('chip',['Snapdragon 8 Gen 3','Apple A18 Pro']),[null,null]);
  assert.deepEqual(as('screen',['6.9-inch OLED','6.1-inch OLED']),[null,null]);
  assert.deepEqual(as('year',[2025,2024]),[null,null]);
  assert.deepEqual(as('battery',['Not available','5000 mAh']),[null,null]);
});
