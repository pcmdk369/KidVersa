import { useMemo, useState, useEffect } from 'react';
import { Brain, CarFront, Compass, Gamepad2, Rocket, Search, ShieldCheck, Trophy, WandSparkles, Volleyball, Star, X } from 'lucide-react';
import GameRoom from './games/GameRoom';

type Game = { id: string; title: string; category: string; description: string; icon: typeof Brain; tone: string };
const games: Game[] = [
  { id: 'memory', title: 'Memory Galaxy', category: 'Brain Academy', description: 'Match hidden pairs and train your memory.', icon: Brain, tone: 'violet' },
  { id: 'number', title: 'Number Dash', category: 'Brain Academy', description: 'Solve arithmetic challenges and build confidence.', icon: Star, tone: 'blue' },
  { id: 'racer', title: 'Speed Racers', category: 'Speed Racers', description: 'Switch lanes and steer through a colourful race.', icon: CarFront, tone: 'orange' },
  { id: 'quest', title: 'Adventure Quest', category: 'Adventure Quest', description: 'Explore a map, collect crystals, and find the gate.', icon: Compass, tone: 'green' },
  { id: 'builder', title: 'Creative Builder', category: 'Creative Builder', description: 'Paint tiles and create your own pixel-art world.', icon: WandSparkles, tone: 'pink' },
  { id: 'sports', title: 'Sports Arena', category: 'Sports Arena', description: 'Take five penalty shots and aim for the goal.', icon: Volleyball, tone: 'teal' },
  { id: 'space', title: 'Space Explorer', category: 'Space Explorer', description: 'Discover science facts across the solar system.', icon: Rocket, tone: 'indigo' },
];
const categories = ['All games', 'Brain Academy', 'Speed Racers', 'Adventure Quest', 'Creative Builder', 'Sports Arena', 'Space Explorer'];

