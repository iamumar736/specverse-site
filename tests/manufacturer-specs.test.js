import test from 'node:test';import assert from 'node:assert/strict';
import {mergeOfficialSpecs} from '../manufacturer-specs.js';
test('verified manufacturer values override placeholders but preserve identity and image',()=>{
 const phones=[{id:'iphone-17',name:'iPhone 17',brand:'Apple',image:'test.svg',camera:null,chip:null},{id:'s23',name:'Galaxy S23',brand:'Samsung'}];
 const a={'iphone-17':{name:'Wrong',brand:'Fake',image:'bad',camera:'48 MP',sourceUrl:'https://support.apple.com/en-us/123'}};
 const s={s23:{chip:'Snapdragon 8 Gen 2'}};
 const result=mergeOfficialSpecs(phones,a,s);
 assert.deepEqual(result[0],{...phones[0],camera:'48 MP',sourceUrl:'https://support.apple.com/en-us/123'});
 assert.equal(result[1].chip,'Snapdragon 8 Gen 2');
});
