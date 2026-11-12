import React from 'react';

/**
 * Ambient decorative layers for the entire website.
 *
 * CSS gradients only: no remote images, video, canvas, extra runtime packages,
 * or GPU-heavy particle systems. The light theme and reduced-motion mode have
 * their own presentations in style.css.
 */
export default function AmbientBackground(){
  return <div className="ambient-backdrop" aria-hidden="true">
    <div className="ambient-backdrop__wash"/>
    <div className="ambient-backdrop__grid"/>
    <div className="ambient-backdrop__stars"/>
    <div className="ambient-backdrop__aurora ambient-backdrop__aurora--violet"/>
    <div className="ambient-backdrop__aurora ambient-backdrop__aurora--cyan"/>
    <div className="ambient-backdrop__aurora ambient-backdrop__aurora--rose"/>
    <div className="ambient-backdrop__vignette"/>
  </div>;
}
