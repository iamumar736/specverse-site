// Conservative, transparent relative comparisons for measurable phone specifications.
// Scores describe listed figures, not overall device quality. Unknown/mixed configurations
// remain neutral rather than inventing a winner.
const number = value => Number(String(value).replaceAll(',', ''));

function singleCapacity(raw) {
  const text=String(raw).trim();
  // Multiple market variants or ranges are not one directly comparable configuration.
  if(/[\u2013\u2014]/.test(text)||/\d\s*[-/]\s*\d/.test(text)||/\s\/\s/.test(text))return null;
  const found=text.match(/^(\d+(?:\.\d+)?)\s*(MB|GB|TB)\b/i);
  if(!found)return null;
  // Avoid interpreting the first value of a multi-capacity list as representative.
  const mentions=[...text.matchAll(/\d+(?:\.\d+)?\s*(?:MB|GB|TB)\b/gi)];
  if(mentions.length!==1)return null;
  const amount=number(found[1]);
  const multiplier={MB:1/1024,GB:1,TB:1024}[found[2].toUpperCase()];
  return amount>0?amount*multiplier:null;
}

function metric(key,raw){
  if(raw===null||raw===undefined||raw===''||typeof raw==='boolean')return null;
  const value=String(raw).trim();
  if(!value||/^(?:n\/?a|not available|unknown|unspecified|tbc|none|-)$/i.test(value))return null;
  let match;
  switch(key){
    case 'ram':
    case 'storage':{
      const capacity=singleCapacity(value);
      return capacity===null?null:{value:capacity,higherIsBetter:true};
    }
    case 'battery':
      // mAh is rated capacity, not a direct estimate of battery life.
      match=value.match(/^([\d,]+(?:\.\d+)?)\s*mAh\b/i);
      return match?{value:number(match[1]),higherIsBetter:true}:null;
    case 'charging':
      // Adapter wattage and 0–50% charging claims must not be mistaken for
      // device-supported wired charging wattage. Region-dependent values are neutral.
      if(/region.dependent|market.dependent/i.test(value))return null;
      match=value.match(/^(\d+(?:\.\d+)?)\s*W\s+wired\b/i);
      return match?{value:number(match[1]),higherIsBetter:true}:null;
    case 'refreshRate':{
      // Maximum rated refresh rate; avoid mixed/flexible lists of multiple rates.
      const hits=[...value.matchAll(/(\d+(?:\.\d+)?)\s*Hz\b/gi)];
      return hits.length===1?{value:number(hits[0][1]),higherIsBetter:true}:null;
    }
    case 'brightness':
      // Only compare *typical* nits, not typical vs HDR/outdoor peak.
      match=value.match(/([\d,]+)\s*nits\s*typical\b/i);
      return match?{value:number(match[1]),higherIsBetter:true}:null;
    case 'resolution':
      // Pixels per inch is more comparable than raw pixel dimensions.
      match=value.match(/(\d+(?:\.\d+)?)\s*ppi\b/i);
      return match?{value:number(match[1]),higherIsBetter:true}:null;
    case 'weight':
      match=value.match(/^([\d,]+(?:\.\d+)?)\s*g\b/i);
      return match?{value:number(match[1]),higherIsBetter:false}:null;
    case 'network':
      // Compare the highest advertised cellular generation, not band support.
      if(/\b5G\b/i.test(value))return {value:5,higherIsBetter:true};
      if(/\b(?:4G|LTE)\b/i.test(value))return {value:4,higherIsBetter:true};
      if(/\b(?:3G|UMTS|HSDPA|HSPA)\b/i.test(value))return {value:3,higherIsBetter:true};
      if(/\b(?:2G|GSM|EDGE)\b/i.test(value))return {value:2,higherIsBetter:true};
      return null;
    default:
      // Chipsets, megapixels, screen size, software versions, storage options,
      // water-resistance labels, etc. lack a reliable universal "better" rank.
      return null;
  }
}

export function compareSpecValues(phones,key){
  const parsed=phones.map(p=>metric(key,p?.[key]));
  const comparable=parsed.filter(p=>p&&Number.isFinite(p.value)&&p.value>0);
  if(comparable.length<2)return phones.map(()=>null);
  const values=comparable.map(p=>p.value);
  const min=Math.min(...values),max=Math.max(...values);
  if(min===max)return phones.map(()=>null);
  return parsed.map(p=>{
    if(!p||!Number.isFinite(p.value)||p.value<=0)return null;
    if(p.value===max)return p.higherIsBetter?'advantage':'disadvantage';
    if(p.value===min)return p.higherIsBetter?'disadvantage':'advantage';
    return null; // intermediate configurations are neither best nor worst
  });
}
