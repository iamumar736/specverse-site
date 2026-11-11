import * as cheerio from 'cheerio';
for(const url of ['https://www.vivo.com/en/products/param/v25','https://www.vivo.com/en/products/param/t15g','https://www.vivo.com/pk/products/param/x200-pro']){
 const $=cheerio.load(await (await fetch(url)).text());
 const pairs=$('.attr-item').map((_,e)=>[$(e).find('.attr-item-name').first().text().trim(),$(e).find('.attr-item-text').first().text().trim().replace(/\s+/g,' ').slice(0,110)]).get();
 console.log('VIVO-KEYS',url,JSON.stringify(pairs.slice(0,80)));
}
