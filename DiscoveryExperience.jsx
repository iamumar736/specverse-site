import React,{useMemo} from 'react';
import {
  ArrowRight,ArrowUpRight,CheckCircle2,Compass,GitCompareArrows,
  Search,ShieldCheck,Sparkles,Smartphone,Zap
} from 'lucide-react';
import HeroExperience from './HeroExperience.jsx';

const PICKS=[
  {name:'Apple',className:'apple',description:'Explore the iPhone lineup'},
  {name:'Samsung',className:'samsung',description:'Discover Galaxy devices'},
  {name:'Xiaomi',className:'xiaomi',description:'Find your next Xiaomi'},
  {name:'OPPO',className:'oppo',description:'Browse OPPO smartphones'}
];
const format=n=>new Intl.NumberFormat('en-US').format(n);

/**
 * An editorial, source-conscious discovery experience that only displays real
 * catalog counts. Brand cards are functional navigation, not decoration.
 */
export default function DiscoveryExperience({catalog=[],onBrowse,onBrand,onCompare}){
  const counts=useMemo(()=>{
    const brands=new Map();
    for(const device of catalog){
      if(device?.brand)brands.set(device.brand,(brands.get(device.brand)||0)+1);
    }
    return brands;
  },[catalog]);

  const brands=counts.size;
  const total=catalog.length;

  return <>
    <section className="hero studio-hero" aria-labelledby="studio-hero-title">
      <div className="studio-hero__light" aria-hidden="true"/>
      <div className="hero-copy studio-hero__copy">
        <span className="studio-hero__eyebrow"><span className="studio-live-dot" aria-hidden="true"/> YOUR PHONE DISCOVERY STUDIO <Sparkles size={15} aria-hidden="true"/></span>
        <h1 id="studio-hero-title">Find the phone<br/>that <span className="studio-gradient">feels like you.</span></h1>
        <p>One place to explore real devices, understand the details and compare what matters. Less searching. Better choosing.</p>
        <div className="studio-hero__actions">
          <button type="button" className="primary studio-primary" onClick={onBrowse}>Explore all phones <ArrowRight size={18} aria-hidden="true"/></button>
          <button type="button" className="studio-secondary" onClick={onCompare}><GitCompareArrows size={18} aria-hidden="true"/> Compare phones</button>
        </div>
        <div className="studio-hero__stats" aria-label="Catalog at a glance">
          <div><strong>{format(total)}</strong><span>phone models</span></div>
          <div className="studio-stat-separator" aria-hidden="true"/>
          <div><strong>{format(brands)}</strong><span>brands to explore</span></div>
          <div className="studio-stat-separator" aria-hidden="true"/>
          <div className="studio-proof"><ShieldCheck size={19} aria-hidden="true"/><span>Source-linked<br/>specifications</span></div>
        </div>
      </div>
      <div className="studio-hero__stage">
        <div className="studio-orbit studio-orbit--outer" aria-hidden="true"/>
        <div className="studio-orbit studio-orbit--inner" aria-hidden="true"/>
        <HeroExperience/>
        <div className="studio-stage-pill studio-stage-pill--top" aria-hidden="true"><Zap size={15}/> Explore your options</div>
        <div className="studio-stage-pill studio-stage-pill--bottom" aria-hidden="true"><CheckCircle2 size={15}/> Designed to compare</div>
      </div>
    </section>

    <div className="studio-ribbon" aria-hidden="true">
      <div className="studio-ribbon__track">
        {Array.from({length:2},(_,index)=><span key={index}>
          <b>DISCOVER</b><i/> FIND YOUR FIT <i/> <b>COMPARE</b><i/> ALL YOUR OPTIONS <i/>
          <b>EXPLORE</b><i/> SMARTER CHOICES <i/>
        </span>)}
      </div>
    </div>

    <section className="studio-start studio-reveal" aria-labelledby="studio-start-heading">
      <div className="studio-start__head">
        <div><span className="eyebrow"><Compass size={15} aria-hidden="true"/> START HERE</span>
          <h2 id="studio-start-heading">Your next phone is <em>just a click away.</em></h2>
          <p>Choose a brand or jump straight into the complete collection.</p>
        </div>
        <button type="button" className="studio-view-all" onClick={onBrowse}>
          Browse the full catalog <ArrowUpRight size={18} aria-hidden="true"/>
        </button>
      </div>
      <div className="studio-path-grid">
        {PICKS.filter(pick=>counts.has(pick.name)).map((pick,index)=>
          <button key={pick.name} type="button"
            className={'studio-path studio-path--'+pick.className+' studio-reveal'}
            style={{'--studio-delay':index*75+'ms'}}
            onClick={()=>onBrand(pick.name)}
            aria-label={'Browse '+format(counts.get(pick.name))+' '+pick.name+' phone models'}>
            <span className="studio-path__shine" aria-hidden="true"/>
            <span className="studio-path__top"><span className="studio-path__brand">{pick.name}</span><ArrowUpRight size={19} aria-hidden="true"/></span>
            <span className="studio-path__bottom"><strong>{pick.description}</strong>
              <small>{format(counts.get(pick.name))} models</small></span>
          </button>
        )}
        <button type="button" className="studio-path studio-path--compare studio-reveal"
          style={{'--studio-delay':'300ms'}} onClick={onCompare}>
          <span className="studio-path__shine" aria-hidden="true"/>
          <span className="studio-path__top"><GitCompareArrows size={23} aria-hidden="true"/><ArrowUpRight size={19} aria-hidden="true"/></span>
          <span className="studio-path__bottom"><strong>Compare side by side</strong><small>Pick up to three phones</small></span>
        </button>
      </div>
    </section>

    <section className="studio-how studio-reveal" aria-label="How SpecVerse works">
      <div className="studio-how__step"><span className="studio-how__number">01</span><Search size={20} aria-hidden="true"/>
        <div><strong>Find it</strong><small>Search by brand or model</small></div></div>
      <span className="studio-how__divider" aria-hidden="true"/>
      <div className="studio-how__step"><span className="studio-how__number">02</span><Smartphone size={20} aria-hidden="true"/>
        <div><strong>Explore it</strong><small>See specs and sources</small></div></div>
      <span className="studio-how__divider" aria-hidden="true"/>
      <div className="studio-how__step"><span className="studio-how__number">03</span><GitCompareArrows size={20} aria-hidden="true"/>
        <div><strong>Compare it</strong><small>Make the choice yours</small></div></div>
    </section>
  </>;
}
