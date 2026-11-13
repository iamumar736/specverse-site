import {useEffect} from 'react';
import {getMobileCapabilities,shouldSkipScrollEffects} from './mobile-performance.js';

/**
 * GSAP microchoreography inspired by cinematic SaaS storytelling:
 * optional, scroll-driven, reduced-motion aware, and fully reverted.
 */
export default function RelayMotion({active}){
  useEffect(()=>{
    if(!active||shouldSkipScrollEffects(getMobileCapabilities()))return;
    let disposed=false;
    let context=null;
    Promise.all([import('gsap'),import('gsap/ScrollTrigger')])
      .then(([{gsap},{ScrollTrigger}])=>{
        if(disposed)return;
        gsap.registerPlugin(ScrollTrigger);
        context=gsap.context(()=>{
          const intro=[
            '.studio-hero__eyebrow',
            '.studio-hero h1',
            '.studio-hero__copy>p',
            '.studio-hero__actions',
            '.studio-hero__stats'
          ].flatMap(selector=>[...document.querySelectorAll(selector)]);
          if(intro.length){
            gsap.fromTo(intro,{autoAlpha:0,y:18},{
              autoAlpha:1,y:0,duration:.85,stagger:.1,ease:'power3.out',
              clearProps:'opacity,visibility,transform'
            });
          }
          document.querySelectorAll('.relay-reveal').forEach(section=>{
            gsap.fromTo(section,{autoAlpha:0,y:32},{
              autoAlpha:1,y:0,duration:.9,ease:'power2.out',
              clearProps:'opacity,visibility,transform',
              scrollTrigger:{trigger:section,start:'top 90%',once:true}
            });
          });
        });
        ScrollTrigger.refresh();
      }).catch(()=>{}); // No animation code should ever block content.
    return()=>{disposed=true;context?.revert()};
  },[active]);
  return null;
}
