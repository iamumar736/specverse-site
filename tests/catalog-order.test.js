import test from 'node:test';
import assert from 'node:assert/strict';
import {comparePhones,orderedBrands,searchScore} from '../catalog-order.js';

const phone=(id,name,brand='Samsung',year=2025)=>({id,name,brand,year});
const priced={
  'expensive':{PKR:{amount:400000,sourceUrl:'https://example.com/p1'}},
  'cheap':{PKR:{amount:180000,sourceUrl:'https://example.com/p2'}}
};
test('matching search results show highest verified price first',()=>{
  const entries=[phone('cheap','Galaxy S24'),phone('none','Galaxy S26'),phone('expensive','Galaxy S25')];
  const result=entries.sort((a,b)=>comparePhones(a,b,priced,'premium','Galaxy S'));
  assert.deepEqual(result.map(x=>x.id),['expensive','cheap','none']);
});
test('newest appears first when no verified price is available',()=>{
  const entries=[phone('old','Pixel 8','Google',2023),phone('new','Pixel 10','Google',2025),phone('middle','Pixel 9','Google',2024)];
  entries.sort((a,b)=>comparePhones(a,b,{},'premium','Pixel'));
  assert.deepEqual(entries.map(x=>x.id),['new','middle','old']);
});
test('different currencies must not be numerically compared',()=>{
  const entries=[phone('usd','Pixel 9 Pro','Google',2024),phone('pkr','Pixel 10 Pro','Google',2025)];
  const prices={usd:{USD:{amount:1200,sourceUrl:'https://example.com/usd'}},pkr:{PKR:{amount:400000,sourceUrl:'https://example.com/pkr'}}};
  entries.sort((a,b)=>comparePhones(a,b,prices,'premium','Pixel'));
  assert.equal(entries[0].id,'pkr');
});
test('exact model search ranks above broader matches',()=>{
  assert.ok(searchScore(phone('a','Galaxy S25 Ultra'),'Galaxy S25 Ultra')>searchScore(phone('b','Galaxy S25 Ultra Plus'),'Galaxy S25 Ultra'));
});
test('featured brands before alphabetic remaining brands',()=>{
  assert.deepEqual(orderedBrands([phone('a','1','ZTE'),phone('b','2','Samsung'),phone('c','3','Apple'),phone('d','4','Motorola'),phone('e','5','Alcatel')]),['Apple','Samsung','Motorola','Alcatel','ZTE']);
});
