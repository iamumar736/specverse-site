// Curated model-specific freely licensed community imagery.
// These are NOT Apple press photos. Wikimedia Commons hosts each source asset.
// File pages identify creators and current image licenses.
export const IPHONE_IMAGE_FILES = Object.freeze(Object.fromEntries(`apple-iphone-17e|IPhone 17e Vector.svg|90
apple-iphone-18-pro|IPhone 18 Pro Vector.svg|6e
apple-iphone-18-pro-max|IPhone 18 Pro Max (burgundy model) - 1.jpg|32
apple-iphone-duo|IPhone Duo Folded Vector.svg|44
apple-iphone-16e|IPhone 16e Vector.svg|5d
apple-iphone-17|IPhone 17 Vector.svg|e6
apple-iphone-17-pro|IPhone 17 Pro Vector.svg|f5
apple-iphone-17-pro-max|IPhone 17 Pro Max Vector.svg|2f
apple-iphone-air|IPhone Air Vector.svg|20
apple-iphone-16|IPhone 16 Vector.svg|7c
apple-iphone-16-plus|IPhone 16 Plus Vector.svg|75
iphone-16-pro|IPhone 16 Pro Vector.svg|d2
apple-iphone-16-pro-max|IPhone 16 Pro Max Vector.svg|fc
apple-iphone-15|IPhone 15 Vector.svg|ee
apple-iphone-15-plus|IPhone 15 Plus Vector.svg|a3
iphone-15-pro|IPhone 15 Pro Vector.svg|f5
apple-iphone-15-pro-max|IPhone 15 Pro Max Vector.svg|26
apple-iphone-14|IPhone 14 vector.svg|61
apple-iphone-14-plus|A blue iPhone 14 Plus.jpg|8d
apple-iphone-14-pro|IPhone 14 Pro vector.svg|9f
apple-iphone-14-pro-max|Back of the iPhone 14 Pro Max.jpg|9e
apple-iphone-se-3rd-generation|IPhone SE (3rd generation) vector.svg|09
apple-iphone-13|IPhone 13 vector.svg|0c
apple-iphone-13-mini|IPhone 13 Mini Grün Freigestellt.png|8b
apple-iphone-13-pro|IPhone 13 Pro vector.svg|b5
apple-iphone-13-pro-max|IPhone 13 Pro Max Sierra Blue 128g.jpg|b0
apple-iphone-12|IPhone 12 Blue.svg|34
apple-iphone-12-mini|IPhone 12 Mini Blue.svg|89
apple-iphone-12-pro|IPhone 12 Pro Gold.svg|3e
apple-iphone-12-pro-max|IPhone 12 Pro Max.png|f7
apple-iphone-se-2nd-generation|IPhone SE (2nd generation) white vector.svg|9d
apple-iphone-11|IPhone 11 Green.svg|39
apple-iphone-11-pro|IPhone 11 Pro Midnight Green.svg|94
apple-iphone-11-pro-max|IPhone 11 Pro Max Midnight Green.svg|37
apple-iphone-xr|IPhone XR Blue.svg|e9
apple-iphone-xs|IPhone XS Gold.svg|06
apple-iphone-xs-max|IPhone XS Max Gold.svg|f4
apple-iphone-8|IPhone 8 vector.svg|5d
apple-iphone-8-plus|IPhone 8 plus vector.svg|70
apple-iphone-x|IPhone X vector.svg|32
apple-iphone-7|IPhone 7 Jet Black.svg|18
apple-iphone-7-plus|IPhone 7 Plus Jet Black.svg|64
apple-iphone-se-1st-generation|IPhone SE (1st generation) rose gold.svg|8d
apple-iphone-6s|IPhone 6s vector.svg|9b
apple-iphone-6s-plus|IPhone 6s Plus vector.svg|f8
apple-iphone-6|IPhone 6 Space Gray.svg|0f
apple-iphone-6-plus|IPhone 6 Plus Space Gray.svg|55
apple-iphone-5c|IPhone 5C (blue).svg|97
apple-iphone-5s|IPhone 5s golden.svg|d9
apple-iphone-5|IPhone 5.svg|87
apple-iphone-4s|IPhone 4s.jpg|83
apple-iphone-4|IPhone 4 - front.jpg|95
apple-iphone-3gs|IPhone 3GS.jpg|61
apple-iphone-3g|IPhone3G.svg|a3
apple-iphone|IPhone 1st Gen.svg|ad`.trim().split('\n').map(line=>{
  const [id,file,hash]=line.split('|');
  return [id,{file,hash}];
})));

const encodeFile=file=>encodeURIComponent(file.replaceAll(' ','_'));
export function getIphoneImageInfo(phone){
  if(phone?.brand!=='Apple')return null;
  const record=IPHONE_IMAGE_FILES[phone.id];
  if(!record)return null;
  const name=encodeFile(record.file);
  const host='https://upload.wikimedia.org/wikipedia/commons/';
  const fileUrl=host+record.hash[0]+'/'+record.hash+'/'+name;
  const isVector=record.file.toLowerCase().endsWith('.svg');
  const image=isVector?fileUrl:host+'thumb/'+record.hash[0]+'/'+record.hash+'/'+name+'/480px-'+name;
  return {image,file:record.file,source:'https://commons.wikimedia.org/wiki/File:'+name,license:'https://creativecommons.org/licenses/by-sa/4.0/'};
}
export function getPhoneImage(phone){
  return getIphoneImageInfo(phone)?.image||phone?.image||null;
}
