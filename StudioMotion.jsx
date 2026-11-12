import {useEffect} from 'react';

/** A tiny IntersectionObserver for nonessential editorial reveals. */
export default function StudioMotion({active}){
  useEffect(()=>{
    if(!active||typeof window==='undefined'||!('IntersectionObserver' in window))return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||
      window.matchMedia('(max-width: 820px)').matches)return;
    const elements=[...document.querySelectorAll('.studio-reveal')];
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        entry.target.classList.remove('studio-pending');
        entry.target.classList.add('studio-visible');
        observer.unobserve(entry.target);
      }
    },{rootMargin:'0px 0px 70px 0px',threshold:0.08});
    for(const element of elements){
      if(element.getBoundingClientRect().top>window.innerHeight-30)
        element.classList.add('studio-pending');
      observer.observe(element);
    }
    return()=>{
      observer.disconnect();
      elements.forEach(element=>element.classList.remove('studio-pending'));
    };
  },[active]);
  return null;
}
