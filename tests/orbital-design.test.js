import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isUsablePhonePhoto,selectUsablePhonePhoto} from '../photo-source-policy.js';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('only photographic raster image sources count as actual device photographs',()=>{
  assert.equal(isUsablePhonePhoto(''),false);
  assert.equal(isUsablePhonePhoto(null),false);
  assert.equal(isUsablePhonePhoto('/iphone-images/apple-iphone-18-pro.svg'),false);
  assert.equal(isUsablePhonePhoto('/images/generic-phone.png'),false);
  assert.equal(isUsablePhonePhoto('/models/default.webp'),false);
  assert.equal(isUsablePhonePhoto('/images/placeholder-phone.jpg'),false);
  assert.equal(isUsablePhonePhoto('/assets/device-concept.png'),false);
  assert.equal(isUsablePhonePhoto('https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/IPhone_16_Pro_Vector.svg/480px-IPhone_16_Pro_Vector.svg.png'),false);
  assert.equal(isUsablePhonePhoto('/images/apple-iphone-16-pro.jpg'),true);
  assert.equal(isUsablePhonePhoto('/device-visuals/samsung-galaxy-s24-ultra.webp'),true);
  assert.equal(isUsablePhonePhoto('https://example.com/model/image.png?w=300'),true);
  assert.equal(isUsablePhonePhoto('/images/bad%ZZ.jpg'),false);
  assert.equal(isUsablePhonePhoto('data:image/png;base64,AAAA'),false);
});
test('good photos stay ahead of generic/vector stand-ins',()=>{
  assert.equal(selectUsablePhonePhoto(['/iphone-images/a.svg','/images/my-model.jpg']),'/images/my-model.jpg');
  assert.equal(selectUsablePhonePhoto(['/default.png','/generic.svg']),null);
  assert.equal(selectUsablePhonePhoto([]),null);
});
test('cards respect the source policy, handle image errors and show a richer fallback',()=>{
  const app=read('src.jsx');
  const fallback=read('PhonePlaceholderArt.jsx');
  assert.match(app,/import \{selectUsablePhonePhoto,isUsablePhonePhoto\} from '\.\/photo-source-policy\.js'/);
  assert.match(app,/const preferred=selectUsablePhonePhoto\(candidates\)/);
  assert.match(app,/getPhoneImage\(p\),p\.image,getPhoneRemoteFallback\(p\)/);
  assert.match(app,/handleImageError/);
  assert.match(app,/<PhonePlaceholderArt phone=\{p\}\/>/);
  assert.match(fallback,/actual device appearance not verified/);
  assert.match(fallback,/modern-phone-art__camera-group/);
});
test('orbital side-rails are visible above the atmospheric backdrop but below the content',()=>{
  const background=read('FloatingTechBackground.jsx');
  const css=read('style.css');
  assert.match(background,/cosmic-side--left/);
  assert.match(background,/cosmic-side--right/);
  assert.match(background,/cosmic-side__phone--two/);
  assert.match(background,/cosmic-meteor--three/);
  assert.match(css,/#root>\.ambient-backdrop\{z-index:0/);
  assert.match(css,/#root>main\{position:relative;z-index:1\}/);
  assert.match(css,/@keyframes cosmic-phone-flight/);
  assert.match(css,/@keyframes cosmic-meteor-shoot/);
  assert.match(css,/\.cosmic-side__word/);
});
test('Orbit Mode is functional, remembers pause state, and allows reduced motion',()=>{
  const app=read('src.jsx');
  const hero=read('DiscoveryExperience.jsx');
  const ambient=read('AmbientBackground.jsx');
  const css=read('style.css');
  assert.match(app,/const\[orbitMotion,setOrbitMotion\]/);
  assert.match(app,/localStorage\.setItem\('specverse-orbit-motion'/);
  assert.match(app,/onMotionToggle=\{\(\)=>setOrbitMotion/);
  assert.match(hero,/aria-pressed=\{motion\}/);
  assert.match(hero,/onClick=\{onMotionToggle\}/);
  assert.match(hero,/Pause animated orbital background/);
  assert.match(ambient,/ambient-backdrop--paused/);
  assert.match(css,/\.ambient-backdrop--paused \*/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\.ambient-tech,\.cosmic-side,\.cosmic-meteor\{display:none!important\}/);
});

test('interactive 3D inspection is optional, lazy-loaded and labeled as concept geometry',()=>{
  const details=read('DetailConceptExperience.jsx');
  const viewer=read('DeviceConcept3D.jsx');
  const app=read('src.jsx');
  const css=read('style.css');
  assert.match(app,/<DetailConceptExperience phone=\{page\}\/>/);
  assert.match(details,/lazy\(\(\)=>import\('\.\/DeviceConcept3D\.jsx'\)\)/);
  assert.match(details,/onClick=\{open\?\(\)=>setOpen\(false\):launch\}/);
  assert.match(details,/NOT EXACT DEVICE GEOMETRY/);
  assert.match(details,/hasWebGL\(\)/);
  assert.match(viewer,/Canvas camera=\{\{position:/);
  assert.match(viewer,/useMemo\(\(\)=>/);
  assert.match(viewer,/OrbitControls enablePan=\{false\}/);
  assert.match(viewer,/placeholderKind\(phone\)/);
  assert.match(css,/\.detail-concept-viewport\{/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
