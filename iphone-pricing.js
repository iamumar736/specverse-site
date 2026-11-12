// Price guards shared by cards, comparison, and the full price panel.
// USD = Apple US starting price. PKR = a Pakistan retailer listing.
// These are NOT currency conversions or guaranteed PTA-approved configurations.
const DAY=86_400_000;
export const RETAILER_MAX_AGE_DAYS=21;
export const APPLE_MAX_AGE_DAYS=45;

export function isCurrentPrice(value,now=Date.now()){
  if(!value||!['USD','PKR'].includes(value.currency))return false;
  const amount=Number(value.amount);
  if(!Number.isFinite(amount)||amount<=0)return false;
  let url;
  try{url=new URL(value.sourceUrl)}catch{return false}
  if(url.protocol!=='https:')return false;
  const timestamp=Date.parse(value.updatedAt||'');
  if(!Number.isFinite(timestamp))return false;
  const age=now-timestamp;
  const maxDays=value.priceType==='apple-us-starting'?APPLE_MAX_AGE_DAYS:RETAILER_MAX_AGE_DAYS;
  return age>=-DAY && age<=maxDays*DAY;
}
export function onlyCurrentPrices(data,now=Date.now()){
  const output={};
  if(!data||typeof data!=='object'||Array.isArray(data))return output;
  for(const [id,values] of Object.entries(data)){
    if(!values||typeof values!=='object'||Array.isArray(values))continue;
    const current={};
    for(const currency of ['PKR','USD']){
      if(isCurrentPrice(values[currency],now)&&values[currency].currency===currency)
        current[currency]=values[currency];
    }
    if(Object.keys(current).length)output[id]=current;
  }
  return output;
}
export function preferredPrice(prices,id){
  return prices?.[id]?.PKR||prices?.[id]?.USD||null;
}
export function formatMarketPrice(value){
  if(!value)return 'Price not available';
  const currency=value.currency;
  const locale=currency==='PKR'?'en-PK':'en-US';
  const formatted=new Intl.NumberFormat(locale,{style:'currency',currency,
    maximumFractionDigits:0}).format(value.amount);
  return (value.priceType==='retailer-from'||value.priceType==='apple-us-starting'?'From ':'')+formatted;
}
export function priceDescription(value){
  if(!value)return 'No current verified listing';
  if(value.priceType==='retailer-from')return 'Pakistan retailer starting price · PTA / storage variant must be confirmed';
  if(value.priceType==='apple-us-starting')return 'Apple US starting price · base configuration';
  return 'Source-linked market price · confirm variant and availability';
}
