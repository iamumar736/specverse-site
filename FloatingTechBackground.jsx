import React from 'react';

/**
 * Deterministic CSS-only background silhouettes: no videos, downloaded logos,
 * WebGL, random layout shifts, timers or particle libraries.
 */
const FLOATERS=[
  {kind:'device',left:'3%',top:'7%',duration:'31s',delay:'-18s',x:'96px',y:'-104px',roll:'17deg'},
  {kind:'brand',name:'SAMSUNG',left:'70%',top:'5%',duration:'37s',delay:'-12s',x:'-120px',y:'118px',roll:'-10deg'},
  {kind:'device',left:'85%',top:'21%',duration:'36s',delay:'-9s',x:'-109px',y:'88px',roll:'-15deg'},
  {kind:'brand',name:'PIXEL',left:'15%',top:'31%',duration:'29s',delay:'-25s',x:'72px',y:'-102px',roll:'12deg'},
  {kind:'device',left:'34%',top:'16%',duration:'43s',delay:'-27s',x:'-122px',y:'121px',roll:'13deg'},
  {kind:'brand',name:'XIAOMI',left:'49%',top:'70%',duration:'38s',delay:'-15s',x:'143px',y:'-87px',roll:'-12deg'},
  {kind:'device',left:'91%',top:'67%',duration:'40s',delay:'-21s',x:'-116px',y:'-121px',roll:'-16deg'},
  {kind:'brand',name:'ONEPLUS',left:'5%',top:'79%',duration:'34s',delay:'-6s',x:'132px',y:'-80px',roll:'11deg'},
  {kind:'device',left:'61%',top:'38%',duration:'46s',delay:'-31s',x:'-96px',y:'156px',roll:'15deg'},
  {kind:'brand',name:'APPLE',left:'26%',top:'92%',duration:'41s',delay:'-30s',x:'83px',y:'-137px',roll:'-9deg'},
  {kind:'device',left:'10%',top:'54%',duration:'38s',delay:'-19s',x:'117px',y:'72px',roll:'19deg'},
  {kind:'brand',name:'OPPO',left:'79%',top:'88%',duration:'33s',delay:'-22s',x:'-120px',y:'-140px',roll:'14deg'},
  {kind:'device',left:'45%',top:'90%',duration:'44s',delay:'-13s',x:'101px',y:'-166px',roll:'-12deg'},
  {kind:'brand',name:'NOTHING',left:'94%',top:'43%',duration:'43s',delay:'-33s',x:'-159px',y:'-43px',roll:'-14deg'}
];

export default function FloatingTechBackground(){
  return <div className="ambient-tech" aria-hidden="true">
    <div className="cosmic-side cosmic-side--left">
      <span className="cosmic-side__orbit cosmic-side__orbit--a"/>
      <span className="cosmic-side__orbit cosmic-side__orbit--b"/>
      <span className="cosmic-side__text">TRANSMISSION • SPECVERSE</span>
      <span className="cosmic-side__phone cosmic-side__phone--one">
        <i className="cosmic-side__glass"/><i className="cosmic-side__lens"/>
        <i className="cosmic-side__lens"/><i className="cosmic-side__lens"/>
      </span>
      <span className="cosmic-side__word cosmic-side__word--one">APPLE</span>
      <span className="cosmic-side__phone cosmic-side__phone--two">
        <i className="cosmic-side__glass"/><i className="cosmic-side__lens"/>
        <i className="cosmic-side__lens"/><i className="cosmic-side__lens"/>
      </span>
      <span className="cosmic-side__word cosmic-side__word--two">PIXEL</span>
      <span className="cosmic-side__spark cosmic-side__spark--one"/>
      <span className="cosmic-side__spark cosmic-side__spark--two"/>
    </div>
    <div className="cosmic-side cosmic-side--right">
      <span className="cosmic-side__orbit cosmic-side__orbit--a"/>
      <span className="cosmic-side__orbit cosmic-side__orbit--b"/>
      <span className="cosmic-side__text">EXPLORE • THE GALAXY</span>
      <span className="cosmic-side__phone cosmic-side__phone--one">
        <i className="cosmic-side__glass"/><i className="cosmic-side__lens"/>
        <i className="cosmic-side__lens"/><i className="cosmic-side__lens"/>
      </span>
      <span className="cosmic-side__word cosmic-side__word--one">GALAXY</span>
      <span className="cosmic-side__phone cosmic-side__phone--two">
        <i className="cosmic-side__glass"/><i className="cosmic-side__lens"/>
        <i className="cosmic-side__lens"/><i className="cosmic-side__lens"/>
      </span>
      <span className="cosmic-side__word cosmic-side__word--two">XIAOMI</span>
      <span className="cosmic-side__spark cosmic-side__spark--one"/>
      <span className="cosmic-side__spark cosmic-side__spark--two"/>
    </div>
    <span className="cosmic-meteor cosmic-meteor--one"/>
    <span className="cosmic-meteor cosmic-meteor--two"/>
    <span className="cosmic-meteor cosmic-meteor--three"/>
    {FLOATERS.map((part,index)=>
      <span key={index} className={'ambient-tech__item ambient-tech__item--'+part.kind}
        style={{
          left:part.left,top:part.top,
          '--tech-duration':part.duration,'--tech-delay':part.delay,
          '--tech-x':part.x,'--tech-y':part.y,'--tech-roll':part.roll
        }}>
        {part.kind==='device'?
          <span className="ambient-tech__device">
            <i/><i/><i/><b/>
          </span>:
          <span className="ambient-tech__wordmark">{part.name}</span>}
      </span>
    )}
  </div>;
}
