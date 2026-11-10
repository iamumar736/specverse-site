import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PHONE_BRANDS,shuffle,makeLogoQuiz,makeLogoMatch} from '../mobile-games.js';

test('all mobile game logos are local SVG assets',()=>{
  assert.equal(PHONE_BRANDS.length,12);
  assert.equal(new Set(PHONE_BRANDS.map(x=>x.id)).size,PHONE_BRANDS.length);
  for(const item of PHONE_BRANDS){
    assert.match(item.logo,/^\/logos\/[a-z]+\.svg$/);
    assert.ok(fs.existsSync(new URL('../public'+item.logo,import.meta.url)),'Missing '+item.logo);
  }
});
test('shuffle preserves inputs and returns the same elements',()=>{
  const input=[1,2,3,4,5];const copy=[...input];
  const output=shuffle(input,()=>0.4);
  assert.deepEqual(input,copy);
  assert.deepEqual(output.slice().sort(),copy.slice().sort());
});
test('quiz presents eight unique correct logos with four distinct choices',()=>{
  const questions=makeLogoQuiz(8,()=>0.21);
  assert.equal(questions.length,8);
  assert.equal(new Set(questions.map(x=>x.answer.id)).size,8);
  for(const q of questions){
    assert.equal(q.choices.length,4);
    assert.equal(new Set(q.choices.map(x=>x.id)).size,4);
    assert.ok(q.choices.some(x=>x.id===q.answer.id));
  }
});
test('memory provides six paired brand logos with unique card identifiers',()=>{
  const deck=makeLogoMatch(6,()=>0.39);
  assert.equal(deck.length,12);
  assert.equal(new Set(deck.map(x=>x.key)).size,12);
  for(const brand of new Set(deck.map(x=>x.id)))assert.equal(deck.filter(x=>x.id===brand).length,2);
});
