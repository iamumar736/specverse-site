import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Check,Search,Smartphone,X} from 'lucide-react';
import {comparePhones,searchScore} from './catalog-order.js';
import {getPhoneImage,getPhoneRemoteFallback} from './iphone-images.js';

function ModelThumbnail({phone}){
  const [src,setSrc]=useState(()=>getPhoneImage(phone));
  useEffect(()=>setSrc(getPhoneImage(phone)),[phone?.id,phone?.image]);
  return <span className="compare-picker-thumb" aria-hidden="true">
    <Smartphone size={20}/>
    {src&&<img src={src} alt="" loading="lazy" referrerPolicy="no-referrer"
      onError={()=>setSrc(previous=>previous===getPhoneImage(phone)?getPhoneRemoteFallback(phone):null)}/>}
  </span>;
}

function ComparePhoneSlot({index,slots,catalog,prices,onSelect}){
  const selectedId=slots[index];
  const chosen=useMemo(()=>catalog.find(p=>p.id===selectedId)||null,[catalog,selectedId]);
  const [query,setQuery]=useState('');
  const [editing,setEditing]=useState(false);
  const [focused,setFocused]=useState(false);
  const [active,setActive]=useState(-1);
  const inputRef=useRef(null);
  const searching=!chosen||editing;
  useEffect(()=>{if(editing)inputRef.current?.focus()},[editing]);
  const results=useMemo(()=>{
    const q=query.trim();
    const available=catalog.filter(p=>(!slots.some((id,i)=>i!==index&&id===p.id))&&(!q||searchScore(p,q)>=0));
    return available.sort((a,b)=>comparePhones(a,b,prices,'premium',q)).slice(0,6);
  },[catalog,prices,query,index,slots]);
  const choose=p=>{
    onSelect(index,p.id);
    setQuery('');
    setActive(-1);
    setFocused(false);
    setEditing(false);
  };
  const remove=()=>{onSelect(index,null);setQuery('');setEditing(false);setFocused(false);setActive(-1)};
  const close=()=>{setFocused(false);setActive(-1);if(chosen)setEditing(false)};
  const label='Phone '+(index+1);
  return <div className="compare-picker-slot">
    <div className="compare-picker-heading">
      <span className="compare-picker-number">{String(index+1).padStart(2,'0')}</span>
      <strong>{label}</strong>
      {chosen&&<span className="compare-picker-check"><Check size={13}/> Selected</span>}
    </div>
    {chosen&&!searching?
      <div className="compare-picker-selected">
        <ModelThumbnail phone={chosen}/>
        <div className="compare-picker-selected-info">
          <strong title={chosen.name}>{chosen.name}</strong>
          <small>{chosen.brand}{chosen.year?' · '+chosen.year:''}</small>
        </div>
        <div className="compare-picker-actions">
          <button type="button" onClick={()=>{setQuery('');setEditing(true)}}>Change</button>
          <button type="button" onClick={remove} aria-label={'Remove '+chosen.name}><X size={15}/></button>
        </div>
      </div>
    :
      <div className="compare-picker-combobox" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false)}}>
        <div className="compare-picker-input-wrap">
          <Search size={17} aria-hidden="true"/>
          <input ref={inputRef} type="search" autoComplete="off" value={query}
            aria-label={'Search '+label+' model'} aria-autocomplete="list"
            aria-expanded={focused}
            aria-controls={'compare-picker-results-'+index}
            aria-activedescendant={focused&&active>=0?'compare-picker-option-'+index+'-'+active:undefined}
            placeholder="Search any phone..."
            onFocus={()=>{setFocused(true);setActive(-1)}}
            onChange={e=>{setQuery(e.target.value);setFocused(true);setActive(-1)}}
            onKeyDown={e=>{
              if(e.key==='Escape'){close();e.currentTarget.blur()}
              if(focused&&e.key==='ArrowDown'){e.preventDefault();setActive(i=>Math.min(i+1,results.length-1))}
              if(focused&&e.key==='ArrowUp'){e.preventDefault();setActive(i=>Math.max(i-1,-1))}
              if(focused&&e.key==='Enter'&&results.length){e.preventDefault();choose(results[active>=0?active:0])}
            }}/>
          {chosen&&<button type="button" onClick={close} title="Cancel changing model" aria-label={'Cancel changing '+label}><X size={15}/></button>}
        </div>
        {focused&&<div className="compare-picker-results" id={'compare-picker-results-'+index} role="listbox" aria-label={'Choose '+label}>
          <span className="compare-picker-results-heading">{query.trim()?'Matching models':'Popular models'}</span>
          {results.length?results.map((p,i)=>
            <button type="button" role="option" aria-selected={active===i}
              id={'compare-picker-option-'+index+'-'+i}
              key={p.id} className={'compare-picker-result'+(active===i?' active':'')}
              onMouseDown={e=>e.preventDefault()} onClick={()=>choose(p)}>
              <ModelThumbnail phone={p}/>
              <span className="compare-picker-result-info"><strong title={p.name}>{p.name}</strong><small>{p.brand}{p.year?' · '+p.year:''}</small></span>
            </button>
          ):<p className="compare-picker-no-results">{catalog.length?'No matching available models.':'Loading phone catalog…'}</p>}
        </div>}
      </div>}
  </div>;
}

export default function ComparePhoneSelectors({catalog,prices,slots,onSelect}){
  const count=slots.filter(Boolean).length;
  return <section className="compare-picker-section" aria-label="Search and select phones to compare">
    <div className="compare-picker-section-head">
      <div><span className="eyebrow">PICK YOUR MODELS</span><h2>Choose up to three phones</h2></div>
      <span className="compare-picker-count">{count} / 3 selected</span>
    </div>
    <div className="compare-picker-grid">{[0,1,2].map(index=>
      <ComparePhoneSlot key={index} index={index} slots={slots} catalog={catalog} prices={prices} onSelect={onSelect}/>
    )}</div>
    <p className="compare-picker-hint">Type a model or brand in any box. Results appear below; the comparison table updates automatically.</p>
  </section>;
}
