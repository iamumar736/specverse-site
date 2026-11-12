import React from 'react';
import {Compass,GitCompareArrows,Grid2X2,Gamepad2} from 'lucide-react';

/** An always-reachable, thumb-friendly alternative to desktop navigation. */
export default function MobileDock({view,onHome,onBrowse,onCompare,compareCount=0}){
  return <nav className="studio-dock" aria-label="Mobile navigation">
    <button type="button" onClick={onHome} aria-current={view==='home'?'page':undefined}>
      <Compass size={20} aria-hidden="true"/><span>Explore</span>
    </button>
    <button type="button" onClick={onBrowse} aria-current={view==='models'?'page':undefined}>
      <Grid2X2 size={20} aria-hidden="true"/><span>All models</span>
    </button>
    <button type="button" onClick={onCompare} aria-current={view==='compare'?'page':undefined}>
      <span className="studio-dock__icon"><GitCompareArrows size={20} aria-hidden="true"/>
        {compareCount>0&&<i aria-label={compareCount+' selected'}>{compareCount}</i>}
      </span><span>Compare</span>
    </button>
    <a href="/games/"><Gamepad2 size={20} aria-hidden="true"/><span>Games</span></a>
  </nav>;
}
