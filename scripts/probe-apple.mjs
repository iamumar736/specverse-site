import * as cheerio from 'cheerio';
const base='https://support.apple.com/en-us/108044';
const html=await (await fetch(base)).text();const $=cheerio.load(html);
const specLinks=[];
$('a').each((_,el)=>{const label=$(el).text().replace(/\s+/g,' ').trim();if(/tech specs for iPhone/i.test(label)){specLinks.push({label,href:$(el).attr('href')})}});
console.log('Spec-links total',specLinks.length);
console.log('Links',JSON.stringify(specLinks.slice(0,65)));
for(const url of ['https://support.apple.com/en-us/111831','https://support.apple.com/en-us/125090','https://support.apple.com/en-us/148588']){
 const page=cheerio.load(await (await fetch(url)).text());
 const heads=page('h3.gb-header').map((_,el)=>({label:page(el).text().replace(/\s+/g,' ').trim(),parent:page(el).parent().prop('tagName'),lines:page(el).parent().find('p.gb-paragraph').map((_,p)=>page(p).text().replace(/\s+/g,' ').trim()).get().slice(0,5)})).get();
 console.log('Page',url,'headings-count',heads.length,'headings',JSON.stringify(heads.slice(0,27)));
}
