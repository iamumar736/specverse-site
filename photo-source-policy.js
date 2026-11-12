/**
 * Only photographic-looking raster files qualify as the actual product photo.
 * A curated vector SVG is useful editorial art, but it isn't a real photograph.
 * Therefore a phone with only a vector/generic picture gets the 3D-style
 * concept placeholder instead. Product photo priority is preserved.
 *
 * This is a display policy, not a claim that every third-party raster file
 * depicts the correct model. Authenticity needs independent sourcing.
 */
export function isUsablePhonePhoto(source){
  if(typeof source!=='string'||!source.trim())return false;
  const src=source.trim();
  if(!/^(\/|https:\/\/)/i.test(src))return false;
  let pathname=src.split(/[?#]/)[0];
  try{if(/^https:\/\//i.test(src))pathname=new URL(src).pathname;}catch{return false}
  // Do not trust placeholder thumbnails or vector-only stand-ins as a real pic.
  let decoded;
  try{decoded=decodeURIComponent(pathname)}catch{return false}
  if(/(?:^|[\/_.-])(?:generic|default|placeholder|fallback|mockup|mock|dummy|concept|render|vector|stock|no-image|coming-soon)(?:[\/_.-]|$)/i.test(decoded))return false;
  if(!/\.(?:jpe?g|png|webp|avif)$/i.test(pathname))return false;
  return true;
}
export function selectUsablePhonePhoto(sources){
  if(!Array.isArray(sources))return null;
  return sources.find(isUsablePhonePhoto)||null;
}
