import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BRAND_PALETTES,brandVisualStyle,paletteForBrand,placeholderKind} from '../brand-visuals.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('brands have distinct consistent palette accents and unknown brands get safe fallbacks',()=>{
  for(const name of ['Apple','Samsung','Google','Xiaomi','OPPO','Vivo','OnePlus','Nothing']){
    assert.ok(BRAND_PALETTES[name],name);
    const style=brandVisualStyle(name);
    assert.match(style['--phone-accent'],/^#[0-9a-f]{6}$/i);
    assert.match(style['--phone-secondary'],/^#[0-9a-f]{6}$/i);
    assert.match(style['--phone-panel'],/^#[0-9a-f]{6}$/i);
  }
  assert.equal(new Set(['Apple','Samsung','Google','Xiaomi','OPPO','Vivo','OnePlus'].map(
    name=>paletteForBrand(name)[0]
  )).size,7);
  assert.deepEqual(paletteForBrand('UnknownBrand'),paletteForBrand('UnknownBrand'));
  assert.deepEqual(paletteForBrand('Samsung'),paletteForBrand('samsung'));
});

test('different fold/slab families get tasteful concept art, not claimed real geometry',()=>{
  assert.equal(placeholderKind({name:'Galaxy Z Fold7',brand:'Samsung'}),'fold');
  assert.equal(placeholderKind({name:'Galaxy Z Flip6',brand:'Samsung'}),'flip');
  assert.equal(placeholderKind({name:'Pixel 10',brand:'Google'}),'pixel');
  assert.equal(placeholderKind({name:'iPhone 18 Pro',brand:'Apple'}),'iphone');
  assert.equal(placeholderKind({name:'Galaxy S25 Ultra',brand:'Samsung'}),'ultra');
  assert.equal(placeholderKind({name:'Nothing Phone (2)',brand:'Nothing'}),'glyph');
  assert.equal(placeholderKind({name:'OnePlus Ace 6',brand:'OnePlus'}),'slab');
});

test('unavailable product photos render original modern art with model label and disclosure',()=>{
  const card=read('PhonePlaceholderArt.jsx');
  const app=read('src.jsx');
  assert.match(card,/role="img"/);
  assert.match(card,/actual device appearance not verified/);
  assert.match(card,/Concept visual/);
  assert.match(card,/modern-phone-art__model/);
  assert.match(card,/modern-phone-art__camera-group/);
  assert.match(app,/import PhonePlaceholderArt from '\.\/PhonePlaceholderArt\.jsx'/);
  assert.match(app,/<PhonePlaceholderArt phone=\{p\}\/>/);
  assert.match(app,/style=\{brandVisualStyle\(p\.brand\)\}/);
  assert.match(app,/className="phone-card__brand"/);
  assert.match(app,/className="phone-name" title=\{p\.name\}/);
});

test('homepage uses quiet, decorative, deterministic device outlines',()=>{
  const ambient=read('AmbientBackground.jsx');
  const floating=read('FloatingTechBackground.jsx');
  const app=read('src.jsx');
  const refined=read('elegance.css');
  assert.match(app,/<AmbientBackground floating=\{!page&&!showCompare\} motion=\{orbitMotion\}\/>/);
  assert.match(ambient,/floating&&<FloatingTechBackground\/>/);
  assert.match(floating,/aria-hidden="true"/);
  assert.match(floating,/ambient-tech--refined/);
  assert.match(floating,/refined-ambience__phone/);
  assert.doesNotMatch(floating,/cosmic-meteor|cosmic-side|ambient-tech__wordmark|Math\.random|setInterval|setTimeout|<img|<canvas|<video/i);
  assert.match(refined,/@keyframes refined-outline-drift/);
  assert.match(refined,/ambient-tech--refined\{display:none!important\}/);
});

test('colors, text, hover animation, accessibility and reduced-motion behavior are styled',()=>{
  const css=read('style.css');
  assert.match(css,/\.phone-card \.phone-name\{[\s\S]*font:800/);
  assert.match(css,/\.modern-phone-art__model\{/);
  assert.match(css,/\.modern-phone-art--fold/);
  assert.match(css,/\.modern-phone-art--flip/);
  assert.match(css,/\.modern-phone-art--pixel/);
  assert.match(css,/\.phone-card:hover \.modern-phone-art__device/);
  assert.match(css,/html\[data-theme=light\] \.phone-card \.phone-name/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*?\.ambient-tech\{display:none!important\}/);
  assert.match(css,/@media\(prefers-reduced-data:reduce\)/);
});
