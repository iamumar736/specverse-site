import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Smartphone,Sun,Moon,Gamepad2,ArrowLeft,Sparkles,ShieldCheck,Search} from 'lucide-react';
import MiniGames from './MiniGames.jsx';
import './style.css';

function GamesPage(){
  const [dark,setDark]=useState(()=>(localStorage.getItem('specverse-theme')??localStorage.getItem('pocket-theme'))!=='light');
  const [search,setSearch]=useState('');
  useEffect(()=>{
    document.documentElement.dataset.theme=dark?'dark':'light';
    localStorage.setItem('specverse-theme',dark?'dark':'light');
  },[dark]);
  return <>
    <header><div className="shell top">
      <a className="logo" href="/" aria-label="SpecVerse homepage">
        <span className="logo-icon"><Smartphone size={20}/></span> SpecVerse<span className="dot">.</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="/">Explore phones</a>
        <a href="/games/" className="active" aria-current="page"><Gamepad2 size={16}/> Games</a>
      </nav>
      <form className="top-search" role="search" onSubmit={e=>{e.preventDefault();window.location.assign('/?q='+encodeURIComponent(search.trim())+'#catalog')}}>
        <input type="search" aria-label="Search phones" placeholder="Search phones..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <button type="submit" aria-label="Show phone search results"><Search size={17}/></button>
      </form>
      <button type="button" className="theme" onClick={()=>setDark(d=>!d)} aria-label="Toggle color theme">
        {dark?<Sun size={19}/>:<Moon size={19}/>}
      </button>
    </div></header>
    <main className="shell games-page">
      <a href="/" className="back"><ArrowLeft size={16}/> Back to phones</a>
      <section className="games-hero">
        <span className="eyebrow"><Sparkles size={15}/> Free mobile mini-games</span>
        <h1>SpecVerse Games<span className="dot">.</span></h1>
        <p>Challenge your smartphone knowledge! Guess brand logos and test your memory with fun, free games. No account needed.</p>
      </section>
      <div className="games-layout">
        <MiniGames/>
        <aside className="games-guide" aria-label="Game instructions">
          <h2>How to play</h2>
          <p>Choose one of the two games to begin instantly.</p>
          <ul>
            <li><strong>Guess the Logo:</strong> identify the smartphone brand from its logo. Earn points for correct guesses.</li>
            <li><strong>Logo Match:</strong> turn over cards and match pairs of mobile-brand logos using as few moves as possible.</li>
          </ul>
          <span className="free-note"><ShieldCheck size={16}/> Completely free to play</span>
        </aside>
      </div>
      <footer>
        <div className="footer-logo">SpecVerse<span className="dot">.</span></div>
        <p>Explore better. Play smarter.</p>
        <small>Mobile-brand logos belong to their respective owners.</small>
      </footer>
    </main>
  </>;
}

createRoot(document.getElementById('root')).render(<GamesPage/>);
