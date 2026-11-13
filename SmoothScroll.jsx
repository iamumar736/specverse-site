import {useEffect} from 'react';
import {getMobileCapabilities,shouldSkipScrollEffects} from './mobile-performance.js';

/**
 * Lenis is never in the startup bundle. It is loaded only on capable
 * desktop devices and destroyed whenever the experience is exited or paused.
 * Browser-native scrolling remains the fully working default.
 */
export default function SmoothScroll({active}){
  useEffect(()=>{
    if(!active||shouldSkipScrollEffects(getMobileCapabilities()))return;
    let disposed=false;
    let lenis=null;
    let onScroll=null;
    Promise.all([import('lenis'),import('gsap/ScrollTrigger'),import('lenis/dist/lenis.css')])
      .then(([lenisModule,{ScrollTrigger}])=>{
        if(disposed)return;
        const Lenis=lenisModule.default;
        lenis=new Lenis({
          autoRaf:true,
          anchors:true,
          syncTouch:false,
          smoothWheel:true,
          wheelMultiplier:.92,
          lerp:.105,
          respectReducedMotion:true,
        });
        onScroll=()=>ScrollTrigger.update();
        lenis.on('scroll',onScroll);
      })
      .catch(()=>{}); // Native scroll is the reliable fallback.
    return()=>{
      disposed=true;
      if(lenis){
        if(onScroll)lenis.off('scroll',onScroll);
        lenis.destroy();
      }
    };
  },[active]);
  return null;
}
