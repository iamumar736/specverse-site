import {readFile,readdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {resolve,join} from 'node:path';

/**
 * Checks resources discovered from the built homepage HTML. Optional 3D and GSAP
 * chunks must stay outside the initial loading path. This is a guardrail, not a
 * replacement for real-device Lighthouse / Core Web Vitals measurements.
 */
const dir=resolve('dist');
const html=await readFile(join(dir,'index.html'),'utf8');
const files=[...new Set([...html.matchAll(/(?:src|href)=["'](\/?assets\/[^"']+\.(?:js|css))["']/g)].map(match=>match[1].replace(/^\//,'')))];
if(!files.some(file=>file.endsWith('.js')))throw Error('No startup JavaScript found in built HTML');
let bytes=0;
const details=[];
for(const file of files){
  const content=await readFile(join(dir,file));
  const compressed=gzipSync(content,{level:9}).byteLength;
  bytes+=compressed;
  details.push({file,gzipKB:Math.round(compressed/1024)});
}
const limit=180*1024;
console.log('Initial homepage assets (gzip KB):',JSON.stringify(details));
console.log('Total startup JavaScript/CSS:',Math.round(bytes/1024),'KB; limit:',limit/1024,'KB');
if(files.some(file=>/PhoneShowcase3D|ScrollTrigger|gsap-/i.test(file)))
  throw Error('A heavyweight optional animation module was incorrectly loaded by the homepage');
if(bytes>limit)throw Error('Homepage startup payload exceeded 180 KB gzip budget');
// Keep 3D off initial path and confirm build still produces on-demand scene.
const list=await readdir(join(dir,'assets'));
if(!list.some(file=>/^PhoneShowcase3D-.+\.js$/.test(file)))
  throw Error('Expected separately built lazy-loaded 3D module');
console.log('OK: 3D module remains code-split and startup budget is within limit.');
