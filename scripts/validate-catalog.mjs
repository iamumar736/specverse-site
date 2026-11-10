import fs from 'node:fs/promises';
const dir=new URL('../public/data/',import.meta.url);
const devices=JSON.parse(await fs.readFile(new URL('catalog.json',dir),'utf8'));
const keys=['screen','resolution','chip','camera','battery','charging','network','storage','ram','dimensions','weight','wifi','bluetooth','usb','os'];
const errors=[],warnings=[],seen=new Set();
const https=s=>{try{return new URL(s).protocol==='https:'}catch{return false}};
for(const [i,d] of devices.entries()){
 if(!d.id||!d.name||!d.brand)errors.push('Missing identity at index '+i);
 if(seen.has(d.id))errors.push('Duplicate id '+d.id);seen.add(d.id);
 if(d.year!=null&&(!Number.isInteger(d.year)||d.year<1990||d.year>new Date().getUTCFullYear()+2))errors.push('Implausible year '+d.id);
 if(d.sourceUrl&&!https(d.sourceUrl))errors.push('Invalid source URL '+d.id);
 if(d.image&&!https(d.image))warnings.push('Untrusted image URL '+d.id);
 if(d.dataQuality==='official-specifications'&&!d.sourceUrl)errors.push('Official claim missing source '+d.id);
 if(!keys.some(k=>d[k]!=null&&d[k]!==''))warnings.push('Model has no specifications '+d.id);
}
const report={checkedAt:new Date().toISOString(),deviceCount:devices.length,errors,warnings:warnings.slice(0,100),warningCount:warnings.length};
await fs.writeFile(new URL('validation.json',dir),JSON.stringify(report,null,2)+'\n');
console.log('Validated '+devices.length+' models; '+errors.length+' errors; '+warnings.length+' incomplete entries');
if(errors.length){console.error(errors.slice(0,20).join('\n'));process.exitCode=1;}
