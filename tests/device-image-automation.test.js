import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  modelMatches,eligibleLicense,isOfficialBrandUrl,isCommonsMediaUrl,
  safeImageEntry,isSafeLocalImage
} from '../device-image-verification.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('model-matched image names reject wrong variants, concept art, and cases',()=>{
  assert.equal(modelMatches('iPhone 17e','IPhone 17e Vector.svg'),true);
  assert.equal(modelMatches('iPhone 18 Pro Max','IPhone 18 Pro Max (burgundy model) - 1.jpg'),true);
  assert.equal(modelMatches('iPhone 18 Pro','IPhone 18 Pro Max Vector.svg'),false);
  assert.equal(modelMatches('Galaxy S24','Samsung Galaxy S24 Ultra.jpg'),false);
  assert.equal(modelMatches('Galaxy S24 Ultra','Samsung Galaxy S24 Ultra blue.jpeg'),true);
  assert.equal(modelMatches('Galaxy S24 Ultra','Samsung Galaxy S24 Ultra concept render.png'),false);
  assert.equal(modelMatches('Galaxy S24 Ultra','Galaxy S24 Ultra case.jpg'),false);
  assert.equal(modelMatches('iPhone 18','iPhone 18 leaked dummy.png'),false);
});

test('licensed media check rejects noncommercial, derivative-prohibited, unknown sources',()=>{
  const license=url=>({LicenseUrl:{value:url}});
  assert.equal(eligibleLicense(license('https://creativecommons.org/licenses/by/4.0/')),true);
  assert.equal(eligibleLicense(license('https://creativecommons.org/licenses/by-sa/4.0/')),true);
  assert.equal(eligibleLicense(license('https://creativecommons.org/publicdomain/zero/1.0/')),true);
  assert.equal(eligibleLicense(license('https://creativecommons.org/licenses/by-nc/4.0/')),false);
  assert.equal(eligibleLicense(license('https://creativecommons.org/licenses/by-nd/4.0/')),false);
  assert.equal(eligibleLicense(license('https://example.com/custom-license')),false);
  assert.equal(eligibleLicense({}),false);
});

test('official and Wikimedia domains cannot be forged by subdomain lookalikes',()=>{
  assert.equal(isOfficialBrandUrl('Apple','https://support.apple.com/en-us/12345'),true);
  assert.equal(isOfficialBrandUrl('Samsung','https://www.samsung.com/pk/smartphones/galaxy-s/'),true);
  assert.equal(isOfficialBrandUrl('Samsung','https://samsung.com.bad-site.io/phone'),false);
  assert.equal(isOfficialBrandUrl('Apple','http://apple.com/device'),false);
  assert.equal(isCommonsMediaUrl('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/image.jpg'),true);
  assert.equal(isCommonsMediaUrl('https://upload.wikimedia.org.evil.invalid/wikipedia/commons/file.jpg'),false);
});

test('only known safe local media paths are published',()=>{
  assert.equal(isSafeLocalImage('/iphone-images/apple-iphone-17e.svg'),true);
  assert.equal(isSafeLocalImage('/device-visuals/galaxy-s24-ultra.jpg'),true);
  assert.equal(isSafeLocalImage('https://unverified.example/photo.jpg'),false);
  assert.equal(isSafeLocalImage('/device-visuals/../../index.html'),false);
  assert.equal(safeImageEntry({id:'apple-iphone-17e',name:'iPhone 17e'},{
    id:'apple-iphone-17e',file:'IPhone 17e Vector.svg',
    source:'https://commons.wikimedia.org/wiki/File:IPhone_17e_Vector.svg',
    local:'/iphone-images/apple-iphone-17e.svg'
  }),true);
});

test('UI uses verified-only motion, attribution, and reduced-motion fallback',()=>{
  const app=read('src.jsx'), component=read('DeviceVisuals.jsx'), css=read('style.css');
  assert.match(app,/DeviceVisualProvider/);
  assert.match(app,/phone-art--motion/);
  assert.match(app,/DeviceVisualCredit phone=\{page\}/);
  assert.match(component,/fetch\('\/data\/animated-device-images\.json'/);
  assert.match(component,/isSafeLocalImage\(entry\.image\)/);
  assert.match(css,/@keyframes specverse-device-float/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*?\.phone-art--motion img/);
  assert.match(app,/device-image-credits\.html/);
});

test('automation checks Commons online and only publishes safe downloaded images',()=>{
  const worker=read('scripts/update-animated-device-visuals.mjs');
  const workflow=read('.github/workflows/device-visuals.yml');
  assert.match(worker,/commons\.wikimedia\.org\/w\/api\.php/);
  assert.match(worker,/manufacturerEvidence\(phone,official\)/);
  assert.match(worker,/validateCommonsPage\(phone,page/);
  assert.match(worker,/licensedDetails\(info\.extmetadata\)/);
  assert.match(worker,/await fs\.writeFile\(rootFile\(manifestPath\)/);
  assert.match(workflow,/cron: '40 5 \* \* \*'/);
  assert.match(workflow,/npm test/);
  assert.match(workflow,/git add -A -- public\/data\/animated-device-images\.json/);
});
