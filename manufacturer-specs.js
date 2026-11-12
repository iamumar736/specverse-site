// Overlay manufacturer-specific specs without losing catalog identity or image.
import {materializeManufacturerSeeds} from './official-extra-brand-seeds.js';
export function mergeOfficialSpecs(catalog,...overlays){
 const seeded=materializeManufacturerSeeds(catalog);
 const list=[...Object.values(seeded),...overlays]
   .filter(x=>x&&typeof x==='object'&&!Array.isArray(x));
 return catalog.map(phone=>{
  const found=Object.assign({},...list.map(data=>data[phone.id]||{}));
  if(!Object.keys(found).length)return phone;
  return {...phone,...found,id:phone.id,brand:phone.brand,name:phone.name,image:phone.image};
 });
}
