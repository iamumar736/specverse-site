import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const load=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const root='https://specverse.it.com/';

test('publicly indexable pages provide canonical titles, descriptions and semantic metadata',()=>{
  for(const [file,canonical,entry] of [
    ['index.html',root,'/src.jsx'],
    ['games/index.html',root+'games/','/games.jsx']
  ]){
    const html=load(file);
    assert.match(html,/<html lang="en">/);
    assert.match(html,/<title>[^<]+<\/title>/);
    assert.match(html,/<meta name="description" content="[^"]{65,180}"\/>/);
    assert.match(html,/<meta name="robots" content="index,follow,max-image-preview:large"\/>/);
    assert.ok(html.includes('<link rel="canonical" href="'+canonical+'"/>'),file);
    assert.ok(html.includes('<meta property="og:url" content="'+canonical+'"/>'));
    assert.ok(html.includes('<script type="module" src="'+entry+'"></script>'));
    assert.match(html,/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema['@context'],'https://schema.org');
    assert.equal(schema.url,canonical);
    assert.ok(!html.includes('google-site-verification'),'Never insert a made-up Google ownership token');
  }
});

test('sitemap contains the two real navigable HTML pages, not fake catalog routes',()=>{
  const xml=load('public/sitemap.xml');
  const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  assert.match(xml,/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.deepEqual(urls,[root,root+'games/']);
  assert.equal(new Set(urls).size,urls.length);
  assert.ok(urls.every(url=>url.startsWith(root)));
  assert.doesNotMatch(xml,/<lastmod>/);
  assert.doesNotMatch(xml,/\/phones\/|\/models\/|\/compare\/|\/device\//);
});

test('robots permits crawlers and points at the canonical sitemap',()=>{
  const robots=load('public/robots.txt');
  assert.match(robots,/User-agent: \*/i);
  assert.match(robots,/Allow: \//i);
  assert.ok(robots.includes('Sitemap: '+root+'sitemap.xml'));
  assert.doesNotMatch(robots,/Disallow: \/|noindex/i);
});

test('Google verification and indexing instructions are explicit and do not promise automatic ranking',()=>{
  const docs=load('README.md');
  assert.match(docs,/Search Console/);
  assert.match(docs,/https:\/\/search\.google\.com\/search-console/);
  assert.match(docs,/https:\/\/specverse\.it\.com\/sitemap\.xml/);
  assert.match(docs,/Google.*verification/i);
  assert.match(docs,/not guarantee indexing/i);
});
