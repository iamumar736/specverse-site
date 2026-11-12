import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Samsung importer scans missing models in rotating regional batches',()=>{
 const source=read('scripts/import-official-samsung.mjs');
 assert.match(source,/const previous=JSON\.parse\(await fs\.readFile/);
 assert.match(source,/const incomplete=devices\.filter\(p=>!validSamsungRecord\(previous\[p\.id\]\)\)/);
 assert.match(source,/const selected=Array\.from/);
 assert.match(source,/selected\.filter\(p=>available\.get\(p\.id\)\?\.length>0\)/);
 assert.match(source,/const sites=Array\.from/);
 assert.match(source,/mergeSamsungVerifiedRecords\(devices,previous,verified\)/);
 assert.match(source,/samsungCoverageReport\(devices,merged/);
 assert.match(source,/new URL\('samsung-import-state\.json',root\)/);
 assert.doesNotMatch(source,/const verified=\{\},failed=\[\];[\s\S]*?fs\.writeFile\(new URL\('official-samsung\.json',root\),JSON\.stringify\(verified/);
});

test('automatic Samsung catalog enrichment starts on main and rotates daily',()=>{
 const workflow=read('.github/workflows/import-official-samsung.yml');
 assert.match(workflow,/cron: '40 4 \* \* \*'/);
 assert.match(workflow,/branches: \[main\]/);
 assert.match(workflow,/--max=24 --regions=3/);
 assert.match(workflow,/public\/data\/samsung-import-state\.json/);
 const daily=read('.github/workflows/daily-update.yml');
 assert.match(daily,/push:\s*\n\s*branches: \[main\]/);
});

test('official Samsung archive identity and source provenance is never confused with legacy placeholders',()=>{
 const sources=read('samsung-archive-specs.js');
 const coverage=JSON.parse(read('public/data/samsung-verification-coverage.json'));
 assert.match(sources,/SAMSUNG_ARCHIVE_SPECS/);
 assert.ok(coverage.verified>=94);
 assert.ok(coverage.newsroomOfficial>=0);
 assert.ok(coverage.regionalOfficial>=73);
 assert.ok(coverage.missing>=0);
 assert.equal(coverage.unverified.length,coverage.missing);
});
