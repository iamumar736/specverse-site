import React,{lazy,Suspense,useEffect,useState} from 'react';
import {Box,RotateCcw,X} from 'lucide-react';
const DeviceConcept3D=lazy(()=>import('./DeviceConcept3D.jsx'));

function hasWebGL(){
  try{
    const canvas=document.createElement('canvas');
    const context=canvas.getContext('webgl2')||canvas.getContext('webgl');
    if(!context)return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  }catch{return false;}
}

export default function DetailConceptExperience({phone}){
  const [open,setOpen]=useState(false);
  const [unsupported,setUnsupported]=useState(false);
  const [reducedMotion]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>setOpen(false),[phone.id]);

  const launch=()=>{
    if(!hasWebGL()){
      setUnsupported(true);return;
    }
    setUnsupported(false);setOpen(true);
  };
  return <>
    {open&&<div className="detail-concept-viewport">
      <Suspense fallback={<div className="detail-concept-loading" role="status">Preparing orbital 3D view…</div>}>
        <DeviceConcept3D phone={phone} reducedMotion={reducedMotion}/>
      </Suspense>
      <span className="detail-concept-caption">ORBITAL 3D CONCEPT · NOT EXACT DEVICE GEOMETRY</span>
    </div>}
    <div className="detail-concept-control">
      <button className="detail-concept-button" type="button"
        onClick={open?()=>setOpen(false):launch}
        aria-expanded={open} aria-label={open?'Close 3D concept preview':'Load interactive 3D concept preview'}>
        {open?<X size={17} aria-hidden="true"/>:<Box size={17} aria-hidden="true"/>}
        {open?'Close 3D':'Inspect 3D concept'}
      </button>
      {open&&<span className="detail-concept-hint"><RotateCcw size={14} aria-hidden="true"/> Drag to rotate</span>}
      {unsupported&&<span role="status" className="detail-concept-unavailable">3D preview isn't supported here</span>}
    </div>
  </>;
}
