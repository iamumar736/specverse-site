import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const publisher='ca-pub-1196332171109259';
const officialScript='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+publisher;

test('AdSense owner-provided code is correctly installed once in each real HTML page head',()=>{
  for(const path of ['index.html','games/index.html']){
    const html=read(path);
    const scriptTag='<script async src="'+officialScript+'" crossorigin="anonymous"></script>';
    assert.equal(html.split(scriptTag).length-1,1,path+' must have one exact AdSense script');
    assert.ok(html.indexOf(scriptTag)>html.indexOf('<head>'),path+' script is not in the head');
    assert.ok(html.indexOf(scriptTag)<html.indexOf('</head>'),path+' script is below the head');
    assert.ok(html.includes('name="robots" content="index,follow,max-image-preview:large"'));
    assert.ok(!html.includes('data-ad-slot="0000000"'),'Do not publish fake ad units');
  }
});
test('public ads.txt lists only the user's AdSense seller account',()=>{
  assert.equal(read('public/ads.txt'),
    'google.com, pub-1196332171109259, DIRECT, f08c47fec0942fa0\n');
});
test('website ownership files and other app routes remain intact',()=>{
  assert.equal(read('public/google4cf6fe8e0eed95a5.html').trim(),
    'google-site-verification: google4cf6fe8e0eed95a5.html');
  assert.match(read('index.html'),/src="\/src.jsx"/);
  assert.match(read('games/index.html'),/src="\/games.jsx"/);
  assert.match(read('public/robots.txt'),/Allow: \//);
  assert.match(read('public/sitemap.xml'),/https:\/\/specverse\.it\.com\//);
});
