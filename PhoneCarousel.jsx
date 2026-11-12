import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';

const FIRST_BATCH=12;
const NEXT_BATCH=12;
const reducedMotion=()=>typeof window!=='undefined'&&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A compact, native horizontal phone carousel.
 *
 * Only a small batch of cards is mounted initially, even for large catalogs.
 * Moving or swiping toward the right loads more, preserving all phone actions.
 * Arrow navigation, touch swipes, trackpads and focused arrow keys are supported.
 */
export default function PhoneCarousel({phones,renderPhone,label='Phone models'}){
  const trackRef=useRef(null);
  const advanceAfterLoad=useRef(false);
  const [visibleCount,setVisibleCount]=useState(()=>Math.min(FIRST_BATCH,phones.length));
  const [edges,setEdges]=useState({start:true,end:phones.length<=1});

  const updateEdges=useCallback(()=>{
    const el=trackRef.current;
    if(!el)return;
    const start=el.scrollLeft<=2;
    const end=visibleCount>=phones.length &&
      el.scrollLeft+el.clientWidth>=el.scrollWidth-2;
    setEdges(prev=>prev.start===start&&prev.end===end?prev:{start,end});
  },[visibleCount,phones.length]);

  useEffect(()=>{
    setVisibleCount(Math.min(FIRST_BATCH,phones.length));
    advanceAfterLoad.current=false;
    if(trackRef.current)trackRef.current.scrollLeft=0;
  },[phones]);

  useEffect(()=>{
    const el=trackRef.current;
    if(!el)return;
    const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(updateEdges);
    observer?.observe(el);
    window.addEventListener('resize',updateEdges);
    const frame=requestAnimationFrame(updateEdges);
    return()=>{
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize',updateEdges);
    };
  },[updateEdges]);

  useEffect(()=>{
    if(advanceAfterLoad.current){
      advanceAfterLoad.current=false;
      const el=trackRef.current;
      if(el)el.scrollBy({left:Math.max(180,el.clientWidth*.82),
        behavior:reducedMotion()?'auto':'smooth'});
    }
    updateEdges();
  },[visibleCount,updateEdges]);

  const loadMore=useCallback(()=>{
    setVisibleCount(count=>Math.min(count+NEXT_BATCH,phones.length));
  },[phones.length]);

  const onScroll=()=>{
    const el=trackRef.current;
    if(!el)return;
    updateEdges();
    if(visibleCount<phones.length &&
       el.scrollLeft+el.clientWidth>=el.scrollWidth-Math.max(120,el.clientWidth*.45)){
      loadMore();
    }
  };

  const move=direction=>{
    const el=trackRef.current;
    if(!el)return;
    if(direction>0&&visibleCount<phones.length&&
       el.scrollLeft+el.clientWidth>=el.scrollWidth-6){
      advanceAfterLoad.current=true;
      loadMore();
      return;
    }
    el.scrollBy({left:direction*Math.max(180,el.clientWidth*.82),
      behavior:reducedMotion()?'auto':'smooth'});
  };

  const onKeyDown=event=>{
    if(event.target!==event.currentTarget)return;
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
      event.preventDefault();
      move(event.key==='ArrowLeft'?-1:1);
    }
  };

  return <div className="phone-rail">
    <button type="button" className="phone-rail__arrow phone-rail__arrow--left"
      onClick={()=>move(-1)} disabled={edges.start}
      aria-label={`Previous ${label}`} title="Previous models">
      <ChevronLeft size={20} aria-hidden="true"/>
    </button>
    <div className="cards phone-rail__track" role="region" aria-roledescription="carousel"
      aria-label={label} tabIndex={0} ref={trackRef} onScroll={onScroll}
      onKeyDown={onKeyDown}>
      {phones.slice(0,visibleCount).map(renderPhone)}
    </div>
    <button type="button" className="phone-rail__arrow phone-rail__arrow--right"
      onClick={()=>move(1)} disabled={edges.end}
      aria-label={`Next ${label}`} title="Next models">
      <ChevronRight size={20} aria-hidden="true"/>
    </button>
  </div>;
}
