import React,{useMemo} from 'react';
import {
  ArrowRight,ArrowUpRight,Compass,GitCompareArrows,Pause,
  Play,Search,ShieldCheck,Smartphone
} from 'lucide-react';
import HeroExperience from './HeroExperience.jsx';
import SignalField from './SignalField.jsx';
import DecisionFlow from './DecisionFlow.jsx';

const PICKS=[
  {name:'Apple',className:'apple',description:'iPhone'},
  {name:'Samsung',className:'samsung',description:'Galaxy'},
  {name:'Xiaomi',className:'xiaomi',description:'Xiaomi and Redmi'},
  {name:'OPPO',className:'oppo',description:'OPPO'}
];
const format=value=>new Intl.NumberFormat('en-US').format(value);

/** Clear editorial discovery; every count comes from the real phone catalog. */
export default function DiscoveryExperience({catalog=[],onBrowse,onBrand,onCompare,onComparePair,motion=true,onMotionToggle}){
  const counts=useMemo(()=>{
    const brands=new Map();
    for(const device of catalog){
      if(device?.brand)brands.set(device.brand,(brands.get(device.brand)||0)+1);
    }
    return brands;
  },[catalog]);

  return <>
    <section className="hero studio-hero" aria-labelledby="studio-hero-title">
      <div className="hero-copy studio-hero__copy">
        <span className="studio-hero__eyebrow">A BETTER WAY TO CHOOSE <span className="relay-hero-live"><i aria-hidden="true"/> INTERACTIVE DISCOVERY</span></span>
        <h1 id="studio-hero-title">The right phone.<br/><span className="studio-gradient">A clearer decision.</span></h1>
        <p>Explore the details that matter, compare models side by side, and find a device that fits your needs.</p>
        <div className="studio-hero__actions">
          <button type="button" className="primary studio-primary" onClick={onBrowse}>
            Browse smartphones <ArrowRight size={18} aria-hidden="true"/>
          </button>
          <button type="button" className="studio-secondary" onClick={onCompare}>
            <GitCompareArrows size={18} aria-hidden="true"/> Compare models
          </button>
        </div>
        <div className="studio-hero__stats" aria-label="Catalog at a glance">
          <div><strong>{format(catalog.length)}</strong><span>Devices listed</span></div>
          <div className="studio-stat-separator" aria-hidden="true"/>
          <div><strong>{format(counts.size)}</strong><span>Brands covered</span></div>
          <div className="studio-stat-separator" aria-hidden="true"/>
          <div className="studio-proof"><ShieldCheck size={17} aria-hidden="true"/>
            <span>Sources linked<br/>where available</span>
          </div>
        </div>
      </div>
      <div className="studio-hero__stage">
        <SignalField active={motion}/>
        <HeroExperience/>
        <div className="studio-stage-footer">
          <span>Interactive concept illustration</span>
          <button type="button" className="studio-orbit-toggle"
            onClick={onMotionToggle} aria-pressed={motion}
            aria-label={motion?'Pause ambient animation':'Resume ambient animation'}>
            {motion?<Pause size={12} aria-hidden="true"/>:<Play size={12} aria-hidden="true"/>}
            {motion?'Pause motion':'Enable motion'}
          </button>
        </div>
      </div>
    </section>

    <DecisionFlow catalog={catalog} onComparePair={onComparePair} onBrowse={onBrowse}/>

    <section className="studio-start studio-reveal" aria-labelledby="studio-start-heading">
      <div className="studio-start__head">
        <div>
          <span className="eyebrow">CURATED DISCOVERY</span>
          <h2 id="studio-start-heading">Explore by brand</h2>
          <p>Start with a manufacturer, or browse the complete catalog.</p>
        </div>
        <button type="button" className="studio-view-all" onClick={onBrowse}>
          View all devices <ArrowUpRight size={17} aria-hidden="true"/>
        </button>
      </div>
      <div className="studio-path-grid">
        {PICKS.filter(pick=>counts.has(pick.name)).map((pick,index)=>
          <button key={pick.name} type="button"
            className={'studio-path studio-path--'+pick.className+' studio-reveal'}
            style={{'--studio-delay':index*55+'ms'}}
            onClick={()=>onBrand(pick.name)}
            aria-label={'Browse '+format(counts.get(pick.name))+' '+pick.name+' phone models'}>
            <span className="studio-path__top">
              <span className="studio-path__brand">{pick.name}</span>
              <ArrowUpRight size={18} aria-hidden="true"/>
            </span>
            <span className="studio-path__bottom">
              <strong>{pick.description}</strong>
              <small>{format(counts.get(pick.name))} models</small>
            </span>
          </button>
        )}
        <button type="button" className="studio-path studio-path--compare studio-reveal"
          style={{'--studio-delay':'220ms'}} onClick={onCompare}>
          <span className="studio-path__top">
            <GitCompareArrows size={21} aria-hidden="true"/>
            <ArrowUpRight size={18} aria-hidden="true"/>
          </span>
          <span className="studio-path__bottom">
            <strong>Side-by-side comparison</strong>
            <small>Compare up to three</small>
          </span>
        </button>
      </div>
    </section>

    <section className="studio-how studio-reveal" aria-label="How SpecVerse works">
      <div className="studio-how__step">
        <span className="studio-how__number">01</span><Search size={18} aria-hidden="true"/>
        <div><strong>Discover</strong><small>Search the catalog</small></div>
      </div>
      <span className="studio-how__divider" aria-hidden="true"/>
      <div className="studio-how__step">
        <span className="studio-how__number">02</span><Smartphone size={18} aria-hidden="true"/>
        <div><strong>Review</strong><small>Examine specifications</small></div>
      </div>
      <span className="studio-how__divider" aria-hidden="true"/>
      <div className="studio-how__step">
        <span className="studio-how__number">03</span><GitCompareArrows size={18} aria-hidden="true"/>
        <div><strong>Compare</strong><small>Choose with confidence</small></div>
      </div>
    </section>
  </>;
}
