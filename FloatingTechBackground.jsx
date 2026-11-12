import React from 'react';

/**
 * An understated architectural backdrop: slow, low-contrast outlines only.
 * Decorative, deterministic and CSS-driven. No moving labels, shooting
 * stars, image downloads, layout shifts or continuous JavaScript loops.
 */
const SHAPES=[
  {left:'3%',top:'12%',scale:'.95',duration:'30s',delay:'-7s'},
  {left:'91%',top:'18%',scale:'1.14',duration:'38s',delay:'-18s'},
  {left:'6%',top:'64%',scale:'.72',duration:'34s',delay:'-16s'},
  {left:'87%',top:'77%',scale:'.8',duration:'42s',delay:'-9s'}
];
export default function FloatingTechBackground(){
  return <div className="ambient-tech ambient-tech--refined" aria-hidden="true">
    {SHAPES.map((shape,index)=>
      <span key={index} className="refined-ambience__phone"
        style={{
          left:shape.left,top:shape.top,
          '--shape-scale':shape.scale,
          '--shape-duration':shape.duration,
          '--shape-delay':shape.delay
        }}>
        <i className="refined-ambience__camera"/>
        <i className="refined-ambience__lens"/>
        <i className="refined-ambience__lens"/>
      </span>
    )}
  </div>;
}
