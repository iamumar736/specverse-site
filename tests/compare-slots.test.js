import test from 'node:test';
import assert from 'node:assert/strict';
import {EMPTY_COMPARE_SLOTS,updateComparisonSlot,toggleComparisonPhone,selectedComparisonIds} from '../compare-slots.js';

test('three independently searchable comparison slots retain positions',()=>{
  let slots=[...EMPTY_COMPARE_SLOTS];
  slots=updateComparisonSlot(slots,2,'iphone');
  assert.deepEqual(slots,[null,null,'iphone']);
  slots=updateComparisonSlot(slots,0,'samsung');
  assert.deepEqual(slots,['samsung',null,'iphone']);
  slots=updateComparisonSlot(slots,2,'pixel');
  assert.deepEqual(slots,['samsung',null,'pixel']);
  assert.deepEqual(selectedComparisonIds(slots),['samsung','pixel']);
});

test('duplicate phones cannot occupy multiple slots',()=>{
  const slots=['iphone',null,'pixel'];
  assert.strictEqual(updateComparisonSlot(slots,1,'iphone'),slots);
  assert.deepEqual(updateComparisonSlot(slots,1,'samsung'),['iphone','samsung','pixel']);
});

test('removing, replacing and catalog toggles keep compare choices synchronized',()=>{
  let slots=['iphone','samsung','pixel'];
  slots=updateComparisonSlot(slots,1,null);
  assert.deepEqual(slots,['iphone',null,'pixel']);
  slots=toggleComparisonPhone(slots,'motorola');
  assert.deepEqual(slots,['iphone','motorola','pixel']);
  slots=toggleComparisonPhone(slots,'iphone');
  assert.deepEqual(slots,[null,'motorola','pixel']);
  assert.strictEqual(toggleComparisonPhone(['a','b','c'],'fourth')[0],'a');
  assert.deepEqual(updateComparisonSlot(slots,7,'unknown'),slots);
});
