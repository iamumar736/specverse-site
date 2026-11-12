import React,{lazy,Suspense,useEffect,useRef,useState} from 'react';

// A static CSS phone remains available when WebGL, bandwidth, or motion preferences
// make the optional 3D scene unsuitable. The renderer is loaded only near the hero.
const PhoneShowcase3D=lazy(()=>import('./PhoneShowcase3D.jsx'));

function supportsWebGL(){
  try{
    const canvas=document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2')||canvas.getContext('webgl'));
  }catch{return false;}
}

export default function HeroExperience(){
  const root=useRef(null);
  const [enabled,setEnabled]=useState(false);
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||
       navigator.connection?.saveData||!supportsWebGL())return;
    const element=root.current;
    if(!element)return;
    if(!('IntersectionObserver' in window)){setEnabled(true);return;}
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){
        setEnabled(true);
        observer.disconnect();
      }
    },{rootMargin:'220px'});
    observer.observe(element);
    return()=>observer.disconnect();
  },[]);

  return <div ref={root} className={'hero-visual'+(enabled?' hero-visual--interactive':'')+(ready?' hero-visual--3d-ready':'')}
    aria-label="Decorative 3D concept smartphone; drag to rotate when supported">
    <div className="glow"/>
    <div className="hero-device rear"><div className="lenses"><i/><i/><i/></div></div>
    <div className="hero-device front"><div className="pill"/><div className="orb"/></div>
    {enabled&&<Suspense fallback={null}>
      <PhoneShowcase3D onReady={()=>setReady(true)}/>
    </Suspense>}
    <div className="floating-chip">{ready?'✦ Drag to rotate':'✦ Find your fit'}</div>
  </div>;
}
