// Freely playable smartphone-brand logo games. Icons are stored locally in /public/logos/.
export const PHONE_BRANDS=[
  {id:'apple',name:'Apple',logo:'/logos/apple.svg'},
  {id:'samsung',name:'Samsung',logo:'/logos/samsung.svg'},
  {id:'xiaomi',name:'Xiaomi',logo:'/logos/xiaomi.svg'},
  {id:'google',name:'Google',logo:'/logos/google.svg'},
  {id:'oneplus',name:'OnePlus',logo:'/logos/oneplus.svg'},
  {id:'oppo',name:'OPPO',logo:'/logos/oppo.svg'},
  {id:'vivo',name:'Vivo',logo:'/logos/vivo.svg'},
  {id:'motorola',name:'Motorola',logo:'/logos/motorola.svg'},
  {id:'nokia',name:'Nokia',logo:'/logos/nokia.svg'},
  {id:'huawei',name:'Huawei',logo:'/logos/huawei.svg'},
  {id:'sony',name:'Sony',logo:'/logos/sony.svg'},
  {id:'honor',name:'Honor',logo:'/logos/honor.svg'}
];
export function shuffle(items,rng=Math.random){
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--){
    const j=Math.max(0,Math.min(i,Math.floor(rng()*(i+1))));
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}
export function makeLogoQuiz(total=8,rng=Math.random){
  const rounds=shuffle(PHONE_BRANDS,rng).slice(0,Math.min(Math.max(total,1),PHONE_BRANDS.length));
  return rounds.map(answer=>({
    answer,
    choices:shuffle([answer,...shuffle(PHONE_BRANDS.filter(b=>b.id!==answer.id),rng).slice(0,3)],rng)
  }));
}
export function makeLogoMatch(pairCount=6,rng=Math.random){
  const chosen=shuffle(PHONE_BRANDS,rng).slice(0,Math.min(Math.max(1,pairCount),PHONE_BRANDS.length));
  return shuffle(chosen.flatMap(brand=>[
    {...brand,key:brand.id+'-1'},
    {...brand,key:brand.id+'-2'}
  ]),rng);
}
