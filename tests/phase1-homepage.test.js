import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../src.jsx',import.meta.url),'utf8');
const packageJson=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));

test('manual refresh captures all seven data feed responses',()=>{
  const refresh=source.slice(source.indexOf('const refresh=async()=>'),source.indexOf('const directory=useMemo'));
  assert.match(refresh,/const \[a,b,c,d,e,f,g\]=await Promise\.all\(/);
  assert.match(refresh,/mergeOfficialSpecs\(data,apple,samsung,oppo,vivo\)/);
});

test('homepage animation respects reduced motion and cleans up GSAP context',()=>{
  assert.ok(packageJson.dependencies.gsap);
  assert.match(source,/prefers-reduced-motion: reduce/);
  assert.match(source,/context\?\.revert\(\)/);
});
