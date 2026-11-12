import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {shouldAutoload3D,shouldSkipScrollEffects} from '../mobile-performance.js';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('3D automatically loads only for sufficiently capable desktop devices',()=>{
  assert.equal(shouldAutoload3D({width:1440,cores:8,memory:8}),true);
  assert.equal(shouldAutoload3D({width:390,cores:8,memory:8}),false);
  assert.equal(shouldAutoload3D({width:1024,coarsePointer:true,cores:8}),false);
  assert.equal(shouldAutoload3D({width:1440,saveData:true,cores:8}),false);
  assert.equal(shouldAutoload3D({width:1440,effectiveType:'3g',cores:8}),false);
  assert.equal(shouldAutoload3D({width:1440,cores:2}),false);
  assert.equal(shouldAutoload3D({width:1440,memory:2}),false);
  assert.equal(shouldAutoload3D({width:1440,reducedMotion:true}),false);
});

test('GSAP ScrollTrigger is not loaded on mobile, save-data, or reduced motion',()=>{
  assert.equal(shouldSkipScrollEffects({width:375}),true);
  assert.equal(shouldSkipScrollEffects({width:1024,saveData:true}),true);
  assert.equal(shouldSkipScrollEffects({width:1024,reducedMotion:true}),true);
  assert.equal(shouldSkipScrollEffects({width:1024}),false);
  assert.match(read('CatalogMotion.jsx'),/shouldSkipScrollEffects\(getMobileCapabilities\(\)\)/);
});

test('3D preview can be enabled manually, pauses offscreen and never blocks CSS fallback',()=>{
  const hero=read('HeroExperience.jsx');
  const scene=read('PhoneShowcase3D.jsx');
  assert.match(hero,/onClick=\{enable3D\}/);
  assert.match(hero,/hero-device rear/);
  assert.match(hero,/pageVisible/);
  assert.match(hero,/IntersectionObserver/);
  assert.match(scene,/frameloop=\{active&&!reducedMotion\?'always':'demand'\}/);
  assert.match(scene,/dpr=\{\[1,1\.25\]\}/);
  assert.match(scene,/autoRotate=\{active&&!reducedMotion\}/);
});

test('mobile CSS prevents perpetual image and background animation, preserves 44px tap targets',()=>{
  const css=read('style.css');
  assert.match(css,/@media\(max-width:820px\)/);
  assert.match(css,/min-width:44px/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/\.phone-art--motion img\{transform:none!important\}/);
  assert.match(css,/content-visibility:auto/);
  assert.match(css,/\.hero-3d-toggle/);
});

test('build budget and mobile Lighthouse CI workflows are configured',()=>{
  assert.match(read('scripts/check-mobile-bundle.mjs'),/180\*1024/);
  assert.match(read('.github/workflows/mobile-audit.yml'),/lhci autorun/);
  assert.match(read('.github/workflows/mobile-audit.yml'),/check:mobile-bundle/);
  assert.match(read('.lighthouserc.cjs'),/http:\/\/127\.0\.0\.1:4173\/games\//);
});
