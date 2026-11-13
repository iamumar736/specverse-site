/**
 * Model-family selection for original SpecVerse studio concept artwork.
 * These five stylized images communicate a general silhouette only;
 * no image is a photograph or exact manufacturer-certified CAD model.
 * Real sourced model photographs always take precedence elsewhere.
 */
export const CONCEPT_RENDER_ASSETS=Object.freeze({
  island:'/concept-renders/island.webp',
  rings:'/concept-renders/rings.webp',
  visor:'/concept-renders/visor.webp',
  fold:'/concept-renders/fold.webp',
  dual:'/concept-renders/dual.webp'
});
const lowercase=value=>String(value||'').toLowerCase();

/** Keep exact device visuals separate from editorial model-family hints. */
export function conceptRenderVariant(phone){
  const name=lowercase(phone?.name),brand=lowercase(phone?.brand);
  if(/\b(?:fold|foldable|duo)\b|\bfold\d+\b/.test(name))return 'fold';
  // We do not have a verified flip concept in this set: avoid portraying a
  // flip clamshell as a book foldable. Use a compact dual-camera concept.
  if(/\b(?:flip|razr)\b|\bflip\d+\b/.test(name))return 'dual';
  if(brand==='google'||/\bpixel\b/.test(name))return 'visor';
  if(brand==='samsung'||/\bgalaxy\b/.test(name))return 'rings';
  if(brand==='nothing')return 'rings';
  if(brand==='apple'||/\biphone\b/.test(name)){
    return /\b(?:pro|ultra|max)\b/.test(name)?'island':'dual';
  }
  if(/\b(?:ultra|pro\+?|pro max|premier|flagship|gt\s*\d+\s*pro|find\s*x)\b/.test(name)){
    return 'island';
  }
  if(['xiaomi','poco','redmi'].includes(brand)){
    return /\b(?:a\d+|c\d+|note\s*\d+[a-z]*\s*4g)\b/.test(name)?'dual':'island';
  }
  if(['oppo','vivo','infinix','tecno','itel','realme','motorola','nokia','honor','huawei','oneplus'].includes(brand)){
    return /\b(?:find|reno\s*\d+\s*pro|x\d+\s*pro|magic\s*\d+\s*pro|oneplus\s*1\d)\b/.test(name)?'island':'dual';
  }
  return 'dual';
}
export function conceptRenderFor(phone){
  return CONCEPT_RENDER_ASSETS[conceptRenderVariant(phone)];
}
