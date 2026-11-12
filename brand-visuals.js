/**
 * Visual accents only: palette choices are a SpecVerse design treatment,
 * not a claim about a manufacturer's exact brand colors.
 * Every new catalog brand gets a stable, non-random accent.
 */
export const BRAND_PALETTES=Object.freeze({
  Apple:['#c5d5f5','#7b91c6','#1c2849'],
  Samsung:['#87afff','#4269ed','#172c58'],
  Google:['#8de2ce','#568ee7','#173947'],
  Xiaomi:['#ffbb78','#f08039','#49301e'],
  Redmi:['#fbb779','#e78052','#463020'],
  POCO:['#f7d46e','#d3a83d','#4a401f'],
  OPPO:['#8debb8','#359d7d','#1b4239'],
  Vivo:['#92ceff','#5e79d6','#202e55'],
  OnePlus:['#ff9e9e','#e34c61','#472434'],
  Nothing:['#e6e7ee','#9ca5bd','#293044'],
  Motorola:['#b6adff','#8061d6','#342853'],
  Huawei:['#ffb0a7','#cf6262','#492c3a'],
  Honor:['#95e6f0','#448bb2','#1d3954'],
  Realme:['#ffe18a','#dea53e','#493b20'],
  Infinix:['#a7ef96','#6fb77b','#234434'],
  Tecno:['#96d8ee','#4c94ba','#214058'],
  GooglePixel:['#9bdddc','#5f94d1','#233a53'],
  Sony:['#cbbbf3','#8277c4','#302c51'],
  Asus:['#efafdc','#aa72b1','#462a4b'],
  Nokia:['#92bbff','#537fcf','#1d3155'],
  Itel:['#98e9e5','#4faca8','#1b4244'],
  Lenovo:['#f5aab9','#cd687e','#432637'],
  iQOO:['#f3d793','#d49a51','#48321e'],
  ZTE:['#a6c6fb','#6183bb','#27334f'],
  Nubia:['#f4a5bb','#c46690','#442b41'],
  Blackview:['#ffbf8b','#d88e63','#463324'],
  Ulefone:['#9fdbce','#71a99b','#294138'],
  Fairphone:['#a4dfac','#66a978','#254034']
});
const fallback=[
  ['#baaaff','#7968d2','#2d2751'],
  ['#91d5f0','#519ab9','#203d55'],
  ['#f7b99b','#cf8262','#483021'],
  ['#9de2ba','#59a88b','#234337'],
  ['#f0c0ef','#ac7db6','#402e4c'],
  ['#e8d38e','#b7a05f','#463a23']
];

export function paletteForBrand(brand){
  const raw=String(brand||'');
  const key=Object.keys(BRAND_PALETTES).find(name=>name.toLowerCase()===raw.toLowerCase());
  if(key)return BRAND_PALETTES[key];
  const index=[...raw].reduce((sum,char)=>sum+char.codePointAt(0),0)%fallback.length;
  return fallback[index];
}
export function brandVisualStyle(brand){
  const [accent,secondary,dark]=paletteForBrand(brand);
  return {'--phone-accent':accent,'--phone-secondary':secondary,'--phone-panel':dark};
}
/**
 * These are deliberately impressionistic illustrations, NOT model-exact renders.
 * Use only name-based form-factor hints, never infer precise camera geometry.
 */
export function placeholderKind(phone){
  const name=String(phone?.name||'').toLowerCase();
  if(/\bfold\b|\bduo\b|\bfold\d/.test(name))return 'fold';
  if(/\bflip\b|\brazr\b|\bflip\d/.test(name))return 'flip';
  if(/\bpixel\b/.test(name))return 'pixel';
  if(/\bnothing\b|phone\s*\([12]\)/.test(name)&&phone?.brand==='Nothing')return 'glyph';
  if(/\bultra\b/.test(name))return 'ultra';
  if(/\bair\b|\bedge\b/.test(name))return 'slim';
  if(/\biphone\b/.test(name))return 'iphone';
  return 'slab';
}
