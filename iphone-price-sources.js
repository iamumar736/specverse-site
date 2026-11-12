// These exact model IDs have current retailer/Apple storefront evidence.
// Never derive prices by exchange-rate conversion, series number, or similarity.
export const RETAILER_MODELS=Object.freeze([
  {id:'apple-iphone-18-pro',name:'iPhone 18 Pro',slug:'apple-iphone-18-pro',minPKR:350000},
  {id:'apple-iphone-18-pro-max',name:'iPhone 18 Pro Max',slug:'apple-iphone-18-pro-max',minPKR:400000},
  {id:'apple-iphone-air',name:'iPhone Air',retailerName:'iPhone 17 Air',slug:'apple-iphone-17-air',minPKR:230000},
  {id:'apple-iphone-17',name:'iPhone 17',slug:'apple-iphone-17',minPKR:220000},
  {id:'apple-iphone-17-pro',name:'iPhone 17 Pro',slug:'apple-iphone-17-pro',minPKR:270000},
  {id:'apple-iphone-17-pro-max',name:'iPhone 17 Pro Max',slug:'apple-iphone-17-pro-max',minPKR:300000},
  {id:'apple-iphone-16',name:'iPhone 16',slug:'apple-iphone-16',minPKR:160000},
  {id:'apple-iphone-17e',name:'iPhone 17e',slug:'apple-iphone-17e',minPKR:160000},
  {id:'apple-iphone-15',name:'iPhone 15',slug:'apple-iphone-15',minPKR:150000}
]);
export const APPLE_SHOP_MODELS=Object.freeze([
  {id:'apple-iphone-duo',shopName:'iPhone Duo',minUSD:1500,maxUSD:3000},
  {id:'apple-iphone-18-pro',shopName:'iPhone 18 Pro & iPhone 18 Pro Max',minUSD:1000,maxUSD:2000},
  {id:'apple-iphone-air',shopName:'iPhone Air',minUSD:600,maxUSD:2000},
  {id:'apple-iphone-17',shopName:'iPhone 17',minUSD:600,maxUSD:1500},
  {id:'apple-iphone-17e',shopName:'iPhone 17e',minUSD:400,maxUSD:1200},
  {id:'apple-iphone-16',shopName:'iPhone 16',minUSD:400,maxUSD:1300}
]);
const text=markup=>String(markup||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ')
  .replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();
const normal=s=>String(s||'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const normalizeTitle=s=>normal(s).replace(/^apple\s+/,'').replace(/\s+(?:price in pakistan.*|buy now.*)$/,'').trim();

export function retailerPriceFromHtml(html,model){
  if(typeof html!=='string'||html.length<100)return null;
  const heading=html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||
    html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  if(!heading)return null;
  // Fail closed for the wrong generation / Pro / Max / Air.
  const title=normalizeTitle(text(heading));
  if(title!==normalizeTitle(model.retailerName||model.name))return null;
  const body=html.split(/<\/h1\s*>/i).slice(1).join('</h1>');
  const area=text(body||html).slice(0,1100);
  const beforeVariants=area.split(/\b(?:Colors|Colours|Storage|Buy Now)\b/i)[0];
  const match=beforeVariants.match(/(?:Rs\.?|PKR|₨)\s*([\d,]{4,10})(?:\.\d{1,2})?/i);
  if(!match)return null;
  const amount=Number(match[1].replace(/,/g,''));
  if(!Number.isInteger(amount)||amount<(model.minPKR||100000)||amount>3000000)return null;
  return amount;
}
export function appleShopPriceFromHtml(html,model){
  if(typeof html!=='string'||html.length<100)return null;
  // Apple storefront cards include the model heading followed by 'from $X'.
  const textContent=text(html).toLowerCase().replace(/[\u00a0\u202f]/g,' ');
  const wanted=String(model.shopName).toLowerCase().replace(/[\u00a0\u202f]/g,' ');
  const index=textContent.indexOf(wanted);
  if(index<0)return null;
  // Ignore mentions of a base model as a substring of Pro/Max variants.
  let cursor=index;
  for(let tries=0;tries<12&&cursor>=0;tries++){
    const next=textContent.slice(cursor+wanted.length).trimStart();
    const invalidVariant=/^(?:pro|max|plus|air|mini|e)\b/i.test(next)&&
      !/(?:pro|pro max|air|17e)$/i.test(wanted);
    const context=textContent.slice(cursor+wanted.length,cursor+wanted.length+160);
    const match=!invalidVariant&&context.match(/\b(?:buy\s+)?from\s*\$\s*([\d,]+)/i);
    if(match){
      const amount=Number(match[1].replace(/,/g,''));
      if(amount>=model.minUSD&&amount<=model.maxUSD)return amount;
    }
    cursor=textContent.indexOf(wanted,cursor+1);
  }
  return null;
}
export function validRetailerSource(model,url){
  try{
    const u=new URL(url);
    return u.protocol==='https:'&&u.hostname==='priceoye.pk'&&
      u.pathname==='/mobiles/apple/'+model.slug;
  }catch{return false}
}
