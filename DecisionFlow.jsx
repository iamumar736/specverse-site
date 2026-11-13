import React,{useEffect,useMemo,useState} from 'react';
import {ArrowRight,Check,CheckCircle2,GitCompareArrows,Search,ShieldCheck,Smartphone} from 'lucide-react';
import {selectTopModels} from './top-models.js';

const fmt=n=>new Intl.NumberFormat('en-US').format(n||0);
const spec=value=>{
  if(value===null||value===undefined||value==='')return 'Not listed';
  const text=String(value);
  return text.length>66?text.slice(0,63)+'…':text;
};

/**
 * Real, functioning comparison preview inspired by workflow storytelling.
 * All model names and properties come from the active catalog, not mock data.
 */
export default function DecisionFlow({catalog=[],onComparePair,onBrowse}){
  const options=useMemo(()=>selectTopModels(catalog,24),[catalog]);
  const [firstId,setFirstId]=useState('');
  const [secondId,setSecondId]=useState('');
  useEffect(()=>{
    if(!options.length)return;
    setFirstId(previous=>options.some(p=>p.id===previous)?previous:options[0].id);
    setSecondId(previous=>{
      const primary=options[0]?.id;
      return options.some(p=>p.id===previous&&p.id!==primary)?previous:
        (options.find(p=>p.brand!==options[0]?.brand)?.id||options[1]?.id||'');
    });
  },[options]);
  const first=options.find(p=>p.id===firstId)||options[0];
  const second=options.find(p=>p.id===secondId&&p.id!==first?.id)||
    options.find(p=>p.id!==first?.id&&p.brand!==first?.brand)||
    options.find(p=>p.id!==first?.id);
  const valid=Boolean(first&&second&&first.id!==second.id);
  const sourceCount=useMemo(()=>catalog.filter(p=>
    String(p.dataQuality||'').startsWith('official-specifications')).length,[catalog]);

  const compare=()=>{if(valid)onComparePair(first.id,second.id)};
  return <section id="decision-flow" className="relay-decision relay-reveal" aria-labelledby="relay-decision-title">
    <div className="relay-decision__heading">
      <div>
        <span className="relay-section-kicker"><span className="relay-pip" aria-hidden="true"/> THE DECISION ENGINE</span>
        <h2 id="relay-decision-title">Less searching.<br/><span>More certainty.</span></h2>
        <p>Choose two actual phones. Inspect their listed details, then open the full side-by-side comparison.</p>
      </div>
      <div className="relay-decision__proof" aria-label="Manufacturer reference coverage">
        <ShieldCheck size={20} aria-hidden="true"/>
        <span><strong>{fmt(sourceCount)}</strong><small>manufacturer-sourced profiles</small></span>
      </div>
    </div>
    <div className="relay-decision__board">
      <svg className="relay-decision__connections" viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="relay-connection-gradient" x1="0" x2="1">
            <stop offset="0" stopColor="#678566"/><stop offset=".52" stopColor="#c8f29a"/><stop offset="1" stopColor="#607a62"/>
          </linearGradient>
        </defs>
        <path d="M240 110 C310 110 345 110 414 110 M585 110 C655 110 690 110 760 110" stroke="#36453b" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path className="relay-decision__signal" d="M240 110 C310 110 345 110 414 110 M585 110 C655 110 690 110 760 110"
          stroke="url(#relay-connection-gradient)" strokeWidth="3" strokeDasharray="12 16" strokeLinecap="round" fill="none"/>
      </svg>
      <div className="relay-decision__grid">
        <div className="relay-step">
          <div className="relay-step__top"><span>01 / DISCOVER</span><Search size={18} aria-hidden="true"/></div>
          <strong className="relay-step__title">Start with a phone.</strong>
          <p>Choose a real model from the catalog.</p>
          <label htmlFor="relay-first-phone">First device</label>
          <select id="relay-first-phone" value={first?.id||''} onChange={event=>setFirstId(event.target.value)}>
            {options.map(p=><option key={p.id} value={p.id}>{p.name} · {p.brand}</option>)}
          </select>
          <div className="relay-step__status"><CheckCircle2 size={14} aria-hidden="true"/>{first?'Model selected':'Choose a model'}</div>
        </div>
        <div className="relay-step relay-step--highlight">
          <div className="relay-step__top"><span>02 / EVALUATE</span><Smartphone size={18} aria-hidden="true"/></div>
          <strong className="relay-step__title">See what matters.</strong>
          <p>Add a second model to examine both.</p>
          <label htmlFor="relay-second-phone">Second device</label>
          <select id="relay-second-phone" value={second?.id||''} onChange={event=>setSecondId(event.target.value)}>
            {options.filter(p=>p.id!==first?.id).map(p=><option key={p.id} value={p.id}>{p.name} · {p.brand}</option>)}
          </select>
          <div className="relay-step__status"><CheckCircle2 size={14} aria-hidden="true"/>{second?'Comparison ready':'Choose another model'}</div>
        </div>
        <div className="relay-step relay-step--finish">
          <div className="relay-step__top"><span>03 / COMPARE</span><GitCompareArrows size={18} aria-hidden="true"/></div>
          <strong className="relay-step__title">Make a clear choice.</strong>
          <p>See the complete specifications side by side.</p>
          <div className="relay-step__result">
            <span><Check size={14} aria-hidden="true"/> Real catalog data</span>
            <span><Check size={14} aria-hidden="true"/> Missing details shown</span>
          </div>
          <button className="relay-step__action" type="button" disabled={!valid} onClick={compare}>
            Compare these phones <ArrowRight size={16} aria-hidden="true"/>
          </button>
        </div>
      </div>
    </div>
    {valid&&<div className="relay-decision__preview" aria-live="polite" aria-atomic="true">
      <div className="relay-decision__preview-intro"><span className="relay-pip" aria-hidden="true"/>
        <strong>Live preview</strong><span>From actual catalog fields</span></div>
      <div className="relay-decision__preview-grid">
        {[first,second].map(p=><div className="relay-preview-phone" key={p.id}>
          <span className="relay-preview-phone__brand">{p.brand}</span>
          <strong>{p.name}</strong>
          <dl>
            <div><dt>Display</dt><dd>{spec(p.screen)}</dd></div>
            <div><dt>Chipset</dt><dd>{spec(p.chip)}</dd></div>
            <div><dt>Battery</dt><dd>{spec(p.battery)}</dd></div>
          </dl>
        </div>)}
      </div>
    </div>}
    <div className="relay-decision__footer">
      <span>Prefer to explore the entire collection?</span>
      <button type="button" onClick={onBrowse}>Browse all models <ArrowRight size={16} aria-hidden="true"/></button>
    </div>
  </section>;
}
