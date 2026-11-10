import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {IPHONE_IMAGE_FILES,getPhoneImage,getPhoneRemoteFallback,getIphoneImageInfo} from '../iphone-images.js';
test('all 55 curated Apple iPhone models have distinct source imagery',()=>{
  assert.equal(Object.keys(IPHONE_IMAGE_FILES).length,55);
  const files=new Set();
  for(const [id,{file,hash}] of Object.entries(IPHONE_IMAGE_FILES)){
    assert.equal(hash,createHash('md5').update(file.replaceAll(' ','_')).digest('hex').slice(0,2),id);
    assert.match(file,/\.(svg|jpg|jpeg|png)$/i);
    assert.ok(!files.has(file),'asset repeated '+file);
    files.add(file);
    const p={id,brand:'Apple',name:id};
    const art=getIphoneImageInfo(p);
    assert.ok(art.image.startsWith('/iphone-images/'+id));
    assert.ok(art.source.startsWith('https://commons.wikimedia.org/wiki/File:'));
    assert.equal(getPhoneImage(p),art.image);
    assert.equal(getPhoneRemoteFallback(p),art.remoteImage);
  }
  assert.equal(getPhoneImage({id:'galaxy-s24',brand:'Samsung',image:null}),null);
});
