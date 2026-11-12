import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const hero=read('DiscoveryExperience.jsx');
const floating=read('FloatingTechBackground.jsx');
const styles=read('elegance.css');
const app=read('src.jsx');
const dock=read('MobileDock.jsx');

test('editorial presentation uses calm, useful language instead of space arcade copy',()=>{
  assert.match(hero,/A BETTER WAY TO CHOOSE/);
  assert.match(hero,/The right phone/);
  assert.match(hero,/A clearer decision/);
  assert.match(hero,/Browse smartphones/);
  assert.match(hero,/Compare models/);
  assert.doesNotMatch(hero,/MISSION|YOUR MISSION|EXPLORE THE GALAXY|ORBIT MODE|EXPLORATION STATION|studio-ribbon|cosmic-meteor/i);
  assert.match(hero,/catalog\.length/);
  assert.match(hero,/counts\.size/);
  assert.match(hero,/<HeroExperience\/>/);
});

test('moving logo pills and meteors are removed; only subtle CSS phone outlines remain',()=>{
  assert.match(floating,/ambient-tech--refined/);
  assert.match(floating,/refined-ambience__phone/);
  assert.doesNotMatch(floating,/cosmic-meteor|cosmic-side|SAMSUNG|ONEPLUS|NOTHING|Math\.random|setInterval|setTimeout/);
  assert.match(styles,/refined-outline-drift/);
  assert.match(styles,/refined-light-drift/);
  assert.match(styles,/\.ambient-backdrop__aurora--rose\{display:none\}/);
  assert.match(styles,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(styles,/\.refined-ambience__phone\{animation:none!important\}/);
});

test('the refined stylesheet is loaded after legacy CSS and supports both light and dark',()=>{
  assert.match(app,/import '\.\/style\.css';import '\.\/elegance\.css'/);
  assert.match(styles,/--ref-panel:#191d22/);
  assert.match(styles,/--ref-bg:#f8f8f6/);
  assert.match(styles,/color-scheme:dark/);
  assert.match(styles,/color-scheme:light/);
  assert.match(styles,/\.studio-primary::after\{display:none\}/);
  assert.match(styles,/\.studio-path__shine\{display:none\}/);
  assert.match(styles,/\.phone-card .phone-name\{/);
});

test('games remain accessible without dominating the core phone navigation',()=>{
  assert.match(app,/<footer>[\s\S]*href="\/games\/"/);
  assert.doesNotMatch(dock,/Gamepad2|href="\/games\/"/);
  assert.match(dock,/onClick=\{onHome\}/);
  assert.match(dock,/onClick=\{onBrowse\}/);
  assert.match(dock,/onClick=\{onCompare\}/);
  assert.match(styles,/\.studio-dock\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
});

test('real product functionality and accessible motion controls remain available',()=>{
  assert.match(hero,/onClick=\{onBrowse\}/);
  assert.match(hero,/onClick=\{onCompare\}/);
  assert.match(hero,/onClick=\{\(\)=>onBrand\(pick\.name\)\}/);
  assert.match(hero,/aria-pressed=\{motion\}/);
  assert.match(hero,/onClick=\{onMotionToggle\}/);
  assert.match(app,/<PhoneGrid title="Top 40 phones to explore"/);
  assert.match(app,/<DetailConceptExperience phone=\{page\}\/>/);
  assert.match(app,/mergeOfficialSpecs\(data,\.\.\.overlays\)/);
  assert.match(styles,/button:focus-visible,a:focus-visible,input:focus-visible/);
});
