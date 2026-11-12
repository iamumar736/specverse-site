import React from 'react';
import {brandVisualStyle,placeholderKind} from './brand-visuals.js';

/**
 * Original, CSS-only concept artwork for phones without a usable photograph.
 * This is not a manufacturer product render. No exact camera specifications or
 * unverified physical details are implied by the illustration.
 */
export default function PhonePlaceholderArt({phone}){
  const kind=placeholderKind(phone);
  return <div className={'modern-phone-art modern-phone-art--'+kind}
    role="img"
    aria-label={'Stylized concept illustration for '+phone.brand+' '+phone.name+'; actual device appearance not verified'}
    style={brandVisualStyle(phone.brand)}>
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
    <span className="modern-phone-art__model" aria-hidden="true">{phone.name}</span>
    <span className="modern-phone-art__concept" aria-hidden="true">Concept visual</span>
  </div>;
}
