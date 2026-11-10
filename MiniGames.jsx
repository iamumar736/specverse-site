import React,{useEffect,useState} from 'react';
import {Gamepad2,RotateCcw,Trophy,Sparkles} from 'lucide-react';
import {makeLogoQuiz,makeLogoMatch} from './mobile-games.js';

function LogoQuiz(){
  const [rounds,setRounds]=useState(()=>makeLogoQuiz());
  const [round,setRound]=useState(0);
  const [choice,setChoice]=useState(null);
  const [score,setScore]=useState(0);
  const finished=round>=rounds.length;
  const question=rounds[round];
  const restart=()=>{setRounds(makeLogoQuiz());setRound(0);setChoice(null);setScore(0)};
  const select=id=>{
    if(choice!==null||finished)return;
    setChoice(id);
    if(id===question.answer.id)setScore(n=>n+1);
  };
  return <div className="logo-quiz">
    {finished?<div className="arcade-finish" role="status">
      <Trophy size={32}/>
      <strong>{score}/{rounds.length} correct!</strong>
      <span>{score===rounds.length?'Perfect! You know your tech logos.':'Nice round! Can you beat your score?'}</span>
      <button className="arcade-main-btn" onClick={restart}><RotateCcw size={15}/> Play again</button>
    </div>:<>
      <div className="arcade-meta"><span>Logo {round+1} of {rounds.length}</span><span>⭐ {score} points</span></div>
      <div className="arcade-quiz-prompt">
        <div className="arcade-logo-frame"><img src={question.answer.logo} alt="Mystery phone brand logo" draggable="false"/></div>
        <strong>Which phone brand is this?</strong>
      </div>
      <div className="arcade-choices">{question.choices.map(brand=><button
        type="button" key={brand.id} onClick={()=>select(brand.id)} disabled={choice!==null}
        className={choice===null?'':brand.id===question.answer.id?'correct':choice===brand.id?'incorrect':''}
      >{brand.name}</button>)}</div>
      {choice!==null&&<div className="arcade-feedback" role="status">
        <span>{choice===question.answer.id?'✅ Correct!':`❌ It's ${question.answer.name}!`}</span>
        <button className="arcade-main-btn" onClick={()=>{setRound(n=>n+1);setChoice(null)}}>{round===rounds.length-1?'See results':'Next logo'} →</button>
      </div>}
    </>}
  </div>;
}

function LogoMemory(){
  const [deck,setDeck]=useState(()=>makeLogoMatch());
  const [flipped,setFlipped]=useState([]);
  const [matched,setMatched]=useState([]);
  const [turns,setTurns]=useState(0);
  const done=matched.length===deck.length/2;
  useEffect(()=>{
    if(flipped.length!==2)return;
    const a=deck[flipped[0]],b=deck[flipped[1]];
    if(a.id===b.id){
      setMatched(previous=>previous.includes(a.id)?previous:[...previous,a.id]);
      setFlipped([]);
      return;
    }
    const timeout=setTimeout(()=>setFlipped([]),850);
    return ()=>clearTimeout(timeout);
  },[flipped,deck]);
  const flip=i=>{
    if(flipped.length>=2||flipped.includes(i)||matched.includes(deck[i].id))return;
    setFlipped(previous=>[...previous,i]);
    if(flipped.length===1)setTurns(n=>n+1);
  };
  const restart=()=>{setDeck(makeLogoMatch());setFlipped([]);setMatched([]);setTurns(0)};
  return <div className="logo-memory">
    <div className="arcade-meta"><span>{matched.length}/{deck.length/2} pairs matched</span><span>🎯 {turns} moves</span></div>
    <div className="arcade-memory-grid">{deck.map((item,i)=>{
      const revealed=flipped.includes(i)||matched.includes(item.id);
      return <button key={item.key} type="button" aria-label={revealed?`Card ${i+1}: ${item.name} logo`:`Reveal logo card ${i+1}`}
        className={'arcade-memory-card '+(revealed?'revealed ':'')+(matched.includes(item.id)?'matched':'')}
        onClick={()=>flip(i)} disabled={revealed||flipped.length===2||done}>
        {revealed?<img src={item.logo} alt="" draggable="false"/>:<span aria-hidden="true">?</span>}
      </button>;
    })}</div>
    {done?<div className="arcade-memory-done" role="status"><span>🏆 All pairs found in {turns} moves!</span><button className="arcade-main-btn" onClick={restart}><RotateCcw size={14}/> Play again</button></div>:
      <div className="arcade-memory-hint"><span>Flip two matching brand logos</span><button onClick={restart} type="button"><RotateCcw size={14}/> Restart</button></div>}
  </div>;
}

export default function MiniGames(){
  const [mode,setMode]=useState('quiz');
  return <section className="mini-arcade" aria-label="Free phone logo mini games">
    <div className="mini-arcade-head">
      <div><span className="arcade-label"><Sparkles size={13}/> PLAY BREAK · FREE</span><h2><Gamepad2 size={19}/> Mobile logo arcade</h2></div>
      <span className="arcade-no-login">No signup</span>
    </div>
    <div className="arcade-tabs" role="tablist" aria-label="Choose a logo game">
      <button role="tab" aria-selected={mode==='quiz'} className={mode==='quiz'?'active':''} onClick={()=>setMode('quiz')} type="button">🧠 Guess the Logo</button>
      <button role="tab" aria-selected={mode==='memory'} className={mode==='memory'?'active':''} onClick={()=>setMode('memory')} type="button">🃏 Logo Match</button>
    </div>
    <div className="arcade-body">{mode==='quiz'?<LogoQuiz/>:<LogoMemory/>}</div>
    <p className="arcade-footer">Just for fun · 12 real mobile-brand logos · Unlimited replays</p>
  </section>;
}
