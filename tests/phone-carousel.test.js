import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {brandGroups} from '../catalog-order.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app=read('src.jsx');
const rail=read('PhoneCarousel.jsx');
const css=read('style.css');

test('brand sections expose every model instead of four previews',()=>{
  const models=Array.from({length:31},(_,index)=>({
    id:'device-'+index,name:'Example '+index,brand:'Example',year:2026
  }));
  const [group]=brandGroups(models,{},models.length);
  assert.equal(group.count,31);
  assert.equal(group.phones.length,31);
  assert.match(app,/brandGroups\(catalog,prices,catalog\.length,sort\)/);
  assert.match(app,/phones=\{group\.phones\}/);
});

test('main page and All models use the same arrow carousel',()=>{
  assert.match(app,/import PhoneCarousel from '\.\/PhoneCarousel\.jsx'/);
  assert.match(app,/phones=\{filtered\}/);
  assert.match(app,/All models <span/);
  assert.match(app,/showAllModels/);
  assert.match(app,/setShowAllModels\(true\)/);
});

test('arrows work with keyboard and load models progressively',()=>{
  assert.match(rail,/ChevronLeft,ChevronRight/);
  assert.match(rail,/aria-label=\{`Previous /);
  assert.match(rail,/aria-label=\{`Next /);
  assert.match(rail,/ArrowLeft/);
  assert.match(rail,/ArrowRight/);
  assert.match(rail,/phones\.slice\(0,visibleCount\)/);
  assert.match(rail,/setVisibleCount\(count=>Math\.min\(count\+NEXT_BATCH,phones\.length\)\)/);
  assert.match(rail,/onScroll=\{onScroll\}/);
  assert.match(css,/scroll-snap-type:x mandatory/);
  assert.match(css,/@media\(max-width:700px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
