import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app=read('src.jsx');
const discovery=read('DiscoveryExperience.jsx');
const dock=read('MobileDock.jsx');
const motion=read('StudioMotion.jsx');
const search=read('HeaderPhoneSearch.jsx');
const css=read('style.css');

test('discovery has real catalog-driven counts and meaningful action callbacks',()=>{
  assert.match(discovery,/catalog\.length/);
  assert.match(discovery,/counts\.size/);
  assert.match(discovery,/counts\.get\(pick\.name\)/);
  assert.match(discovery,/onClick=\{onBrowse\}/);
  assert.match(discovery,/onClick=\{onCompare\}/);
  assert.match(discovery,/onClick=\{\(\)=>onBrand\(pick\.name\)\}/);
  assert.match(discovery,/<HeroExperience\/>/);
  assert.match(app,/<DiscoveryExperience catalog=\{catalog\}/);
  assert.doesNotMatch(discovery,/onClick=\{undefined\}/);
});

test('mobile navigation uses real handlers and maintains destinations',()=>{
  assert.match(dock,/aria-label="Mobile navigation"/);
  assert.match(dock,/onClick=\{onHome\}/);
  assert.match(dock,/onClick=\{onBrowse\}/);
  assert.match(dock,/onClick=\{onCompare\}/);
  assert.doesNotMatch(dock,/href="\/games\/"/);
  assert.match(app,/<footer>[\s\S]*href="\/games\/"/);
  assert.match(dock,/aria-current=\{view==='compare'\?'page':undefined\}/);
  assert.match(app,/<MobileDock /);
});

test('search and main content have accessible keyboard navigation',()=>{
  assert.match(app,/className="skip-link" href="#main-content"/);
  assert.match(app,/<main id="main-content" tabIndex=\{-1\}/);
  assert.match(app,/<nav aria-label="Primary navigation">/);
  assert.match(search,/aria-keyshortcuts="\/"/);
  assert.match(search,/event\.key!=='\/'/);
  assert.match(search,/role="combobox"/);
  assert.match(search,/document\.removeEventListener\('keydown',handleShortcut\)/);
  assert.match(css,/\.skip-link:focus\{top:12px\}/);
  assert.match(css,/button:focus-visible,a:focus-visible/);
});

test('motion enhancement preserves accessible content and a reduced-motion fallback',()=>{
  assert.match(motion,/IntersectionObserver/);
  assert.match(motion,/prefers-reduced-motion: reduce/);
  assert.match(motion,/studio-pending/);
  assert.match(motion,/observer\.disconnect\(\)/);
  assert.match(app,/<StudioMotion active=\{!page&&!showCompare\}/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/studio-reveal\.studio-pending\{opacity:1!important/);
  assert.match(css,/@media\(max-width:820px\)/);
  assert.match(css,/studio-ribbon__track[\s\S]*animation:none!important/);
  assert.match(css,/content-visibility:auto/);
});

test('studio interaction animations use CSS and do not introduce a heavy new runtime library',()=>{
  const pkg=JSON.parse(read('package.json'));
  assert.ok(pkg.dependencies.react&&pkg.dependencies.gsap);
  for(const name of [
    'studio-orbit-turn','studio-bob','studio-gradient-slide',
    'studio-marquee','studio-button-sheen','studio-tray-arrive',
    'studio-hero-aura','studio-pulse'
  ])assert.ok(css.includes('@keyframes '+name),name);
  assert.match(css,/\.studio-path:hover/);
  assert.match(css,/\.studio-dock\{display:none\}/);
});