export default function App() {
  const [category, setCategory] = useState('All games');
  const [query, setQuery] = useState('');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [stars, setStars] = useState(() => Number(localStorage.getItem('kidversa-stars') || 0));
  const [parentOpen, setParentOpen] = useState(false);
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [parentAnswer, setParentAnswer] = useState('');
  const [sessionMinutes, setSessionMinutes] = useState(() => Number(localStorage.getItem('kidversa-session-minutes') || 30));
  const [sessionStartedAt] = useState(() => Date.now());
  const [clock, setClock] = useState(Date.now());
  useEffect(() => { localStorage.setItem('kidversa-stars', String(stars)); }, [stars]);
  useEffect(() => { localStorage.setItem('kidversa-session-minutes', String(sessionMinutes)); }, [sessionMinutes]);
  useEffect(() => { const id = window.setInterval(() => setClock(Date.now()), 15000); return () => window.clearInterval(id); }, []);
  const remainingMs = Math.max(0, sessionMinutes * 60000 - (clock - sessionStartedAt));
  const sessionExpired = remainingMs <= 0;
  useEffect(() => { if (sessionExpired && activeGame) setActiveGame(null); }, [sessionExpired, activeGame]);
  const filtered = useMemo(() => games.filter(game => (category === 'All games' || game.category === category) && `${game.title} ${game.description} ${game.category}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  return <main className="app-shell"><header className="topbar"><a className="brand" href="#home"><span className="brand-mark"><Gamepad2 /></span><span>Kid<span>Versa</span><small>PLAY • LEARN • CREATE • EXPLORE</small></span></a><nav><a href="#games">Games</a><a href="#worlds">Worlds</a><a href="#safety">Safe play</a></nav><div className="top-actions"><span className="star-count"><Star size={16} fill="currentColor"/> {stars}</span><span className="session-clock">{sessionExpired ? "Time up" : `${Math.ceil(remainingMs/60000)} min left`}</span><button className="profile-button" aria-label="Parent settings" onClick={() => { setParentOpen(true); setParentUnlocked(false); setParentAnswer(""); }}>P</button></div></header>
    <section className="hero" id="home"><div className="hero-copy"><span className="eyebrow">YOUR NEXT ADVENTURE STARTS HERE</span><h1>A universe of fun.<br/><em>A world of discovery.</em></h1><p>Play exciting games, solve clever challenges, and let your imagination explore new worlds.</p><a className="primary-button" href="#games">Explore games <span>→</span></a><div className="hero-note"><ShieldCheck size={17}/> Designed with safer play in mind</div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="planet planet-main">K<span>V</span></div><div className="planet planet-small">★</div><div className="floating f1">✦</div><div className="floating f2">✧</div><div className="floating f3">●</div><div className="art-label">IMAGINE MORE</div></div></section>
    <section className="quick-stats"><div><span className="stat-icon purple"><Gamepad2/></span><span><b>7</b><small>Game worlds</small></span></div><div><span className="stat-icon orange"><Trophy/></span><span><b>{stars}</b><small>Stars earned</small></span></div><div><span className="stat-icon green"><ShieldCheck/></span><span><b>Safe</b><small>Play-first design</small></span></div></section>
    <section className="games-section" id="games"><div className="section-heading"><div><span className="eyebrow">PICK YOUR ADVENTURE</span><h2>Explore the game zone</h2><p>Choose a world and discover something new.</p></div><label className="search-box"><Search size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search games..."/></label></div><div className="filters">{categories.map(item => <button key={item} className={category === item ? 'filter active' : 'filter'} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="game-grid">{filtered.map(game => { const Icon = game.icon; return <article className="game-card" key={game.id}><div className={`game-art ${game.tone}`}><Icon size={44}/><span className="art-spark">✦</span></div><div className="game-card-body"><span className="game-category">{game.category}</span><h3>{game.title}</h3><p>{game.description}</p><button className="card-link" onClick={() => sessionExpired ? setParentOpen(true) : setActiveGame(game.id)}>{sessionExpired ? "Ask parent to continue" : "Play game →"}</button></div></article>; })}</div>{filtered.length === 0 && <p className="empty-state">No games found. Try another search.</p>}</section>
    <section className="worlds-section" id="worlds"><div><span className="eyebrow">MORE THAN A GAME</span><h2>Big ideas begin with play.</h2><p>Build confidence, curiosity, creativity, and problem-solving one adventure at a time.</p></div><div className="world-pills"><span>Think creatively</span><span>Explore science</span><span>Practice logic</span><span>Keep moving</span></div></section>
    <footer id="safety"><div className="footer-brand">KidVersa™</div><p>Play • Learn • Create • Explore</p><div className="safety-note"><ShieldCheck size={17}/> No public chat. No location sharing. No targeted ads.</div><small>© 2026 PCMDK369™. KidVersa is in active development.</small></footer>
    {parentOpen && <div className="game-overlay"><section className="game-panel parent-panel"><div className="game-top"><div><span className="eyebrow">FAMILY SETTINGS</span><h2>Parent area</h2><p>Manage this device's play session.</p></div><button className="icon-button" onClick={() => setParentOpen(false)} aria-label="Close parent settings"><X /></button></div>
      {!parentUnlocked ? <div className="challenge-box"><h3>Parent check</h3><p>Please solve this quick question to continue: 9 + 6 = ?</p><input className="parent-input" inputMode="numeric" value={parentAnswer} onChange={event => setParentAnswer(event.target.value)} placeholder="Answer"/><button className="primary-game-button" onClick={() => { if (parentAnswer.trim() === "15") setParentUnlocked(true); else setParentAnswer(""); }}>Continue</button></div> : <div className="parent-settings"><label>Daily play session limit<select value={sessionMinutes} onChange={event => setSessionMinutes(Number(event.target.value))}><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option></select></label><p>Current session remaining: {Math.ceil(remainingMs/60000)} minutes</p><button className="secondary-button" onClick={() => { setStars(0); localStorage.removeItem('kidversa-stars'); }}>Reset stars on this device</button><p className="parent-disclaimer">These settings are stored locally. This basic parent check is not secure adult authentication or a device-level parental control.</p></div>}
      </section></div>}
    {activeGame && <GameRoom gameId={activeGame} onClose={() => setActiveGame(null)} onReward={amount => setStars(value => value + amount)}/>}
    </main>;
}
