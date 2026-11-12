import {useEffect} from 'react';

// ScrollTrigger ships with GSAP. All animations are reverted when the catalog
// changes or the user navigates, so no transforms linger on recycled cards.
export default function CatalogMotion({active,revision}){
  useEffect(()=>{
    if(!active||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const container=document.getElementById('catalog');
    if(!container)return;
    let disposed=false;
    let context;
    Promise.all([import('gsap'),import('gsap/ScrollTrigger')])
      .then(([{gsap},{ScrollTrigger}])=>{
        if(disposed)return;
        gsap.registerPlugin(ScrollTrigger);
        context=gsap.context(()=>{
          const elements=container.querySelectorAll('.section-head, .brand-tile, .phone-card');
          elements.forEach((element,index)=>{
            gsap.fromTo(element,
              {autoAlpha:0,y:Math.min(28,16+index%4*4)},
              {autoAlpha:1,y:0,duration:.68,delay:Math.min(index%4*.055,.18),
                ease:'power2.out',clearProps:'opacity,visibility,transform',
                scrollTrigger:{trigger:element,start:'top 94%',once:true}});
          });
        },container);
        ScrollTrigger.refresh();
      })
      .catch(()=>{}); // Enhancement must never block browsing if animation code fails.
    return()=>{disposed=true;context?.revert()};
  },[active,revision]);
  return null;
}
