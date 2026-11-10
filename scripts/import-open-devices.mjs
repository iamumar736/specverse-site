/**
 * Imports factual Android device names from DeviceFarmer (CC BY-SA 4.0).
 * Source: https://github.com/DeviceFarmer/stf-device-db
 * Google's original manufacturer/model identifiers have no stated Google license.
 * This is NOT a complete list of phones and no missing specifications are fabricated.
 */
import fs from 'node:fs/promises';
const out = new URL('../public/data/imported.json', import.meta.url);
const source = 'https://raw.githubusercontent.com/DeviceFarmer/stf-device-db/master/dist/devices.json';
const aliases = {
  'xiaomi':'Xiaomi','redmi':'Redmi','poco':'POCO','oppo':'OPPO','vivo':'Vivo',
  'realme':'Realme','motorola':'Motorola','oneplus':'OnePlus','huawei':'Huawei',
  'honor':'Honor','infinix':'Infinix','tecno':'Tecno','tecno mobile':'Tecno',
  'itel':'Itel','zte':'ZTE','asus':'ASUS','sony':'Sony','nokia':'Nokia','hmd':'HMD',
  'lge':'LG','tct (alcatel)':'Alcatel','htc':'HTC','nothing':'Nothing',
  'cmf by nothing':'Nothing','blackberry':'BlackBerry','lenovo':'Lenovo',
  'oukitel':'Oukitel','google':'Google','ulefone':'Ulefone','doogee':'Doogee',
  'cubot':'Cubot','meizu':'Meizu','sharp':'Sharp','tcl':'TCL','fairphone':'Fairphone',
  'micromax':'Micromax','lava':'Lava','panasonic':'Panasonic','gionee':'Gionee',
  'leeco':'LeEco','microsoft':'Microsoft Lumia','sony ericsson':'Sony Ericsson',
  'palm':'Palm','essential':'Essential','cat':'CAT Phones','cat phones':'CAT Phones',
  'agm':'AGM','blackview':'Blackview','nubia':'Nubia','redmagic':'RedMagic','iqoo':'iQOO'
};
const families = {
 'ZTE':/^(?:ZTE|Blade|Axon|Nubia|Libero|Voyage|Grand|Kis|Skate|Tempo|V\d|A\d|S\d|X\d|F\d|N\d|Maven|Sonata|Warp|Cymbal|Max|Optik|Score|Imperial|Racer|Avid|Vantage|Visible)/i,
 'Alcatel':/^(?:alcatel|one\s?touch|pop|pixi|idol|shine|1x|1v|3v|3x|5v|1\b|3\b|5\b|a\d|u\d|onetouch|pulsemix|ideal)/i,
 'Lenovo':/^(?:Lenovo|Vibe|Phab|Legion|Moto|K\d|S\d|Z\d|A\d|P\d)/i,
 'LG':/^(?:LG|G\d|V\d|K\d|Q\d|X\d|Optimus|Stylo|Wing|Velvet|Nexus|Tribute|Aristo|Rebel|Phoenix|Fortune|Leon|L\d|N\d|Spirit|Joy|G Flex)/i,
 'Sharp':/^(?:AQUOS|SHARP|Leitz|SENSE|BASIO|Simple|Android One|402SH|404SH|506SH)/i,
 'Huawei':/^(?:HUAWEI|Huawei|nova|Mate|P\d|Y\d|Enjoy|Ascend|G\d|Honor|Pocket|Pura)/i,
 'Google':/^(?:Pixel|Nexus)/i,
 'ASUS':/^(?:ASUS|Asus|Zenfone|ROG Phone|PadFone)/i,
 'Sony':/^(?:Xperia)/i,
 'Microsoft Lumia':/^(?:Lumia|Microsoft)/i,
 'Motorola':/^(?:Motorola|moto|Moto|Droid|Razr|Edge|Milestone|One|Defy|Photon|Atrix|G\d|E\d|X\d)/i,
 'HTC':/^(?:HTC|Desire|One|U\d|Wildfire|EVO|Butterfly|Sensation|Incredible|10\b)/i,
 'OnePlus':/^(?:OnePlus|One\b|Nord|Ace|\d{1,2}(?:R|T| Pro| 5G|$))/i,
 'Realme':/^(?:realme|narzo|GT\b|P\d|C\d|X\d|Q\d|V\d|\d{1,2}(?: Pro| 5G|$))/i,
 'Vivo':/^(?:vivo|iQOO|NEX|X\d|Y\d|V\d|S\d|T\d|Z\d|U\d)/i,
 'OPPO':/^(?:OPPO|Oppo|Find|Reno|Ace|A\d|F\d|K\d|R\d|N\d|U\d)/i,
 'Xiaomi':/^(?:Xiaomi|Mi\s|MIX|Civi|Redmi|POCO|Black Shark|Hong Mi|HM\s|\d{1,2}(?:T| Pro| Ultra| Lite|$))/i,
 'Tecno':/^(?:TECNO|CAMON|SPARK|POVA|PHANTOM|POP|F\d|S\d)/i,
 'Infinix':/^(?:Infinix|HOT|NOTE|ZERO|SMART|GT\b|S\d|X\d)/i,
 'Itel':/^(?:itel|A\d|S\d|P\d|Vision|RS\d|POWER)/i
};
// Android device directories also include televisions, tablets, wearables and test hardware.
const nonPhone = /\b(?:smart\s*tv|android\s*tv|tv|television|tablet|tab(?:let)?\b|tab\d|pad|watch|wristband|fitband|projector|chromebook|chromebox|smartbox|tvbox|set.top|tv stick|car |automotive|emulator|monitor|smart.?display|laptop|notebook|pixelbook|thinkpad|ideapad|netbook|e.reader|audio|refrigerator|toy|camera|speaker|home hub|tkee|home appliance)\b/i;
const key = s => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'');
const slug = s => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const response = await fetch(source, {headers:{'Accept':'application/json','User-Agent':'SpecVerse/1.2 (device catalog; github.com/iamumar736/specverse-site)'},signal:AbortSignal.timeout(45000)});
if(!response.ok)throw new Error('DeviceFarmer HTTP '+response.status);
const payload = await response.json();
if(!payload?.models || Object.keys(payload.models).length < 1000)throw new Error('Unexpected/empty DeviceFarmer response');
const found = new Map();
for(const [modelCode, value] of Object.entries(payload.models)){
  let brand = aliases[String(value?.b||'').trim().toLowerCase()];
  const name = String(value?.m||'').trim().replace(/\s+/g,' ');
  if(!brand)continue;
  if(/^iqoo\b/i.test(name))brand='iQOO';
  else if(/^redmagic|^red magic/i.test(name))brand='RedMagic';
  else if(/^nubia\b/i.test(name))brand='Nubia';
  else if(/^poco\b/i.test(name))brand='POCO';
  else if(/^redmi\b/i.test(name))brand='Redmi';
  if(!name||name.length<2||name.length>90||nonPhone.test(name)
     || /^(?:android|device|phone|unknown|default|generic|test|prototype|google)$/i.test(name)
     || /^\d+$/.test(name)||key(name)===key(brand))continue;
  if(key(name)===key(modelCode)&&/^[a-z]{0,5}\d{3,}$/i.test(name))continue;
  if(/^(?:[a-z]{1,4}\d{5,}|[0-9a-z]{12,})$/i.test(name))continue;
  if(families[brand]&&!families[brand].test(name))continue;
  const identity=key(brand)+'|'+key(name);
  if(!found.has(identity))found.set(identity,{
    id:'open-'+slug(brand)+'-'+slug(name),brand,name,
    sourceName:'DeviceFarmer open device database / Google Play identifiers',
    sourceUrl:'https://github.com/DeviceFarmer/stf-device-db',
    dataLicense:'CC BY-SA 4.0',
    dataQuality:'open-data-identity-category-inferred',
    models:''
  });
  const item=found.get(identity);
  const modelCodes=item.models?item.models.split(', '):[];
  if(modelCodes.length<6 && !modelCodes.includes(modelCode))item.models=[...modelCodes,modelCode].join(', ');
  if(!item.year && /^\d{4}-\d{2}-\d{2}$/.test(value.d||'')){
    const y=Number(value.d.slice(0,4));
    if(y>=1990&&y<=new Date().getUTCFullYear())item.year=y;
  }
  if(!item.chip && value.c?.name){
    item.chip=String(value.c.name).slice(0,160)+' (documented variant)';
    item.fieldSources={...(item.fieldSources||{}),chip:'LineageOS Wiki via DeviceFarmer'};
  }
  if(!item.ram && value.y?.ram>=256 && value.y?.ram<=65536){
    item.ram=(Number(value.y.ram)/1024)+' GB (documented variant)';
  }
  if(!item.storage && value.y?.rom>=1 && value.y?.rom<=2048){
    item.storage=value.y.rom+' GB (documented variant)';
  }
}
const devices=[...found.values()].sort((a,b)=>a.brand.localeCompare(b.brand)||a.name.localeCompare(b.name));
if(devices.length<1000)throw new Error('Too few candidate phones; refusing to overwrite catalog');
await fs.mkdir(new URL('../public/data/',import.meta.url),{recursive:true});
await fs.writeFile(out,JSON.stringify(devices,null,2)+'\n');
console.log('Imported '+devices.length+' distinct Android phone candidates across '+new Set(devices.map(d=>d.brand)).size+' brands (data quality marked; non-phone terms filtered).');
