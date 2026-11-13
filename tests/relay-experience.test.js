import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app=read('src.jsx');
const hero=read('DiscoveryExperience.jsx');
const flow=read('DecisionFlow.jsx');
const field=read('SignalField.jsx');
const smooth=read('SmoothScroll.jsx');
const motion=read('RelayMotion.jsx');
const css=read('relay.css');
const packageJson=JSON.parse(read('package.json'));

test('relay-inspired hero retains accessible browsing, 3D, and comparison actions',()=>{
  assert.match(hero,/<HeroExperience\/>/);
  assert.match(hero,/<SignalField active=\{motion\}\/>/);
  assert.match(hero,/<DecisionFlow catalog=\{catalog\} onComparePair=\{onComparePair\} onBrowse=\{onBrowse\}\/>/);
  assert.match(hero,/onClick=\{onBrowse\}/);
  assert.match(hero,/onClick=\{onCompare\}/);
  assert.match(hero,/onClick=\{\(\)=>onBrand\(pick\.name\)\}/);
  assert.match(hero,/onClick=\{onMotionToggle\}/);
  assert.match(hero,/aria-pressed=\{motion\}/);
  assert.match(hero,/A clearer decision/);
  assert.doesNotMatch(hero,/YOUR MISSION|EXPLORE THE GALAXY|SHOOTING STARS/i);
});

test('live demonstration uses genuine model names and specs with noninvented values',()=>{
  assert.match(flow,/selectTopModels\(catalog,24\)/);
  assert.match(flow,/p\.dataQuality/);
  assert.match(flow,/manufacturer-sourced profiles/);
  assert.match(flow,/p\.screen/);
  assert.match(flow,/p\.chip/);
  assert.match(flow,/p\.battery/);
  assert.match(flow,/Not listed/);
  assert.match(flow,/id="relay-first-phone"/);
  assert.match(flow,/id="relay-second-phone"/);
  assert.match(flow,/options\.filter\(p=>p\.id!==first\?\.id\)/);
  assert.match(flow,/disabled=\{!valid\}/);
  assert.match(flow,/onComparePair\(first\.id,second\.id\)/);
  assert.match(flow,/onClick=\{onBrowse\}/);
  assert.doesNotMatch(flow,/Math\.random|fakePrice|mockData/);
});

test('workflow pair selection opens the existing real three-slot comparison tool',()=>{
  assert.match(app,/import RelayMotion from '\.\/RelayMotion\.jsx'/);
  assert.match(app,/import SmoothScroll from '\.\/SmoothScroll\.jsx'/);
  assert.match(app,/onComparePair=\{compareFromFlow\}/);
  assert.match(app,/const compareFromFlow=\(firstId,secondId\)=>/);
  assert.match(app,/setCompareSlots\(\[firstId,secondId,null\]\);goCompare\(\)/);
  assert.match(app,/<ComparePhoneSelectors catalog=\{catalog\}/);
  assert.match(app,/<PhoneGrid title="Top 40 phones to explore"/);
  assert.match(app,/mergeOfficialSpecs\(data,\.\.\.overlays\)/);
});

test('light beams are static SVG assets, noninteractive and motion optional',()=>{
  assert.match(field,/aria-hidden="true"/);
  assert.match(field,/relay-signal-field--paused/);
  assert.match(field,/relay-signal-field__beams/);
  assert.match(css,/@keyframes relay-beam-drift/);
  assert.match(css,/@keyframes relay-workflow-signal/);
  assert.match(css,/\.relay-signal-field--paused \.relay-signal-field__beams path/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/@media\(prefers-reduced-data:reduce\)/);
  assert.match(css,/\.relay-signal-field\{[\s\S]*?pointer-events:none/);
});

test('Lenis is an on-demand lightweight enhancement with complete cleanup',()=>{
  assert.match(packageJson.dependencies.lenis,/^\^1\./);
  assert.match(smooth,/shouldSkipScrollEffects\(getMobileCapabilities\(\)\)/);
  assert.match(smooth,/import\('lenis'\)/);
  assert.match(smooth,/import\('lenis\/dist\/lenis\.css'\)/);
  assert.match(smooth,/autoRaf:true/);
  assert.match(smooth,/syncTouch:false/);
  assert.match(smooth,/respectReducedMotion:true/);
  assert.match(smooth,/lenis\.destroy\(\)/);
  assert.match(smooth,/lenis\.on\('scroll',onScroll\)/);
  assert.match(smooth,/ScrollTrigger\.update\(\)/);
  assert.match(app,/<SmoothScroll active=\{!page&&!showCompare&&orbitMotion\}\/>/);
});

test('GSAP sequences only editorial content on capable devices and reverts on navigation',()=>{
  assert.match(motion,/shouldSkipScrollEffects\(getMobileCapabilities\(\)\)/);
  assert.match(motion,/import\('gsap'\)/);
  assert.match(motion,/import\('gsap\/ScrollTrigger'\)/);
  assert.match(motion,/gsap\.context/);
  assert.match(motion,/\.relay-reveal/);
  assert.match(motion,/context\?\.revert\(\)/);
  assert.match(app,/<RelayMotion active=\{!page&&!showCompare&&orbitMotion\}\/>/);
});

test('styles use subtle high-end dark and light palettes with mobile fallback',()=>{
  assert.match(app,/import '\.\/elegance\.css';import '\.\/relay\.css'/);
  assert.match(css,/--signal:#cbf09d/);
  assert.match(css,/html\[data-theme=light\]/);
  assert.match(css,/\.relay-decision__grid\{[\s\S]*?grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:820px\)\{[\s\S]*?\.relay-decision__grid\{grid-template-columns:1fr/);
  assert.match(css,/\.relay-step select:focus-visible/);
  assert.match(css,/\.relay-step__action:disabled/);
});
