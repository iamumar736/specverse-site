import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const app=read('src.jsx');
const hero=read('HeroExperience.jsx');
const scene=read('PhoneShowcase3D.jsx');
const motion=read('CatalogMotion.jsx');
const mobile=read('mobile-performance.js');
const styles=read('style.css');
const pkg=JSON.parse(read('package.json'));

test('interactive hero is integrated and 3D libraries match React 19',()=>{
  assert.match(read('DiscoveryExperience.jsx'),/<HeroExperience\/>/);
  assert.match(app,/<DiscoveryExperience /);
  assert.match(hero,/lazy\(\(\)=>import\('\.\/PhoneShowcase3D\.jsx'\)\)/);
  assert.match(scene,/import \{Canvas\} from '@react-three\/fiber'/);
  assert.match(scene,/OrbitControls/);
  assert.match(pkg.dependencies['@react-three/fiber'],/^\^9\./);
  assert.ok(pkg.dependencies['@react-three/drei']);
  assert.ok(pkg.dependencies.three);
});

test('3D animation preserves fallback and reduced-motion access',()=>{
  assert.match(mobile,/prefers-reduced-motion: reduce/);
  assert.match(mobile,/connection\?\.saveData/);
  assert.match(hero,/supportsWebGL\(\)/);
  assert.match(hero,/IntersectionObserver/);
  assert.match(hero,/hero-device rear/);
  assert.match(styles,/hero-visual--3d-ready/);
});

test('catalog scroll animations clean up and respect reduced-motion preferences',()=>{
  assert.match(app,/<CatalogMotion /);
  assert.match(motion,/ScrollTrigger/);
  assert.match(motion,/context\?\.revert\(\)/);
  assert.match(motion,/shouldSkipScrollEffects\(getMobileCapabilities\(\)\)/);
});
