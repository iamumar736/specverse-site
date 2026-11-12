import React,{createContext,useContext,useEffect,useState} from 'react';
import {isSafeLocalImage} from './device-image-verification.js';
import {isUsablePhonePhoto} from './photo-source-policy.js';

// The manifest is published by a daily GitHub Action after online source checks.
// No entry means use the existing, unchanged phone photo / illustration.
const context=createContext(Object.freeze({}));
export function DeviceVisualProvider({children}){
  const [visuals,setVisuals]=useState({});
  useEffect(()=>{
    let alive=true;
    fetch('/data/animated-device-images.json',{cache:'no-store'})
      .then(response=>response.ok?response.json():null)
      .then(data=>{
        if(!alive||data?.version!==1||!data.devices||typeof data.devices!=='object')return;
        const valid=Object.fromEntries(Object.entries(data.devices).filter(
          ([id,entry])=>id===entry?.id&&isSafeLocalImage(entry.image)&&
            entry.motion==='gentle-float'&&
            entry.source?.startsWith('https://commons.wikimedia.org/wiki/File:')
        ));
        setVisuals(valid);
      }).catch(()=>{}); // An unavailable manifest is not a catalog blocker.
    return()=>{alive=false};
  },[]);
  return <context.Provider value={visuals}>{children}</context.Provider>;
}
export function useVerifiedDeviceVisual(phone){
  const visuals=useContext(context);
  return visuals[phone?.id]||null;
}
export function DeviceVisualCredit({phone}){
  const visual=useVerifiedDeviceVisual(phone);
  if(!visual||!isUsablePhonePhoto(visual.image))return null;
  return <p className="muted image-credit">
    Device image is from a model-matched licensed source, shown with subtle 2D
    motion (not a true 3D model).{' '}
    <a href={visual.source} target="_blank" rel="noopener noreferrer">
      Image and author: {visual.author||'see file page'}
    </a>
    {' · '}
    <a href={visual.licenseUrl} target="_blank" rel="noopener noreferrer">
      {visual.license}
    </a>.
    {' '}<a href={visual.manufacturerSource} target="_blank" rel="noopener noreferrer">
      Manufacturer specifications
    </a>.
  </p>;
}
