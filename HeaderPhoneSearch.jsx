import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Search,Smartphone} from 'lucide-react';
import {comparePhones,searchScore} from './catalog-order.js';
import {getPhoneImage,getPhoneRemoteFallback} from './iphone-images.js';

export default function HeaderPhoneSearch({query,onQuery,catalog=[],prices={},onSelect,onSubmit}){
  const inputRef=useRef(null);
  const [focused,setFocused]=useState(false);
  useEffect(()=>{
    const handleShortcut=event=>{
      if(event.key!=='/'||event.altKey||event.ctrlKey||event.metaKey)return;
      const target=event.target;
      if(target?.isContentEditable||/^(input|textarea|select)$/i.test(target?.tagName||''))return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener('keydown',handleShortcut);
    return()=>document.removeEventListener('keydown',handleShortcut);
  },[]);
  const [active,setActive]=useState(-1);
  const matches=useMemo(()=>{
    const q=query.trim();
    if(!q)return [];
    return catalog.filter(p=>searchScore(p,q)>=0).sort((a,b)=>comparePhones(a,b,prices,'premium',q)).slice(0,6);
  },[query,catalog,prices]);
  const visible=focused&&query.trim().length>0;
  const pick=p=>{setFocused(false);setActive(-1);onSelect(p)};
  return <form className="top-search top-search-autocomplete" role="search"
    onSubmit={e=>{e.preventDefault();if(visible&&active>=0&&matches[active])pick(matches[active]);else{setFocused(false);onSubmit()}}}
    onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget)){setFocused(false);setActive(-1)}}}>
    <input ref={inputRef} type="search" role="combobox" aria-keyshortcuts="/" aria-label="Search phones" aria-autocomplete="list"
      aria-expanded={Boolean(visible)} aria-controls="header-phone-suggestions"
      aria-activedescendant={visible&&active>=0?'header-phone-option-'+active:undefined}
      placeholder="Search phones..." value={query}
      onFocus={()=>setFocused(true)}
      onChange={e=>{onQuery(e.target.value);setFocused(true);setActive(-1)}}
      onKeyDown={e=>{
        if(e.key==='Escape'){setFocused(false);setActive(-1);e.currentTarget.blur()}
        if(visible&&e.key==='ArrowDown'){e.preventDefault();setActive(i=>Math.min(i+1,matches.length-1))}
        if(visible&&e.key==='ArrowUp'){e.preventDefault();setActive(i=>Math.max(i-1,-1))}
      }}/>
    <kbd className="top-search-shortcut" aria-hidden="true">/</kbd>
    <button type="submit" aria-label="Show phone search results"><Search size={17}/></button>
    {visible&&<div className="top-search-dropdown" id="header-phone-suggestions" role="listbox" aria-label="Matching phones">
      {matches.length?matches.map((p,i)=><button type="button" role="option" aria-selected={active===i}
        id={'header-phone-option-'+i} className={'top-search-result '+(active===i?'highlight':'')}
        key={p.id} onMouseDown={e=>e.preventDefault()} onClick={()=>pick(p)}>
        <span className="top-search-thumb">{getPhoneImage(p)?<img src={getPhoneImage(p)} alt="" loading="lazy" onError={e=>{const fallback=getPhoneRemoteFallback(p);if(fallback&&!e.currentTarget.dataset.fallback){e.currentTarget.dataset.fallback='1';e.currentTarget.src=fallback}else{e.currentTarget.style.display='none'}}}/>:<Smartphone size={20}/>}</span>
        <span className="top-search-info"><strong>{p.name}</strong><small>{p.brand}{p.year?' · '+p.year:''}</small></span>
      </button>):<div className="top-search-empty">No matching phones found</div>}
      {matches.length>0&&<div className="top-search-tip">Press Enter for all results</div>}
    </div>}
  </form>;
}
