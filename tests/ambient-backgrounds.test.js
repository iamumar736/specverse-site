import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app=read('src.jsx');
const background=read('AmbientBackground.jsx');
const css=read('style.css');

test('ambient background mounts behind the app and cannot intercept clicks',()=>{
  assert.match(app,/import AmbientBackground from '\.\/AmbientBackground\.jsx'/);
  assert.match(app,/return <><AmbientBackground\/><header>/);
  assert.match(background,/aria-hidden="true"/);
  assert.match(css,/\.ambient-backdrop\s*\{[^}]*pointer-events:none/s);
  assert.match(css,/#root\s*\{[^}]*isolation:isolate/s);
});

test('aurora, stars and grid are present in dark and light modes',()=>{
  for(const layer of ['wash','grid','stars','aurora--violet','aurora--cyan','aurora--rose','vignette']){
    assert.ok(background.includes('ambient-backdrop__'+layer),layer);
  }
  assert.match(css,/html\[data-theme=light\] \.ambient-backdrop/);
  assert.match(css,/html\[data-theme=light\] \.hero/);
  assert.match(css,/\.hero-visual::before/);
});

test('reduced motion disables animation and mobile limits work',()=>{
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\.ambient-backdrop__aurora,\.ambient-backdrop__stars\s*\{\s*animation:none!important/s);
  assert.match(css,/@media\(max-width:700px\)/);
  assert.doesNotMatch(background,/<img|<video|<canvas/i);
});
