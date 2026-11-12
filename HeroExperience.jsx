import React,{lazy,Suspense,useEffect,useRef,useState} from 'react';
import {getMobileCapabilities,shouldAutoload3D} from './mobile-performance.js';

// WebGL is only imported if a capable desktop requests it, or a mobile user
// explicitly opts in. The original CSS concept phone always renders first.
const PhoneShowcase3D=lazy(()=>import('./PhoneShowcase3D.jsx'));

function supportsWebGL(){
  try{
    const canvas=document.createElement('canvas');
    const context=canvas.getContext('webgl2')||canvas.getContext('webgl');
    if(!context)return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  }catch{return false;}
}

export default function HeroExperience(){
  const root=useRef(null);
  const [enabled,setEnabled]=useState(false);
  const [ready,setReady]=useState(false);
  const [unsupported,setUnsupported]=useState(false);
  const [inView,setInView]=useState(true);
  const [pageVisible,setPageVisible]=useState(true);
  const [reduceMotion,setReduceMotion]=useState(false);

  useEffect(()=>{
    const hints=getMobileCapabilities();
    setReduceMotion(hints.reducedMotion);
    if(!shouldAutoload3D(hints)||!supportsWebGL())return;
    const element=root.current;
    if(!element)return;
    if(!('IntersectionObserver' in window)){setEnabled(true);return;}
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){
        setEnabled(true);
        observer.disconnect();
      }
    },{rootMargin:'80px'});
    observer.observe(element);
    return()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    if(!enabled||!root.current)return;
    const element=root.current;
    const onVisibility=()=>setPageVisible(!document.hidden);
    onVisibility();
    document.addEventListener('visibilitychange',onVisibility);
    const observer=typeof IntersectionObserver==='undefined'?null:
      new IntersectionObserver(entries=>{
        setInView(entries.some(entry=>entry.isIntersecting));
      },{threshold:0.01});
    observer?.observe(element);
    return()=>{
      observer?.disconnect();
      document.removeEventListener('visibilitychange',onVisibility);
    };
  },[enabled]);

  const enable3D=()=>{
    if(supportsWebGL()){
      setUnsupported(false);
      setEnabled(true);
    }else setUnsupported(true);
  };

  return <div ref={root} className={'hero-visual'+(enabled?' hero-visual--interactive':'')+(ready?' hero-visual--3d-ready':'')}
    aria-label="Decorative concept smartphone; optional interactive 3D preview">
    <div className="glow"/>
    <div className="hero-device rear"><div className="lenses"><i/><i/><i/></div></div>
    <div className="hero-device front"><div className="pill"/><div className="orb"/></div>
    {enabled&&<Suspense fallback={null}>
      <PhoneShowcase3D onReady={()=>setReady(true)}
        active={inView&&pageVisible} reducedMotion={reduceMotion}/>
    </Suspense>}
    {!enabled&&<button type="button" className="hero-3d-toggle"
      onClick={enable3D} aria-label="Load interactive 3D phone preview">
      View 3D
    </button>}
    {unsupported&&<span className="hero-3d-unavailable" role="status">
      3D is unavailable on this device
    </span>}
    <div className="floating-chip">{ready?'Drag to rotate':'Device concept'}</div>
  </div>;
}
