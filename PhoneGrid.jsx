import React,{useEffect,useMemo,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,Grid2X2} from 'lucide-react';

export const GRID_PAGE_SIZE=40;

/**
 * A fully visible responsive grid, not a horizontal carousel.
 * Exactly 40 models are mounted on the initial page if 40 are available.
 * Large catalogs remain usable through paged results and a page selector.
 */
export default function PhoneGrid({phones=[],renderPhone,title,description,paginate=false}){
  const [page,setPage]=useState(0);
  const sectionRef=useRef(null);
  const count=phones.length;
  const pageCount=Math.max(1,Math.ceil(count/GRID_PAGE_SIZE));
  const current=Math.min(page,pageCount-1);
  const visible=useMemo(()=>phones.slice(current*GRID_PAGE_SIZE,(current+1)*GRID_PAGE_SIZE),[phones,current]);

  useEffect(()=>setPage(0),[phones]);

  const goTo=number=>{
    if(number<0||number>=pageCount||number===current)return;
    setPage(number);
    window.requestAnimationFrame(()=>{
      sectionRef.current?.scrollIntoView({
        block:'start',
        behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'
      });
    });
  };
  return <section className="top-models-section" ref={sectionRef} aria-label={title||'Phone models'}>
    {title&&<div className="top-models-section__head">
      <div><span className="eyebrow"><Grid2X2 size={14} aria-hidden="true"/> FEATURED COLLECTION</span>
        <h3>{title}</h3>{description&&<p className="muted">{description}</p>}</div>
      <span className="top-models-section__count">{count} models</span>
    </div>}
    <div className="cards top-models-grid" aria-label={title||'Phone model results'}>
      {visible.map(renderPhone)}
    </div>
    {!count&&<p className="empty">No matching phones found. Try a different search or brand.</p>}
    {paginate&&pageCount>1&&<nav className="top-grid-pagination" aria-label="Phone results pages">
      <button type="button" onClick={()=>goTo(current-1)} disabled={current===0}
        aria-label="Previous 40 phones"><ChevronLeft size={18} aria-hidden="true"/> Previous</button>
      <div className="top-grid-pagination__middle">
        <span aria-live="polite" aria-atomic="true">
          Showing {current*GRID_PAGE_SIZE+1}–{Math.min((current+1)*GRID_PAGE_SIZE,count)} of {count}
        </span>
        <label className="top-grid-pagination__jump">Page
          <select aria-label="Jump to results page" value={current}
            onChange={event=>goTo(Number(event.target.value))}>
            {Array.from({length:pageCount},(_,index)=>
              <option key={index} value={index}>{index+1} of {pageCount}</option>)}
          </select>
        </label>
      </div>
      <button type="button" onClick={()=>goTo(current+1)} disabled={current===pageCount-1}
        aria-label="Next 40 phones">Next <ChevronRight size={18} aria-hidden="true"/></button>
    </nav>}
  </section>;
}
