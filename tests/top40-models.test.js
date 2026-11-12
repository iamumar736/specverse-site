import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {selectTopModels,TOP_MODEL_COUNT,phoneFeatureScore} from '../top-models.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const grid=read('PhoneGrid.jsx');
const app=read('src.jsx');
const styles=read('style.css');

test('40 visible phones are selected from real catalog records, not invented entries',()=>{
 const brands=['Apple','Samsung','Google','Xiaomi','OnePlus','OPPO','Vivo','Honor','Motorola','Nothing'];
 const phones=brands.flatMap(brand=>Array.from({length:10},(_,index)=>({
   id:brand.toLowerCase()+'-'+index,
   name:brand+' Pro '+(index+1),
   brand,year:2026,screen:'AMOLED',
   camera:'50 MP',chip:'Chip',battery:'5000 mAh'
 })));
 const picks=selectTopModels(phones,TOP_MODEL_COUNT,2026);
 assert.equal(picks.length,40);
 assert.equal(new Set(picks.map(p=>p.id)).size,40);
 assert.ok(new Set(picks.map(p=>p.brand)).size>=8);
 for(const phone of picks)assert.ok(phones.includes(phone));
});
test('top models favor modern premium devices with manufacturer sources',()=>{
 const base={id:'one',name:'Phone 1',brand:'Apple',year:2026};
 const premium={...base,id:'two',name:'Phone 1 Pro Max',dataQuality:'official-specifications'};
 assert.ok(phoneFeatureScore(premium,2026)>phoneFeatureScore(base,2026));
 assert.equal(selectTopModels([base,base,premium],40,2026).length,2);
 assert.deepEqual(selectTopModels([],40,2026),[]);
 assert.equal(selectTopModels([base],40,2026).length,1);
});
test('home page and All models display a real 40-card grid instead of a 12-card swipe rail',()=>{
 assert.match(app,/title="Top 40 phones to explore"/);
 assert.match(app,/selectTopModels\(catalog\)/);
 assert.match(app,/phones=\{featured40\}/);
 assert.match(app,/phones=\{browseResults\} paginate/);
 assert.match(app,/featured40,\.\.\.filtered\.filter/);
 assert.match(grid,/export const GRID_PAGE_SIZE=40/);
 assert.match(grid,/phones\.slice\(current\*GRID_PAGE_SIZE,\(current\+1\)\*GRID_PAGE_SIZE\)/);
 assert.match(grid,/className="cards top-models-grid"/);
 assert.match(grid,/aria-label="Next 40 phones"/);
 assert.match(grid,/aria-label="Previous 40 phones"/);
 assert.match(grid,/aria-label="Jump to results page"/);
 assert.match(grid,/aria-live="polite"/);
});
test('40-card grid has four desktop columns and two mobile columns',()=>{
 assert.match(styles,/\.top-models-grid\.cards\{[\s\S]*?grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(styles,/@media\(max-width:700px\)\{\s*\.top-models-grid\.cards\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(styles,/content-visibility:auto/);
 assert.match(styles,/@media\(prefers-reduced-motion:reduce\)/);
});
