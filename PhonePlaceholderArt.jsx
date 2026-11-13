import React,{useEffect,useState} from 'react';
import {brandVisualStyle,placeholderKind} from './brand-visuals.js';
import {conceptRenderFor,conceptRenderVariant} from './concept-renders.js';

/**
 * Site-owned photorealistic studio concept images for absent product photos.
 * The five model-family variants are illustrations, not real device photos
 * and NOT exact claims about a manufacturer's camera configuration.
 * Keep the original CSS illustration as a fallback if an asset fails to load.
 */
export default function PhonePlaceholderArt({phone}){
  const kind=placeholderKind(phone);
  const variant=conceptRenderVariant(phone);
  const renderPath=conceptRenderFor(phone);
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[phone?.id,renderPath]);

  return <div
    className={'modern-phone-art modern-phone-art--'+kind+' studio-concept-art studio-concept-art--'+variant}
    role="img"
    aria-label={'Stylized studio concept illustration for '+phone.brand+' '+phone.name+'; actual device appearance not verified'}
    style={brandVisualStyle(phone.brand)}>
    {!failed&&renderPath?
      <img className="studio-concept-art__image" src={renderPath} alt=""
        loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:
      <>
        <span className="modern-phone-art__halo" aria-hidden="true"/>
        <span className="modern-phone-art__ring modern-phone-art__ring--one" aria-hidden="true"/>
        <span className="modern-phone-art__ring modern-phone-art__ring--two" aria-hidden="true"/>
        <div className="modern-phone-art__front" aria-hidden="true">
          <span className="modern-phone-art__front-screen"/>
          <span className="modern-phone-art__front-camera"/>
        </div>
        <div className="modern-phone-art__device" aria-hidden="true">
          <div className="modern-phone-art__finish"/>
          <div className="modern-phone-art__camera-group">
            <span className="modern-phone-art__lens"/><span className="modern-phone-art__lens"/>
            <span className="modern-phone-art__lens"/><span className="modern-phone-art__flash"/>
          </div>
          <div className="modern-phone-art__hinge"/>
          <span className="modern-phone-art__device-mark">{phone.brand}</span>
        </div>
      </>}
    <span className="modern-phone-art__model" aria-hidden="true">{phone.name}</span>
    <span className="modern-phone-art__concept" aria-hidden="true">Studio illustration</span>
  </div>;
}
